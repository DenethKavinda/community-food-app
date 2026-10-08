import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapLocationPicker from "../../components/MapLocationPicker";
import { fetchRequestById, updateRequest } from '../../services/recipientService';

const GREEN = "#2e7d32";
const BTN_GREEN = "#0f7a55";
const GREEN_MID = "#388e3c";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_BORDER = "#c8e6c9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const TEXT_MUTED = "#aaa";
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

const getDisplayStatusLabel = (reqStatus, drvStatus) => {
  if (drvStatus === "ACCEPTED") return "Approved";
  if (drvStatus === "PICKED_UP") return "Food Picked Up";
  if (drvStatus === "DELIVERED") return "Completed";
  return STATUS_LABELS[reqStatus] || reqStatus;
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

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalRequest, setOriginalRequest] = useState(null);
  
  const [editPortions, setEditPortions] = useState(1);
  const [editFulfillment, setEditFulfillment] = useState("driver"); // 'driver' | 'pickup'
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLatitude, setEditLatitude] = useState(null);
  const [editLongitude, setEditLongitude] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [availablePortions, setAvailablePortions] = useState(1);

  // Request GPS location on edit mount
  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });

        setMapRegion((prev) => {
          if (!editLatitude && !editLongitude) {
            return { ...prev, latitude, longitude };
          }
          return prev;
        });
      } catch (e) {
        console.log("GPS Location error:", e);
      }
    })();
  }, [isEditing]); // re-run only when Edit is toggled

  const reverseGeocode = async (lat, lng) => {
    setIsGeocodingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setEditAddress(data.display_name);
        }
      }
    } catch {
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!requestId) {
        setLoading(false);
        return;
      }
      loadRequestData();
      // Poll every 10 s so driver status changes appear automatically
      const interval = setInterval(loadRequestData, 10000);
      return () => clearInterval(interval);
    }, [requestId])
  );

  const loadRequestData = async () => {
    setLoading(true);
    try {
      const data = await fetchRequestById(requestId);
      if (data?.request) {
        setRequestStatus(data.request.request_status);
        setOriginalRequest(data.request);
        setAvailablePortions(data.request.available_portions || 1);
        
        // Populate edit form
        setEditPortions(data.request.requested_portions || 1);
        setEditFulfillment(
          data.request.fulfillment_method === "Self Pickup" ? "pickup" : "driver"
        );
        setEditAddress(data.request.delivery_address || "");
        setEditPhone(data.request.contact_phone || "");
        setEditNotes(data.request.special_instructions || "");
        
        const lat = data.request.delivery_latitude ? Number(data.request.delivery_latitude) : null;
        const lng = data.request.delivery_longitude ? Number(data.request.delivery_longitude) : null;
        setEditLatitude(lat);
        setEditLongitude(lng);
        if (lat !== null && lng !== null) {
          setMapRegion(prev => ({...prev, latitude: lat, longitude: lng}));
        }
      }
    } catch (err) {
      console.error("Failed to fetch request status:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = getDisplayStatusLabel(requestStatus, originalRequest?.driver_task_status);

  // Derive icon and colour from actual status
  const isCancelledOrRejected = requestStatus === "Cancelled" || requestStatus === "Rejected";
  const iconName  = isCancelledOrRejected ? "x" : "check";
  const iconColor = isCancelledOrRejected ? "#c62828" : GREEN;
  const borderColor = isCancelledOrRejected ? "#e57373" : GREEN;

  const handleSave = async () => {
    if (editPortions < 1 || editPortions > availablePortions) {
      Alert.alert("Invalid Portions", `Please request between 1 and ${availablePortions} portions.`);
      return;
    }
    if (!editPhone || String(editPhone).trim() === "") {
      Alert.alert("Missing Information", "Please provide a contact phone number.");
      return;
    }
    if (editFulfillment === "driver") {
      if (!editAddress || String(editAddress).trim() === "") {
        Alert.alert("Missing Information", "Please provide a delivery address for Volunteer Driver Delivery.");
        return;
      }
      if (editLatitude === null || editLongitude === null) {
        Alert.alert("Missing Information", "Please select an exact delivery location on the map.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        requested_portions: editPortions,
        fulfillment_method:
          editFulfillment === "driver" ? "Volunteer Driver Delivery" : "Self Pickup",
        delivery_address: editFulfillment === "driver" ? editAddress : null,
        delivery_latitude: editFulfillment === "driver" ? editLatitude : null,
        delivery_longitude: editFulfillment === "driver" ? editLongitude : null,
        contact_phone: editPhone,
        special_instructions: editNotes || null,
      };

      const res = await updateRequest(requestId, requestData);
      if (res && res.success) {
        Alert.alert("Success", "Request updated successfully.");
        await loadRequestData();
        setIsEditing(false);
      } else {
        Alert.alert("Error", res?.message || "Failed to edit request.");
      }
    } catch (err) {
      console.error("Update request error:", err);
      Alert.alert("Error", err.response?.data?.message || "An error occurred while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset fields to what they were
    if (originalRequest) {
      setEditPortions(originalRequest.requested_portions || 1);
      setEditFulfillment(
        originalRequest.fulfillment_method === "Self Pickup" ? "pickup" : "driver"
      );
      setEditAddress(originalRequest.delivery_address || "");
      setEditPhone(originalRequest.contact_phone || "");
      setEditNotes(originalRequest.special_instructions || "");
      
      const lat = originalRequest.delivery_latitude ? Number(originalRequest.delivery_latitude) : null;
      const lng = originalRequest.delivery_longitude ? Number(originalRequest.delivery_longitude) : null;
      setEditLatitude(lat);
      setEditLongitude(lng);
      if (lat !== null && lng !== null) {
         setMapRegion(prev => ({...prev, latitude: lat, longitude: lng}));
      }
    }
    setIsEditing(false);
  };

  const increment = () => setEditPortions((p) => Math.min(p + 1, availablePortions));
  const decrement = () => setEditPortions((p) => Math.max(p - 1, 1));

  if (isEditing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleCancelEdit}>
            <Text style={{ fontSize: 16, color: TEXT_PRIMARY, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Details</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Portions */}
          <View style={styles.card}>
            <Text style={styles.portionLabel}>Requested Portions</Text>
            <Text style={styles.portionHint}>Max limit: {availablePortions} portions</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} onPress={decrement}>
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                <Text style={styles.stepperValueText}>{editPortions}</Text>
              </View>
              <TouchableOpacity style={styles.stepperBtn} onPress={increment}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SectionDivider title="FULFILLMENT METHOD" />

          {/* Driver Delivery */}
          <TouchableOpacity
            style={[styles.fulfillCard, editFulfillment === "driver" && styles.fulfillCardActive]}
            onPress={() => setEditFulfillment("driver")}
            activeOpacity={0.8}
          >
            <View style={styles.fulfillTop}>
              <View style={styles.fulfillRadioTitle}>
                {editFulfillment === "driver" ? <RadioFilled /> : <RadioEmpty />}
                <Text style={styles.fulfillTitle}>Volunteer Driver Delivery</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Self Pickup */}
          <TouchableOpacity
            style={[styles.fulfillCard, editFulfillment === "pickup" && styles.fulfillCardActive]}
            onPress={() => setEditFulfillment("pickup")}
            activeOpacity={0.8}
          >
            <View style={styles.fulfillTop}>
              <View style={styles.fulfillRadioTitle}>
                {editFulfillment === "pickup" ? <RadioFilled /> : <RadioEmpty />}
                <Text style={styles.fulfillTitle}>Self Pickup</Text>
              </View>
            </View>
          </TouchableOpacity>

          <SectionDivider title="DELIVERY & CONTACT INFO" />

          {editFulfillment === "driver" && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={styles.editLabel}>EXACT DELIVERY LOCATION</Text>
              <MapLocationPicker
                latitude={editLatitude}
                longitude={editLongitude}
                currentLocation={currentLocation}
                initialRegion={mapRegion}
                onLocationSelect={(lat, lng) => {
                  setEditLatitude(lat);
                  setEditLongitude(lng);
                  reverseGeocode(lat, lng);
                }}
              />
              {isGeocodingAddress && (
                <Text style={styles.geocodingHint}>
                  📍 Fetching address from selected location…
                </Text>
              )}
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>📍  Delivery Address</Text>
              <TextInput
                style={[styles.editInput, editFulfillment === "pickup" && styles.inputDisabled]}
                value={editFulfillment === "pickup" ? "N/A (Self Pickup)" : editAddress}
                onChangeText={setEditAddress}
                placeholder="Enter delivery address"
                placeholderTextColor={TEXT_MUTED}
                editable={editFulfillment !== "pickup"}
                multiline
              />
            </View>
            <View style={[styles.editField, styles.editFieldBorder]}>
              <Text style={styles.editLabel}>📞  Contact Phone</Text>
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter contact phone number"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <SectionDivider title="DELIVERY NOTES / SPECIAL INSTRUCTIONS" />
          <View style={styles.card}>
            <TextInput
              style={styles.notesBox}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="e.g. Please ring front bell..."
              placeholderTextColor={TEXT_MUTED}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.stickyFooter}>
          <TouchableOpacity style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Normal Read-Only Status View ---
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{flexGrow: 1}}>
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
              : statusLabel === "Food Picked Up"
              ? "Food has been picked up by the driver."
              : statusLabel === "Completed"
              ? "Your request has been completed!"
              : statusLabel === "Approved"
              ? "Your request has been approved!"
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
              isLast={true}
            />
          </View>
          
          {/* Details Card if not loading */}
          {originalRequest && !loading && (
            <View style={styles.card}>
               <InfoRow icon="hash" label="Portions" value={String(originalRequest.requested_portions)} />
               <InfoRow icon="truck" label="Method" value={originalRequest.fulfillment_method} />
               {originalRequest.delivery_address ? <InfoRow icon="map-pin" label="Address" value={originalRequest.delivery_address} /> : null}
               <InfoRow icon="phone" label="Phone" value={originalRequest.contact_phone} isLast={true} />
            </View>
          )}

          {/* Edit Button */}
          {requestStatus === "Pending" && !loading && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsEditing(true)}>
              <Feather name="edit-2" size={16} color={BTN_GREEN} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Edit Delivery Details</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

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

// ── Subcomponents ──

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

const RadioFilled = () => (
  <View style={styles.radioOuter}>
    <View style={styles.radioInner} />
  </View>
);
const RadioEmpty = () => <View style={styles.radioOuterEmpty} />;

const SectionDivider = ({ title }) => (
  <View style={styles.sectionDivider}>
    <Text style={styles.sectionDividerText}>{title}</Text>
  </View>
);

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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerBtn: {
    minWidth: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  scroll: { flex: 1, backgroundColor: "#fdfdfd" },
  scrollContent: { padding: 16 },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20
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
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
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
    width: 120,
  },
  rowIcon: {
    marginRight: 10,
    color: "#a3a3a3",
  },
  rowLabel: {
    fontSize: 13.5,
    color: "#555",
  },
  colon: {
    fontSize: 14,
    color: "#777",
    marginRight: 12,
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    flex: 1,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BTN_GREEN,
    backgroundColor: "#e8f5e9",
    width: "100%"
  },
  secondaryBtnText: {
    color: BTN_GREEN,
    fontSize: 14,
    fontWeight: "700"
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

  // ── Edit Form Styles ──
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
  sectionDivider: {
    marginBottom: 8,
    marginTop: 12,
  },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
  },
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
  editField: {
    paddingVertical: 8,
  },
  editFieldBorder: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  editInput: {
    borderWidth: 1,
    borderColor: GREEN_BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: TEXT_PRIMARY,
    backgroundColor: "#fafffe",
    minHeight: 38,
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#a0a0a0"
  },
  notesBox: {
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN_BORDER,
    padding: 10,
    backgroundColor: "#fafffe",
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  geocodingHint: {
    fontSize: 12,
    color: GREEN_MID,
    marginTop: 4,
    textAlign: "center",
  },
  stickyFooter: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    alignItems: "center",
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
});
