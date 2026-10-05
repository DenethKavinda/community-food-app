import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

export default function ConfirmDropoff() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  // =========================
  // CAMERA
  // =========================

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to take a delivery photo."
        );
        return;
      }
    }

    setCameraVisible(true);
  };

  const takePhoto = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync();

      if (photo?.uri) {
        setPhotoTaken(true);
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Could not take the photo.");
    }
  };

  // =========================
  // CONFIRM DROP-OFF
  // =========================

  const confirmDropoff = () => {
    if (!photoTaken) {
      Alert.alert(
        "Photo Required",
        "Please take a photo of the delivered food before confirming the drop-off."
      );
      return;
    }

    // Directly go to Delivery History
    router.push("/(driver)/history");
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
            color="#1F2937"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Confirm Drop-off
        </Text>

        <View style={styles.profileButton}>
          <Ionicons
            name="person-outline"
            size={22}
            color="#374151"
          />
        </View>
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= RECEIVER CARD ================= */}

        <View style={styles.receiverCard}>

          <View style={styles.receiverIcon}>
            <Ionicons
              name="business-outline"
              size={25}
              color="#16A34A"
            />
          </View>

          <View style={styles.receiverInfo}>

            <Text style={styles.receiverName}>
              Community Center
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color="#6B7280"
              />

              <Text style={styles.infoText}>
                456 Temple Road, Nugegoda
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="person-outline"
                size={14}
                color="#6B7280"
              />

              <Text style={styles.infoText}>
                Receiver: Sister Mary
              </Text>
            </View>

          </View>
        </View>

        {/* ================= DELIVERY CONFIRMATION ================= */}

        <Text style={styles.sectionLabel}>
          DELIVERY CONFIRMATION
        </Text>

        <View style={styles.confirmationCard}>

          <View style={styles.successCircle}>
            <Ionicons
              name="checkmark"
              size={17}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.successText}>
            Food delivered successfully
          </Text>

          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              Verified
            </Text>
          </View>

        </View>

        {/* ================= PHOTO HEADER ================= */}

        <View style={styles.photoHeader}>

          <Text style={styles.sectionLabel}>
            ADD PHOTO (REQUIRED)
          </Text>

          <Text style={styles.stepText}>
            Step 2 of 2
          </Text>

        </View>

        {/* ================= PHOTO BOX ================= */}

        <TouchableOpacity
          style={[
            styles.photoBox,
            photoTaken && styles.photoBoxDone,
          ]}
          onPress={openCamera}
          activeOpacity={0.8}
        >

          <View style={styles.cameraCircle}>
            <Ionicons
              name={photoTaken ? "checkmark" : "camera-outline"}
              size={28}
              color="#16A34A"
            />
          </View>

          <Text style={styles.takePhotoText}>
            {photoTaken ? "Photo Added" : "Take Photo"}
          </Text>

          <Text style={styles.photoDescription}>
            {photoTaken
              ? "Delivery photo captured successfully"
              : "Take a photo of the delivered food at drop-off point"}
          </Text>

        </TouchableOpacity>

        {/* ================= CONFIRM BUTTON ================= */}

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmDropoff}
          activeOpacity={0.85}
        >

          <Ionicons
            name="checkmark"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.confirmButtonText}>
            Confirm Drop-off
          </Text>

        </TouchableOpacity>

        {/* ================= RECENT ACTIVITY ================= */}

        <View style={styles.recentHeader}>

          <Text style={styles.sectionLabel}>
            RECENT ACTIVITY
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.activityCard}>

          <ActivityItem
            title="Rice & Curry"
            subtitle="Delivered • 2024-09-14"
          />

          <ActivityItem
            title="Sandwiches"
            subtitle="Delivered • 2024-09-13"
          />

          <ActivityItem
            title="Fruits (Mixed)"
            subtitle="Delivered • 2024-09-12"
          />

        </View>

      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(driver)")}
        >
          <Ionicons
            name="home-outline"
            size={23}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(driver)/map")}
        >
          <Ionicons
            name="map-outline"
            size={24}
            color="#16A34A"
          />

          <Text
            style={[
              styles.navText,
              styles.activeNavText,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(driver)/history")}
        >
          <Ionicons
            name="time-outline"
            size={23}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            History
          </Text>
        </TouchableOpacity>

      </View>

      {/* ================= CAMERA MODAL ================= */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >

        <View style={styles.cameraContainer}>

          <CameraView
            style={styles.camera}
            facing="back"
            ref={(ref) => setCameraRef(ref)}
          />

          <View style={styles.cameraOverlay}>

            <TouchableOpacity
              style={styles.closeCamera}
              onPress={() => setCameraVisible(false)}
            >
              <Ionicons
                name="close"
                size={30}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

/* =====================================================
   ACTIVITY ITEM
===================================================== */

function ActivityItem({ title, subtitle }) {
  return (
    <View style={styles.activityItem}>

      <View style={styles.activityCheck}>
        <Ionicons
          name="checkmark"
          size={15}
          color="#16A34A"
        />
      </View>

      <View style={styles.activityInfo}>

        <Text style={styles.activityTitle}>
          {title}
        </Text>

        <Text style={styles.activitySubtitle}>
          {subtitle}
        </Text>

      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#CBD5E1"
      />

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
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 25,
    paddingBottom: 18,
  },

  /* ================= HEADER ================= */

  header: {
    height: 92,
    paddingTop: 38,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= RECEIVER ================= */

  receiverCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  receiverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  receiverInfo: {
    flex: 1,
  },

  receiverName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  infoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 5,
  },

  /* ================= LABEL ================= */

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },

  /* ================= DELIVERY ================= */

  confirmationCard: {
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  successCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  successText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },

  verifiedBadge: {
    backgroundColor: "#E8F8EF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  verifiedText: {
    color: "#16A34A",
    fontSize: 10,
    fontWeight: "700",
  },

  /* ================= PHOTO ================= */

  photoHeader: {
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepText: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  photoBox: {
    marginTop: 8,
    height: 125,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#4ADE80",
    borderStyle: "dashed",
    backgroundColor: "#F3FBF6",
    justifyContent: "center",
    alignItems: "center",
  },

  photoBoxDone: {
    backgroundColor: "#ECFDF3",
  },

  cameraCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DDF7E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  takePhotoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  photoDescription: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  /* ================= BUTTON ================= */

  confirmButton: {
    height: 50,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  /* ================= RECENT ================= */

  recentHeader: {
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewAll: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },

  activityItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  activityCheck: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },

  activitySubtitle: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 2,
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    height: 75,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },

  navText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },

  activeNavText: {
    color: "#16A34A",
    fontWeight: "700",
  },

  /* ================= CAMERA ================= */

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 45,
  },

  closeCamera: {
    alignSelf: "flex-start",
    marginLeft: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#16A34A",
  },

});