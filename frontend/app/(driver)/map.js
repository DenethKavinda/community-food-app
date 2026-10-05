import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

// Native maps only
let MapView = null;
let Marker = null;
let Polyline = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");

  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

export default function DriverMap() {
  const router = useRouter();

  const [location, setLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pickup location
  const pickupLocation = {
    latitude: 6.9271,
    longitude: 79.8612,
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ------------------------------------------------
  // GET DRIVER GPS LOCATION
  // ------------------------------------------------

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.log("Location error:", error);
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // GOOGLE MAPS NAVIGATION
  // ------------------------------------------------

  const startNavigation = async () => {
    const destination =
      `${pickupLocation.latitude},${pickupLocation.longitude}`;

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    try {
      await Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.log("Google Maps error:", error);
    }
  };

  // ------------------------------------------------
  // CONFIRM PICKUP
  // ------------------------------------------------

    const confirmPickup = () => {
        router.push("/(driver)/verify-pickup");
    };

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#374151"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Pickup Location
        </Text>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#374151"
          />
        </TouchableOpacity>
      </View>

      {/* ================================================= */}
      {/* MAP */}
      {/* ================================================= */}

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#16A34A"
            />

            <Text style={styles.loadingText}>
              Getting your location...
            </Text>
          </View>
        ) : Platform.OS === "web" ? (
          <View style={styles.webMap}>
            <View style={styles.webMapCenter}>
              <Ionicons
                name="map-outline"
                size={60}
                color="#16A34A"
              />

              <Text style={styles.webMapTitle}>
                Pickup Location
              </Text>

              <Text style={styles.webMapSubtitle}>
                GPS location is available
              </Text>

              {location && (
                <Text style={styles.coordinates}>
                  {location.latitude.toFixed(5)},{" "}
                  {location.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={location !== null}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {/* Driver current location */}
            {location && (
              <Marker
                coordinate={location}
                title="You"
              >
                <View style={styles.driverMarker}>
                  <View style={styles.driverMarkerInner} />
                </View>
              </Marker>
            )}

            {/* Pickup marker */}
            <Marker
              coordinate={pickupLocation}
              title="ABC Restaurant"
              description="123 Main Street, Colombo 03"
            >
              <View style={styles.pickupMarker}>
                <Ionicons
                  name="restaurant"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </Marker>

            {/* Route */}
            {location && (
              <Polyline
                coordinates={[
                  location,
                  pickupLocation,
                ]}
                strokeWidth={5}
                strokeColor="#16A34A"
              />
            )}
          </MapView>
        )}

        {/* ================================================= */}
        {/* TOP PICKUP CARD */}
        {/* ================================================= */}

        <View style={styles.pickupTopCard}>
          <View style={styles.restaurantIcon}>
            <Ionicons
              name="location"
              size={21}
              color="#16A34A"
            />
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              ABC Restaurant
            </Text>

            <Text style={styles.restaurantAddress}>
              123 Main Street, Colombo 03
            </Text>
          </View>

          <View style={styles.pickupBadge}>
            <Text style={styles.pickupBadgeText}>
              Pickup
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* DISTANCE BADGE */}
        {/* ================================================= */}

        <View style={styles.distanceBadge}>
          <Ionicons
            name="navigate"
            size={13}
            color="#FFFFFF"
          />

          <Text style={styles.distanceText}>
            5 km
          </Text>
        </View>

        {/* ================================================= */}
        {/* MAP CONTROLS */}
        {/* ================================================= */}

        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            activeOpacity={0.8}
          >
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlButton}
            activeOpacity={0.8}
          >
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={getCurrentLocation}
            activeOpacity={0.8}
          >
            <Ionicons
              name="locate"
              size={18}
              color="#374151"
            />
          </TouchableOpacity>
        </View>

        {/* Permission warning */}
        {permissionDenied && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>
              Location permission required
            </Text>

            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ================================================= */}
      {/* BOTTOM PICKUP CARD */}
      {/* ================================================= */}

      <View style={styles.bottomCard}>
        <View style={styles.foodHeader}>
          <View style={styles.foodImageContainer}>
            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1547592180-85f173990554?w=300",
              }}
              style={styles.foodImage}
            />
          </View>

          <View style={styles.foodInfo}>
            <View style={styles.foodTitleRow}>
              <Text style={styles.foodTitle}>
                Rice & Curry
              </Text>

              <View style={styles.portionBadge}>
                <Text style={styles.portionText}>
                  10 portions
                </Text>
              </View>
            </View>

            <Text style={styles.foodDescription}>
              Vegetarian cooked meals in boxes
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9CA3AF"
          />
        </View>

        {/* Pickup information */}
        <View style={styles.infoSection}>
          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={17}
              color="#16A34A"
            />

            <Text style={styles.timeText}>
              Pickup Time: 11:30 AM
            </Text>
          </View>

          <View style={styles.scheduleBadge}>
            <Text style={styles.scheduleText}>
              On Schedule
            </Text>
          </View>
        </View>

        {/* Confirm pickup */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmPickup}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Pickup
          </Text>

          <Ionicons
            name="checkmark-circle-outline"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Start Google Navigation */}
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={startNavigation}
          activeOpacity={0.8}
        >
          <Ionicons
            name="navigate"
            size={18}
            color="#16A34A"
          />

          <Text style={styles.navigationButtonText}>
            Open Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================================================= */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/(driver)")}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="map"
            size={21}
            color="#16A34A"
          />

          <Text style={styles.navTextActive}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={21}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F7",
  },

  // ---------------------------------------------------
  // HEADER
  // ---------------------------------------------------

  header: {
    height: 58,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },

  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------
  // MAP
  // ---------------------------------------------------

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  map: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  // ---------------------------------------------------
  // WEB MAP
  // ---------------------------------------------------

  webMap: {
    flex: 1,
    backgroundColor: "#DCEFE0",
    alignItems: "center",
    justifyContent: "center",
  },

  webMapCenter: {
    alignItems: "center",
    padding: 20,
  },

  webMapTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  webMapSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },

  coordinates: {
    marginTop: 10,
    fontSize: 12,
    color: "#374151",
  },

  // ---------------------------------------------------
  // TOP PICKUP CARD
  // ---------------------------------------------------

  pickupTopCard: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    minHeight: 66,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    elevation: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  restaurantIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  restaurantInfo: {
    flex: 1,
    marginLeft: 10,
  },

  restaurantName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  restaurantAddress: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
  },

  pickupBadge: {
    backgroundColor: "#E8F7ED",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  pickupBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },

  // ---------------------------------------------------
  // MAP MARKERS
  // ---------------------------------------------------

  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },

  driverMarkerInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#16A34A",
  },

  pickupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------
  // DISTANCE
  // ---------------------------------------------------

  distanceBadge: {
    position: "absolute",
    top: "45%",
    left: "50%",
    marginLeft: -30,
    backgroundColor: "#1F2937",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  distanceText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  // ---------------------------------------------------
  // MAP CONTROLS
  // ---------------------------------------------------

  mapControls: {
    position: "absolute",
    right: 14,
    top: "40%",
    gap: 7,
  },

  mapControlButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  zoomText: {
    fontSize: 24,
    color: "#374151",
    lineHeight: 27,
  },

  // ---------------------------------------------------
  // PERMISSION
  // ---------------------------------------------------

  permissionCard: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 100,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  permissionTitle: {
    fontWeight: "700",
    color: "#111827",
  },

  permissionButton: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ---------------------------------------------------
  // BOTTOM CARD
  // ---------------------------------------------------

  bottomCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    elevation: 12,
  },

  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  foodImageContainer: {
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },

  foodImage: {
    width: "100%",
    height: "100%",
  },

  foodInfo: {
    flex: 1,
    marginLeft: 10,
  },

  foodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  foodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  portionBadge: {
    backgroundColor: "#E8F7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  portionText: {
    color: "#16A34A",
    fontSize: 9,
    fontWeight: "700",
  },

  foodDescription: {
    marginTop: 7,
    fontSize: 10,
    color: "#6B7280",
  },

  // ---------------------------------------------------
  // INFO
  // ---------------------------------------------------

  infoSection: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    marginLeft: 7,
    fontSize: 11,
    color: "#374151",
  },

  scheduleBadge: {
    backgroundColor: "#E8F7ED",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  scheduleText: {
    color: "#16A34A",
    fontSize: 9,
    fontWeight: "700",
  },

  // ---------------------------------------------------
  // CONFIRM BUTTON
  // ---------------------------------------------------

  confirmButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 11,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // ---------------------------------------------------
  // GOOGLE MAPS BUTTON
  // ---------------------------------------------------

  navigationButton: {
    marginTop: 8,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  navigationButtonText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700",
  },

  // ---------------------------------------------------
  // BOTTOM NAV
  // ---------------------------------------------------

  bottomNav: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  navText: {
    marginTop: 4,
    fontSize: 10,
    color: "#9CA3AF",
  },

  navTextActive: {
    marginTop: 4,
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "700",
  },
});