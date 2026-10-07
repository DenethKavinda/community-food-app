import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

// Native maps import
let MapView = null;
let Marker = null;

if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.log("react-native-maps load error:", e);
  }
}

// Helper: Reverse Geocoding (lat/lng -> address text)
export const reverseGeocodeCoords = async (latitude, longitude) => {
  try {
    const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverse && reverse.length > 0) {
      const first = reverse[0];
      const parts = [
        first.name && first.name !== first.street ? first.name : null,
        first.street,
        first.subregion || first.district || first.city,
        first.city || first.region,
        first.country,
      ].filter(Boolean);
      
      const uniqueParts = parts.filter((item, index) => parts.indexOf(item) === index);
      if (uniqueParts.length > 0) {
        return uniqueParts.join(", ");
      }
    }
  } catch (e) {
    console.log("Expo reverse geocode error:", e);
  }

  // Fallback via OpenStreetMap Nominatim API for web & edge cases
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(", ").slice(0, 4);
      return parts.join(", ");
    }
  } catch (err) {
    console.log("Nominatim reverse geocode error:", err);
  }

  return `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
};

// Helper: Forward Geocoding (address query -> lat/lng)
export const geocodeAddressQuery = async (query) => {
  if (!query || !query.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const first = data[0];
      return {
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lon),
        address: first.display_name.split(", ").slice(0, 4).join(", "),
      };
    }
  } catch (err) {
    console.log("Geocoding query error:", err);
  }
  return null;
};

const POPULAR_HUBS = [
  { name: "Colombo 03 (Kollupitiya)", lat: 6.9147, lng: 79.8518, address: "Colombo 03, Western Province, Sri Lanka" },
  { name: "Colombo 07 (Cinnamon Gardens)", lat: 6.9083, lng: 79.8667, address: "Colombo 07, Western Province, Sri Lanka" },
  { name: "Dehiwala / Mount Lavinia", lat: 6.8511, lng: 79.8653, address: "Dehiwala-Mount Lavinia, Sri Lanka" },
  { name: "Nugegoda Hub", lat: 6.8722, lng: 79.8889, address: "Nugegoda, Western Province, Sri Lanka" },
];

export default function LocationPickerModal({ visible, onClose, onSelectLocation, initialAddress }) {
  const defaultCoords = {
    latitude: 6.9271,
    longitude: 79.8612,
  };

  const [selectedCoords, setSelectedCoords] = useState(defaultCoords);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "Colombo 03, Sri Lanka");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingGps, setLoadingGps] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);

  // Fetch current GPS location
  const fetchCurrentLocation = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Defaulting to standard map location."
        );
        setLoadingGps(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setSelectedCoords(newCoords);

      setResolvingAddress(true);
      const addr = await reverseGeocodeCoords(newCoords.latitude, newCoords.longitude);
      setSelectedAddress(addr);
      setResolvingAddress(false);
    } catch (err) {
      console.warn("GPS location error:", err.message);
    } finally {
      setLoadingGps(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      if (initialAddress && initialAddress.trim() !== "") {
        geocodeAddressQuery(initialAddress).then((result) => {
          if (!isMounted) return;
          if (result) {
            setSelectedCoords({ latitude: result.latitude, longitude: result.longitude });
            setSelectedAddress(result.address);
          } else {
            fetchCurrentLocation();
          }
        });
      } else {
        fetchCurrentLocation();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [visible, initialAddress]);

  // Handle Search submit
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const result = await geocodeAddressQuery(searchQuery.trim());
    setSearching(false);
    if (result) {
      setSelectedCoords({ latitude: result.latitude, longitude: result.longitude });
      setSelectedAddress(result.address);
    } else {
      Alert.alert("Location Not Found", `Could not locate "${searchQuery}". Please try another search term.`);
    }
  };

  // Handle Quick Hub Select
  const handleSelectHub = (hub) => {
    setSelectedCoords({ latitude: hub.lat, longitude: hub.lng });
    setSelectedAddress(hub.address);
  };

  // Handle map press / marker drag (Native)
  const handleMapPress = async (e) => {
    const coords = e.nativeEvent?.coordinate || e;
    if (!coords || !coords.latitude || !coords.longitude) return;

    setSelectedCoords({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    setResolvingAddress(true);
    const addr = await reverseGeocodeCoords(coords.latitude, coords.longitude);
    setSelectedAddress(addr);
    setResolvingAddress(false);
  };

  const handleConfirm = () => {
    onSelectLocation({
      address: selectedAddress,
      latitude: selectedCoords.latitude,
      longitude: selectedCoords.longitude,
    });
    onClose();
  };

  const region = {
    latitude: selectedCoords.latitude,
    longitude: selectedCoords.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location on Google Map</Text>
          <TouchableOpacity
            onPress={fetchCurrentLocation}
            style={styles.gpsHeaderBtn}
            disabled={loadingGps}
            activeOpacity={0.7}
          >
            {loadingGps ? (
              <ActivityIndicator size="small" color="#087A3D" />
            ) : (
              <Ionicons name="locate" size={22} color="#087A3D" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search area (e.g. Colombo 03, Wellawatte...)"
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator size="small" color="#087A3D" />
            ) : (
              <TouchableOpacity onPress={handleSearch} style={{ padding: 4 }}>
                <Ionicons name="arrow-forward-circle" size={22} color="#087A3D" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Hub Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, styles.gpsChip]}
              onPress={fetchCurrentLocation}
              disabled={loadingGps}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.gpsChipText}>Current GPS</Text>
            </TouchableOpacity>

            {POPULAR_HUBS.map((hub, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleSelectHub(hub)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{hub.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Map Body */}
        <View style={styles.mapContainer}>
          {Platform.OS !== "web" && MapView ? (
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              <Marker
                coordinate={selectedCoords}
                draggable
                onDragEnd={(e) => handleMapPress(e.nativeEvent.coordinate)}
                title="Pickup Location"
                description={selectedAddress}
              />
            </MapView>
          ) : (
            /* Web Google Maps Embed - Clean view with single centered marker */
            <View style={styles.webMapBox}>
              <iframe
                title="Google Map Location Picker"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${selectedCoords.latitude},${selectedCoords.longitude}&z=16&output=embed`}
              />
            </View>
          )}

          {/* Map Tip Bar */}
          <View style={styles.floatingTip}>
            <Ionicons name="location-outline" size={16} color="#087A3D" />
            <Text style={styles.floatingTipText}>
              {Platform.OS === "web"
                ? "Showing location pin at selected coordinates on Google Maps"
                : "Tap anywhere on the map or drag the pin to select location"}
            </Text>
          </View>
        </View>

        {/* Bottom Card / Selection Bar */}
        <View style={styles.bottomCard}>
          <Text style={styles.addressLabel}>CONFIRM PICKUP ADDRESS</Text>
          
          <View style={styles.addressInputContainer}>
            <Ionicons name="location-sharp" size={22} color="#087A3D" style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              {resolvingAddress ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 }}>
                  <ActivityIndicator size="small" color="#087A3D" />
                  <Text style={styles.addressText}>Fetching address details...</Text>
                </View>
              ) : (
                <Text style={styles.addressText} numberOfLines={3}>
                  {selectedAddress}
                </Text>
              )}
              <Text style={styles.coordsSubtext}>
                Lat: {selectedCoords.latitude.toFixed(5)}, Lng: {selectedCoords.longitude.toFixed(5)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, resolvingAddress && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={resolvingAddress}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.confirmBtnText}>Confirm Pickup Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  gpsHeaderBtn: {
    padding: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#111827",
  },
  chipRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  gpsChip: {
    backgroundColor: "#087A3D",
    borderColor: "#087A3D",
    flexDirection: "row",
    alignItems: "center",
  },
  gpsChipText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webMapBox: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  floatingTip: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingTipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 6,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  addressEditableInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    padding: 0,
    maxHeight: 60,
  },
  coordsSubtext: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
