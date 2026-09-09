import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AdminSidebar from "./components/AdminSidebar";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

export default function AdminDashboardIndex() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDrivers: 0,
    pendingFoodBanks: 0,
    activeDonations: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminOverviewStats();
  }, []);

  const fetchAdminOverviewStats = async () => {
    setLoading(true);
    try {
      const response = await API.get("/users");
      if (response.data) setStats(response.data);
    } catch (e) {
      console.log("Stats fetch skipped:", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>
            Welcome Back, {user?.name || "Admin"}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Overview of community food bank activities and surplus donations.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0284c7"
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  isMobile && styles.fullWidthCard,
                  { borderLeftColor: "#22c55e" },
                ]}
              >
                <Text style={styles.statNumber}>
                  {stats.activeDonations || 0}
                </Text>
                <Text style={styles.statLabel}>Active Donations</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  isMobile && styles.fullWidthCard,
                  { borderLeftColor: "#3b82f6" },
                ]}
              >
                <Text style={styles.statNumber}>{stats.totalUsers || 0}</Text>
                <Text style={styles.statLabel}>Registered Users</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  isMobile && styles.fullWidthCard,
                  { borderLeftColor: "#f59e0b" },
                ]}
              >
                <Text style={styles.statNumber}>
                  {stats.pendingDrivers || 0}
                </Text>
                <Text style={styles.statLabel}>Pending Drivers</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  isMobile && styles.fullWidthCard,
                  { borderLeftColor: "#8b5cf6" },
                ]}
              >
                <Text style={styles.statNumber}>
                  {stats.pendingFoodBanks || 0}
                </Text>
                <Text style={styles.statLabel}>Pending Food Banks</Text>
              </View>
            </View>

            {/* Team Responsibility Action Cards */}
            <Text style={styles.sectionHeading}>Management Panels</Text>

            <View style={styles.moduleGrid}>
              <TouchableOpacity
                style={[styles.moduleCard, isMobile && styles.fullWidthCard]}
                onPress={() => router.push("/(admin)/donations")}
              >
                <Text style={styles.moduleIcon}>📦</Text>
                <Text style={styles.moduleTitle}>Donations Management</Text>
                <Text style={styles.moduleDesc}>
                  Review food listing history, donor accounts, and force-delete
                  expired items.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.moduleCard, isMobile && styles.fullWidthCard]}
                onPress={() => router.push("/(admin)/claims")}
              >
                <Text style={styles.moduleIcon}>🤝</Text>
                <Text style={styles.moduleTitle}>Claims & Requests</Text>
                <Text style={styles.moduleDesc}>
                  Monitor reservations, track food recipient activity, and
                  resolve claims disputes.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.moduleCard, isMobile && styles.fullWidthCard]}
                onPress={() => router.push("/(admin)/drivers")}
              >
                <Text style={styles.moduleIcon}>🚚</Text>
                <Text style={styles.moduleTitle}>Driver & Verification</Text>
                <Text style={styles.moduleDesc}>
                  Review pending driver applications, check driver licenses, and
                  approve driver profiles.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.moduleCard, isMobile && styles.fullWidthCard]}
                onPress={() => router.push("/(admin)/organizations")}
              >
                <Text style={styles.moduleIcon}>🏢</Text>
                <Text style={styles.moduleTitle}>
                  Organization & Bulk Admin
                </Text>
                <Text style={styles.moduleDesc}>
                  Approve Food Banks/NGOs, manage public drop-off locations, and
                  oversee bulk request feeds.
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8fafc",
  },
  mobileContainer: {
    flexDirection: "column",
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeBanner: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moduleCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  fullWidthCard: {
    width: "100%",
    minWidth: "100%",
  },
  moduleIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
});
