import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DonationCard from "./DonationCard";

const mockDonations = [
  {
    id: "1",
    title: "Rice & Curry",
    quantity: "10 portions",
    location: "Colombo 03",
    status: "Active",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    title: "Sandwiches",
    quantity: "20 portions",
    location: "Wellawatte",
    status: "Picked Up",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    title: "Fruits (Mixed)",
    quantity: "15 portions",
    location: "Nugegoda",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80",
  },
];

export default function RecentDonations({ donations = mockDonations, onSeeAllPress, onDonationPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <TouchableOpacity
          onPress={onSeeAllPress || (() => console.log("See All pressed"))}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsList}>
        {donations.map((item) => (
          <DonationCard
            key={item.id}
            donation={item}
            onPress={() => onDonationPress && onDonationPress(item)}
          />
        ))}
      </View>
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
});
