import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
// TODO: Uncomment the import below when the Request API endpoint is ready.
// import { fetchMyRequests } from '../../services/recipientService';

const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 14;

// ── Request data will come from the backend Request API ───────────────────────
// (DUMMY_REQUESTS removed – data will come from /api/recipient/my-requests)

export default function MyRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Uncomment the lines below once the Request API endpoint is ready.
    // setLoading(true);
    // fetchMyRequests()
    //   .then((data) => setRequests(data))
    //   .catch((err) => console.error('Failed to fetch requests:', err))
    //   .finally(() => setLoading(false));
  }, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfdfd" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Request</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* List content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading your requests...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No requests yet.</Text>
          </View>
        ) : (
          requests.map((item) => (
            <RequestCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>

      {/* Bottom Tab Bar (dummy navigation logic) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace("/(recipient)")}>
          <FontAwesome name="home" size={24} color="#999" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <FontAwesome name="heart" size={24} color={GREEN} />
          <Text style={styles.tabLabelActive}>My Requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function RequestCard({ item }) {
  const router = useRouter();
  const [cardHovered, setCardHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <View 
      style={[
        styles.card,
        cardHovered && styles.cardHovered,
      ]}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.cardImage} 
        contentFit="cover"
        transition={200}
      />
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        
        <View style={styles.portionBadge}>
          <Text style={styles.portionText}>{item.portions}</Text>
        </View>
        
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
          <Text style={styles.metaText}>{item.distance}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="clock" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
          <Text style={styles.metaText}>{item.time}</Text>
        </View>
      </View>

      <Pressable 
        style={[
          styles.viewBtn,
          btnHovered && styles.viewBtnHovered
        ]} 
        onHoverIn={() => setBtnHovered(true)}
        onHoverOut={() => setBtnHovered(false)}
        onPress={() => router.push({ pathname: "/(recipient)/request-details", params: item })}
      >
        <Text style={styles.viewBtnText}>View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#f9f9f9",
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
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHovered: {
    backgroundColor: "#f0faf0",
    borderColor: "#81c784",
    shadowOpacity: 0.14,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#f0f0f0",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 1,
  },
  portionBadge: {
    backgroundColor: GREEN_LIGHT,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 4,
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
    marginRight: 5,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
    marginLeft: 8,
  },
  viewBtnHovered: {
    backgroundColor: "#c8e6c9",
    borderWidth: 1,
    borderColor: "#66bb6a",
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
  },
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
