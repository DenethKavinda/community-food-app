import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// ── Constants ─────────────────────────────────────────────────────────────────
const GREEN = "#2e7d32";
const GREEN_MID = "#388e3c";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_BORDER = "#c8e6c9";
const GREEN_CHIP = "#4caf50";
const BORDER = "#e8e8e8";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const TEXT_MUTED = "#aaa";
const RADIUS = 12;

// ── Dummy request data (replaced by real data later) ─────────────────────────
const DUMMY_REQUEST = {
  id: "1",
  name: "Rice & Curry",
  availablePortions: 10,
  donor: "ABC Restaurant",
  distance: "1.2 km away",
  timeWindow: "Today, 11:30 AM – 12:30 PM",
  color: "#f5e6d3",
  emoji: "🍛",
  recipientEntity: "Hope NGO Community Center",
  deliveryAddress: "No. 45, Temple Road, Colombo 03",
  contactPhone: "+94 77 987 8543",
  estTime: "~25 – 35 mins",
  serviceFee: "Free (Donation)",
};

// ── Small reusable components ─────────────────────────────────────────────────
const BackIcon = () => <Text style={{ fontSize: 20, color: TEXT_PRIMARY }}>‹</Text>;
const InfoIcon = () => <Text style={{ fontSize: 18, color: TEXT_SECONDARY }}>ⓘ</Text>;
const RadioFilled = () => (
  <View style={styles.radioOuter}>
    <View style={styles.radioInner} />
  </View>
);
const RadioEmpty = () => <View style={styles.radioOuterEmpty} />;

const SectionDivider = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionDivider}>
    <Text style={styles.sectionDividerText}>{title}</Text>
    {actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionDividerAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ConfirmRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Merge dummy data with any params passed from the dashboard (future use)
  const item = { ...DUMMY_REQUEST, ...(params.itemData ? JSON.parse(params.itemData) : {}) };

  const [portions, setPortions] = useState(Math.min(10, item.availablePortions));
  const [fulfillment, setFulfillment] = useState("driver"); // 'driver' | 'pickup'
  const [notes, setNotes] = useState("");

  const increment = () => setPortions((p) => Math.min(p + 1, item.availablePortions));
  const decrement = () => setPortions((p) => Math.max(p - 1, 1));

  const handleConfirm = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    router.replace({
      pathname: "/(recipient)/request-status",
      params: {
        id: item.id || "REQ00123",
        name: item.name,
        date: formattedDate
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Request</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <InfoIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Food Summary Card ── */}
        <View style={styles.card}>
          {/* Food image + info row */}
          <View style={styles.foodRow}>
            <View style={[styles.foodThumb, { backgroundColor: item.color }]}>
              <Text style={styles.foodEmoji}>{item.emoji ?? "🥗"}</Text>
            </View>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <View style={styles.availChip}>
                <Text style={styles.availChipText}>
                  {item.availablePortions} portions available
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{item.donor} · {item.distance}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>🕐</Text>
                <Text style={styles.metaText}>{item.timeWindow}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Requested Portions Stepper */}
          <View>
            <Text style={styles.portionLabel}>Requested Portions</Text>
            <Text style={styles.portionHint}>Max limit: {item.availablePortions} portions</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} onPress={decrement}>
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                <Text style={styles.stepperValueText}>{portions}</Text>
              </View>
              <TouchableOpacity style={styles.stepperBtn} onPress={increment}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Fulfillment Method ── */}
        <SectionDivider title="FULFILLMENT METHOD" />

        {/* Driver Delivery */}
        <TouchableOpacity
          style={[
            styles.fulfillCard,
            fulfillment === "driver" && styles.fulfillCardActive,
          ]}
          onPress={() => setFulfillment("driver")}
          activeOpacity={0.8}
        >
          <View style={styles.fulfillTop}>
            <View style={styles.fulfillRadioTitle}>
              {fulfillment === "driver" ? <RadioFilled /> : <RadioEmpty />}
              <Text style={styles.fulfillTitle}>Volunteer Driver Delivery</Text>
            </View>
            <View style={styles.recommendedChip}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          </View>
          <Text style={styles.fulfillDesc}>
            Assign an available driver to deliver the package directly to your location.
          </Text>
        </TouchableOpacity>

        {/* Self Pickup */}
        <TouchableOpacity
          style={[
            styles.fulfillCard,
            fulfillment === "pickup" && styles.fulfillCardActive,
          ]}
          onPress={() => setFulfillment("pickup")}
          activeOpacity={0.8}
        >
          <View style={styles.fulfillTop}>
            <View style={styles.fulfillRadioTitle}>
              {fulfillment === "pickup" ? <RadioFilled /> : <RadioEmpty />}
              <Text style={styles.fulfillTitle}>Self Pickup</Text>
            </View>
          </View>
          <Text style={styles.fulfillDesc}>
            Collect the package in-person from the donor at {item.donor}.
          </Text>
        </TouchableOpacity>

        {/* ── Delivery & Contact Info ── */}
        <SectionDivider
          title="DELIVERY & CONTACT INFO"
          actionLabel="Edit"
          onAction={() => {}}
        />

        <View style={styles.card}>
          <InfoRow icon="🏢" label={item.recipientEntity} />
          <InfoRow icon="📍" label={item.deliveryAddress} />
          <InfoRow icon="📞" label={item.contactPhone} last />
        </View>

        {/* ── Delivery Notes ── */}
        <SectionDivider title="DELIVERY NOTES / SPECIAL INSTRUCTIONS" />

        <View style={styles.card}>
          <NotesInput value={notes} onChange={setNotes} />
        </View>

        {/* ── Summary Row ── */}
        <View style={styles.summaryCard}>
          <SummaryRow label="Estimated Confirmation & Prep" value={item.estTime} />
          <SummaryRow
            label="Service Fee / Cost"
            value={item.serviceFee}
            valueGreen
          />
        </View>

        {/* Spacer so button doesn't overlap last card */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky Confirm Button ── */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Confirm Request →</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          You can track status or cancel this request under{" "}
          <Text style={styles.footerNoteLink}>My Requests.</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function SummaryRow({ label, value, valueGreen }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueGreen && { color: GREEN_MID }]}>{value}</Text>
    </View>
  );
}

function NotesInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  // Use a simple TextInput-like approach with a native text view
  return (
    <View style={[styles.notesBox, focused && styles.notesBoxFocused]}>
      <Text
        style={styles.notesPlaceholder}
        onPress={() => setFocused(true)}
      >
        {value || "e.g. Please ring front bell, leave with security at gate..."}
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // ── Generic card ──
  card: {
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // ── Food summary card ──
  foodRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  foodThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  foodEmoji: { fontSize: 30 },
  foodInfo: { flex: 1, gap: 4 },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  availChip: {
    backgroundColor: GREEN_LIGHT,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  availChipText: {
    fontSize: 12,
    color: GREEN_MID,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: { fontSize: 11 },
  metaText: { fontSize: 12, color: TEXT_SECONDARY },

  // Divider inside card
  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 14,
  },

  // ── Stepper ──
  portionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  portionHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepperBtnText: {
    fontSize: 20,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  stepperValue: {
    width: 44,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepperValueText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  // ── Section divider ──
  sectionDivider: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
  },
  sectionDividerAction: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN_MID,
  },

  // ── Fulfillment cards ──
  fulfillCard: {
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 10,
  },
  fulfillCardActive: {
    borderColor: GREEN,
    backgroundColor: "#f5fbf5",
  },
  fulfillTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fulfillRadioTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  fulfillTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
  },
  fulfillDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginLeft: 30,
    lineHeight: 18,
  },

  // Radio buttons
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  radioOuterEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
  },

  // Recommended chip
  recommendedChip: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: GREEN_MID,
  },

  // ── Info rows ──
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 9,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  infoIcon: { fontSize: 15, marginTop: 1 },
  infoLabel: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 18,
  },

  // ── Notes box ──
  notesBox: {
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  notesBoxFocused: {
    borderColor: GREEN_BORDER,
    backgroundColor: "#fff",
  },
  notesPlaceholder: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 20,
  },

  // ── Summary card ──
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },

  // ── Sticky footer ──
  stickyFooter: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    alignItems: "center",
    gap: 8,
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: GREEN,
    borderRadius: RADIUS,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: "center",
  },
  footerNoteLink: {
    color: GREEN_MID,
    fontWeight: "700",
  },
});
