import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchRecipientProfile, updateRecipientProfile } from "../../services/recipientService";

// ── Icons ──────────────────────────────────────────────────────────────────────
const BackIcon = () => <Text style={styles.backIconText}>←</Text>;
const PersonIcon = () => <Text style={styles.inputIconText}>👤</Text>;
const EmailIcon = () => <Text style={styles.inputIconText}>✉️</Text>;
const PhoneIcon = () => <Text style={styles.inputIconText}>📞</Text>;
const AddressIcon = () => <Text style={styles.inputIconText}>📍</Text>;
const SaveCheckIcon = () => <Text style={styles.saveCheckText}>✓</Text>;

export default function RecipientEditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchRecipientProfile();
      if (data && data.profile) {
        setName(data.profile.name || "");
        setEmail(data.profile.email || "");
        setPhone(data.profile.phone || "");
        setAddress(data.profile.address || "");
      }
    } catch (err) {
      console.error("Failed to load recipient profile for editing:", err);
      Alert.alert(
        "Error Loading Profile",
        "Could not load current profile details. Please try again.",
        [{ text: "Go Back", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // ── Field Validations ──
    if (!name.trim()) {
      Alert.alert("Validation Error", "Full Name is required.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Validation Error", "Phone Number is required.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Delivery Address is required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateRecipientProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      if (response && response.success) {
        Alert.alert(
          "Profile Updated",
          "Your recipient profile details have been saved successfully!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Update Failed", response?.message || "Could not update profile.");
      }
    } catch (err) {
      console.error("Error updating recipient profile:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to save profile changes. Please try again.";
      Alert.alert("Update Error", errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.headerSaveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving || loading}
          activeOpacity={0.7}
        >
          <SaveCheckIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loadingText}>Loading current details...</Text>
          </View>
        ) : (
          <>
            {/* ── Form Section ── */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>EDIT PERSONAL DETAILS</Text>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <PersonIcon />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter full name"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>

              {/* Email (Read-Only) */}
              <View style={styles.fieldGroup}>
                <View style={styles.readOnlyLabelRow}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <Text style={styles.readOnlyTag}>Read Only</Text>
                </View>
                <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                  <EmailIcon />
                  <TextInput
                    style={[styles.textInput, styles.textInputDisabled]}
                    value={email}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <PhoneIcon />
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>

              {/* Delivery Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Delivery Address *</Text>
                <View style={styles.multilineWrapper}>
                  <View style={styles.multilineIconCol}>
                    <AddressIcon />
                  </View>
                  <TextInput
                    style={styles.multilineInput}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                    placeholder="Enter full delivery address"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>
            </View>

            {/* ── Save Action Button ── */}
            <TouchableOpacity
              style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const GREEN = "#2e7d32";
const BORDER = "#e8e8e8";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#666666";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  backIconText: {
    fontSize: 20,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerSaveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#e8f5e9",
  },
  saveCheckText: {
    fontSize: 18,
    fontWeight: "800",
    color: GREEN,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  readOnlyLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readOnlyTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888888",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  inputIconText: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  textInputDisabled: {
    color: "#777777",
  },
  multilineWrapper: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    minHeight: 80,
  },
  multilineIconCol: {
    marginRight: 10,
    marginTop: 2,
  },
  multilineInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    textAlignVertical: "top",
    minHeight: 60,
  },
  submitBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#a5d6a7",
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
});
