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
  const [organizationName, setOrganizationName] = useState(user?.organization_name || "");

  // Avatar Photo State
  const [avatarUri, setAvatarUri] = useState(user?.avatar_url || null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

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
      setOrganizationName(user.organization_name || "");
      setAvatarUri(user.avatar_url || null);
      setAvatarBase64(null);
      setRemoveAvatar(false);
    }
  }, [user]);

  const handleBackOrCancel = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(donor)/profile");
    }
  };

  const handleSelectPhotoOptions = () => {
    const options = [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Gallery", onPress: handleChooseFromGallery },
    ];

    if (avatarUri || avatarBase64) {
      options.push({
        text: "Remove Photo",
        style: "destructive",
        onPress: () => {
          setAvatarUri(null);
          setAvatarBase64(null);
          setRemoveAvatar(true);
        },
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Profile Photo", "Select an option to update your profile photo:", options);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is required to take a profile photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Str = asset.base64
          ? asset.base64.startsWith("data:image")
            ? asset.base64
            : `data:image/jpeg;base64,${asset.base64}`
          : null;
        setAvatarUri(asset.uri);
        setAvatarBase64(base64Str);
        setRemoveAvatar(false);
      }
    } catch (err) {
      console.warn("Camera error:", err.message);
      Alert.alert("Error", "Could not capture photo.");
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery permission is required to select a profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Str = asset.base64
          ? asset.base64.startsWith("data:image")
            ? asset.base64
            : `data:image/jpeg;base64,${asset.base64}`
          : null;
        setAvatarUri(asset.uri);
        setAvatarBase64(base64Str);
        setRemoveAvatar(false);
      }
    } catch (err) {
      console.warn("Gallery error:", err.message);
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const handleFetchGPSLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is required to fetch current GPS location.");
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const addr = await reverseGeocodeCoords(loc.coords.latitude, loc.coords.longitude);
      setAddress(addr);
    } catch (err) {
      console.warn("GPS location error:", err.message);
      Alert.alert("Location Error", "Could not determine location automatically. Please choose on Google Map.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
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
      };

      if (avatarBase64) {
        payload.avatar_base64 = avatarBase64;
      } else if (removeAvatar) {
        payload.avatar_url = null;
      }

      const res = await updateProfile(payload);

      if (res && res.success && res.user) {
        await updateUserProfile(res.user);
        Alert.alert(
          "Profile Updated! 🎉",
          "Your profile changes have been saved successfully.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(donor)/profile"),
            },
          ]
        );
      } else {
        Alert.alert("Update Failed", res?.message || "Could not update profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to update profile.");
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
              onPress={handleSelectPhotoOptions}
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
                onPress={handleSelectPhotoOptions}
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

            {/* Primary Hub / Address (Google Map / GPS Only) */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={styles.fieldLabel}>Primary Pickup Hub / Address</Text>
                <TouchableOpacity 
                  onPress={handleFetchGPSLocation} 
                  disabled={isLocating}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  activeOpacity={0.7}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#087A3D" />
                  ) : (
                    <Ionicons name="navigate" size={13} color="#087A3D" />
                  )}
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#087A3D" }}>
                    {isLocating ? "Locating..." : "Use Current GPS"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clickable Location Card (Opens Map Picker) */}
              <TouchableOpacity
                style={styles.locationCardSelect}
                onPress={() => setIsMapModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="location-sharp" size={20} color="#087A3D" style={{ marginRight: 8 }} />
                <Text style={styles.locationCardText} numberOfLines={1}>
                  {address || "Select location on Google Map"}
                </Text>
                <View style={styles.mapPillBadge}>
                  <MaterialCommunityIcons name="google-maps" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.mapPillText}>Google Map</Text>
                </View>
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

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        initialAddress={address}
        onSelectLocation={(selected) => setAddress(selected.address)}
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
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  mapPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#087A3D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  mapPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF",
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
});
