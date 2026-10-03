import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';

const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 14;

export default function RequestDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const item = {
    id: params.id || "REQ00123",
    name: params.name || "Rice & Curry",
    portions: params.portions || "10 portions",
    date: params.date || "2028-09-14",
    time: params.time || "11:30 AM",
    image: params.image || "https://images.unsplash.com/photo-1626804475297-41609ea266eb?auto=format&fit=crop&w=300&q=80"
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfdfd" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Details Card */}
        <View style={styles.card}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.cardImage} 
            contentFit="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            
            <View style={styles.portionBadge}>
              <Text style={styles.portionText}>{item.portions}</Text>
            </View>
            
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
              <Text style={styles.metaText}>Donor Location</Text>
            </View>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.date}, {item.time}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Request Status</Text>

        {/* Timeline Stepper */}
        <View style={styles.timeline}>
          {/* Step 1 */}
          <View style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Feather name="check" size={12} color={GREEN} />
              </View>
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleCompleted}>Request Sent</Text>
              <Text style={styles.stepSubtitle}>{item.date}, 10:15 AM</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Feather name="check" size={12} color="#ffffff" style={styles.checkIconActive} />
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleCompleted}>Pending Approval</Text>
              <Text style={styles.stepSubtitle}>Waiting for donor response</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepCircle} />
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Approved</Text>
              <Text style={styles.stepSubtitle}>You will be notified</Text>
            </View>
          </View>

          {/* Step 4 */}
          <View style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepCircle} />
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Food Pickup</Text>
              <Text style={styles.stepSubtitle}>Pending</Text>
            </View>
          </View>

          {/* Step 5 */}
          <View style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepCircle} />
              {/* No line for last step */}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Completed</Text>
              <Text style={styles.stepSubtitle}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Request ID</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{item.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requested On</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{item.date}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace("/(recipient)")}>
          <FontAwesome name="home" size={24} color="#999" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace("/(recipient)/my-requests")}>
          <FontAwesome name="heart" size={24} color={GREEN} />
          <Text style={styles.tabLabelActive}>My Requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#fdfdfd",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#f0f0f0",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  portionBadge: {
    backgroundColor: GREEN_LIGHT,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  portionText: {
    fontSize: 11,
    fontWeight: "700",
    color: GREEN,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  
  /* Timeline */
  timeline: {
    marginLeft: 8,
    marginBottom: 24,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    borderColor: GREEN,
  },
  stepCircleActive: {
    borderColor: "#1a1a1a",
    backgroundColor: "#1a1a1a",
  },
  checkIconActive: {
    marginTop: 1,
  },
  stepLine: {
    width: 2,
    height: 38,
    backgroundColor: "#ddd",
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: GREEN,
  },
  stepContent: {
    flex: 1,
    paddingTop: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  stepTitleCompleted: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    color: "#888",
  },

  /* Info Card */
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    width: 100,
    fontSize: 13,
    color: "#666",
  },
  colon: {
    fontSize: 13,
    color: "#666",
    marginRight: 12,
  },
  infoValue: {
    fontSize: 13.5,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  tabLabelActive: {
    fontSize: 11,
    color: GREEN,
    fontWeight: "700",
  },
});
