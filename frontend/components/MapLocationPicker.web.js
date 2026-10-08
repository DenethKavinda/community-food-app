/**
 * MapLocationPicker.web.js
 * Used on Expo web (browser) via Expo's platform-specific file resolution.
 * Uses react-leaflet + leaflet, which are browser-compatible.
 *
 * Leaflet CSS is injected dynamically so no webpack config changes are needed.
 */
import React, { useEffect, useRef } from "react";

const GREEN_MID = "#388e3c";
const GREEN_LIGHT = "#e8f5e9";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";

// Inject Leaflet CSS once when this module is first loaded on web.
function injectLeafletCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

// Fix Leaflet's default marker icon broken by webpack/bundlers.
function fixLeafletIcon(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function MapLocationPicker({
  latitude,
  longitude,
  currentLocation,
  initialRegion,
  onLocationSelect,
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const currentLocMarkerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Inject CSS and fix icon on mount.
    injectLeafletCSS();

    let L;
    try {
      L = require("leaflet");
    } catch {
      return;
    }
    fixLeafletIcon(L);

    if (mapRef.current && !mapInstanceRef.current) {
      const center = [
        initialRegion?.latitude ?? 6.9271,
        initialRegion?.longitude ?? 79.8612,
      ];
      const zoom = 12;

      const map = L.map(mapRef.current, { center, zoom });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Click handler: update marker and call callback.
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;

        // Place or move the marker.
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng])
            .addTo(map)
            .bindPopup("Delivery Location")
            .openPopup();
        }

        onLocationSelect(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If an external lat/lng is passed in (e.g. reset), sync the marker.
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let L;
    try { L = require("leaflet"); } catch { return; }

    if (latitude !== null && longitude !== null) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup("Delivery Location");
      }
    } else if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [latitude, longitude]);

  // Sync current location (blue dot)
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;
    let L;
    try { L = require("leaflet"); } catch { return; }

    if (currentLocMarkerRef.current) {
      currentLocMarkerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
    } else {
      currentLocMarkerRef.current = L.circleMarker([currentLocation.latitude, currentLocation.longitude], {
        radius: 6,
        fillColor: "#2196F3",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(mapInstanceRef.current).bindPopup("Current Location");
    }
  }, [currentLocation]);

  return (
    <div style={styles.wrapper}>
      <p style={styles.instruction}>
        Click on the map to select the exact delivery location.
      </p>
      <div
        ref={mapRef}
        style={styles.mapContainer}
      />
      {latitude !== null && longitude !== null ? (
        <p style={styles.selectedText}>Location selected ✅</p>
      ) : (
        <p style={styles.warningText}>Location not selected ❌</p>
      )}
    </div>
  );
}

// Plain JS object styles for web (no StyleSheet.create on web component).
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
  },
  instruction: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    marginTop: 0,
  },
  mapContainer: {
    height: 220,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
    border: `1px solid ${BORDER}`,
  },
  selectedText: {
    fontSize: 13,
    color: GREEN_MID,
    fontWeight: "600",
    textAlign: "center",
    margin: 0,
  },
  warningText: {
    fontSize: 13,
    color: "#d32f2f",
    fontWeight: "600",
    textAlign: "center",
    margin: 0,
  },
};
