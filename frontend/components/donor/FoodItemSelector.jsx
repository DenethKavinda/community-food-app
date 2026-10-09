import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FoodItemSelector({
  selectedItem,
  onSelectItem,
  foodItems = [],
  isLoading = false,
  onRefreshItems,
  hasError = false,
}) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item) => {
    onSelectItem(item);
    setModalVisible(false);
  };

  const handleAddNewFood = () => {
    setModalVisible(false);
    router.push("/(donor)/food-items");
  };

  const getCategoryColor = (category) => {
    switch ((category || "").toLowerCase()) {
      case "cooked meal":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "bakery":
        return { bg: "#FFEDD5", text: "#C2410C" };
      case "produce":
      case "fresh produce":
        return { bg: "#DCFCE7", text: "#166534" };
      case "dairy":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "beverages":
        return { bg: "#E0E7FF", text: "#3730A3" };
      default:
        return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Food or Meal <Text style={{ color: "#DC2626" }}>*</Text>
        </Text>
        <TouchableOpacity
          onPress={handleAddNewFood}
          style={styles.addQuickBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={16} color="#087A3D" />
          <Text style={styles.addQuickText}>Add New Food</Text>
        </TouchableOpacity>
      </View>

      {/* Main Trigger Dropdown Button */}
      <TouchableOpacity
        style={[styles.dropdownTrigger, hasError && styles.errorBorder]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={18}
          color="#087A3D"
          style={styles.leftIcon}
        />
        
        <View style={styles.textContainer}>
          {selectedItem ? (
            <View style={styles.selectedRow}>
              <Text style={styles.selectedTitle} numberOfLines={1}>
                {selectedItem.name}
              </Text>
              {selectedItem.category && (
                <View
                  style={[
                    styles.miniCategoryBadge,
                    { backgroundColor: getCategoryColor(selectedItem.category).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniCategoryText,
                      { color: getCategoryColor(selectedItem.category).text },
                    ]}
                  >
                    {selectedItem.category}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select Food Item</Text>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#087A3D" style={{ marginLeft: 8 }} />
        ) : (
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        )}
      </TouchableOpacity>

      {/* Modal Picker */}
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Saved Food Item</Text>
                <Text style={styles.modalSubtitle}>
                  Choose from your registered food item menu
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* "Add New Food" Action Header Button */}
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={handleAddNewFood}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalAddButtonText}>Add New Food Item to Catalog</Text>
            </TouchableOpacity>

            {/* List of Food Items */}
            {isLoading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color="#087A3D" />
                <Text style={styles.stateText}>Loading your food items...</Text>
              </View>
            ) : foodItems.length === 0 ? (
              <View style={styles.stateBox}>
                <MaterialCommunityIcons name="food-off-outline" size={44} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No saved food items found</Text>
                <Text style={styles.emptySubtitle}>
                  Create food items in your catalog to easily select them for future donations.
                </Text>
                <TouchableOpacity
                  style={styles.createFirstBtn}
                  onPress={handleAddNewFood}
                >
                  <Text style={styles.createFirstText}>Create Food Item Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={foodItems}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                  const isSelected = selectedItem && selectedItem.id === item.id;
                  const catStyle = getCategoryColor(item.category);

                  return (
                    <TouchableOpacity
                      style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemCardLeft}>
                        <View style={styles.itemHeaderRow}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <View
                            style={[
                              styles.categoryBadge,
                              { backgroundColor: catStyle.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryBadgeText,
                                { color: catStyle.text },
                              ]}
                            >
                              {item.category}
                            </Text>
                          </View>
                        </View>

                        {item.description ? (
                          <Text style={styles.itemDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.radioBox}>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={24} color="#087A3D" />
                        ) : (
                          <Ionicons name="ellipse-outline" size={22} color="#D1D5DB" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
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
  addQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addQuickText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 50,
  },
  leftIcon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    maxWidth: "65%",
  },
  miniCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniCategoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  placeholderText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxHeight: "80%",
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
  modalAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 10,
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  itemCardSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#087A3D",
  },
  itemCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#111827",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  radioBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  stateBox: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  createFirstBtn: {
    backgroundColor: "#087A3D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createFirstText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  errorBorder: {
    borderColor: "#DC2626",
  },
});
