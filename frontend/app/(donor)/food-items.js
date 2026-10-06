import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import {
  fetchFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from "../../services/foodItemService";

const CATEGORY_OPTIONS = [
  "Cooked Meal",
  "Bakery",
  "Fresh Produce",
  "Dairy",
  "Beverages",
  "Packaged Food",
  "Other",
];

export default function FoodItemManagementScreen() {
  const router = useRouter();

  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form Modal State
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if creating, item object if editing
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cooked Meal");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load food items from backend
  const loadFoodItems = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFoodItems(1);
      if (data && data.foodItems) {
        setFoodItems(data.foodItems);
      } else if (Array.isArray(data)) {
        setFoodItems(data);
      }
    } catch (error) {
      console.warn("Failed to load food items from backend:", error.message);
      // Fallback sample data if backend connection fails
      setFoodItems([
        {
          id: 1,
          donor_id: 1,
          name: "Rice & Curry",
          category: "Cooked Meal",
          description: "Sri Lankan rice and curry meal with vegetable dishes",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          donor_id: 1,
          name: "Fresh Bread",
          category: "Bakery",
          description: "Assorted artisanal baked loaves and dinner rolls",
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          donor_id: 1,
          name: "Vegetable Kottu",
          category: "Cooked Meal",
          description: "Freshly made Sri Lankan style vegetable kottu roti",
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          donor_id: 1,
          name: "Fried Rice",
          category: "Cooked Meal",
          description: "Egg and vegetable fried rice prepared fresh",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  // Open Form Modal for Creating
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategory("Cooked Meal");
    setDescription("");
    setIsFormModalVisible(true);
  };

  // Open Form Modal for Editing
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    setCategory(item.category || "Cooked Meal");
    setDescription(item.description || "");
    setIsFormModalVisible(true);
  };

  // Save (Create or Update) Food Item
  const handleSaveItem = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Food Name is required.");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Validation Error", "Category is required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        // Update existing item
        await updateFoodItem(editingItem.id, {
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
        });
      } else {
        // Create new item
        await createFoodItem({
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          donor_id: 1,
        });
      }
      setIsFormModalVisible(false);
      await loadFoodItems();
    } catch (error) {
      console.warn("Error saving food item:", error.message);
      // Fallback local update if backend fails
      if (editingItem) {
        setFoodItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...i, name: name.trim(), category: category.trim(), description: description.trim() }
              : i
          )
        );
      } else {
        const newItem = {
          id: Date.now(),
          donor_id: 1,
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          created_at: new Date().toISOString(),
        };
        setFoodItems((prev) => [newItem, ...prev]);
      }
      setIsFormModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Request Delete Confirmation
  const handleRequestDelete = (item) => {
    setDeletingItem(item);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      await deleteFoodItem(deletingItem.id);
      setFoodItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
    } catch (error) {
      console.warn("Delete food item error:", error.message);
      setFoodItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const getCategoryColor = (cat) => {
    switch ((cat || "").toLowerCase()) {
      case "cooked meal":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "bakery":
        return { bg: "#FFEDD5", text: "#C2410C" };
      case "fresh produce":
      case "produce":
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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="My Food Items" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeaderRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(donor)")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>Food Item Catalog</Text>

        <View style={{ width: 34 }} />
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconBox}>
              <MaterialCommunityIcons name="format-list-bulleted-type" size={22} color="#087A3D" />
            </View>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle}>Reusable Menu Management</Text>
              <Text style={styles.bannerSubtitle}>
                Add your regular dishes & products here to quickly select them when creating food donations.
              </Text>
            </View>
          </View>

          {/* Action Bar */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Saved Items ({foodItems.length})
            </Text>

            <TouchableOpacity
              style={styles.addPrimaryBtn}
              onPress={handleOpenCreateModal}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addPrimaryBtnText}>+ Add Food Item</Text>
            </TouchableOpacity>
          </View>

          {/* Food Items List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#087A3D" />
              <Text style={styles.loadingText}>Fetching saved food items...</Text>
            </View>
          ) : foodItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="food-outline" size={56} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No food items added yet</Text>
              <Text style={styles.emptySubtitle}>
                Build your food catalog so you can quickly register surplus meals with a single tap.
              </Text>
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={handleOpenCreateModal}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.createFirstBtnText}>Add Your First Food Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {foodItems.map((item) => {
                const catStyle = getCategoryColor(item.category);
                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
                          <Text style={[styles.categoryBadgeText, { color: catStyle.text }]}>
                            {item.category}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionButtonsRow}>
                        {/* Edit Button */}
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => handleOpenEditModal(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="create-outline" size={18} color="#087A3D" />
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleRequestDelete(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {item.description ? (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    ) : (
                      <Text style={styles.noDescription}>No description provided.</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <DonorBottomNav initialTab="Home" />
      </View>

      {/* Add / Edit Food Item Modal Form */}
      <Modal
        visible={isFormModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingItem ? "Edit Food Item" : "Add Food Item"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingItem ? "Update item details in menu catalog" : "Save a reusable food item to your menu"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFormModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContent}>
              {/* 1. Food Name (Required) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Food Name <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="food-fork-drink" size={18} color="#087A3D" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Rice & Curry or Fresh Artisan Bread"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* 2. Category (Required) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Category <Text style={styles.requiredStar}>*</Text></Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryPillsRow}
                >
                  {CATEGORY_OPTIONS.map((catOption) => {
                    const isSelected = category === catOption;
                    return (
                      <TouchableOpacity
                        key={catOption}
                        style={[
                          styles.catPill,
                          isSelected && styles.catPillSelected,
                        ]}
                        onPress={() => setCategory(catOption)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.catPillText,
                            isSelected && styles.catPillTextSelected,
                          ]}
                        >
                          {catOption}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 3. Description (Optional) */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <View style={styles.multilineWrapper}>
                  <TextInput
                    style={styles.multilineInput}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    placeholder="e.g. Sri Lankan rice and curry meal with freshly prepared vegetable dishes"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsFormModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSaveItem}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>
                      {editingItem ? "Update Item" : "Save Food Item"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deletingItem}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeletingItem(null)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBox}>
              <Ionicons name="warning-outline" size={32} color="#DC2626" />
            </View>

            <Text style={styles.deleteTitle}>Delete Food Item?</Text>
            <Text style={styles.deleteSubtitle}>
              Are you sure you want to delete <Text style={{ fontWeight: "700" }}>"{deletingItem?.name}"</Text>? This action cannot be undone.
            </Text>

            <View style={styles.deleteActionsRow}>
              <TouchableOpacity
                style={styles.cancelDeleteBtn}
                onPress={() => setDeletingItem(null)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, isDeleting && styles.confirmDeleteBtnDisabled]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
                activeOpacity={0.85}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Yes, Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 6,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#087A3D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonHeaderText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#087A3D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
  },
  createFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#087A3D",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  itemDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  noDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 4,
  },
  formContent: {
    gap: 14,
    marginBottom: 20,
  },
  fieldGroup: {},
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#DC2626",
  },
  optionalText: {
    fontSize: 12,
    color: "#9CA3AF",
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
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  categoryPillsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catPillSelected: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
  },
  catPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  catPillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  modalActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
  },
  saveBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  deleteIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  deleteSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteActionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelDeleteText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#374151",
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
  },
  confirmDeleteBtnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  confirmDeleteText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
