import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const PRESET_OPTIONS = [
  "Today, 02:00 PM",
  "Today, 05:00 PM",
  "Today, 08:00 PM",
  "Tomorrow, 10:00 AM",
  "Tomorrow, 02:00 PM",
  "Tomorrow, 06:00 PM",
];

const TIME_SLOTS = [
  "08:00 AM",
  "11:00 AM",
  "01:30 PM",
  "03:00 PM",
  "05:00 PM",
  "07:30 PM",
  "09:00 PM",
];

export default function ExpiryPickerModal({
  visible,
  onClose,
  currentValue,
  onSelectExpiry,
}) {
  const [selectedDay, setSelectedDay] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("05:00 PM");
  const [customDateStr, setCustomDateStr] = useState("");

  const handleSelectPreset = (preset) => {
    onSelectExpiry(preset);
    onClose();
  };

  const handleConfirmCustom = () => {
    let dayText = selectedDay;
    if (selectedDay === "Custom" && customDateStr.trim()) {
      dayText = customDateStr.trim();
    }
    const finalVal = `${dayText}, ${selectedTime}`;
    onSelectExpiry(finalVal);
    onClose();
  };

  // Web Native Date/Time picker handler
  const handleWebNativeDateTime = (e) => {
    const val = e.target.value; // format: "YYYY-MM-DDTHH:mm"
    if (val) {
      const dateObj = new Date(val);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      onSelectExpiry(`${dateStr}, ${timeStr}`);
      onClose();
    }
  };

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
            <View>
              <Text style={styles.modalTitle}>Set Expiry Window</Text>
              <Text style={styles.modalSubtitle}>
                Select when this surplus food must be consumed by
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Quick Presets Section */}
            <Text style={styles.sectionLabel}>Quick Presets</Text>
            <View style={styles.presetGrid}>
              {PRESET_OPTIONS.map((preset) => {
                const isSelected = currentValue === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipSelected,
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isSelected ? "#FFFFFF" : "#087A3D"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextSelected,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Interactive Date & Time Picker */}
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Custom Date & Time Selector</Text>

            {/* Day Selector Pills */}
            <View style={styles.daysRow}>
              {["Today", "Tomorrow", "In 2 Days", "Custom"].map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayPill,
                      isSelected && styles.dayPillSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayPillText,
                        isSelected && styles.dayPillTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* If Custom Date typed */}
            {selectedDay === "Custom" && (
              <View style={styles.customDateWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#087A3D" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.customDateInput}
                  value={customDateStr}
                  onChangeText={setCustomDateStr}
                  placeholder="e.g. Oct 10 or 2026-10-10"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* Time Slot Picker */}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Select Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlotsRow}>
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Web Native Calendar & Time Picker input */}
            {Platform.OS === "web" && (
              <View style={styles.nativeWebContainer}>
                <Text style={styles.nativeWebLabel}>Or pick exact Date & Time calendar:</Text>
                <input
                  type="datetime-local"
                  onChange={handleWebNativeDateTime}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "#111827",
                    backgroundColor: "#F9FAFB",
                    width: "100%",
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
              </View>
            )}
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmCustom}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>
                Confirm Expiry ({selectedDay}, {selectedTime})
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetChipSelected: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
  presetChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  dayPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayPillSelected: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  dayPillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  customDateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  customDateInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  timeSlotsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeSlotSelected: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
  },
  timeSlotText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  nativeWebContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  nativeWebLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
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
    borderRadius: 12,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
