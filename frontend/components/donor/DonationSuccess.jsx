import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DonationSuccess({
  donationId = null,
  postedDate = new Date().toISOString().split("T")[0],
  mealName = "Fresh Food Donation",
  quantity = "10 portions",
  expiryWindow = "Today, 05:00 PM",
  image = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
  onBackToDashboard,
  onViewDonation,
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Top Header Row with back chevron */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToDashboard}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Animated/Glowing Checkmark Header */}
          <View style={styles.successIconContainer}>
            <View style={styles.outerGlowCircle}>
              <View style={styles.innerGreenCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.handHeartBadge}>
                <MaterialCommunityIcons name="hand-heart" size={14} color="#087A3D" />
              </View>
            </View>

            <Text style={styles.title}>Posted Successfully!</Text>
            <Text style={styles.subtitle}>
              Your food donation has been posted and is now visible to receivers and volunteers.
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Donation ID (Rendered only if realId exists) */}
            {donationId ? (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBox}>
                      <Ionicons name="receipt-outline" size={18} color="#087A3D" />
                    </View>
                    <Text style={styles.detailLabel}>Donation ID</Text>
                  </View>
                  <View style={styles.idBadgeRow}>
                    <View style={styles.idPill}>
                      <Text style={styles.idText}>{donationId}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.copyBtn}>
                      <Ionicons name="copy-outline" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Posted Date */}
            <View style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={18} color="#087A3D" />
                </View>
                <Text style={styles.detailLabel}>Posted Date</Text>
              </View>
              <Text style={styles.detailValue}>{postedDate}</Text>
            </View>

            <View style={styles.divider} />

            {/* Status */}
            <View style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="time-outline" size={18} color="#087A3D" />
                </View>
                <Text style={styles.detailLabel}>Status</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>🟢 Live for Rescue</Text>
              </View>
            </View>
          </View>

          {/* Item Summary Card */}
          <View style={styles.summaryCard}>
            <Image source={{ uri: image }} style={styles.foodImage} resizeMode="cover" />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.tagText}>SURPLUS RESCUE</Text>
              <Text style={styles.foodTitle} numberOfLines={1}>
                {mealName}
              </Text>
              <Text style={styles.windowText}>
                Pickup window: {expiryWindow}
              </Text>
            </View>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBackToDashboard}
            activeOpacity={0.85}
          >
            <Ionicons name="grid-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewDonation || (() => console.log("View Donation pressed"))}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>View Donation</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  backButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  successIconContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  outerGlowCircle: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  innerGreenCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#087A3D",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  handHeartBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E8F8EE",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
    marginTop: 20,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
    lineHeight: 19,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 16,
    marginTop: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  idBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  idPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  idText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  copyBtn: {
    padding: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  statusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#087A3D",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  foodImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  summaryTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#087A3D",
    letterSpacing: 0.4,
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  windowText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  quantityText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 14,
    height: 52,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    height: 52,
    marginHorizontal: 16,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
});
