import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { fetchMyRequests, cancelRequest } from '../../services/recipientService';
import { getImageUrl } from '../../services/api';

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
    setLoading(true);
    fetchMyRequests()
      .then((data) => {
        const reqs = data.requests || [];
        console.log('[my-requests] loaded requests:', JSON.stringify(reqs.map(r => ({ id: r.id, request_status: r.request_status, meal_name: r.meal_name }))));
        setRequests(reqs);
      })
      .catch((err) => console.error('Failed to fetch requests:', err))
      .finally(() => setLoading(false));
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
            <RequestCard
              key={item.id}
              item={item}
              onCancel={async (id) => {
                console.log('[my-requests] onCancel called with id:', id);
                try {
                  const result = await cancelRequest(id);
                  console.log('[my-requests] cancelRequest response:', JSON.stringify(result));
                  setRequests(prev => prev.map(r => r.id === id ? { ...r, request_status: 'Cancelled' } : r));
                } catch (error) {
                  console.error('[my-requests] cancelRequest error:', error?.response?.status, error?.response?.data);
                  Alert.alert("Error", error.response?.data?.message || "Failed to cancel the request. Please try again.");
                }
              }}
            />
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

function RequestCard({ item, onCancel }) {
  const router = useRouter();
  const [cardHovered, setCardHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Debug: log what status this card sees so we can confirm the button guard
  console.log(`[RequestCard] id=${item.id} request_status="${item.request_status}" showCancel=${item.request_status === 'Pending'}`);

  const handleCancelPress = () => {
    console.log('[RequestCard] handleCancelPress id:', item.id, 'request_status:', item.request_status);

    if (Platform.OS === 'web') {
      // Alert.alert() is a no-op on Expo Web — use the browser's native confirm dialog instead
      const confirmed = window.confirm('Are you sure you want to cancel this request?');
      if (confirmed) {
        console.log('[RequestCard] Yes, Cancel pressed for id:', item.id);
        setIsCancelling(true);
        onCancel(item.id).finally(() => setIsCancelling(false));
      }
    } else {
      Alert.alert(
        'Cancel Request',
        'Are you sure you want to cancel this request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              console.log('[RequestCard] Yes, Cancel pressed for id:', item.id);
              setIsCancelling(true);
              try {
                await onCancel(item.id);
              } finally {
                setIsCancelling(false);
              }
            },
          },
        ]
      );
    }
  };

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
        source={{ uri: getImageUrl(item.image_url) || "https://images.unsplash.com/photo-1546833999-b9f581a1996d" }} 
        style={styles.cardImage} 
        contentFit="cover"
        transition={200}
      />
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.meal_name}</Text>
        
        <View style={styles.portionBadge}>
          <Text style={styles.portionText}>{item.requested_portions} portions</Text>
        </View>
        
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
          <Text style={styles.metaText}>{item.donation_location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="clock" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
          <Text style={styles.metaText}>{item.expiry_window || item.request_status}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable 
          style={[
            styles.viewBtn,
            btnHovered && styles.viewBtnHovered
          ]} 
          onHoverIn={() => setBtnHovered(true)}
          onHoverOut={() => setBtnHovered(false)}
          onPress={() => router.push({ pathname: "/(recipient)/request-details", params: { id: item.id } })}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>

        {(item.request_status === 'Pending' || item.request_status === 'pending') && (
          <Pressable
            style={[
              styles.cancelBtn,
              cancelHovered && styles.cancelBtnHovered,
              isCancelling && { opacity: 0.6 }
            ]}
            disabled={isCancelling}
            onHoverIn={() => setCancelHovered(true)}
            onHoverOut={() => setCancelHovered(false)}
            onPress={handleCancelPress}
          >
            <Text style={styles.cancelBtnText}>
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </Text>
          </Pressable>
        )}
      </View>
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
  cardActions: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
    marginLeft: 8,
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
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
    textAlign: "center",
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e57373",
    backgroundColor: "#fff5f5",
  },
  cancelBtnHovered: {
    backgroundColor: "#ffcdd2",
    borderColor: "#ef5350",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c62828",
    textAlign: "center",
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
