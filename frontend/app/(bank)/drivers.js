import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { AuthContext } from "../../context/AuthContext";
import { createFoodBankClaim } from "../../services/recipientService";
import { getImageUrl } from "../../services/api";

let MapView = null;
let Marker = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function DriversScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Food Bank User";
  const params = useLocalSearchParams();
  const donation = params.itemData ? JSON.parse(params.itemData) : {};
  const [method, setMethod] = useState("Volunteer Driver Delivery");
  const [location, setLocation] = useState(donation.location || "");
  const [coordinates, setCoordinates] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submitClaim = async () => {
    if (!location.trim()) {
      Alert.alert("Location required", "Enter the current food-bank or pickup location.");
      return;
    }
    setSaving(true);
    try {
      await createFoodBankClaim({
        donation_id: donation.id,
        fulfillment_method: method,
        pickup_location: location,
        additional_notes: notes,
      });
      router.replace("/(bank)");
    } catch (error) {
      Alert.alert("Claim failed", error.response?.data?.message || "This donation may already be claimed.");
    } finally {
      setSaving(false);
    }
  };

  const updateLocationFromCoordinates = async (latitude, longitude) => {
    setCoordinates({ latitude, longitude });
    if (Platform.OS === "web") {
      setLocation(`Current location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
      return;
    }

    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addresses[0];
      const formatted = [address?.name, address?.street, address?.city, address?.region]
        .filter(Boolean)
        .join(", ");
      if (formatted) setLocation(formatted);
    } catch (error) {
      console.warn("Could not resolve map location:", error.message);
    }
  };

  const useCurrentLocation = async () => {
    setMapLoading(true);
    try {
      if (Platform.OS === "web") {
        if (!navigator.geolocation) {
          Alert.alert("Location unavailable", "This browser does not support location access.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            updateLocationFromCoordinates(coords.latitude, coords.longitude);
            setMapLoading(false);
          },
          () => {
            Alert.alert(
              "Location permission required",
              "Allow location access in your browser, then try again."
            );
            setMapLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location permission required", "Allow location access to use your current location.");
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      await updateLocationFromCoordinates(current.coords.latitude, current.coords.longitude);
    } catch (_error) {
      Alert.alert("Location unavailable", "We could not get your current location.");
    } finally {
      setMapLoading(false);
    }
  };

  const searchMapLocation = async () => {
    if (!searchLocation.trim()) return;
    if (Platform.OS === "web") {
      Alert.alert(
        "Search unavailable on web",
        "Use the current location button or open the app on a mobile device to search and pin a place."
      );
      return;
    }

    setMapLoading(true);
    try {
      const results = await Location.geocodeAsync(searchLocation.trim());
      if (!results.length) {
        Alert.alert("Location not found", "Try a nearby address, city, or landmark.");
        return;
      }
      await updateLocationFromCoordinates(results[0].latitude, results[0].longitude);
    } catch (_error) {
      Alert.alert("Search failed", "We could not find that location.");
    } finally {
      setMapLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(bank)")} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={25} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fulfill Donation</Text>
        <View style={styles.headerActions}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <View style={styles.profileButton}>
            <Ionicons name="person-outline" size={19} color="#16a34a" />
          </View>
          <TouchableOpacity onPress={logout} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons name="car-outline" size={23} color="#ffffff" />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Request Driver Dispatch</Text>
          <Text style={styles.infoText}>
            Assign an active volunteer driver to collect and transport this food donation from the donor location.
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <Text style={styles.label}>DONATION DETAILS</Text>
          <Text style={styles.readyPill}>Ready for pickup</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.donationRow}>
          <View style={styles.foodImage}>
            {donation.image_url ? (
              <Image source={{ uri: getImageUrl(donation.image_url) }} style={styles.foodImage} />
            ) : (
              <Ionicons name="restaurant-outline" size={26} color="#cbd5e1" />
            )}
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.foodName}>{donation.display_meal_name || donation.meal_name || "Donation"}</Text>
              <Text style={styles.peoplePill}>{donation.quantity || "Available"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{donation.location || "Pickup location unavailable"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="#16a34a" />
              <Text style={styles.metaTextDark}>{donation.expiry_window || "Expiry not specified"}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.fieldTitle}>Fulfillment method</Text>
      <View style={styles.methodRow}>
        {["Volunteer Driver Delivery", "Self Pickup"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.methodButton, method === option && styles.methodButtonActive]}
            onPress={() => setMethod(option)}
          >
            <Text style={[styles.methodText, method === option && styles.methodTextActive]}>
              {option === "Self Pickup" ? "Self Pickup" : "Assign Driver"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.fieldTitle}>Current / pickup location</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchLocation}
          onChangeText={setSearchLocation}
          onSubmitEditing={searchMapLocation}
          placeholder="Search on Google Maps"
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchMapLocation}>
          <Ionicons name="search" size={19} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.mapCard}>
        {MapView ? (
          <MapView
            provider={Platform.OS === "android" ? "google" : undefined}
            style={styles.map}
            initialRegion={{ latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
            region={coordinates ? { ...coordinates, latitudeDelta: 0.02, longitudeDelta: 0.02 } : undefined}
            onPress={(event) =>
              updateLocationFromCoordinates(
                event.nativeEvent.coordinate.latitude,
                event.nativeEvent.coordinate.longitude
              )
            }
          >
            {coordinates && <Marker coordinate={coordinates} title="Pickup location" />}
          </MapView>
        ) : (
          <View style={styles.webMapFallback}>
            <Ionicons name="map-outline" size={28} color="#16a34a" />
            <Text style={styles.webMapText}>Use search or current location to choose a pickup point.</Text>
          </View>
        )}
        {mapLoading && (
          <View style={styles.mapLoading}>
            <ActivityIndicator color="#16a34a" />
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.currentLocationButton} onPress={useCurrentLocation}>
        <Ionicons name="locate-outline" size={18} color="#16a34a" />
        <Text style={styles.currentLocationText}>Use current location</Text>
      </TouchableOpacity>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Selected location" />
      <View style={styles.helperRow}>
        <View style={styles.helperDot} />
        <Text style={styles.helperText}>Search for a place or tap the map to pin the pickup location.</Text>
      </View>

      <Text style={[styles.fieldTitle, styles.notesTitle]}>
        Additional Notes <Text style={styles.optional}>(Optional)</Text>
      </Text>
      <TextInput
        style={styles.notesBox}
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes for pickup or delivery..."
        multiline
      />

      <TouchableOpacity style={styles.confirmButton} onPress={submitClaim} disabled={saving}>
        <Ionicons name="send-outline" size={20} color="#ffffff" />
        <Text style={styles.confirmText}>{saving ? "Saving..." : "Save Claim Details"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 18, paddingBottom: 30 },
  header: { height: 55, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#172033" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  userName: { maxWidth: 105, fontSize: 12, fontWeight: "700", color: "#334155" },
  profileButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#86efac", backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", marginTop: 12, padding: 17, borderRadius: 17, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#bbf7d0" },
  infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
  infoCopy: { flex: 1, marginLeft: 13 },
  infoTitle: { fontSize: 15, fontWeight: "800", color: "#172033" },
  infoText: { marginTop: 5, fontSize: 13, lineHeight: 20, color: "#64748b" },
  searchRow: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: "#dbe3ed", borderRadius: 12, backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#172033" },
  searchButton: { width: 48, borderRadius: 12, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
  mapCard: { height: 230, marginTop: 10, overflow: "hidden", borderRadius: 14, borderWidth: 1, borderColor: "#dbe3ed" },
  map: { flex: 1 },
  webMapFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#ecfdf5" },
  webMapText: { marginTop: 8, textAlign: "center", color: "#166534", fontSize: 13, lineHeight: 19 },
  mapLoading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.45)" },
  currentLocationButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 10 },
  currentLocationText: { color: "#16a34a", fontWeight: "700", fontSize: 13 },
  detailsCard: { marginTop: 17, padding: 16, borderRadius: 17, backgroundColor: "#ffffff", boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.06)", elevation: 2 },
  detailsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5, color: "#64748b" },
  readyPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: "#d1fae5", color: "#047857", fontSize: 11, fontWeight: "700" },
  separator: { height: 1, marginVertical: 13, backgroundColor: "#f1f5f9" },
  donationRow: { flexDirection: "row", alignItems: "center" },
  foodImage: { width: 80, height: 80, borderRadius: 13, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginLeft: 13 },
  foodName: { fontSize: 16, fontWeight: "800", color: "#172033" },
  peoplePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: "#ecfdf5", color: "#16a34a", fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7, marginLeft: 13 },
  metaText: { fontSize: 12, color: "#64748b" },
  metaTextDark: { fontSize: 12, fontWeight: "600", color: "#334155" },
  fieldTitle: { marginTop: 19, marginBottom: 8, fontSize: 15, fontWeight: "700", color: "#334155" },
  methodRow: { flexDirection: "row", gap: 10 },
  methodButton: { flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff" },
  methodButtonActive: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
  methodText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  methodTextActive: { color: "#16a34a" },
  input: { minHeight: 48, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff", fontSize: 14, color: "#334155" },
  helperRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 9, paddingHorizontal: 4 },
  helperDot: { width: 7, height: 7, marginTop: 5, marginRight: 7, borderRadius: 4, backgroundColor: "#10b981" },
  helperText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#64748b" },
  notesTitle: { marginTop: 20 },
  optional: { fontWeight: "400", color: "#94a3b8" },
  notesBox: { minHeight: 89, padding: 14, borderRadius: 13, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff", textAlignVertical: "top", fontSize: 14, color: "#334155" },
  confirmButton: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 28, borderRadius: 13, backgroundColor: "#16a34a", boxShadow: "0px 5px 10px rgba(22, 163, 74, 0.2)", elevation: 4 },
  confirmText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
