import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { fetchRequestById } from '../../services/recipientService';

const GREEN = "#2e7d32";
const BTN_GREEN = "#0f7a55";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 12;

// Map raw DB status values to human-readable labels
const STATUS_LABELS = {
  Pending:   "Pending Approval",
  Approved:  "Approved",
  Rejected:  "Rejected",
  Cancelled: "Cancelled",
  Completed: "Completed",
};

export default function RequestStatus() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // These basic fields come from route params (set right after submit)
  const requestId   = params.id   || "";
  const foodItem    = params.name || "";
  const requestDate = params.date || "";

  // Real status is fetched from the backend
  const [requestStatus, setRequestStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!requestId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      fetchRequestById(requestId)
        .then((data) => {
          if (data?.request?.request_status) {
            setRequestStatus(data.request.request_status);
          }
        })
        .catch((err) => console.error("Failed to fetch request status:", err))
        .finally(() => setLoading(false));
    }, [requestId])
  );

  const statusLabel = STATUS_LABELS[requestStatus] || requestStatus;

  // Derive icon and colour from actual status
  const isCancelledOrRejected = requestStatus === "Cancelled" || requestStatus === "Rejected";
  const iconName  = isCancelledOrRejected ? "x" : "check";
  const iconColor = isCancelledOrRejected ? "#c62828" : GREEN;
  const borderColor = isCancelledOrRejected ? "#e57373" : GREEN;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(recipient)/my-requests");
            }
          }}
        >
          <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Status</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { borderColor }]}>
            {loading ? (
              <ActivityIndicator size="small" color={GREEN} />
            ) : (
              <Feather name={iconName} size={36} color={iconColor} style={styles.checkIcon} />
            )}
          </View>
        </View>

        <Text style={styles.titleText}>
          {isCancelledOrRejected ? `Request ${requestStatus}` : "Request Successful!"}
        </Text>
        <Text style={styles.subtitleText}>
          {requestStatus === "Cancelled"
            ? "Your request has been cancelled."
            : requestStatus === "Rejected"
            ? "Your request was rejected by the donor."
            : "Your request has been sent to the donor.\nYou will be notified once it is confirmed."}
        </Text>

        {/* Info Card */}
        <View style={styles.card}>
          <InfoRow icon="file-text" label="Request ID" value={requestId} />
          <InfoRow icon="box"       label="Food Item"  value={foodItem} />
          <InfoRow icon="calendar"  label="Request Date" value={requestDate} />
          <InfoRow
            icon="clock"
            label="Status"
            value={loading ? "Loading..." : statusLabel}
            statusColor={isCancelledOrRejected ? "#c62828" : GREEN}
            isLast
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace("/(recipient)/my-requests")}>
          <Text style={styles.primaryBtnText}>Go to My Requests</Text>
          <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, isLast, statusColor }) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowMargin]}>
      <View style={styles.infoRowLeft}>
        <Feather name={icon} size={18} color="#a3a3a3" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.colon}>:</Text>
      <Text style={[
        styles.rowValue,
        label === 'Status' && { color: statusColor || TEXT_PRIMARY, fontWeight: '700' }
      ]}>
        {value}
      </Text>
    </View>
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
    backgroundColor: "#fdfdfd",
    paddingHorizontal: 16,
    paddingVertical: 13,
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    marginTop: 2,
  },
  titleText: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoRowMargin: {
    marginBottom: 16,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: 125,
  },
  rowIcon: {
    marginRight: 12,
    color: "#a3a3a3",
  },
  rowLabel: {
    fontSize: 13.5,
    color: "#555",
  },
  colon: {
    fontSize: 14,
    color: "#777",
    marginRight: 16,
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    backgroundColor: "#fdfdfd",
  },
  primaryBtn: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: BTN_GREEN,
    borderRadius: RADIUS,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
