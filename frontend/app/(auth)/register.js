import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import API from "../../services/api";

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("DONOR");

  // Common Required Fields
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Dynamic Role-Specific Fields
  const [businessName, setBusinessName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handleRegister = async () => {
    if (!name || !nic || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields marked with *");
      return;
    }

    try {
      const payload = {
        name,
        nic,
        email,
        password,
        role,
        phone,
        address,
        business_name: businessName,
        organization_name: orgName,
        register_number: regNumber,
        license_number: licenseNumber,
      };

      const response = await API.post("/auth/register", payload);

      if (response.data.requiresApproval) {
        Alert.alert(
          "Registration Submitted",
          "Your account was created and is currently pending Admin approval.",
        );
      } else {
        Alert.alert("Success", "Account created successfully!");
      }

      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>

      {/* Role Picker Selection */}
      <Text style={styles.label}>Select Account Type:</Text>
      <View style={styles.roleContainer}>
        {[
          { key: "DONOR", label: "Donor" },
          { key: "RECIPIENT", label: "Recipient" },
          { key: "FOOD_BANK", label: "Food Bank" },
          { key: "DRIVER", label: "Driver" },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.roleBtn, role === item.key && styles.roleBtnActive]}
            onPress={() => setRole(item.key)}
          >
            <Text
              style={[
                styles.roleText,
                role === item.key && styles.roleTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Common Required Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="NIC Number *"
        value={nic}
        onChangeText={setNic}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Conditional Role-Based Inputs */}
      {role === "DONOR" && (
        <TextInput
          style={styles.input}
          placeholder="Business Name (Optional)"
          value={businessName}
          onChangeText={setBusinessName}
        />
      )}

      {role === "RECIPIENT" && (
        <TextInput
          style={styles.input}
          placeholder="Delivery Address / Location *"
          value={address}
          onChangeText={setAddress}
        />
      )}

      {role === "FOOD_BANK" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Food Bank Name *"
            value={orgName}
            onChangeText={setOrgName}
          />
          <TextInput
            style={styles.input}
            placeholder="Registration Number *"
            value={regNumber}
            onChangeText={setRegNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Organization Address *"
            value={address}
            onChangeText={setAddress}
          />
        </>
      )}

      {role === "DRIVER" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Driving License Number *"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Operating Base Address *"
            value={address}
            onChangeText={setAddress}
          />
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
        <Text style={styles.submitText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#ffffff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1b5e20",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 10, color: "#333" },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  roleBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    flex: 1,
    alignItems: "center",
    minWidth: "45%",
  },
  roleBtnActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  roleText: { color: "#444444", fontSize: 13, fontWeight: "bold" },
  roleTextActive: { color: "#ffffff" },
  input: {
    borderBottomWidth: 1,
    borderColor: "#cccccc",
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  submitText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  linkText: {
    marginTop: 20,
    textAlign: "center",
    color: "#1565c0",
    fontSize: 14,
  },
});
