import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import QuantityUnitSelector from "./QuantityUnitSelector";
import LocationPickerModal from "./LocationPickerModal";
import ExpiryPickerModal from "./ExpiryPickerModal";
import { updateDonation } from "../../services/donorService";

export default function EditDonationModal({
  visible,
  onClose,
  donation,
  onDonationUpdated,
}) {
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [expiryWindow, setExpiryWindow] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isExpiryModalVisible, setIsExpiryModalVisible] = useState(false);

  useEffect(() => {
    if (donation) {
      setMealName(donation.title || donation.meal_name || "");
      setQuantity(String(donation.originalQuantity ?? donation.quantity ?? ""));
      setQuantityUnit((donation.quantity_unit || donation.unit || "items").toLowerCase());
      setLocation(donation.location || "");
      setLatitude(donation.latitude ?? null);
      setLongitude(donation.longitude ?? null);
      setExpiryWindow(donation.expiry || donation.expiry_window || "");
      setNotes(donation.notes === "None provided" ? "" : (donation.notes || ""));
      setSelectedImage(donation.image || donation.image_url || null);
      setErrors({});
    }
  }, [donation, visible]);

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

  const validate = () => {
    const newErrors = {};
    if (!mealName.trim()) {
      newErrors.mealName = "Please enter food or meal name.";
    }
    if (!quantity || !String(quantity).trim() || parseFloat(quantity) <= 0) {
      newErrors.quantity = "Please enter valid quantity greater than 0.";
    }
    if (!quantityUnit.trim()) {
      newErrors.quantityUnit = "Please select quantity unit.";
    }
    if (!location.trim()) {
      newErrors.location = "Please select a pickup location.";
    }
    if (!expiryWindow.trim()) {
      newErrors.expiryWindow = "Please select expiry window.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await updateDonation(donation.id, {
        meal_name: mealName.trim(),
        quantity: parseFloat(quantity),
        quantity_unit: quantityUnit.toLowerCase(),
        location: location.trim(),
        latitude,
        longitude,
        expiry_window: expiryWindow.trim(),
        notes: notes.trim(),
        image_base64: selectedImage && selectedImage.startsWith("data:image") ? selectedImage : null,
        image_url: selectedImage && !selectedImage.startsWith("data:image") ? selectedImage : null,
      });

      if (res && res.success) {
        Alert.alert("Success", "Donation updated successfully!");
        if (onDonationUpdated) onDonationUpdated(res.donation);
        onClose();
      } else {
        Alert.alert("Update Error", res?.message || "Could not update donation.");
      }
    } catch (err) {
      console.warn("Update donation failed:", err.message);
      Alert.alert("Update Error", err.response?.data?.message || err.message || "Could not update donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!donation) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="pencil-box-outline" size={22} color="#087A3D" />
              <Text style={styles.headerTitle}>Edit Available Donation</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formContent}>
              {/* Meal Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Food or Meal Name <Text style={styles.star}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, errors.mealName && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    value={mealName}
                    onChangeText={(val) => {
                      setMealName(val);
                      if (errors.mealName) setErrors((prev) => ({ ...prev, mealName: undefined }));
                    }}
                    placeholder="Enter meal name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.mealName && <Text style={styles.errorText}>{errors.mealName}</Text>}
              </View>

              {/* Quantity & Unit */}
              <View style={styles.fieldGroup}>
                <QuantityUnitSelector
                  quantity={quantity}
                  onChangeQuantity={(val) => {
                    setQuantity(val);
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  unit={quantityUnit}
                  onChangeUnit={(val) => {
                    setQuantityUnit(val);
                    if (errors.quantityUnit) setErrors((prev) => ({ ...prev, quantityUnit: undefined }));
                  }}
                  quantityError={!!errors.quantity}
                  unitError={!!errors.quantityUnit}
                />
                {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
              </View>

              {/* Pickup Location */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Pickup Location <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, errors.location && styles.inputError]}
                  onPress={() => setIsMapModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="location-sharp" size={18} color="#087A3D" style={{ marginRight: 8 }} />
                  <Text style={[styles.textInputText, !location && { color: "#9CA3AF" }]} numberOfLines={1}>
                    {location || "Select location on Google Map"}
                  </Text>
                  <Ionicons name="map-outline" size={18} color="#087A3D" />
                </TouchableOpacity>
                {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
              </View>

              {/* Expiry Window */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Consume Before (Expiry Window) <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, errors.expiryWindow && styles.inputError]}
                  onPress={() => setIsExpiryModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="time-outline" size={18} color="#087A3D" style={{ marginRight: 8 }} />
                  <Text style={[styles.textInputText, !expiryWindow && { color: "#9CA3AF" }]} numberOfLines={1}>
                    {expiryWindow || "Select expiry date and time"}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#087A3D" />
                </TouchableOpacity>
                {errors.expiryWindow && <Text style={styles.errorText}>{errors.expiryWindow}</Text>}
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Additional Notes & Allergens (Optional)</Text>
                <View style={styles.multilineWrapper}>
                  <TextInput
                    style={styles.multilineInput}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    placeholder="e.g. Vegetarian, packed warmly..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Photo Upload */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Food Photo (Optional)</Text>
                {selectedImage ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImgBtn} onPress={handleSelectImage}>
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.photoBtn} onPress={handleSelectImage} activeOpacity={0.8}>
                    <Ionicons name="camera-outline" size={22} color="#087A3D" />
                    <Text style={styles.photoBtnText}>Change or Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Location Picker Modal */}
          <LocationPickerModal
            visible={isMapModalVisible}
            onClose={() => setIsMapModalVisible(false)}
            initialAddress={location}
            onSelectLocation={(selected) => {
              setLocation(selected.address || "");
              setLatitude(selected.latitude ?? null);
              setLongitude(selected.longitude ?? null);
              if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
            }}
          />

          {/* Expiry Picker Modal */}
          <ExpiryPickerModal
            visible={isExpiryModalVisible}
            onClose={() => setIsExpiryModalVisible(false)}
            currentValue={expiryWindow}
            onSelectExpiry={(selected) => {
              setExpiryWindow(selected);
              if (errors.expiryWindow) setErrors((prev) => ({ ...prev, expiryWindow: undefined }));
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    width: "100%",
    maxWidth: 480,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
  },
  scrollContainer: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 16,
  },
  formContent: {
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  star: {
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
  inputError: {
    borderColor: "#DC2626",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  textInputText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 2,
  },
  multilineWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    minHeight: 70,
  },
  multilineInput: {
    fontSize: 13.5,
    color: "#111827",
    textAlignVertical: "top",
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingVertical: 12,
    borderRadius: 12,
  },
  photoBtnText: {
    color: "#087A3D",
    fontSize: 13,
    fontWeight: "600",
  },
  imagePreviewWrapper: {
    position: "relative",
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
    backgroundColor: "#F3F4F6",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeImgBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 10,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#087A3D",
  },
  saveBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
