import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchFoodBankClaimHistory } from "../../services/recipientService";
import { getImageUrl } from "../../services/api";

export default function FoodBankHistoryScreen() {
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchFoodBankClaimHistory();
      setClaims(response?.claims || []);
    } catch (error) {
      console.error("Failed to load food-bank claim history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={25} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.title}>Claim History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#16a34a" />
          <Text style={styles.helperText}>Loading claim history...</Text>
        </View>
      ) : claims.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={42} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No claimed donations yet</Text>
          <Text style={styles.helperText}>Your food-bank claims will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {claims.map((claim) => (
            <View key={claim.id} style={styles.card}>
              <View style={styles.imageBox}>
                {claim.image_url ? (
                  <Image source={{ uri: getImageUrl(claim.image_url) }} style={styles.image} />
                ) : (
                  <Ionicons name="restaurant-outline" size={26} color="#cbd5e1" />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.foodName}>{claim.display_meal_name || claim.meal_name || "Donation"}</Text>
                <Text style={styles.portions}>{claim.requested_portions} portions claimed</Text>
                <Text style={styles.meta}>
                  {claim.fulfillment_method} · {claim.status}
                </Text>
                <Text style={styles.meta}>{claim.pickup_location}</Text>
                <Text style={styles.date}>
                  {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#172033" },
  headerSpacer: { width: 25 },
  content: { padding: 18, paddingBottom: 30 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 25 },
  emptyTitle: { marginTop: 12, fontSize: 17, fontWeight: "800", color: "#334155" },
  helperText: { marginTop: 7, color: "#64748b", fontSize: 13 },
  card: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  imageBox: {
    width: 78,
    height: 78,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: { width: "100%", height: "100%" },
  cardBody: { flex: 1, marginLeft: 13 },
  foodName: { fontSize: 16, fontWeight: "800", color: "#172033" },
  portions: { marginTop: 4, color: "#16a34a", fontSize: 13, fontWeight: "700" },
  meta: { marginTop: 4, color: "#64748b", fontSize: 12 },
  date: { marginTop: 5, color: "#94a3b8", fontSize: 11 },
});
