import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import LocationPickerModal, { reverseGeocodeCoords } from "../../components/donor/LocationPickerModal";
import { AuthContext } from "../../context/AuthContext";
import { updateProfile } from "../../services/donorService";
import API from "../../services/api";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:") || url.startsWith("data:")) {
    return url;
  }
  const baseUrl = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/?$/, "") : "http://localhost:5000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function DonorEditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useContext(AuthContext);

  // Form State initialized from authenticated user context
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [latitude, setLatitude] = useState(user?.latitude || null);
  const [longitude, setLongitude] = useState(user?.longitude || null);
  const [organizationName, setOrganizationName] = useState(user?.organization_name || "");

  // Avatar Photo State
  const [avatarUri, setAvatarUri] = useState(user?.avatar_url || null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // Custom Alert Modal State for Web & Mobile
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
    onConfirm: null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Location Picker State
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setLatitude(user.latitude || null);
      setLongitude(user.longitude || null);
      setOrganizationName(user.organization_name || "");
      setAvatarUri(user.avatar_url || null);
      setAvatarBase64(null);
      setRemoveAvatar(false);
    }
  }, [user]);

  const showAlert = (title, message, type = "success", onConfirm = null) => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const handleBackOrCancel = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(donor)/profile");
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showAlert("Permission Required", "Gallery permission is required to select a profile photo.", "error");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        let base64Str = asset.base64;
        if (base64Str && !base64Str.startsWith("data:image")) {
          base64Str = `data:image/jpeg;base64,${base64Str}`;
        } else if (!base64Str && asset.uri && asset.uri.startsWith("data:image")) {
          base64Str = asset.uri;
        }
        setAvatarUri(asset.uri);
        setAvatarBase64(base64Str);
        setRemoveAvatar(false);
      }
    } catch (err) {
      console.warn("Gallery error:", err.message);
      showAlert("Error", "Could not pick image from gallery.", "error");
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === "web") {
        return handleChooseFromGallery();
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Required", "Camera permission is required to take a profile photo.", "error");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        let base64Str = asset.base64;
        if (base64Str && !base64Str.startsWith("data:image")) {
          base64Str = `data:image/jpeg;base64,${base64Str}`;
        }
        setAvatarUri(asset.uri);
        setAvatarBase64(base64Str);
        setRemoveAvatar(false);
      }
    } catch (err) {
      console.warn("Camera error:", err.message);
      showAlert("Error", "Could not capture photo.", "error");
    }
  };

  // Option 1: Use Current GPS
  const handleFetchGPSLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Required", "Location permission is required to fetch current GPS location.", "error");
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      const addr = await reverseGeocodeCoords(lat, lng);

      // Update form state only (no immediate DB save)
      setAddress(addr);
      setLatitude(lat);
      setLongitude(lng);
    } catch (err) {
      console.warn("GPS location error:", err.message);
      showAlert("Location Error", "Could not determine location automatically. Please choose on Google Map.", "error");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Missing Name", "Please enter your full name.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        organization_name: organizationName.trim(),
        latitude,
        longitude,
      };

      if (avatarBase64) {
        payload.avatar_base64 = avatarBase64;
      } else if (removeAvatar) {
        payload.avatar_url = null;
      }

      const res = await updateProfile(payload);

      if (res && res.success && res.user) {
        await updateUserProfile(res.user);
        showAlert(
          "Profile Updated! 🎉",
          "Your profile changes have been saved successfully.",
          "success",
          () => {
            router.push("/(donor)/profile");
          }
        );
      } else {
        showAlert("Update Failed", res?.message || "Could not update profile.", "error");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      showAlert(
        "Error",
        err.response?.data?.message || err.message || "Failed to update profile.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="Edit Profile" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBackOrCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={styles.saveCheckBtn}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#087A3D" />
          ) : (
            <Ionicons name="checkmark-circle" size={26} color="#087A3D" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Edit Card */}
          <View style={styles.avatarCard}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => {
                if (Platform.OS === "web") {
                  handleChooseFromGallery();
                } else {
                  setIsPhotoModalVisible(true);
                }
              }}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={{ uri: getImageUrl(avatarUri) }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#087A3D" />
                </View>
              )}
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.photoActionRow}>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={() => {
                  if (Platform.OS === "web") {
                    handleChooseFromGallery();
                  } else {
                    setIsPhotoModalVisible(true);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={14} color="#087A3D" style={{ marginRight: 4 }} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>

              {(avatarUri || avatarBase64) && (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => {
                    setAvatarUri(null);
                    setAvatarBase64(null);
                    setRemoveAvatar(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Personal Information Form Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#087A3D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#087A3D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email address"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color="#087A3D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Organization / Business Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Organization / Business Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color="#087A3D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={organizationName}
                  onChangeText={setOrganizationName}
                  placeholder="Enter organization or business name (optional)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Primary Hub / Address (GPS & Google Map Options) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primary Pickup Hub / Address</Text>

              {/* Two Options Row */}
              <View style={styles.locationOptionsRow}>
                {/* Option 1: Use Current GPS */}
                <TouchableOpacity
                  style={[styles.locationOptionBtn, styles.gpsOptionBtn, isLocating && styles.locationOptionBtnDisabled]}
                  onPress={handleFetchGPSLocation}
                  disabled={isLocating}
                  activeOpacity={0.8}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#087A3D" />
                  ) : (
                    <Ionicons name="navigate" size={15} color="#087A3D" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.gpsOptionText}>
                    {isLocating ? "Locating..." : "Use Current GPS"}
                  </Text>
                </TouchableOpacity>

                {/* Option 2: Choose on Google Map */}
                <TouchableOpacity
                  style={[styles.locationOptionBtn, styles.mapOptionBtn]}
                  onPress={() => setIsMapModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="google-maps" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.mapOptionText}>Choose on Google Map</Text>
                </TouchableOpacity>
              </View>

              {/* Clickable Selected Location Display Card */}
              <TouchableOpacity
                style={styles.locationCardSelect}
                onPress={() => setIsMapModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="location-sharp" size={22} color="#087A3D" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationCardText} numberOfLines={2}>
                    {address || "Select location using GPS or Google Map"}
                  </Text>
                  {latitude && longitude ? (
                    <Text style={styles.coordsSubtext}>
                      Lat: {Number(latitude).toFixed(5)}, Lng: {Number(longitude).toFixed(5)}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleBackOrCancel}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom Navigation Bar */}
        <DonorBottomNav initialTab="Profile" />
      </View>

      {/* Cross-Platform Alert Modal (Success / Error) */}
      <Modal
        visible={alertModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          const cb = alertModal.onConfirm;
          setAlertModal((prev) => ({ ...prev, visible: false }));
          if (cb) cb();
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            const cb = alertModal.onConfirm;
            setAlertModal((prev) => ({ ...prev, visible: false }));
            if (cb) cb();
          }}
        >
          <View style={styles.alertModalContent}>
            <View
              style={[
                styles.alertIconCircle,
                alertModal.type === "error" && { backgroundColor: "#FEE2E2" },
              ]}
            >
              <Ionicons
                name={alertModal.type === "error" ? "alert-circle" : "checkmark-circle"}
                size={36}
                color={alertModal.type === "error" ? "#DC2626" : "#087A3D"}
              />
            </View>

            <Text style={styles.alertModalTitle}>{alertModal.title}</Text>
            <Text style={styles.alertModalMessage}>{alertModal.message}</Text>

            <TouchableOpacity
              style={[
                styles.alertModalBtn,
                alertModal.type === "error" && { backgroundColor: "#DC2626" },
              ]}
              onPress={() => {
                const cb = alertModal.onConfirm;
                setAlertModal((prev) => ({ ...prev, visible: false }));
                if (cb) cb();
              }}
            >
              <Text style={styles.alertModalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cross-Platform Photo Options Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={styles.photoModalContent}>
            <Text style={styles.photoModalTitle}>Profile Photo Options</Text>
            <Text style={styles.photoModalSubtitle}>Choose how to update your avatar</Text>

            <TouchableOpacity
              style={styles.photoModalOptionBtn}
              onPress={() => {
                setIsPhotoModalVisible(false);
                handleChooseFromGallery();
              }}
            >
              <Ionicons name="images-outline" size={20} color="#087A3D" style={{ marginRight: 10 }} />
              <Text style={styles.photoModalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {Platform.OS !== "web" && (
              <TouchableOpacity
                style={styles.photoModalOptionBtn}
                onPress={() => {
                  setIsPhotoModalVisible(false);
                  handleTakePhoto();
                }}
              >
                <Ionicons name="camera-outline" size={20} color="#087A3D" style={{ marginRight: 10 }} />
                <Text style={styles.photoModalOptionText}>Take Photo with Camera</Text>
              </TouchableOpacity>
            )}

            {(avatarUri || avatarBase64) && (
              <TouchableOpacity
                style={[styles.photoModalOptionBtn, { borderColor: "#FCA5A5" }]}
                onPress={() => {
                  setIsPhotoModalVisible(false);
                  setAvatarUri(null);
                  setAvatarBase64(null);
                  setRemoveAvatar(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 10 }} />
                <Text style={[styles.photoModalOptionText, { color: "#DC2626" }]}>Remove Current Photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.photoModalCancelBtn}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Text style={styles.photoModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Option 2: Choose on Google Map Modal */}
      <LocationPickerModal
        visible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        initialAddress={address}
        onSelectLocation={(selected) => {
          // Update local form state only (no immediate DB update)
          setAddress(selected.address);
          if (selected.latitude) setLatitude(selected.latitude);
          if (selected.longitude) setLongitude(selected.longitude);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  saveCheckBtn: {
    padding: 2,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#DCFCE7",
  },
  cameraCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#087A3D",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  photoActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#087A3D",
  },
  removePhotoBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  locationOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  locationOptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsOptionBtn: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  gpsOptionText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#087A3D",
  },
  mapOptionBtn: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
  },
  mapOptionText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationOptionBtnDisabled: {
    opacity: 0.6,
  },
  locationCardSelect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#087A3D",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  locationCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18,
  },
  coordsSubtext: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 14,
    height: 52,
    marginTop: 8,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelBtnText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertModalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  alertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  alertModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  alertModalMessage: {
    fontSize: 13.5,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  alertModalBtn: {
    width: "100%",
    backgroundColor: "#087A3D",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  alertModalBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  photoModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  photoModalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  photoModalOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  photoModalOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  photoModalCancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  photoModalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
});
