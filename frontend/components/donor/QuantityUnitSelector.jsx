import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ALL_UNITS = [
  { value: "portions", label: "Portions" },
  { value: "packets", label: "Packets" },
  { value: "boxes", label: "Boxes" },
  { value: "trays", label: "Trays" },
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kg" },
  { value: "g", label: "g" },
  { value: "liters", label: "Liters" },
  { value: "ml", label: "ml" },
  { value: "bottles", label: "Bottles" },
];

const CATEGORY_UNIT_MAP = {
  "cooked meal": ["portions", "packets", "boxes", "trays"],
  bakery: ["pieces", "packets", "boxes"],
  produce: ["kg", "g", "pieces", "boxes"],
  "fresh produce": ["kg", "g", "pieces", "boxes"],
  beverages: ["liters", "ml", "bottles"],
};

export default function QuantityUnitSelector({
  quantity,
  onChangeQuantity,
  unit,
  onChangeUnit,
  category,
  quantityError = false,
  unitError = false,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Filter units based on food category if available
  const getAvailableUnits = () => {
    if (!category) return ALL_UNITS;
    const catLower = category.toLowerCase();
    const allowed = CATEGORY_UNIT_MAP[catLower];
    if (allowed && allowed.length > 0) {
      return ALL_UNITS.filter((u) => allowed.includes(u.value));
    }
    return ALL_UNITS;
  };

  const availableUnits = getAvailableUnits();

  const currentUnitObj =
    ALL_UNITS.find((u) => u.value === (unit || "").toLowerCase()) || null;

  const handleSelectUnit = (unitValue) => {
    onChangeUnit(unitValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Quantity & Unit <Text style={{ color: "#DC2626" }}>*</Text>
        </Text>
        <Text style={styles.subLabel}>Numeric amount & measure</Text>
      </View>

      <View style={styles.inputRow}>
        {/* Numeric Quantity Input */}
        <View style={[styles.quantityInputWrapper, quantityError && styles.errorBorder]}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={18}
            color="#087A3D"
            style={styles.inputLeftIcon}
          />
          <TextInput
            style={styles.numericInput}
            value={quantity}
            onChangeText={(text) => {
              // Only allow numbers and one decimal point
              const sanitized = text.replace(/[^0-9.]/g, "");
              // Ensure at most one decimal point
              const parts = sanitized.split(".");
              if (parts.length > 2) return;
              onChangeQuantity(sanitized);
            }}
            keyboardType="decimal-pad"
            placeholder="e.g. 10 or 2.5"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Unit Dropdown Trigger Button */}
        <TouchableOpacity
          style={[
            styles.unitDropdownTrigger,
            !currentUnitObj && styles.unitDropdownTriggerEmpty,
            unitError && styles.errorBorder,
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.unitTriggerText,
              !currentUnitObj && styles.unitTriggerTextEmpty,
            ]}
            numberOfLines={1}
          >
            {currentUnitObj ? currentUnitObj.label : "Choose"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={currentUnitObj ? "#087A3D" : "#6B7280"}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Unit Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Quantity Unit</Text>
                {category ? (
                  <Text style={styles.modalSubtitle}>
                    Filtered for category: {category}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableUnits}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.unitList}
              renderItem={({ item }) => {
                const isSelected = (unit || "").toLowerCase() === item.value;
                return (
                  <TouchableOpacity
                    style={[styles.unitItem, isSelected && styles.unitItemSelected]}
                    onPress={() => handleSelectUnit(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.unitItemText,
                        isSelected && styles.unitItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color="#087A3D" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={18} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
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
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  quantityInputWrapper: {
    flex: 1,
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
  numericInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 8,
  },
  unitDropdownTrigger: {
    width: 120,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  unitDropdownTriggerEmpty: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  unitTriggerText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#087A3D",
    flex: 1,
  },
  unitTriggerTextEmpty: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    maxHeight: 380,
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
    marginBottom: 12,
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
  unitList: {
    gap: 6,
    paddingBottom: 8,
  },
  unitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unitItemSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#087A3D",
  },
  unitItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  unitItemTextSelected: {
    color: "#087A3D",
    fontWeight: "700",
  },
  errorBorder: {
    borderColor: "#DC2626",
  },
});
