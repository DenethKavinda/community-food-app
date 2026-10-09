import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DonationCard({ donation, onPress }) {
  const { title, quantity, location, status, image } = donation;

  // Status badge styling helper
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          label: "Available",
          badge: { backgroundColor: "#FEF3C7" },
          text: { color: "#D97706" },
        };
      case "Active":
        return {
          label: "Reserved",
          badge: { backgroundColor: "#DCFCE7" },
          text: { color: "#087A3D" },
        };
      case "Picked Up":
        return {
          label: "Picked Up",
          badge: { backgroundColor: "#F3F4F6" },
          text: { color: "#4B5563" },
        };
      case "Completed":
        return {
          label: "Completed",
          badge: { backgroundColor: "#DCFCE7" },
          text: { color: "#087A3D" },
        };
      case "Cancelled":
        return {
          label: "Cancelled",
          badge: { backgroundColor: "#FEF2F2" },
          text: { color: "#DC2626" },
        };
      case "Expired":
        return {
          label: "Expired",
          badge: { backgroundColor: "#F3F4F6" },
          text: { color: "#6B7280" },
        };
      default:
        return {
          label: status || "Available",
          badge: { backgroundColor: "#FEF3C7" },
          text: { color: "#D97706" },
        };
    }
  };

  const statusStyle = getStatusBadgeStyle(status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress || (() => console.log(`Donation ${title} pressed`))}
      activeOpacity={0.8}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.noImagePlaceholder}>
          <Ionicons name="camera-outline" size={18} color="#9CA3AF" />
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={13} color="#6B7280" style={styles.icon} />
          <Text style={styles.infoText}>
            Orig: {donation.originalQuantity ?? quantity} • Res: {donation.reservedQuantity ?? 0}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="pie-chart-outline" size={13} color="#087A3D" style={styles.icon} />
          <Text style={[styles.infoText, { fontWeight: "700", color: donation.availableQuantity === 0 ? "#DC2626" : "#087A3D" }]}>
            Avail: {donation.availableQuantity === 0 ? "Fully Reserved" : `${donation.availableQuantity ?? quantity} ${donation.unit || ''}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color="#6B7280" style={styles.icon} />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, statusStyle.badge]}>
        <Text style={[styles.statusText, statusStyle.text]}>{statusStyle.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    marginRight: 60, // ensure space for status badge
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  icon: {
    marginRight: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  noImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noImageText: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500",
  },
});
