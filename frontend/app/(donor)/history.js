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
import EditDonationModal from "../../components/donor/EditDonationModal";
import FeedbackModal from "../../components/common/FeedbackModal";
import ExpiryCountdown, { isDonationExpired } from "../../components/donor/ExpiryCountdown";
import { getMyDonations, deleteDonation, updateDonationStatus } from "../../services/donorService";
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

  // Edit Modal state
  const [editingDonation, setEditingDonation] = useState(null);

  // Delete Confirmation Modal state
  const [deletingDonation, setDeletingDonation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pop Up Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

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
          const origQty = item.original_quantity ?? (parseInt(item.quantity) || 0);
          const resQty = item.reserved_quantity ?? 0;
          const availQty = item.available_quantity ?? Math.max(0, origQty - resQty);
          const rawUnit = item.quantity_unit || "Items";
          const unit =
            rawUnit.toLowerCase() === "kg"
              ? "Kg"
              : rawUnit.toLowerCase() === "g"
              ? "g"
              : rawUnit.toLowerCase() === "ml"
              ? "ml"
              : rawUnit.charAt(0).toUpperCase() + rawUnit.slice(1);

          let formattedQty = `${origQty} ${unit}`;

          let img = null;
          if (item.image_url) {
            img = item.image_url.startsWith("http")
              ? item.image_url
              : `${serverBaseUrl}${item.image_url}`;
          }

          const expiryWindow = item.expiry_window || item.expiry;
          const isExpired = isDonationExpired(expiryWindow, item.created_at);
          const effectiveStatus =
            isExpired && (item.status === "Pending" || item.status === "Active")
              ? "Expired"
              : item.status || "Pending";

          // Sync backend asynchronously if expired locally
          if (isExpired && (item.status === "Pending" || item.status === "Active")) {
            updateDonationStatus(item.id, "Expired").catch(() => {});
          }

          return {
            id: String(item.id),
            title: item.meal_name,
            quantity: formattedQty,
            originalQuantity: origQty,
            reservedQuantity: resQty,
            availableQuantity: effectiveStatus === "Expired" ? 0 : availQty,
            unit: unit,
            location: item.location,
            expiry: item.expiry_window || "Today, 05:00 PM",
            expiry_window: item.expiry_window,
            created_at: item.created_at,
            notes: item.notes || "None provided",
            date: item.created_at
              ? item.created_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: effectiveStatus,
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

  // Handle donation expiration in real time
  const handleDonationExpired = useCallback((donationId) => {
    setDonations((prev) =>
      prev.map((item) =>
        item.id === donationId
          ? { ...item, status: "Expired", availableQuantity: 0 }
          : item
      )
    );
    updateDonationStatus(donationId, "Expired").catch((err) =>
      console.warn("Could not sync donation expired status:", err.message)
    );
  }, []);

  // Handle Delete Donation
  const handleConfirmDelete = async () => {
    if (!deletingDonation) return;

    setIsDeleting(true);
    try {
      const res = await deleteDonation(deletingDonation.id);
      setDonations((prev) =>
        prev.filter((item) => item.id !== deletingDonation.id),
      );
      if (selectedDonation && selectedDonation.id === deletingDonation.id) {
        setSelectedDonation(null);
      }
      setFeedbackModal({
        visible: true,
        type: "success",
        title: "Donation Deleted",
        message: res?.message || "Donation post deleted successfully.",
      });
    } catch (err) {
      console.warn("Delete request error:", err.message);
      setFeedbackModal({
        visible: true,
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || err.message || "Could not delete donation.",
      });
    } finally {
      setIsDeleting(false);
      setDeletingDonation(null);
    }
  };

  // Filter items based on active tab
  // 1. Recent Posts: Active donations only (Pending, Active)
  // 2. History: Closed donations only (Completed, Picked Up, Cancelled, Expired)
  const displayedItems =
    activeTab === "Recent Posts"
      ? donations.filter((item) => ["Pending", "Active"].includes(item.status))
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

        {/* Empty spacer to keep title centered after removing profile icon */}
        <View style={{ width: 34 }} />
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
              <Text style={styles.emptyTitle}>
                {activeTab === "Recent Posts"
                  ? "No active donations"
                  : "No donation history"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === "Recent Posts"
                  ? "You have no live donation posts currently available or reserved."
                  : "Completed, picked up, expired, or cancelled donations will appear here."}
              </Text>
              {activeTab === "Recent Posts" ? (
                <TouchableOpacity
                  style={styles.donateNowBtn}
                  onPress={() => router.push("/(donor)/donate")}
                >
                  <Text style={styles.donateNowText}>+ Donate Food Now</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.cardsList}>
              {displayedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.88}
                  onPress={() => setSelectedDonation(item)}
                >
                  {/* Top Bar: Title, Location & Status Badge */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#64748B"
                          style={{ marginRight: 3 }}
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      {renderStatusBadge(item.status)}
                    </View>
                  </View>

                  {/* Card Main Body */}
                  <View style={styles.cardContentRow}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.noImageCardPlaceholder}>
                        <MaterialCommunityIcons name="food-variant" size={26} color="#059669" />
                      </View>
                    )}

                    <View style={styles.cardDetailsBox}>
                      {/* Portion Metric Pill */}
                      <View style={styles.portionPillRow}>
                        <View style={[
                          styles.availablePill,
                          item.availableQuantity === 0 && styles.fullyReservedPill,
                          item.status === "Expired" && styles.expiredPill,
                        ]}>
                          <Text style={[
                            styles.availablePillText,
                            item.availableQuantity === 0 && styles.fullyReservedPillText,
                            item.status === "Expired" && styles.expiredPillText,
                          ]}>
                            {item.status === "Expired"
                              ? "Expired Listing"
                              : item.availableQuantity === 0
                              ? "Fully Reserved"
                              : `${item.availableQuantity} ${item.unit} Available`}
                          </Text>
                        </View>
                        <Text style={styles.portionSubtext}>
                          Orig: {item.originalQuantity} • Res: {item.reservedQuantity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Card Bottom Row: Date & Countdown on Left, Action Buttons on Right */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.footerLeft}>
                      <View style={styles.dateRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#94A3B8"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.dateText}>{item.date}</Text>
                      </View>

                      {(item.status === "Pending" || item.status === "Active") && (item.expiry_window || item.expiry) ? (
                        <ExpiryCountdown
                          expiryWindow={item.expiry_window || item.expiry}
                          createdAt={item.created_at}
                          status={item.status}
                          compact={true}
                          onExpire={() => handleDonationExpired(item.id)}
                        />
                      ) : null}
                    </View>

                    {/* Horizontal Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnView}
                        onPress={() => setSelectedDonation(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={16} color="#059669" />
                      </TouchableOpacity>

                      {item.status === "Pending" ? (
                        <TouchableOpacity
                          style={styles.actionBtnEdit}
                          onPress={() => setEditingDonation(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="create-outline" size={16} color="#087A3D" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionBtnDelete}
                          onPress={() => setDeletingDonation(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
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
                {selectedDonation.image ? (
                  <Image
                    source={{ uri: selectedDonation.image }}
                    style={styles.detailsImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.detailsNoImagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.detailsNoImageText}>No Image Available</Text>
                  </View>
                )}

                <View style={styles.detailsHeaderRow}>
                  <Text style={styles.detailsTitle}>
                    {selectedDonation.title}
                  </Text>
                  {renderStatusBadge(selectedDonation.status)}
                </View>

                <View style={styles.detailsGrid}>
                  {/* Modern Portion Breakdown Card */}
                  <View style={styles.modernQtyCard}>
                    <View style={styles.modernQtyHeader}>
                      <View style={styles.qtyHeaderIconBox}>
                        <MaterialCommunityIcons
                          name="silverware-fork-knife"
                          size={15}
                          color="#059669"
                        />
                      </View>
                      <Text style={styles.modernQtyTitle}>Portion Breakdown</Text>
                    </View>

                    {/* 3 Modern Stat Cards */}
                    <View style={styles.metricStatsRow}>
                      {/* Metric 1: Original */}
                      <View style={styles.metricCard}>
                        <Text style={styles.metricCardValue}>
                          {selectedDonation.originalQuantity}
                        </Text>
                        <Text style={styles.metricCardUnit}>{selectedDonation.unit}</Text>
                        <Text style={styles.metricCardLabel}>Original</Text>
                      </View>

                      {/* Metric 2: Reserved */}
                      <View style={[styles.metricCard, styles.metricCardReserved]}>
                        <Text style={[styles.metricCardValue, styles.reservedValColor]}>
                          {selectedDonation.reservedQuantity}
                        </Text>
                        <Text style={styles.metricCardUnit}>{selectedDonation.unit}</Text>
                        <Text style={styles.metricCardLabel}>Reserved</Text>
                      </View>

                      {/* Metric 3: Available */}
                      <View
                        style={[
                          styles.metricCard,
                          selectedDonation.availableQuantity === 0
                            ? styles.metricCardFullyReserved
                            : styles.metricCardAvailable,
                        ]}
                      >
                        <Text
                          style={[
                            styles.metricCardValue,
                            selectedDonation.availableQuantity === 0
                              ? styles.fullyReservedValColor
                              : styles.availableValColor,
                          ]}
                        >
                          {selectedDonation.availableQuantity}
                        </Text>
                        <Text
                          style={[
                            styles.metricCardUnit,
                            selectedDonation.availableQuantity === 0
                              ? styles.fullyReservedUnitColor
                              : styles.availableUnitColor,
                          ]}
                        >
                          {selectedDonation.unit}
                        </Text>
                        <Text
                          style={[
                            styles.metricCardLabel,
                            selectedDonation.availableQuantity === 0
                              ? styles.fullyReservedLabelColor
                              : styles.availableLabelColor,
                          ]}
                        >
                          {selectedDonation.availableQuantity === 0 ? "Exhausted" : "Available"}
                        </Text>
                      </View>
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
                      {(selectedDonation.expiry_window || selectedDonation.expiry) ? (
                        <View style={{ marginTop: 6 }}>
                          <ExpiryCountdown
                            expiryWindow={selectedDonation.expiry_window || selectedDonation.expiry}
                            createdAt={selectedDonation.created_at}
                            status={selectedDonation.status}
                            compact={false}
                          />
                        </View>
                      ) : null}
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
                      style={[
                        styles.deleteModalBtn,
                        { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" },
                      ]}
                      onPress={() => {
                        const target = selectedDonation;
                        setSelectedDonation(null);
                        setEditingDonation(target);
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#087A3D"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.deleteModalBtnText, { color: "#087A3D" }]}>
                        Edit Donation
                      </Text>
                    </TouchableOpacity>
                  ) : (
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

      {/* Edit Donation Modal */}
      <EditDonationModal
        visible={!!editingDonation}
        onClose={() => setEditingDonation(null)}
        donation={editingDonation}
        onDonationUpdated={() => fetchDonations()}
      />

      {/* Feedback Pop Up Modal */}
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 66,
    height: 66,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
  },
  noImageCardPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  cardDetailsBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: "center",
  },
  portionPillRow: {
    marginBottom: 6,
  },
  availablePill: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    marginBottom: 3,
  },
  availablePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  fullyReservedPill: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  fullyReservedPillText: {
    color: "#DC2626",
  },
  expiredPill: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  expiredPillText: {
    color: "#64748B",
  },
  portionSubtext: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtnView: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnEdit: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDelete: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgePending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  textPending: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
  badgeActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginRight: 4,
  },
  textActive: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  badgePickedUp: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  textPickedUp: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  badgeCompleted: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  textCompleted: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  badgeCancelled: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  textCancelled: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  badgeExpired: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  textExpired: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
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
  qtyBreakdownBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qtyMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 3,
    columnGap: 12,
    marginBottom: 4,
  },
  qtyMetricChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyLabelText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  qtyValText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  qtyAvailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  qtyAvailLabelText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  availableHighlightVal: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#087A3D",
  },
  qtyBold: {
    fontWeight: "700",
    color: "#1E293B",
  },
  availableBold: {
    fontWeight: "700",
    color: "#087A3D",
  },
  fullyReservedBadge: {
    fontWeight: "800",
    color: "#DC2626",
  },
  modernQtyCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 6,
  },
  modernQtyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  qtyHeaderIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  modernQtyTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  metricStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricCardReserved: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
  },
  metricCardAvailable: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  metricCardFullyReserved: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  metricCardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 22,
  },
  reservedValColor: {
    color: "#475569",
  },
  availableValColor: {
    color: "#059669",
  },
  fullyReservedValColor: {
    color: "#DC2626",
  },
  metricCardUnit: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
    marginBottom: 3,
  },
  availableUnitColor: {
    color: "#059669",
  },
  fullyReservedUnitColor: {
    color: "#DC2626",
  },
  metricCardLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  availableLabelColor: {
    color: "#059669",
  },
  fullyReservedLabelColor: {
    color: "#DC2626",
  },
  noImageCardPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noImageCardText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500",
  },
  detailsNoImagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsNoImageText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    fontWeight: "600",
  },
});
