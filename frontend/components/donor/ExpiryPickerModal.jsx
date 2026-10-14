import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Format a Date object to YYYY-MM-DD for HTML5 date input
 */
function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to HH:MM for HTML5 time input
 */
function toTimeInputValue(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format hours and minutes to human-readable "HH:MM AM/PM"
 */
function formatTime12H(hours, minutes) {
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const padH = String(h12).padStart(2, "0");
  const padM = String(minutes).padStart(2, "0");
  return `${padH}:${padM} ${ampm}`;
}

/**
 * Parse an incoming currentValue (e.g. "Oct 15, 05:00 PM" or ISO string)
 * into a valid Date object. Defaults to 2 hours from now.
 */
function parseInitialDate(currentValue) {
  const now = new Date();
  const defaultFuture = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  if (!currentValue || typeof currentValue !== "string") {
    return defaultFuture;
  }

  const str = currentValue.trim();

  // Try direct ISO or Date parse first
  const parsedDirect = new Date(str);
  if (!isNaN(parsedDirect.getTime()) && parsedDirect > now) {
    return parsedDirect;
  }

  // Handle format like "Oct 15, 05:00 PM"
  if (str.includes(",")) {
    const parts = str.split(",");
    const datePart = parts[0].trim();
    const timePart = parts.slice(1).join(",").trim();

    const withYear = `${datePart} ${now.getFullYear()}`;
    const parsedDate = new Date(withYear);

    if (!isNaN(parsedDate.getTime())) {
      const timeMatch = timePart.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        parsedDate.setHours(hours, minutes, 0, 0);
      }
      if (parsedDate > now) {
        return parsedDate;
      }
    }
  }

  return defaultFuture;
}

export default function ExpiryPickerModal({
  visible,
  onClose,
  currentValue,
  onSelectExpiry,
}) {
  // Selected expiry as a single master Date object
  const [selectedDateTime, setSelectedDateTime] = useState(() =>
    parseInitialDate(currentValue)
  );

  // Native mobile picker visibility states
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);
  const [showNativeTimePicker, setShowNativeTimePicker] = useState(false);

  // Validation error state
  const [validationError, setValidationError] = useState("");

  // Sync state when modal opens or currentValue changes
  useEffect(() => {
    if (visible) {
      const initial = parseInitialDate(currentValue);
      setSelectedDateTime(initial);
      setValidationError("");
    }
  }, [visible, currentValue]);

  // Derived current values
  const now = new Date();
  const minDateString = toDateInputValue(now);
  const currentDateInputValue = toDateInputValue(selectedDateTime);
  const currentTimeInputValue = toTimeInputValue(selectedDateTime);

  // Check if selected datetime is in the past
  const isPastDateTime = useMemo(() => {
    return selectedDateTime.getTime() <= Date.now();
  }, [selectedDateTime]);

  // Update validation message whenever selectedDateTime changes
  useEffect(() => {
    if (selectedDateTime.getTime() <= Date.now()) {
      setValidationError("Selected expiry date and time must be in the future.");
    } else {
      setValidationError("");
    }
  }, [selectedDateTime]);

  // Handle HTML5 Web Date change
  const handleWebDateChange = (e) => {
    const dateStr = e.target.value; // YYYY-MM-DD
    if (!dateStr) return;

    const [year, month, day] = dateStr.split("-").map(Number);
    const updated = new Date(selectedDateTime);
    updated.setFullYear(year, month - 1, day);
    setSelectedDateTime(updated);
  };

  // Handle HTML5 Web Time change
  const handleWebTimeChange = (e) => {
    const timeStr = e.target.value; // HH:MM
    if (!timeStr) return;

    const [hours, minutes] = timeStr.split(":").map(Number);
    const updated = new Date(selectedDateTime);
    updated.setHours(hours, minutes, 0, 0);
    setSelectedDateTime(updated);
  };

  // Handle Native Mobile Date Picker change
  const handleNativeDateChange = (event, selected) => {
    setShowNativeDatePicker(false);
    if (selected) {
      const updated = new Date(selectedDateTime);
      updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setSelectedDateTime(updated);
    }
  };

  // Handle Native Mobile Time Picker change
  const handleNativeTimeChange = (event, selected) => {
    setShowNativeTimePicker(false);
    if (selected) {
      const updated = new Date(selectedDateTime);
      updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setSelectedDateTime(updated);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedDateTime.getTime() <= Date.now()) {
      setValidationError("Cannot set an expired date. Please choose a future time.");
      return;
    }

    // Format as "Mon DD, YYYY, HH:MM AM/PM" or "Mon DD, HH:MM AM/PM"
    // Using clean calendar format: e.g. "Oct 15, 05:00 PM"
    const monthDay = selectedDateTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeStr = formatTime12H(
      selectedDateTime.getHours(),
      selectedDateTime.getMinutes()
    );

    const finalVal = `${monthDay}, ${timeStr}`;
    onSelectExpiry(finalVal);
    onClose();
  };

  // Formatted display values
  const formattedDateDisplay = selectedDateTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTimeDisplay = formatTime12H(
    selectedDateTime.getHours(),
    selectedDateTime.getMinutes()
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleBox}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="calendar-outline" size={18} color="#087A3D" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Set Expiry Window</Text>
                <Text style={styles.modalSubtitle}>
                  Pick exact consumption deadline
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Validation Warning Banner if past date/time is selected */}
          {validationError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            {/* STEP 1: CUSTOM DATE PICKER */}
            <View style={styles.pickerSection}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepTitle}>1. Select Expiry Date</Text>
              </View>

              {Platform.OS === "web" ? (
                <View style={styles.webInputCard}>
                  <View style={styles.inputDisplayRow}>
                    <Ionicons name="calendar" size={18} color="#087A3D" style={{ marginRight: 8 }} />
                    <Text style={styles.inputCurrentValueText}>
                      {formattedDateDisplay}
                    </Text>
                  </View>
                  <input
                    type="date"
                    min={minDateString}
                    value={currentDateInputValue}
                    onChange={handleWebDateChange}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid #A7F3D0",
                      fontSize: "14px",
                      fontWeight: "600",
                      fontFamily: "inherit",
                      color: "#0F172A",
                      backgroundColor: "#F0FDF4",
                      width: "100%",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      outline: "none",
                      marginTop: "8px",
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nativePickerCard}
                  onPress={() => setShowNativeDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nativeCardLeft}>
                    <View style={styles.fieldIconCircle}>
                      <Ionicons name="calendar" size={18} color="#087A3D" />
                    </View>
                    <View>
                      <Text style={styles.nativeFieldLabel}>Date</Text>
                      <Text style={styles.nativeFieldValue}>{formattedDateDisplay}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* STEP 2: CUSTOM TIME PICKER */}
            <View style={styles.pickerSection}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepTitle}>2. Select Expiry Time</Text>
              </View>

              {Platform.OS === "web" ? (
                <View style={styles.webInputCard}>
                  <View style={styles.inputDisplayRow}>
                    <Ionicons name="time" size={18} color="#087A3D" style={{ marginRight: 8 }} />
                    <Text style={styles.inputCurrentValueText}>
                      {formattedTimeDisplay}
                    </Text>
                  </View>
                  <input
                    type="time"
                    value={currentTimeInputValue}
                    onChange={handleWebTimeChange}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid #A7F3D0",
                      fontSize: "14px",
                      fontWeight: "600",
                      fontFamily: "inherit",
                      color: "#0F172A",
                      backgroundColor: "#F0FDF4",
                      width: "100%",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      outline: "none",
                      marginTop: "8px",
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nativePickerCard}
                  onPress={() => setShowNativeTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nativeCardLeft}>
                    <View style={styles.fieldIconCircle}>
                      <Ionicons name="time" size={18} color="#087A3D" />
                    </View>
                    <View>
                      <Text style={styles.nativeFieldLabel}>Time</Text>
                      <Text style={styles.nativeFieldValue}>{formattedTimeDisplay}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Summary Preview Pill */}
            <View style={styles.previewBox}>
              <MaterialCommunityIcons name="clock-check-outline" size={18} color="#087A3D" style={{ marginRight: 6 }} />
              <Text style={styles.previewText}>
                Expires on: <Text style={{ fontWeight: "800", color: "#087A3D" }}>{formattedDateDisplay} at {formattedTimeDisplay}</Text>
              </Text>
            </View>
          </ScrollView>

          {/* Native Picker Components (Mobile Only) */}
          {showNativeDatePicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={selectedDateTime}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleNativeDateChange}
            />
          )}

          {showNativeTimePicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={selectedDateTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleNativeTimeChange}
            />
          )}

          {/* Confirmation Button */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, isPastDateTime && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={isPastDateTime}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.confirmBtnText}>
                {isPastDateTime ? "Choose Future Time" : "Set Expiry Window"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
    flex: 1,
  },
  pickerSection: {
    marginBottom: 14,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087A3D",
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  webInputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  inputDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputCurrentValueText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  nativePickerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  nativeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  nativeFieldLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  nativeFieldValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 4,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12.5,
    color: "#065F46",
    fontWeight: "600",
    flex: 1,
  },
  actionsRow: {
    marginTop: 14,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
