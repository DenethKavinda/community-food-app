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
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

import API from "../../services/api";

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
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [pickupDisplayAddress, setPickupDisplayAddress] = useState("");

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickupLoading, setPickupLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
  }, []);

  // ------------------------------------------------
  // LOAD DRIVER GPS + REAL PICKUP DATA
  // ------------------------------------------------

  const loadDriverData = async () => {
    setLoading(true);
    setPickupLoading(true);

    try {
      await Promise.all([
        getCurrentLocation(),
        getDriverPickup(),
      ]);
    } finally {
      setLoading(false);
      setPickupLoading(false);
    }
  };

  // ------------------------------------------------
  // GET DRIVER GPS LOCATION
  // ------------------------------------------------

  const getCurrentLocation = async () => {
    try {
      setPermissionDenied(false);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
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
      console.log("Driver location error:", error);
      setPermissionDenied(true);
    }
  };

  // ------------------------------------------------
  // GET REAL DRIVER PICKUP FROM BACKEND
  // ------------------------------------------------

  const getDriverPickup = async () => {
    try {
      const response = await API.get("/driver/pickups");

      const pickups = response.data?.pickups || [];

      if (pickups.length === 0) {
        setPickup(null);
        setPickupLocation(null);
        return;
      }

      // For now use the newest available pickup.
      const firstPickup = pickups[0];

      // Accept the task when the driver opens it so the assignment is persisted.
      try {
        await API.patch("/driver/task-status", {
          taskType: firstPickup.task_type,
          claimId: firstPickup.claim_id,
          requestId: firstPickup.request_id,
          status: "ACCEPTED",
        });
      } catch (error) {
        console.error(
          "Failed to accept driver task:",
          error?.response?.data || error.message
        );
      }

      const latitude = Number(firstPickup.pickup_latitude);
      const longitude = Number(firstPickup.pickup_longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        console.log(
          "Pickup does not have valid GPS coordinates:",
          firstPickup
        );

        setPickup(firstPickup);
        setPickupLocation(null);
        return;
      }

      setPickup(firstPickup);

      setPickupLocation({
        latitude,
        longitude,
      });

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = addresses[0];

        const formattedAddress = [
          address?.name,
          address?.street,
          address?.city,
          address?.region,
        ]
          .filter(Boolean)
          .join(", ");

        setPickupDisplayAddress(
          formattedAddress ||
            firstPickup.pickup_address ||
            "Pickup address unavailable"
        );
      } catch (error) {
        console.log("Pickup address lookup error:", error);

        setPickupDisplayAddress(
          firstPickup.pickup_address || "Pickup address unavailable"
        );
      }
    } catch (error) {
      console.log(
        "Driver pickup loading error:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Pickup Error",
        "Could not load the pickup location."
      );

      setPickup(null);
      setPickupLocation(null);
    }
  };

  // ------------------------------------------------
  // GOOGLE MAPS NAVIGATION
  // ------------------------------------------------

  const startNavigation = async () => {
    if (!pickupLocation) {
      Alert.alert(
        "Location unavailable",
        "Pickup GPS location is not available yet."
      );
      return;
    }

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

  const confirmPickup = async () => {
    if (!pickup) {
      Alert.alert("Pickup Error", "Pickup task is not available.");
      return;
    }

    let destinationLatitude = pickup.destination_latitude;
    let destinationLongitude = pickup.destination_longitude;

    // If backend does not have destination GPS,
    // convert the destination address into GPS coordinates.
    if (
      !destinationLatitude ||
      !destinationLongitude
    ) {
      try {
        const address = pickup.destination_address;

        if (address) {
          const results = await Location.geocodeAsync(address);

          if (results.length > 0) {
            destinationLatitude = results[0].latitude;
            destinationLongitude = results[0].longitude;
          }
        }
      } catch (error) {
        console.log("Destination geocoding error:", error);
      }
    }

    router.push({
      pathname: "/(driver)/verify-pickup",
      params: {
        taskType: pickup.task_type || "",
        claimId: pickup.claim_id ? String(pickup.claim_id) : "",
        requestId: pickup.request_id ? String(pickup.request_id) : "",
        mealName: pickup.meal_name || "",
        quantity: String(pickup.quantity ?? ""),
        quantityUnit: pickup.quantity_unit || "portions",
        pickupAddress: pickup.pickup_address || "",
        donorName: pickup.donor_name || "",
        imageUrl: pickup.image_url || "",
        notes: pickup.notes || "",
        expiryWindow: pickup.expiry_window || "",
        destinationAddress: pickup.destination_address || "",
        destinationLatitude: destinationLatitude
          ? String(destinationLatitude)
          : "",
        destinationLongitude: destinationLongitude
          ? String(destinationLongitude)
          : "",
      },
    });
  };

  // ------------------------------------------------
  // MAP REGION
  // ------------------------------------------------

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : pickupLocation
    ? {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 6.9271,
        longitude: 79.8612,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------

  if (loading || pickupLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#16A34A"
          />

          <Text style={styles.loadingText}>
            Loading pickup location...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {Platform.OS === "web" ? (
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

              {pickupLocation ? (
                <>
                  <Text style={styles.webMapSubtitle}>
                    Real pickup GPS location
                  </Text>

                  <Text style={styles.coordinates}>
                    {pickupLocation.latitude.toFixed(5)},{" "}
                    {pickupLocation.longitude.toFixed(5)}
                  </Text>
                </>
              ) : (
                <Text style={styles.webMapSubtitle}>
                  Pickup GPS location unavailable
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

            {/* REAL PICKUP MARKER */}
            {pickupLocation && (
              <Marker
                coordinate={pickupLocation}
                title={pickup?.donor_name || "Food Pickup"}
                description={
                  pickup?.pickup_address ||
                  "Pickup location"
                }
              >
                <View style={styles.pickupMarker}>
                  <Ionicons
                    name="restaurant"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
              </Marker>
            )}

            {/* Route */}
            {location && pickupLocation && (
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
              {pickup?.donor_name || "Food Pickup"}
            </Text>

            <Text
              style={styles.restaurantAddress}
              numberOfLines={2}
            >
              {pickupDisplayAddress ||
                pickup?.pickup_address ||
                "Pickup address unavailable"}
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
            GPS
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
                  pickup?.image_url ||
                  "https://images.unsplash.com/photo-1547592180-85f173990554?w=300",
              }}
              style={styles.foodImage}
            />
          </View>

          <View style={styles.foodInfo}>
            <View style={styles.foodTitleRow}>
              <Text style={styles.foodTitle}>
                {pickup?.meal_name || "Food Donation"}
              </Text>

              <View style={styles.portionBadge}>
                <Text style={styles.portionText}>
                  {pickup?.quantity || 0}{" "}
                  {pickup?.quantity_unit || "portions"}
                </Text>
              </View>
            </View>

            <Text style={styles.foodDescription}>
              {pickup?.notes ||
                "Food donation available for pickup"}
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
              Pickup:{" "}
              {pickup?.expiry_window || "Available"}
            </Text>
          </View>

          <View style={styles.scheduleBadge}>
            <Text style={styles.scheduleText}>
              Available
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
          onPress={() => router.push("/(driver)/history")}
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

  // HEADER
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

  // MAP
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

  // WEB MAP
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
    textAlign: "center",
  },

  coordinates: {
    marginTop: 10,
    fontSize: 12,
    color: "#374151",
  },

  // TOP PICKUP CARD
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

  // MAP MARKERS
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

  // DISTANCE
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

  // MAP CONTROLS
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

  // PERMISSION
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

  // BOTTOM CARD
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
    flexShrink: 1,
  },

  portionBadge: {
    backgroundColor: "#E8F7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 5,
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

  // INFO
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

  // CONFIRM BUTTON
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

  // GOOGLE MAPS BUTTON
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

  // BOTTOM NAV
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