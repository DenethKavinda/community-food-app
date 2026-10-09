import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

export default function DriverProfile() {
  const router = useRouter();
  const { user, updateUserProfile } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");

  const [bio, setBio] = useState(
    "Passionate about helping communities and reducing food waste through reliable food deliveries."
  );

  const [saving, setSaving] = useState(false);

  // Load current logged-in user details
  useEffect(() => {
    if (!user) return;

    setFullName(user.name || "");
    setDisplayName(user.name?.split(" ")[0] || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setDistrict(user.address || "");
  }, [user]);

  // Save profile changes to backend
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put("/auth/profile", {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: district.trim(),
      });

      if (response.data?.success) {
        const updatedUser = response.data.user;

        // Update AuthContext + AsyncStorage
        await updateUserProfile(updatedUser);

        // Keep display name local because it is not stored
        // in the current users table.
        setDisplayName(updatedUser.name?.split(" ")[0] || "");

        Alert.alert(
          "Profile Updated",
          "Your profile changes have been saved successfully."
        );
      } else {
        Alert.alert(
          "Update Failed",
          response.data?.message || "Could not update your profile."
        );
      }
    } catch (error) {
      console.error(
        "Profile update error:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Update Failed",
        error?.response?.data?.message ||
          "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Edit Profile
        </Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= PROFILE PHOTO ================= */}

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={58}
              color="#FFFFFF"
            />

            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons
                name="camera"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.photoActions}>
            <TouchableOpacity>
              <Text style={styles.changePhoto}>
                Change Photo
              </Text>
            </TouchableOpacity>

            <Text style={styles.dot}>•</Text>

            <TouchableOpacity>
              <Text style={styles.removePhoto}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.verifiedBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color="#047857"
            />

            <Text style={styles.verifiedBadgeText}>
              VERIFIED DRIVER
            </Text>
          </View>
        </View>

        {/* ================= PERSONAL INFORMATION ================= */}

        <SectionHeader
          title="PERSONAL INFORMATION"
          rightText="Public visibility"
        />

        <View style={styles.sectionCard}>
          <InputField
            label="Full Name"
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
          />

          <InputField
            label="Display Name / Alias"
            icon="id-card-outline"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <View style={styles.helperRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#374151"
            />

            <Text style={styles.helperText}>
              Visible on your delivery and community activity
              records
            </Text>
          </View>

          <View style={styles.roleHeader}>
            <Text style={styles.fieldLabel}>
              Driver Role
            </Text>

            <View style={styles.roleVerified}>
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color="#047857"
              />

              <Text style={styles.roleVerifiedText}>
                Verified Driver
              </Text>
            </View>
          </View>

          <View style={styles.selectBox}>
            <Ionicons
              name="car-outline"
              size={20}
              color="#374151"
            />

            <Text style={styles.selectText}>
              Community Food Delivery Driver
            </Text>

            <Ionicons
              name="chevron-down"
              size={19}
              color="#374151"
            />
          </View>
        </View>

        {/* ================= CONTACT ================= */}

        <SectionHeader
          title="CONTACT & LOCATION"
          rightText="Encrypted & secure"
        />

        <View style={styles.sectionCard}>
          <InputField
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.emailVerified}>
            <Ionicons
              name="checkmark"
              size={12}
              color="#047857"
            />

            <Text style={styles.emailVerifiedText}>
              Verified
            </Text>
          </View>

          <InputField
            label="Phone Number"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.phoneHelper}>
            Shared only with matched food donation partners
            during an active delivery
          </Text>

          <InputField
            label="Primary Area / District"
            icon="location-outline"
            value={district}
            onChangeText={setDistrict}
          />
        </View>

        {/* ================= COMMUNITY BIO ================= */}

        <SectionHeader
          title="DRIVER BIO"
          rightText={`${bio.length}/200 chars`}
        />

        <View style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>
            Short Bio (Optional)
          </Text>

          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={(text) => {
              if (text.length <= 200) {
                setBio(text);
              }
            }}
            multiline
            textAlignVertical="top"
            placeholder="Tell the community a little about yourself..."
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.bioFooter}>
            <Text style={styles.bioHelper}>
              Helps food donors and recipients know you better
            </Text>

            <Text style={styles.charCount}>
              {bio.length}/200
            </Text>
          </View>
        </View>

        {/* ================= DRIVER SAFETY ================= */}

        <View style={styles.safetyCard}>
          <View style={styles.safetyIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#047857"
            />
          </View>

          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>
              Safe Food Delivery Active
            </Text>

            <Text style={styles.safetyText}>
              Your driver account follows standard food
              handling and community delivery guidelines.
            </Text>
          </View>
        </View>

        {/* ================= SAVE ================= */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Ionicons
            name={saving ? "sync-outline" : "save-outline"}
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        {/* ================= DISCARD ================= */}

        <TouchableOpacity
          style={styles.discardButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.discardText}>
            Discard Changes
          </Text>
        </TouchableOpacity>

        {/* ================= FOOTER ================= */}

        <View style={styles.footerNote}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color="#047857"
          />

          <Text style={styles.footerText}>
            Changes sync immediately across volunteer driver
            and delivery records.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({ title, rightText }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>
        {title}
      </Text>

      <Text style={styles.sectionHeaderRight}>
        {rightText}
      </Text>
    </View>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

function InputField({
  label,
  icon,
  value,
  onChangeText,
  keyboardType = "default",
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View style={styles.inputBox}>
        <Ionicons
          name={icon}
          size={18}
          color="#374151"
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 35,
  },

  /* ================= HEADER ================= */

  header: {
    height: 92,
    paddingTop: 38,
    paddingHorizontal: 17,
    backgroundColor: "#F8FAF9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF1EF",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },

  /* ================= PROFILE ================= */

  profileSection: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 22,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#159447",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cameraButton: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#087A3D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8FAF9",
  },

  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },

  changePhoto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
  },

  removePhoto: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },

  dot: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  verifiedBadge: {
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#BFF5CE",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#047857",
    letterSpacing: 0.3,
  },

  /* ================= SECTION ================= */

  sectionHeader: {
    marginTop: 5,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.6,
  },

  sectionHeaderRight: {
    fontSize: 10,
    color: "#6B7280",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 15,
    marginBottom: 14,
  },

  /* ================= INPUT ================= */

  inputGroup: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 7,
  },

  inputBox: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: "#F1F3F2",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1F2937",
    paddingVertical: 5,
  },

  /* ================= HELPER ================= */

  helperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: -5,
    marginBottom: 15,
  },

  helperText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 15,
  },

  /* ================= ROLE ================= */

  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  roleVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  roleVerifiedText: {
    fontSize: 10,
    color: "#047857",
    fontWeight: "600",
  },

  selectBox: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: "#F1F3F2",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  selectText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#1F2937",
  },

  /* ================= EMAIL ================= */

  emailVerified: {
    position: "absolute",
    right: 14,
    top: 70,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#A7F3C1",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  emailVerifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#047857",
  },

  phoneHelper: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 14,
    marginTop: -7,
    marginBottom: 15,
  },

  /* ================= BIO ================= */

  bioInput: {
    minHeight: 105,
    borderRadius: 12,
    backgroundColor: "#F1F3F2",
    padding: 12,
    fontSize: 13,
    color: "#1F2937",
    lineHeight: 19,
  },

  bioFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  bioHelper: {
    flex: 1,
    fontSize: 10,
    color: "#6B7280",
  },

  charCount: {
    fontSize: 10,
    color: "#6B7280",
  },

  /* ================= SAFETY ================= */

  safetyCard: {
    backgroundColor: "#E9EEEC",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    marginBottom: 15,
  },

  safetyIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  safetyInfo: {
    flex: 1,
  },

  safetyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 3,
  },

  safetyText: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 15,
  },

  /* ================= SAVE ================= */

  saveButton: {
    height: 51,
    borderRadius: 11,
    backgroundColor: "#087A3D",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ================= DISCARD ================= */

  discardButton: {
    height: 48,
    marginTop: 8,
    borderRadius: 11,
    backgroundColor: "#E8EBEA",
    justifyContent: "center",
    alignItems: "center",
  },

  discardText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },

  /* ================= FOOTER ================= */

  footerNote: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 15,
  },

  footerText: {
    flex: 1,
    marginLeft: 7,
    textAlign: "center",
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 15,
  },
});