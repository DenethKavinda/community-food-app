/**
 * MapLocationPicker.native.js
 * Used on iOS and Android via Expo's platform-specific file resolution.
 * Uses react-native-maps which is already installed in this project.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const GREEN_MID = "#388e3c";
const BORDER = "#e8e8e8";
const TEXT_SECONDARY = "#777";

export default function MapLocationPicker({
  latitude,
  longitude,
  currentLocation,
  initialRegion,
  onLocationSelect,
}) {
  const handlePress = (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    onLocationSelect(lat, lng);
  };

  return (
    <View>
      <Text style={styles.instruction}>
        Tap on the map to select the exact delivery location.
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={!!currentLocation}
          showsMyLocationButton={false}
          onPress={handlePress}
        >
          {latitude !== null && longitude !== null && (
            <Marker
              coordinate={{ latitude, longitude }}
              title="Delivery Location"
              description="Your package will be delivered exactly here."
            />
          )}
        </MapView>
      </View>
      {latitude !== null && longitude !== null ? (
        <Text style={styles.selectedText}>Location selected ✅</Text>
      ) : (
        <Text style={styles.warningText}>Location not selected ❌</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  mapContainer: {
    height: 200,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  selectedText: {
    fontSize: 13,
    color: GREEN_MID,
    fontWeight: "600",
    textAlign: "center",
  },
  warningText: {
    fontSize: 13,
    color: "#d32f2f",
    fontWeight: "600",
    textAlign: "center",
  },
});
