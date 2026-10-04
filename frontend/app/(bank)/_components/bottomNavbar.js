import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const navItems = [
  {
    name: "Home",
    route: "/(bank)",
    icon: "home-outline",
    activeIcon: "home",
    match: (pathname) => pathname === "/" || pathname.endsWith("/(bank)") || pathname.endsWith("/(bank)/"),
  },
  {
    name: "Drivers",
    route: "/(bank)/drivers",
    icon: "car-outline",
    activeIcon: "car",
    match: (pathname) => pathname.endsWith("/drivers"),
  },
  {
    name: "Inventory",
    route: "/(bank)/inventory",
    icon: "cube-outline",
    activeIcon: "cube",
    match: (pathname) => pathname.endsWith("/inventory"),
  },
];

export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = item.match(pathname);

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navButton}
            activeOpacity={0.75}
            onPress={() => router.replace(item.route)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={24}
                color={isActive ? "#16a34a" : "#94a3b8"}
              />
              {isActive && <View style={styles.activeDot} />}
            </View>
            <Text style={[styles.navText, isActive && styles.activeNavText]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 76 : 68,
    paddingBottom: Platform.OS === "ios" ? 14 : 4,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 8,
    boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.05)",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconWrap: {
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    top: -3,
    right: -5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  navText: {
    fontSize: 11,
    marginTop: 3,
    color: "#94a3b8",
    fontWeight: "500",
  },
  activeNavText: {
    color: "#16a34a",
    fontWeight: "700",
  },
});
