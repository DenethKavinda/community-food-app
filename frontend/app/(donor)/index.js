import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorGreeting from "../../components/donor/DonorGreeting";
import DonationPromoCard from "../../components/donor/DonationPromoCard";
import QuickActions from "../../components/donor/QuickActions";
import RecentDonations from "../../components/donor/RecentDonations";
import MotivationCard from "../../components/donor/MotivationCard";
import DonorBottomNav from "../../components/donor/DonorBottomNav";

import { useRouter } from "expo-router";

export default function DonorDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader />
      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DonorGreeting />
          <DonationPromoCard onPress={() => router.push("/(donor)/donate")} />
          <QuickActions
            onDonateFoodPress={() => router.push("/(donor)/donate")}
            onViewHistoryPress={() => router.push("/(donor)/history")}
          />
          <RecentDonations onSeeAllPress={() => router.push("/(donor)/history")} />
          <MotivationCard onPress={() => router.push("/(donor)/donate")} />
        </ScrollView>
        <DonorBottomNav initialTab="Home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
