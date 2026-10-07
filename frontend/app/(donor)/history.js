import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import API from "../../services/api";
import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import { getMyDonations, deleteDonation } from "../../services/donorService";
import { AuthContext } from "../../context/AuthContext";

const getImageUrl = (url) => {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const baseUrl = API.defaults.baseURL
    ? API.defaults.baseURL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function DonationHistoryScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("Recent Posts");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // View Details Modal state
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Delete Confirmation Modal state
  const [deletingDonation, setDeletingDonation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyDonations();
      if (data && data.success && data.donations) {
        const serverBaseUrl = API.defaults.baseURL
          ? API.defaults.baseURL.replace(/\/api\/?$/, "")
          : "";

        const formatted = data.donations.map((item) => {
          let formattedQty = item.quantity || "";
          if (item.quantity_unit) {
            formattedQty = `${item.quantity} ${item.quantity_unit.charAt(0).toUpperCase() + item.quantity_unit.slice(1)}`;
          }

          let img =
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80";
          if (item.image_url) {
            img = item.image_url.startsWith("http")
              ? item.image_url
              : `${serverBaseUrl}${item.image_url}`;
          }

          return {
            id: String(item.id),
            title: item.meal_name,
            quantity: formattedQty,
            location: item.location,
            expiry: item.expiry_window || "Today, 05:00 PM",
            notes: item.notes || "None provided",
            date: item.created_at
              ? item.created_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: item.status || "Pending",
            image: img,
          };
        });
        setDonations(formatted);
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.warn("Backend fetch failed:", err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load donations.",
      );
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchDonations, 0);
    return () => clearTimeout(timer);
  }, [fetchDonations]);

  // Handle Delete Donation
  const handleConfirmDelete = async () => {
    if (!deletingDonation) return;

    setIsDeleting(true);
    try {
      await deleteDonation(deletingDonation.id);
      setDonations((prev) =>
        prev.filter((item) => item.id !== deletingDonation.id),
      );
      if (selectedDonation && selectedDonation.id === deletingDonation.id) {
        setSelectedDonation(null);
      }
    } catch (err) {
      console.warn("Delete request error:", err.message);
      Alert.alert(
        "Delete Error",
        err.response?.data?.message || "Could not delete donation.",
      );
    } finally {
      setIsDeleting(false);
      setDeletingDonation(null);
    }
  };

  // Filter items based on active tab
  const displayedItems =
    activeTab === "Recent Posts"
      ? donations
      : donations.filter((item) =>
          [
            "Completed",
            "Picked Up",
            "Cancelled",
            "Expired",
          ].includes(item.status),
        );

  // Render status badge (mapped to Donor UI labels)
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <View style={[styles.badgeBase, styles.badgePending]}>
            <Ionicons
              name="time-outline"
              size={12}
              color="#D97706"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.textPending}>Available</Text>
          </View>
        );
      case "Active":
        return (
          <View style={[styles.badgeBase, styles.badgeActive]}>
            <View style={styles.activeDot} />
            <Text style={styles.textActive}>Reserved</Text>
          </View>
        );
      case "Picked Up":
        return (
          <View style={[styles.badgeBase, styles.badgePickedUp]}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={12}
              color="#4B5563"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.textPickedUp}>Picked Up</Text>
          </View>
        );
      case "Completed":
        return (
          <View style={[styles.badgeBase, styles.badgeCompleted]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={12}
              color="#087A3D"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.textCompleted}>Completed</Text>
          </View>
        );
      case "Cancelled":
        return (
          <View style={[styles.badgeBase, styles.badgeCancelled]}>
            <Ionicons
              name="close-circle-outline"
              size={12}
              color="#DC2626"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.textCancelled}>Cancelled</Text>
          </View>
        );
      case "Expired":
        return (
          <View style={[styles.badgeBase, styles.badgeExpired]}>
            <Ionicons
              name="alert-circle-outline"
              size={12}
              color="#6B7280"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.textExpired}>Expired</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badgeBase, styles.badgePending]}>
            <Text style={styles.textPending}>{status}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="My Donations" />

      {/* Sub Header Title Bar */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(donor)")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>My Donations</Text>

        {user?.avatar_url ? (
          <Image
            source={{ uri: getImageUrl(user.avatar_url) }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholderHeader}>
            <Ionicons name="person" size={18} color="#087A3D" />
          </View>
        )}
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Segmented Control Tabs */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "Recent Posts" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("Recent Posts")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Recent Posts" && styles.tabTextActive,
                ]}
              >
                Recent Posts
              </Text>
              {activeTab === "Recent Posts" && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "History" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("History")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "History" && styles.tabTextActive,
                ]}
              >
                History
              </Text>
              {activeTab === "History" && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Summary Row */}
          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              <View style={styles.recordedDot} />
              <Text style={styles.recordedText}>
                {donations.length} listing{donations.length !== 1 ? "s" : ""}{" "}
                recorded
              </Text>
            </View>

            <View style={styles.rescuedPill}>
              <Text style={styles.rescuedPillText}>🌱 Zero Food Waste</Text>
            </View>
          </View>

          {/* History Cards List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#087A3D" />
              <Text style={styles.loadingText}>Loading your donations...</Text>
            </View>
          ) : displayedItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="heart-broken-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>No donations found</Text>
              <Text style={styles.emptySubtitle}>
                Create a donation post to share surplus food with local food
                banks & volunteers.
              </Text>
              <TouchableOpacity
                style={styles.donateNowBtn}
                onPress={() => router.push("/(donor)/donate")}
              >
                <Text style={styles.donateNowText}>+ Donate Food Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {displayedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDonation(item)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text
                        style={[
                          styles.quantityText,
                          (item.status === "Active" ||
                            item.status === "Pending") &&
                            styles.quantityTextActive,
                        ]}
                      >
                        {item.quantity}
                      </Text>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>

                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                  </View>

                  <View style={styles.rightActionColumn}>
                    {renderStatusBadge(item.status)}

                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.viewIconBtn}
                        onPress={() => setSelectedDonation(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={16}
                          color="#087A3D"
                        />
                      </TouchableOpacity>

                      {item.status === "Pending" && (
                        <TouchableOpacity
                          style={styles.deleteIconBtn}
                          onPress={() => setDeletingDonation(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#DC2626"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Navigation Bar with "History" active */}
        <DonorBottomNav initialTab="History" />
      </View>

      {/* View Donation Details Modal */}
      <Modal
        visible={!!selectedDonation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDonation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Donation Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedDonation(null)}
                style={styles.closeModalBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedDonation && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedDonation.image }}
                  style={styles.detailsImage}
                  resizeMode="cover"
                />

                <View style={styles.detailsHeaderRow}>
                  <Text style={styles.detailsTitle}>
                    {selectedDonation.title}
                  </Text>
                  {renderStatusBadge(selectedDonation.status)}
                </View>

                <View style={styles.detailsGrid}>
                  {/* Quantity */}
                  <View style={styles.detailCard}>
                    <MaterialCommunityIcons
                      name="silverware-fork-knife"
                      size={18}
                      color="#087A3D"
                    />
                    <View style={styles.detailTextBox}>
                      <Text style={styles.detailLabel}>Quantity</Text>
                      <Text style={styles.detailValue}>
                        {selectedDonation.quantity}
                      </Text>
                    </View>
                  </View>

                  {/* Pickup Location */}
                  <View style={styles.detailCard}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#087A3D"
                    />
                    <View style={styles.detailTextBox}>
                      <Text style={styles.detailLabel}>Pickup Location</Text>
                      <Text style={styles.detailValue}>
                        {selectedDonation.location}
                      </Text>
                    </View>
                  </View>

                  {/* Expiry Window */}
                  <View style={styles.detailCard}>
                    <Ionicons name="time-outline" size={18} color="#087A3D" />
                    <View style={styles.detailTextBox}>
                      <Text style={styles.detailLabel}>Consume Before</Text>
                      <Text style={styles.detailValue}>
                        {selectedDonation.expiry}
                      </Text>
                    </View>
                  </View>

                  {/* Date Created */}
                  <View style={styles.detailCard}>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#087A3D"
                    />
                    <View style={styles.detailTextBox}>
                      <Text style={styles.detailLabel}>Posted Date</Text>
                      <Text style={styles.detailValue}>
                        {selectedDonation.date}
                      </Text>
                    </View>
                  </View>

                  {/* Notes & Allergens */}
                  <View style={[styles.detailCard, { width: "100%" }]}>
                    <MaterialCommunityIcons
                      name="notebook-outline"
                      size={18}
                      color="#087A3D"
                    />
                    <View style={styles.detailTextBox}>
                      <Text style={styles.detailLabel}>Notes & Allergens</Text>
                      <Text style={styles.detailValue}>
                        {selectedDonation.notes}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions in View Modal */}
                <View style={styles.modalActionButtonsRow}>
                  {selectedDonation.status === "Pending" ? (
                    <TouchableOpacity
                      style={styles.deleteModalBtn}
                      onPress={() => setDeletingDonation(selectedDonation)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#DC2626"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.deleteModalBtnText}>
                        Delete Donation
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.readOnlyNoteBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.readOnlyNoteText}>
                        Status:{" "}
                        {selectedDonation.status === "Active"
                          ? "Reserved"
                          : selectedDonation.status}{" "}
                        (Read Only)
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.closeModalPrimaryBtn}
                    onPress={() => setSelectedDonation(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.closeModalPrimaryText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deletingDonation}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeletingDonation(null)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBox}>
              <Ionicons name="trash-outline" size={30} color="#DC2626" />
            </View>

            <Text style={styles.deleteTitle}>Delete Donation?</Text>
            <Text style={styles.deleteSubtitle}>
              Are you sure you want to delete{" "}
              <Text
                style={{ fontWeight: "700" }}
              >{`"${deletingDonation?.title}"`}</Text>
              ? This donation post will be permanently removed.
            </Text>

            <View style={styles.deleteActionsRow}>
              <TouchableOpacity
                style={styles.cancelDeleteBtn}
                onPress={() => setDeletingDonation(null)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteBtn,
                  isDeleting && styles.confirmDeleteBtnDisabled,
                ]}
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
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholderHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    position: "relative",
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#087A3D",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 4,
    width: 24,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#087A3D",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#087A3D",
  },
  recordedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  rescuedPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rescuedPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
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
    marginBottom: 16,
    lineHeight: 18,
  },
  donateNowBtn: {
    backgroundColor: "#087A3D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  donateNowText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  cardsList: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  quantityTextActive: {
    color: "#087A3D",
  },
  bulletDot: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 5,
  },
  locationText: {
    fontSize: 12.5,
    color: "#6B7280",
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  rightActionColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
    paddingVertical: 2,
    marginLeft: 6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 6,
  },
  viewIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  textPending: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#D97706",
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087A3D",
    marginRight: 4,
  },
  textActive: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#087A3D",
  },
  badgePickedUp: {
    backgroundColor: "#F3F4F6",
  },
  textPickedUp: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#4B5563",
  },
  badgeCompleted: {
    backgroundColor: "#E8F8EE",
  },
  textCompleted: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#087A3D",
  },
  badgeCancelled: {
    backgroundColor: "#FEF2F2",
  },
  textCancelled: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#DC2626",
  },
  badgeExpired: {
    backgroundColor: "#F3F4F6",
  },
  textExpired: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  readOnlyNoteBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  readOnlyNoteText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detailsModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeModalBtn: {
    padding: 4,
  },
  detailsImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 14,
  },
  detailsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  detailsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  detailTextBox: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11.5,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalActionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  deleteModalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 13,
  },
  deleteModalBtnText: {
    color: "#DC2626",
    fontSize: 13.5,
    fontWeight: "700",
  },
  closeModalPrimaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 12,
    paddingVertical: 13,
  },
  closeModalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
