import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import LocationPickerModal, { reverseGeocodeCoords } from "../../components/donor/LocationPickerModal";

export default function DonorEditProfileScreen() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("Nawaz M.");
  const [email, setEmail] = useState("nawaz@example.com");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [address, setAddress] = useState("Colombo 03, Sri Lanka");
  const [bio, setBio] = useState(
    "Urban food safety volunteer & active donor sharing surplus meals."
  );

  // Preference Toggles State
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [publicLeaderboard, setPublicLeaderboard] = useState(true);

  // Avatar Image State
  const [avatarUri] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  );
  const [isSaving, setIsSaving] = useState(false);
  // Location Picker State
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
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
    }, 500);
  };

  const handleSelectPhoto = () => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option to update your avatar:",
      [
        { text: "Take Photo", onPress: () => console.log("Camera selected") },
        { text: "Choose from Gallery", onPress: () => console.log("Gallery selected") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="Edit Profile" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={styles.saveCheckBtn}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={26} color="#087A3D" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Edit Card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.cameraCircle}
                onPress={handleSelectPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.photoActionRow}>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handleSelectPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={14} color="#087A3D" style={{ marginRight: 4 }} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => Alert.alert("Remove Photo", "Reset to default avatar?")}
                activeOpacity={0.8}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
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

            {/* Bio / Donor Note */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>About / Organization Note</Text>
              <View style={styles.multilineWrapper}>
                <TextInput
                  style={styles.multilineInput}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  placeholder="Brief description about your surplus food contributions..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Preferences & Notifications Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>PREFERENCES & PRIVACY</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Urgent Pickup SMS Alerts</Text>
                <Text style={styles.toggleSubtitle}>Receive instant SMS when driver arrives</Text>
              </View>
              <Switch
                value={smsAlerts}
                onValueChange={setSmsAlerts}
                trackColor={{ false: "#E5E7EB", true: "#DCFCE7" }}
                thumbColor={smsAlerts ? "#087A3D" : "#9CA3AF"}
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Public Leaderboard Profile</Text>
                <Text style={styles.toggleSubtitle}>Display badges on community hero list</Text>
              </View>
              <Switch
                value={publicLeaderboard}
                onValueChange={setPublicLeaderboard}
                trackColor={{ false: "#E5E7EB", true: "#DCFCE7" }}
                thumbColor={publicLeaderboard ? "#087A3D" : "#9CA3AF"}
              />
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
            onPress={() => router.back()}
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
  mapSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  mapSelectBtnInner: {
    flexDirection: "row",
    alignItems: "center",
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
  multilineWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    minHeight: 80,
  },
  multilineInput: {
    fontSize: 13.5,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 60,
  },
  toggleRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#6B7280",
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
