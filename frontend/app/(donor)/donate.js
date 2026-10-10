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
import FeedbackModal from "../../components/common/FeedbackModal";
import { fetchFoodItems } from "../../services/foodItemService";
import { createDonation } from "../../services/donorService";

function isFutureExpiry(expiryStr) {
  if (!expiryStr || !expiryStr.trim()) return false;
  const str = expiryStr.trim();
  const now = new Date();

  let targetDate = new Date();

  if (str.toLowerCase().startsWith("today")) {
    targetDate = new Date();
  } else if (str.toLowerCase().startsWith("yesterday")) {
    return false;
  } else if (str.toLowerCase().startsWith("tomorrow")) {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (str.toLowerCase().startsWith("in 2 days")) {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
  } else {
    // Extract only the date portion (before the comma+time) and try to parse it
    const datePart = str.split(",")[0].trim();
    // Try adding current year so "Oct 10" becomes "Oct 10 2026"
    const withYear = `${datePart} ${now.getFullYear()}`;
    const parsed = new Date(withYear);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
      // If that date already passed this year, try next year
      if (targetDate < now) {
        const withNextYear = `${datePart} ${now.getFullYear() + 1}`;
        const parsedNext = new Date(withNextYear);
        if (!isNaN(parsedNext.getTime())) {
          targetDate = parsedNext;
        }
      }
    } else {
      // Fallback: try parsing the whole string directly
      const fullParsed = new Date(str);
      if (!isNaN(fullParsed.getTime())) {
        return fullParsed > now;
      }
      // Cannot parse — allow it through
      return true;
    }
  }

  const timeMatch = str.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate > now;
  }

  return true;
}

export default function DonateFoodScreen() {
  const router = useRouter();

  // Form State
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [expiryWindow, setExpiryWindow] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdDonation, setCreatedDonation] = useState(null);

  // Pop Up Feedback Modal state
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

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
      const data = await fetchFoodItems();
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
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      const address = await reverseGeocodeCoords(lat, lng);

      setLocation(address);
      setLatitude(lat);
      setLongitude(lng);

      if (errors.location) {
        setErrors((prev) => ({ ...prev, location: undefined }));
      }
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
    }
  };

  // Form Validation Handler
  const validateForm = () => {
    const newErrors = {};

    // 1. Food Item validation
    const finalMealName = selectedFoodItem ? selectedFoodItem.name : mealName.trim();
    if (!finalMealName) {
      newErrors.foodItem = "Please select a food item.";
    }

    // 2. Quantity validation
    if (!quantity || !String(quantity).trim()) {
      newErrors.quantity = "Please enter a quantity.";
    } else {
      const parsedQty = parseFloat(quantity);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        newErrors.quantity = "Quantity must be greater than 0.";
      }
    }

    // 3. Quantity Unit validation
    if (!quantityUnit || !quantityUnit.trim()) {
      newErrors.quantityUnit = "Please select a quantity unit.";
    }

    // 4. Pickup Location validation
    if (!location || !location.trim()) {
      newErrors.location = "Please select a pickup location.";
    }

    // 5. Expiry Window validation
    if (!expiryWindow || !expiryWindow.trim()) {
      newErrors.expiryWindow = "Please select an expiry time.";
    } else if (!isFutureExpiry(expiryWindow)) {
      newErrors.expiryWindow = "Expiry time must be in the future.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const finalMealName = selectedFoodItem ? selectedFoodItem.name : mealName.trim();
    const foodItemId = selectedFoodItem ? selectedFoodItem.id : null;
    const parsedQty = parseFloat(quantity);

    setIsSubmitting(true);

    try {
      const data = await createDonation({
        food_item_id: foodItemId,
        meal_name: finalMealName,
        quantity: parsedQty,
        quantity_unit: quantityUnit.toLowerCase(),
        location: location.trim(),
        latitude,
        longitude,
        expiry_window: expiryWindow.trim(),
        notes: notes.trim(),
        image_base64: selectedImage && selectedImage.startsWith("data:image") ? selectedImage : null,
        image_url: selectedImage && !selectedImage.startsWith("data:image") ? selectedImage : null,
      });

      if (data && data.donation) {
        setCreatedDonation(data.donation);
        setIsSubmitting(false);
        setFeedbackModal({
          visible: true,
          type: "success",
          title: "Donation Created Successfully!",
          message: data.message || "Your surplus food donation post has been published and is now visible to nearby recipients.",
          onCloseAction: () => {
            setIsSubmitted(true);
          },
        });
      } else {
        setFeedbackModal({
          visible: true,
          type: "error",
          title: "Submission Failed",
          message: data?.message || "Failed to submit donation.",
          onCloseAction: null,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.warn("Donation submit error:", error.message);
      setFeedbackModal({
        visible: true,
        type: "error",
        title: "Submission Error",
        message: error.response?.data?.message || error.message || "Failed to submit donation.",
        onCloseAction: null,
      });
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const realId = createdDonation?.id
      ? `#FD${String(createdDonation.id).padStart(5, "0")}`
      : null;
    const formattedQtyDisplay = quantityUnit
      ? `${quantity} ${quantityUnit.charAt(0).toUpperCase() + quantityUnit.slice(1)}`
      : `${quantity}`;
    return (
      <DonationSuccess
        donationId={realId}
        postedDate={createdDonation?.created_at ? createdDonation.created_at.split("T")[0] : new Date().toISOString().split("T")[0]}
        mealName={mealName.trim() || (selectedFoodItem ? selectedFoodItem.name : "Fresh Food Donation")}
        quantity={formattedQtyDisplay}
        expiryWindow={expiryWindow || "Today, 05:00 PM"}
        image={selectedImage || null}
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
                <Text style={styles.label}>
                  Pickup Location <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
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
                style={[
                  styles.locationCardSelect,
                  errors.location && styles.inputErrorBorder,
                ]}
                onPress={() => setIsMapModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="location-sharp" size={20} color="#087A3D" style={{ marginRight: 8 }} />
                <Text
                  style={[
                    styles.locationCardText,
                    !location && { color: "#9CA3AF", fontWeight: "400" },
                  ]}
                  numberOfLines={1}
                >
                  {location || "Select location on Google Map"}
                </Text>
                <View style={styles.mapPillBadge}>
                  <MaterialCommunityIcons name="google-maps" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.mapPillText}>Google Map</Text>
                </View>
              </TouchableOpacity>
              {errors.location ? (
                <Text style={styles.fieldErrorText}>{errors.location}</Text>
              ) : null}
            </View>

            {/* 2. Food Item Selector Dropdown */}
            <View style={{ marginBottom: errors.foodItem ? 0 : 0 }}>
              <FoodItemSelector
                selectedItem={selectedFoodItem}
                onSelectItem={(item) => {
                  setSelectedFoodItem(item);
                  setMealName(item ? item.name : "");
                  if (errors.foodItem) {
                    setErrors((prev) => ({ ...prev, foodItem: undefined }));
                  }
                }}
                foodItems={foodItems}
                isLoading={isLoadingFoodItems}
                onRefreshItems={loadFoodItems}
                hasError={!!errors.foodItem}
              />
              {errors.foodItem ? (
                <Text style={[styles.fieldErrorText, { marginTop: -10, marginBottom: 12 }]}>
                  {errors.foodItem}
                </Text>
              ) : null}
            </View>

            {/* 3. Numeric Quantity & Unit Selector */}
            <View style={{ marginBottom: (errors.quantity || errors.quantityUnit) ? 0 : 0 }}>
              <QuantityUnitSelector
                quantity={quantity}
                onChangeQuantity={(val) => {
                  setQuantity(val);
                  if (errors.quantity) {
                    setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }
                }}
                unit={quantityUnit}
                onChangeUnit={(val) => {
                  setQuantityUnit(val);
                  if (errors.quantityUnit) {
                    setErrors((prev) => ({ ...prev, quantityUnit: undefined }));
                  }
                }}
                category={selectedFoodItem ? selectedFoodItem.category : null}
                quantityError={!!errors.quantity}
                unitError={!!errors.quantityUnit}
              />
              {(errors.quantity || errors.quantityUnit) ? (
                <View style={{ marginTop: -10, marginBottom: 14, gap: 2 }}>
                  {errors.quantity ? (
                    <Text style={styles.fieldErrorText}>{errors.quantity}</Text>
                  ) : null}
                  {errors.quantityUnit ? (
                    <Text style={styles.fieldErrorText}>{errors.quantityUnit}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* 4. Consume Before (Expiry Window) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Consume Before (Expiry Window) <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
                <View style={styles.safetyRow}>
                  <Ionicons name="timer-outline" size={12} color="#DC2626" />
                  <Text style={styles.safetyText}>Safety First</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.inputWrapper, errors.expiryWindow && styles.inputErrorBorder]}
                onPress={() => setIsExpiryModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="time-outline" size={18} color="#087A3D" style={styles.inputLeftIcon} />
                <Text
                  style={[
                    styles.textInput,
                    {
                      color: expiryWindow ? "#111827" : "#9CA3AF",
                      paddingTop: Platform.OS === "web" ? 10 : 8,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {expiryWindow || "Select expiry date and time"}
                </Text>
                <View style={styles.inputRightIconBtn}>
                  <Ionicons name="calendar-outline" size={20} color="#087A3D" />
                </View>
              </TouchableOpacity>
              {errors.expiryWindow ? (
                <Text style={styles.fieldErrorText}>{errors.expiryWindow}</Text>
              ) : null}
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
        onSelectLocation={(selected) => {
          setLocation(selected.address || "");
          setLatitude(selected.latitude !== undefined && selected.latitude !== null ? selected.latitude : null);
          setLongitude(selected.longitude !== undefined && selected.longitude !== null ? selected.longitude : null);
          if (errors.location) {
            setErrors((prev) => ({ ...prev, location: undefined }));
          }
        }}
      />

      {/* Interactive Expiry Calendar & Timer Picker Modal */}
      <ExpiryPickerModal
        visible={isExpiryModalVisible}
        onClose={() => setIsExpiryModalVisible(false)}
        currentValue={expiryWindow}
        onSelectExpiry={(selected) => {
          setExpiryWindow(selected);
          if (errors.expiryWindow) {
            setErrors((prev) => ({ ...prev, expiryWindow: undefined }));
          }
        }}
      />

      {/* Pop Up Feedback Modal */}
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => {
          const action = feedbackModal.onCloseAction;
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
          if (action) action();
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
  fieldErrorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 2,
  },
  inputErrorBorder: {
    borderColor: "#DC2626",
    borderWidth: 1,
  },
});
