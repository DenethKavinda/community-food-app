import React, { useState } from "react";
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

  const handleConfirm = () => {
    const finalVal = `${selectedDay}, ${selectedTime}`;
    onSelectExpiry(finalVal);
    onClose();
  };

  // Handle native web date picker change
  const handleDateChange = (e) => {
    const dateVal = e.target.value; // YYYY-MM-DD
    if (dateVal) {
      const parts = dateVal.split("-");
      if (parts.length === 3) {
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        setSelectedDay(formattedDate);
      }
    }
  };

  // Handle native web time picker change
  const handleTimeChange = (e) => {
    const timeVal = e.target.value; // HH:MM
    if (timeVal) {
      const parts = timeVal.split(":");
      let hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
      setSelectedTime(formattedTime);
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
                1. Pick date → 2. Pick time
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* STEP 1: PICK DATE */}
            <View style={styles.stepHeaderRow}>
              <Ionicons name="calendar" size={16} color="#087A3D" style={{ marginRight: 6 }} />
              <Text style={styles.stepTitle}>1. Select Date</Text>
              <Text style={styles.selectedBadgeText}>Selected: {selectedDay}</Text>
            </View>

            {/* Quick Day Pills */}
            <View style={styles.daysRow}>
              {["Today", "Tomorrow", "In 2 Days"].map((day) => {
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

            {/* Web Calendar Date Picker */}
            {Platform.OS === "web" && (
              <View style={styles.pickerCard}>
                <Text style={styles.pickerCardLabel}>Or pick custom date on calendar:</Text>
                <input
                  type="date"
                  onChange={handleDateChange}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #D1D5DB",
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    color: "#111827",
                    backgroundColor: "#FFFFFF",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
              </View>
            )}

            <View style={styles.divider} />

            {/* STEP 2: PICK TIME */}
            <View style={styles.stepHeaderRow}>
              <Ionicons name="time" size={16} color="#087A3D" style={{ marginRight: 6 }} />
              <Text style={styles.stepTitle}>2. Select Time</Text>
              <Text style={styles.selectedBadgeText}>Selected: {selectedTime}</Text>
            </View>

            {/* Time Slot Pills */}
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

            {/* Web Clock Time Picker */}
            {Platform.OS === "web" && (
              <View style={styles.pickerCard}>
                <Text style={styles.pickerCardLabel}>Or pick custom time on clock:</Text>
                <input
                  type="time"
                  onChange={handleTimeChange}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #D1D5DB",
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    color: "#111827",
                    backgroundColor: "#FFFFFF",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
              </View>
            )}
          </ScrollView>

          {/* Confirmation Button */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>
                Set Expiry to ({selectedDay}, {selectedTime})
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
    color: "#087A3D",
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  selectedBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#087A3D",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
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
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  dayPillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  pickerCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    marginBottom: 10,
  },
  pickerCardLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  timeSlotsRow: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
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
