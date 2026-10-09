import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import DonationCard from "./DonationCard";
import { getMyDonations } from "../../services/donorService";
import API from "../../services/api";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:") || url.startsWith("data:")) {
    return url;
  }
  const baseUrl = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/?$/, "") : "http://localhost:5000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function RecentDonations({ onSeeAllPress, onDonationPress }) {
  const [recentList, setRecentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMyDonations();
      if (res && res.success && res.donations) {
        const mapped = res.donations.slice(0, 3).map((item) => {
          const origQty = item.original_quantity ?? (parseInt(item.quantity) || 0);
          const resQty = item.reserved_quantity ?? 0;
          const availQty = item.available_quantity ?? Math.max(0, origQty - resQty);
          const unit = item.quantity_unit
            ? item.quantity_unit.charAt(0).toUpperCase() + item.quantity_unit.slice(1)
            : "Portions";

          return {
            id: String(item.id),
            title: item.meal_name || "Food Donation",
            quantity: `${origQty} ${unit}`,
            originalQuantity: origQty,
            reservedQuantity: resQty,
            availableQuantity: availQty,
            unit: unit,
            location: item.location || "Location Not Set",
            status: item.status || "Pending",
            image: getImageUrl(item.image_url),
            raw: item,
          };
        });
        setRecentList(mapped);
      } else {
        setRecentList([]);
      }
    } catch (err) {
      console.warn("Could not load recent donations:", err.message);
      setRecentList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadRecent, 0);
    return () => clearTimeout(timer);
  }, [loadRecent]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <TouchableOpacity
          onPress={onSeeAllPress || (() => {})}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#087A3D" />
          <Text style={styles.loadingText}>Loading recent donations...</Text>
        </View>
      ) : recentList.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Recent Donations</Text>
          <Text style={styles.emptySubtext}>
            Your registered surplus food donations will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {recentList.map((item) => (
            <DonationCard
              key={item.id}
              donation={item}
              onPress={() => onDonationPress && onDonationPress(item.raw)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  headerRow: {
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
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#087A3D",
  },
  cardsList: {
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadingText: {
    fontSize: 12.5,
    color: "#6B7280",
  },
  emptyBox: {
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
