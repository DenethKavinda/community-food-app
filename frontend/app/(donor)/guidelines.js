import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";

const guidelineSections = [
  {
    id: "temp",
    title: "Temperature & Storage Rules",
    icon: "thermometer-outline",
    iconType: "ionicons",
    badge: "Crucial",
    summary: "Storage thresholds for hot and cold meal donations.",
    rules: [
      "Hot meals must be maintained above 60°C (140°F) or packaged immediately post-preparation.",
      "Cold items and dairy products must be refrigerated below 4°C (40°F) prior to pickup.",
      "Avoid leaving perishable food items at room temperature for longer than 2 hours.",
    ],
  },
  {
    id: "expiry",
    title: "Expiry & Freshness Window",
    icon: "time-outline",
    iconType: "ionicons",
    badge: "Safety First",
    summary: "Ensuring adequate consumption windows for recipients.",
    rules: [
      "Registered meals must have a minimum remaining consumption window of 4 hours.",
      "Always clearly indicate 'Prepared On' and 'Consume Before' timestamps.",
      "Never donate food items that are expired, spoiled, unsealed, or previously served.",
    ],
  },
  {
    id: "hygiene",
    title: "Hygiene & Packaging Standards",
    icon: "sparkles-outline",
    iconType: "ionicons",
    badge: "Hygiene",
    summary: "Eco-friendly, food-grade, and tamper-proof packing.",
    rules: [
      "Use clean, unused food-grade containers, leak-proof boxes, or foil wraps.",
      "Food preparers must wear clean disposable gloves, hairnets, and masks during packing.",
      "Seal all meal containers firmly with tamper-evident tape or secure lids.",
    ],
  },
  {
    id: "allergens",
    title: "Allergen Declarations & Labeling",
    icon: "alert-circle-outline",
    iconType: "ionicons",
    badge: "Mandatory",
    summary: "Clear labeling of potential dietary allergens.",
    rules: [
      "Declare major allergens: Nuts, Peanuts, Dairy, Eggs, Seafood, Soy, Wheat, Gluten.",
      "Mark dietary suitability tags clearly (e.g. Vegetarian, Vegan, Halal, Kosher).",
      "Separate allergen-containing dishes from allergen-free portions during storage.",
    ],
  },
];

export default function FoodSafetyGuidelinesScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState("temp");

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(donor)/profile");
    }
  };

  const toggleSection = (id) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="Food Safety Guidelines" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>Safety Guidelines</Text>

        <View style={styles.verifiedShield}>
          <Ionicons name="shield-checkmark" size={20} color="#087A3D" />
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Banner Card */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconBox}>
              <Ionicons name="shield-checkmark" size={24} color="#087A3D" />
            </View>
            <View style={styles.heroTextBox}>
              <Text style={styles.heroTitle}>Ensuring Safe & Hygienic Meals</Text>
              <Text style={styles.heroSubtitle}>
                Follow these essential rules to keep community donations safe, fresh, and compliant for all recipients.
              </Text>
            </View>
          </View>

          {/* Quick Summary Pill Bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryPill}>
              <Ionicons name="checkmark-circle" size={14} color="#087A3D" style={{ marginRight: 4 }} />
              <Text style={styles.summaryPillText}>Fresh Prep Only</Text>
            </View>
            <View style={styles.summaryPill}>
              <MaterialCommunityIcons name="cube-outline" size={14} color="#087A3D" style={{ marginRight: 4 }} />
              <Text style={styles.summaryPillText}>Sealed Boxes</Text>
            </View>
            <View style={styles.summaryPill}>
              <Ionicons name="pricetag-outline" size={14} color="#087A3D" style={{ marginRight: 4 }} />
              <Text style={styles.summaryPillText}>Allergen Labeled</Text>
            </View>
          </View>

          {/* Guidelines Section Cards List */}
          <View style={styles.sectionsList}>
            {guidelineSections.map((item) => {
              const isExpanded = expandedSection === item.id;
              return (
                <View key={item.id} style={styles.guidelineCard}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleSection(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.cardIconBox}>
                        <Ionicons name={item.icon} size={20} color="#087A3D" />
                      </View>
                      <View style={styles.headerTitleBox}>
                        <View style={styles.titleBadgeRow}>
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardSummary}>{item.summary}</Text>
                      </View>
                    </View>

                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.cardBody}>
                      <View style={styles.bodyDivider} />
                      {item.rules.map((rule, idx) => (
                        <View key={idx} style={styles.ruleRow}>
                          <View style={styles.ruleBullet} />
                          <Text style={styles.ruleText}>{rule}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Good Samaritan Law Legal Protection Card */}
          <View style={styles.legalCard}>
            <View style={styles.legalHeaderRow}>
              <Ionicons name="shield-outline" size={20} color="#087A3D" style={{ marginRight: 8 }} />
              <Text style={styles.legalTitle}>Good Samaritan Protection</Text>
              <View style={styles.legalBadge}>
                <Text style={styles.legalBadgeText}>Protected</Text>
              </View>
            </View>
            <Text style={styles.legalText}>
              Food donors acting in good faith without gross negligence or intentional misconduct are protected under local Food Donation Good Samaritan regulations.
            </Text>
          </View>

          {/* Donate Food CTA */}
          <TouchableOpacity
            style={styles.donateCtaBtn}
            onPress={() => router.push("/(donor)/donate")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="hand-heart" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.donateCtaText}>Donate Safe Food Now</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom Navigation Bar */}
        <DonorBottomNav initialTab="Profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedShield: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    marginBottom: 12,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroTextBox: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
  summaryBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#374151",
  },
  sectionsList: {
    gap: 10,
    marginBottom: 14,
  },
  guidelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#111827",
  },
  badgePill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#087A3D",
  },
  cardSummary: {
    fontSize: 12,
    color: "#6B7280",
  },
  cardBody: {
    marginTop: 10,
  },
  bodyDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087A3D",
    marginTop: 6,
    marginRight: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 12.5,
    color: "#374151",
    lineHeight: 18,
  },
  legalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 16,
  },
  legalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  legalBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  legalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#087A3D",
  },
  legalText: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 17,
  },
  donateCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 14,
    height: 50,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  donateCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
