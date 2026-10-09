import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import API from "../../services/api";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export default function VerifyPickup() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // =====================================================
  // CHECKLIST
  // =====================================================

  const [checks, setChecks] = useState({
    collected: true,
    quantity: true,
    condition: true,
  });

  // =====================================================
  // NOTES
  // =====================================================

  const [notes, setNotes] = useState("");

  // =====================================================
  // CAMERA
  // =====================================================

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [camera, setCamera] = useState(null);

  // =====================================================
  // CHECKLIST TOGGLE
  // =====================================================

  const toggleCheck = (key) => {
    setChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allChecked =
    checks.collected &&
    checks.quantity &&
    checks.condition;

  // =====================================================
  // OPEN CAMERA
  // =====================================================

  const openCamera = async () => {
    if (!cameraPermission) {
      return;
    }

    if (!cameraPermission.granted) {
      const permissionResult =
        await requestCameraPermission();

      if (!permissionResult.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take a pickup verification photo."
        );

        return;
      }
    }

    setShowCamera(true);
  };

  // =====================================================
  // TAKE PHOTO
  // =====================================================

  const takePhoto = async () => {
    try {
      if (!camera) {
        Alert.alert(
          "Camera Not Ready",
          "Please wait a moment and try again."
        );

        return;
      }

      const photo = await camera.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.log("Camera error:", error);

      Alert.alert(
        "Camera Error",
        "Unable to take photo. Please try again."
      );
    }
  };

  // =====================================================
  // RETAKE PHOTO
  // =====================================================

  const retakePhoto = () => {
    setPhotoUri(null);
    setShowCamera(true);
  };

  // =====================================================
  // CONFIRM PICKUP
  // =====================================================

  const handleConfirmPickup = async () => {
    if (!allChecked) {
        Alert.alert(
        "Verification Required",
        "Please complete all checklist items before confirming pickup."
        );
        return;
    }

    try {
      const response = await API.patch("/driver/task-status", {
        taskType: params.taskType,
        claimId: params.claimId,
        requestId: params.requestId,
        status: "PICKED_UP",
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Could not update pickup status.");
      }

      router.push({
        pathname: "/(driver)/confirm-dropoff",
        params: {
          taskType: params.taskType || "",
          claimId: params.claimId || "",
          requestId: params.requestId || "",
          destinationAddress: params.destinationAddress || "",
          destinationLatitude: params.destinationLatitude || "",
          destinationLongitude: params.destinationLongitude || "",
        },
      });
    } catch (error) {
      Alert.alert(
        "Pickup Error",
        error?.response?.data?.message || error.message || "Could not confirm pickup."
      );
    }
  };

  // =====================================================
  // CAMERA SCREEN
  // =====================================================

if (showCamera) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        ref={(ref) => setCamera(ref)}
      />

      <SafeAreaView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "space-between",
        }}
      >
        {/* BACK BUTTON */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.6)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* CAPTURE BUTTON */}
        <View
          style={{
            alignItems: "center",
            paddingBottom: 35,
          }}
        >
          <TouchableOpacity
            onPress={takePhoto}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FFFFFF",
              borderWidth: 5,
              borderColor: "#DDDDDD",
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
  // =====================================================
  // MAIN VERIFY PICKUP SCREEN
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#374151"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Verify Pickup
        </Text>

        <View style={styles.profileButton}>
          <Ionicons
            name="person-outline"
            size={19}
            color="#374151"
          />
        </View>
      </View>

      {/* KEYBOARD SAFE CONTENT */}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          {/* FOOD CARD */}

          <View style={styles.foodCard}>
            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
              }}
              style={styles.foodImage}
            />

            <View style={styles.foodInfo}>
              <View style={styles.foodTitleRow}>
                <Text style={styles.foodTitle}>
                  Rice & Curry
                </Text>

                <View style={styles.portionBadge}>
                  <Text style={styles.portionText}>
                    10 portions
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#6B7280"
                />

                <Text style={styles.detailText}>
                  ABC Restaurant
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#6B7280"
                />

                <Text style={styles.detailText}>
                  11:30 AM
                </Text>
              </View>
            </View>
          </View>

          {/* CHECKLIST */}

          <Text style={styles.sectionTitle}>
            Verification Checklist
          </Text>

          <View style={styles.checklistCard}>
            <CheckItem
              checked={checks.collected}
              label="Food collected from donor"
              onPress={() =>
                toggleCheck("collected")
              }
            />

            <CheckItem
              checked={checks.quantity}
              label="Quantity matches (10 portions)"
              onPress={() =>
                toggleCheck("quantity")
              }
            />

            <CheckItem
              checked={checks.condition}
              label="Food is in good condition"
              onPress={() =>
                toggleCheck("condition")
              }
            />
          </View>

          {/* PHOTO */}

          <Text style={styles.sectionTitle}>
            Add Photo
            <Text style={styles.optional}>
              {" "}
              (Optional)
            </Text>
          </Text>

          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: photoUri }}
                style={styles.photoPreview}
              />

              <View style={styles.photoPreviewActions}>
                <View style={styles.photoTakenLabel}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#16A34A"
                  />

                  <Text style={styles.photoTakenText}>
                    Photo added
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={retakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={17}
                    color="#16A34A"
                  />

                  <Text style={styles.retakeText}>
                    Retake
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoBox}
              activeOpacity={0.8}
              onPress={openCamera}
            >
              <View style={styles.cameraCircle}>
                <Ionicons
                  name="camera-outline"
                  size={25}
                  color="#16A34A"
                />
              </View>

              <Text style={styles.photoTitle}>
                Take Photo
              </Text>

              <Text style={styles.photoSubtitle}>
                Camera verification photo
              </Text>
            </TouchableOpacity>
          )}

          {/* NOTES */}

          <Text style={styles.sectionTitle}>
            Additional Notes
            <Text style={styles.optional}>
              {" "}
              (Optional)
            </Text>
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Food packed securely in thermal bag..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.notesInput}
            returnKeyType="done"
            blurOnSubmit={false}
          />

          {/* CONFIRM */}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !allChecked &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmPickup}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Pickup
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.replace("/(driver)")
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.replace("/(driver)/map")
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="map-outline"
            size={21}
            color="#16A34A"
          />

          <Text style={styles.navTextActive}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={21}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// CHECK ITEM
// =====================================================

function CheckItem({
  checked,
  label,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.checkItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#FFFFFF"
          />
        )}
      </View>

      <Text style={styles.checkLabel}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F7",
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 58,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // CONTENT
  // ===================================================

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  // ===================================================
  // FOOD CARD
  // ===================================================

  foodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  foodImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },

  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },

  foodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  foodTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  portionBadge: {
    backgroundColor: "#E8F7ED",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  portionText: {
    color: "#16A34A",
    fontSize: 9,
    fontWeight: "700",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  detailText: {
    marginLeft: 5,
    fontSize: 11,
    color: "#6B7280",
  },

  // ===================================================
  // SECTION
  // ===================================================

  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  optional: {
    fontWeight: "400",
    color: "#6B7280",
  },

  // ===================================================
  // CHECKLIST
  // ===================================================

  checklistCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  checkItem: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  checkLabel: {
    marginLeft: 10,
    fontSize: 12,
    color: "#374151",
  },

  // ===================================================
  // PHOTO
  // ===================================================

  photoBox: {
    height: 108,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderStyle: "dashed",
    backgroundColor: "#F7FFF9",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  photoTitle: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  photoSubtitle: {
    marginTop: 2,
    fontSize: 9,
    color: "#9CA3AF",
  },

  photoPreviewContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  photoPreview: {
    width: "100%",
    height: 180,
  },

  photoPreviewActions: {
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  photoTakenLabel: {
    flexDirection: "row",
    alignItems: "center",
  },

  photoTakenText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },

  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
  },

  retakeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  // ===================================================
  // NOTES
  // ===================================================

  notesInput: {
    minHeight: 90,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 12,
    color: "#374151",
  },

  // ===================================================
  // CONFIRM
  // ===================================================

  confirmButton: {
    height: 48,
    marginTop: 15,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  confirmButtonDisabled: {
    opacity: 0.65,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpacing: {
    height: 20,
  },

  // ===================================================
  // BOTTOM NAV
  // ===================================================

  bottomNav: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  navText: {
    marginTop: 4,
    fontSize: 10,
    color: "#9CA3AF",
  },

  navTextActive: {
    marginTop: 4,
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "700",
  },

  // ===================================================
  // CAMERA
  // ===================================================

  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },

  cameraHeader: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  cameraCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  cameraHeaderSpace: {
    width: 46,
    height: 46,
  },

  cameraGuideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraGuide: {
    width: 280,
    height: 360,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 18,
    position: "relative",
  },

  // Guide corners

  cornerTopLeft: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#16A34A",
    borderTopLeftRadius: 18,
  },

  cornerTopRight: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#16A34A",
    borderTopRightRadius: 18,
  },

  cornerBottomLeft: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#16A34A",
    borderBottomLeftRadius: 18,
  },

  cornerBottomRight: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#16A34A",
    borderBottomRightRadius: 18,
  },

  cameraBottom: {
    height: 170,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 25,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cameraHint: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 18,
    textAlign: "center",
  },

  captureButtonOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
  },
});