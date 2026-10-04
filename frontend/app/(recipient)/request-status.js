import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const GREEN = "#2e7d32";
const BTN_GREEN = "#0f7a55";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 12;

export default function RequestStatus() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Data passed via route params from confirm-request.js after a successful submission
  const requestId = params.id || "";
  const foodItem = params.name || "";
  const requestDate = params.date || "";
  const status = "Pending";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Status</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="check" size={36} color={GREEN} style={styles.checkIcon} />
          </View>
        </View>

        <Text style={styles.titleText}>Request Successful!</Text>
        <Text style={styles.subtitleText}>
          Your request has been sent to the donor.{"\n"}
          You will be notified once it is confirmed.
        </Text>

        {/* Info Card */}
        <View style={styles.card}>
          <InfoRow icon="file-text" label="Request ID" value={requestId} />
          <InfoRow icon="box" label="Food Item" value={foodItem} />
          <InfoRow icon="calendar" label="Request Date" value={requestDate} />
          <InfoRow icon="clock" label="Status" value={status} isLast />
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

function InfoRow({ icon, label, value, isLast }) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowMargin]}>
      <View style={styles.infoRowLeft}>
        <Feather name={icon} size={18} color={TEXT_SECONDARY} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.colon}>:</Text>
      <Text style={[styles.rowValue, label === 'Status' && { color: TEXT_PRIMARY, fontWeight: '700' }]}>{value}</Text>
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
