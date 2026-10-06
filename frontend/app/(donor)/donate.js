import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import DonationSuccess from "../../components/donor/DonationSuccess";
import LocationPickerModal, { reverseGeocodeCoords } from "../../components/donor/LocationPickerModal";
import FoodItemSelector from "../../components/donor/FoodItemSelector";
import ExpiryPickerModal from "../../components/donor/ExpiryPickerModal";
import QuantityUnitSelector from "../../components/donor/QuantityUnitSelector";
import { fetchFoodItems } from "../../services/foodItemService";

export default function DonateFoodScreen() {
  const router = useRouter();

  // Form State
  const [location, setLocation] = useState("Colombo 03, Sri Lanka");
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [expiryWindow, setExpiryWindow] = useState("Today, 02:00 PM");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Expiry Picker Modal State
  const [isExpiryModalVisible, setIsExpiryModalVisible] = useState(false);

  // Reusable Food Item State
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);

  // Map & GPS Location State
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Load Saved Food Items for Donor
  const loadFoodItems = async () => {
    setIsLoadingFoodItems(true);
    try {
      const data = await fetchFoodItems(1);
      const items = data && data.foodItems ? data.foodItems : (Array.isArray(data) ? data : []);
      setFoodItems(items);
      if (items.length > 0) {
        setSelectedFoodItem(items[0]);
        setMealName(items[0].name);
      }
    } catch (err) {
      console.warn("Could not load food items:", err.message);
    } finally {
      setIsLoadingFoodItems(false);
    }
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  // Fetch Current GPS Location
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
      const address = await reverseGeocodeCoords(loc.coords.latitude, loc.coords.longitude);
      setLocation(address);
    } catch (err) {
      console.warn("GPS location error:", err.message);
      Alert.alert("Location Error", "Could not determine location automatically. Please select on Google Map.");
    } finally {
      setIsLocating(false);
    }
  };

  // Real Image Picker (File Browser on Web / Base64 Data URL)
  const handleSelectImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
      return;
    }

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedImage(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      setSelectedImage(
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
      );
    }
  };

  // Form Submission Handler
  const handleSubmit = async () => {
    const finalMealName = selectedFoodItem ? selectedFoodItem.name : mealName.trim();
    const foodItemId = selectedFoodItem ? selectedFoodItem.id : null;
    const parsedQty = parseFloat(quantity);

    if (!finalMealName) {
      Alert.alert("Required Field", "Please select a Food Item.");
      return;
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert("Validation Error", "Please enter a valid numeric quantity greater than 0.");
      return;
    }

    if (!quantityUnit) {
      Alert.alert("Validation Error", "Please select a unit (e.g. portions, packets, kg).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          food_item_id: foodItemId,
          meal_name: finalMealName,
          quantity: parsedQty,
          quantity_unit: quantityUnit.toLowerCase(),
          location: location.trim() || "Colombo 03, Sri Lanka",
          expiry_window: expiryWindow || "Today, 02:00 PM",
          notes: notes.trim(),
          image_base64: selectedImage && selectedImage.startsWith("data:image") ? selectedImage : null,
          image_url: selectedImage && !selectedImage.startsWith("data:image") ? selectedImage : null,
          donor_id: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitting(false);
        setIsSubmitted(true);
      } else {
        Alert.alert("Submission Failed", data.message || "Failed to submit donation.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.warn("Backend connection error, falling back to local view:", error.message);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    const formattedQtyDisplay = quantityUnit
      ? `${quantity} ${quantityUnit.charAt(0).toUpperCase() + quantityUnit.slice(1)}`
      : `${quantity}`;
    return (
      <DonationSuccess
        donationId="#FD00123"
        postedDate={new Date().toISOString().split("T")[0]}
        mealName={mealName.trim() || (selectedFoodItem ? selectedFoodItem.name : "Fresh Artisan Bread & Pastries")}
        quantity={formattedQtyDisplay}
        expiryWindow={expiryWindow || "Today, 5:00 PM – 7:30 PM"}
        image={selectedImage || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"}
        onBackToDashboard={() => router.push("/(donor)")}
        onViewDonation={() => setIsSubmitted(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="Donate Food" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeaderRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(donor)")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.pioneerBadge}>
          <Text style={styles.pioneerBadgeText}>🌱 Zero Food Waste Pioneer</Text>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert("Help", "Food donations follow community food safety rules.")}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Share Surplus Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconBox}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#087A3D" />
            </View>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle}>Share Surplus Nourishment</Text>
              <Text style={styles.bannerSubtitle}>
                Every meal registered is safely routed to verified volunteers and community kitchens...
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* 1. Pickup Location (Google Map / GPS Only) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Pickup Location</Text>
                <TouchableOpacity 
                  onPress={handleFetchGPSLocation}
                  disabled={isLocating}
                  style={styles.activeHubBadge}
                  activeOpacity={0.7}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#087A3D" />
                  ) : (
                    <Ionicons name="navigate" size={13} color="#087A3D" />
                  )}
                  <Text style={styles.activeHubText}>
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
                  {location || "Select location on Google Map"}
                </Text>
                <View style={styles.mapPillBadge}>
                  <MaterialCommunityIcons name="google-maps" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.mapPillText}>Google Map</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 2. Food Item Selector Dropdown */}
            <FoodItemSelector
              selectedItem={selectedFoodItem}
              onSelectItem={(item) => {
                setSelectedFoodItem(item);
                setMealName(item ? item.name : "");
              }}
              foodItems={foodItems}
              isLoading={isLoadingFoodItems}
              onRefreshItems={loadFoodItems}
            />

            {/* 3. Numeric Quantity & Unit Selector */}
            <QuantityUnitSelector
              quantity={quantity}
              onChangeQuantity={setQuantity}
              unit={quantityUnit}
              onChangeUnit={setQuantityUnit}
              category={selectedFoodItem ? selectedFoodItem.category : null}
            />

            {/* 4. Consume Before (Expiry Window) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Consume Before (Expiry Window)</Text>
                <View style={styles.safetyRow}>
                  <Ionicons name="timer-outline" size={12} color="#DC2626" />
                  <Text style={styles.safetyText}>Safety First</Text>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={18} color="#087A3D" style={styles.inputLeftIcon} />
                <TextInput
                  style={styles.textInput}
                  value={expiryWindow}
                  onChangeText={setExpiryWindow}
                  placeholder="Select expiry time"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.inputRightIconBtn}
                  onPress={() => setIsExpiryModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#087A3D" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Food Photo Upload */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Food Photo</Text>
                <Text style={styles.subLabel}>Optional but recommended</Text>
              </View>

              <View style={styles.photoBox}>
                {selectedImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={handleSelectImage}>
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadTouchable}
                    onPress={handleSelectImage}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cameraCircle}>
                      <Ionicons name="camera-outline" size={26} color="#087A3D" />
                    </View>
                    <Text style={styles.photoTitle}>Tap to add image</Text>
                    <Text style={styles.photoSubtitle}>
                      High quality food photo helps recipients identify meals quickly
                    </Text>
                    <View style={styles.cameraPill}>
                      <Ionicons name="camera-outline" size={14} color="#374151" style={{ marginRight: 4 }} />
                      <Text style={styles.cameraPillText}>Camera or Gallery</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 6. Additional Notes & Allergens */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Additional Notes & Allergens</Text>
                <Text style={styles.subLabel}>Optional</Text>
              </View>
              <View style={styles.multilineWrapper}>
                <TextInput
                  style={styles.multilineInput}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Vegetarian, contains nuts, packed warmly in eco containers, front desk handoff..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Good Samaritan Guidelines Box */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#087A3D" />
              <Text style={styles.disclaimerText}>
                Registered donations adhere to regional Community Good Samaritan guidelines to protect your organization.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="hand-heart" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Submitting..." : "Submit Donation"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom Navigation Bar with "Donate" active */}
        <DonorBottomNav initialTab="Donate" />
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        initialAddress={location}
        onSelectLocation={(selected) => setLocation(selected.address)}
      />

      {/* Interactive Expiry Calendar & Timer Picker Modal */}
      <ExpiryPickerModal
        visible={isExpiryModalVisible}
        onClose={() => setIsExpiryModalVisible(false)}
        currentValue={expiryWindow}
        onSelectExpiry={(selected) => setExpiryWindow(selected)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 6,
  },
  pioneerBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pioneerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
  helpButton: {
    padding: 4,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  formContainer: {
    gap: 16,
  },
  fieldGroup: {},
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
  subLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  activeHubBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeHubText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
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
  safetyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
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
  inputLeftIcon: {
    marginRight: 8,
  },
  inputRightIconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 8,
  },
  photoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTouchable: {
    alignItems: "center",
    width: "100%",
  },
  cameraCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  photoSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 16,
    marginBottom: 10,
  },
  cameraPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraPillText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11.5,
    color: "#374151",
    marginLeft: 10,
    lineHeight: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
