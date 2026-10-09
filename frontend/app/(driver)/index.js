import React, { useContext } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

import DriverHeader from "../../components/driver/DriverHeader";
import DriverPickupRequest from "../../components/driver/DriverPickupRequest";
import DriverTasks from "../../components/driver/DriverTasks";
import DriverBottomNav from "../../components/driver/DriverBottomNav";

export default function DriverDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleAcceptPickup = () => {
    router.push("/(driver)/map");
  };

  const handleTaskPress = (task) => {
    console.log(
      `TASK CLICKED: ${task.title} - Pickup from ${task.location} at ${task.time}`
    );
  };

  const handleTabPress = (tab) => {
    if (tab === "Home") {
      router.push("/(driver)");
    } else if (tab === "Map") {
      router.push("/(driver)/map");
    } else if (tab === "History") {
      router.push("/(driver)/history");
    }
  };

  const handleProfilePress = () => {
    router.push("/(driver)/profile");
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />

      <DriverHeader
        title="Driver Dashboard"
        onProfilePress={handleProfilePress}
      />

      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DriverPickupRequest
            onAccept={handleAcceptPickup}
          />

          <DriverTasks
            onTaskPress={handleTaskPress}
          />
        </ScrollView>

        <DriverBottomNav
          activeTab="Home"
          onTabPress={handleTabPress}
        />
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