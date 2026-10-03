import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';

const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 14;

// Dummy data mirroring the screenshot requirements
const DUMMY_REQUESTS = [
  {
    id: "1",
    name: "Rice & Curry",
    portions: "10 portions",
    distance: "1.2 km away",
    time: "Today, 11:30 AM",
    image: "https://images.unsplash.com/photo-1626804475297-41609ea266eb?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    name: "Sandwiches",
    portions: "20 portions",
    distance: "2.4 km away",
    time: "Today, 12:00 PM",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    name: "Fruits (Mixed)",
    portions: "15 portions",
    distance: "3.1 km away",
    time: "Today, 02:00 PM",
    image: "https://images.unsplash.com/photo-1543228900-b620021c1775?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    name: "Bread Packs",
    portions: "12 portions",
    distance: "4.0 km away",
    time: "Today, 03:30 PM",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
  },
];

export default function MyRequests() {
  const router = useRouter();

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
        {DUMMY_REQUESTS.map((item) => (
          <RequestCard key={item.id} item={item} />
        ))}
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
