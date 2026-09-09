import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { AuthContext } from "../../../context/AuthContext";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  // Mobile detection threshold (Width < 768px)
  const isMobile = width < 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "📊 Dashboard Overview", route: "/(admin)" },
    { label: "📦 Donations Admin", route: "/(admin)/donations" },
    { label: "🤝 Claims & Requests", route: "/(admin)/claims" },
    { label: "🚚 Drivers & Verification", route: "/(admin)/drivers" },
    { label: "🏢 Food Banks & Outlets", route: "/(admin)/organizations" },
  ];

  return (
    <View style={isMobile ? styles.mobileWrapper : styles.sidebar}>
      {/* Top Bar for Mobile View */}
      {isMobile && (
        <View style={styles.mobileHeader}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Text style={styles.hamburgerText}>
              {mobileMenuOpen ? "✕ Close" : "☰ Menu"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Items (Visible always on Desktop, conditionally on Mobile) */}
      {(!isMobile || mobileMenuOpen) && (
        <View style={styles.menuContainer}>
          {!isMobile && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSubtitle}>Surplus Food App</Text>
            </View>
          )}

          <View style={styles.linksList}>
            {menuItems.map((item) => {
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => {
                    router.push(item.route);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                >
                  <Text
                    style={[styles.menuText, isActive && styles.activeMenuText]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>🚪 Logout System</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop Sidebar
  sidebar: {
    width: 240,
    backgroundColor: "#1e293b",
    padding: 20,
    justifyContent: "space-between",
    minHeight: "100%",
  },
  // Mobile Top Bar Wrapper
  mobileWrapper: {
    width: "100%",
    backgroundColor: "#1e293b",
    zIndex: 100,
  },
  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  hamburgerBtn: {
    backgroundColor: "#334155",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  hamburgerText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 15,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    padding: 15,
  },
  linksList: {
    gap: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  activeMenuItem: {
    backgroundColor: "#0284c7",
  },
  menuText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
  activeMenuText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
