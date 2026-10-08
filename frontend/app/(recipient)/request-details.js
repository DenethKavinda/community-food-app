import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import MapLocationPicker from "../../components/MapLocationPicker";
import { fetchRequestById, updateRequest } from '../../services/recipientService';
import { getImageUrl } from '../../services/api';

const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";
const BORDER = "#e8e8e8";
const RADIUS = 14;

export default function RequestDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // -- Edit State --
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editPortions, setEditPortions] = useState(1);
  const [editFulfillment, setEditFulfillment] = useState("driver");
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

  const safeAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

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
  }, [isEditing]);

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

  useEffect(() => {
    if (params.id) {
      loadRequestData();
    }
  }, [params.id]);

  const loadRequestData = async () => {
    setLoading(true);
    try {
      const data = await fetchRequestById(params.id);
      if (data?.request) {
        setRequest(data.request);
        setAvailablePortions(data.request.available_portions || 1);
        setEditPortions(data.request.requested_portions || 1);
        setEditFulfillment(data.request.fulfillment_method === "Self Pickup" ? "pickup" : "driver");
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
      console.error("Failed to fetch request details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (editPortions < 1 || editPortions > availablePortions) {
      safeAlert("Invalid Portions", `Please request between 1 and ${availablePortions} portions.`);
      return;
    }
    if (!editPhone || String(editPhone).trim() === "") {
      safeAlert("Missing Information", "Please provide a contact phone number.");
      return;
    }
    if (editFulfillment === "driver") {
      if (!editAddress || String(editAddress).trim() === "") {
        safeAlert("Missing Information", "Please provide a delivery address for Volunteer Driver Delivery.");
        return;
      }
      if (editLatitude === null || editLongitude === null) {
        safeAlert("Missing Information", "Please select an exact delivery location on the map.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        requested_portions: editPortions,
        fulfillment_method: editFulfillment === "driver" ? "Volunteer Driver Delivery" : "Self Pickup",
        delivery_address: editFulfillment === "driver" ? editAddress : null,
        delivery_latitude: editFulfillment === "driver" ? editLatitude : null,
        delivery_longitude: editFulfillment === "driver" ? editLongitude : null,
        contact_phone: editPhone,
        special_instructions: editNotes || null,
      };

      const res = await updateRequest(params.id, requestData);
      if (res && res.success) {
        safeAlert("Success", "Request updated successfully.");
        await loadRequestData();
        setIsEditing(false);
      } else {
        safeAlert("Error", res?.message || "Failed to edit request.");
      }
    } catch (err) {
      console.error("Update request error:", err);
      safeAlert("Error", err.response?.data?.message || "An error occurred while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (request) {
      setEditPortions(request.requested_portions || 1);
      setEditFulfillment(request.fulfillment_method === "Self Pickup" ? "pickup" : "driver");
      setEditAddress(request.delivery_address || "");
      setEditPhone(request.contact_phone || "");
      setEditNotes(request.special_instructions || "");
      
      const lat = request.delivery_latitude ? Number(request.delivery_latitude) : null;
      const lng = request.delivery_longitude ? Number(request.delivery_longitude) : null;
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

  let formattedDate = "";
  let formattedTime = "";
  if (request?.requested_at) {
    const d = new Date(request.requested_at);
    formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(d.getMinutes()).padStart(2, "0");
    formattedTime = `${hours}:${minutes} ${ampm}`;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: TEXT_SECONDARY }}>Request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing && request) {
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

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
            <View style={[styles.infoCard, { marginBottom: 16 }]}>
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

          <View style={styles.infoCard}>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>📍 Delivery Address</Text>
              <TextInput
                style={[styles.editInput, editFulfillment === "pickup" && styles.inputDisabled]}
                value={editFulfillment === "pickup" ? "N/A (Self Pickup)" : editAddress}
                onChangeText={setEditAddress}
                placeholder="Enter delivery address"
                placeholderTextColor={TEXT_SECONDARY}
                editable={editFulfillment !== "pickup"}
                multiline
              />
            </View>
            <View style={[styles.editField, styles.editFieldBorder]}>
              <Text style={styles.editLabel}>📞 Contact Phone</Text>
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter contact phone number"
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <SectionDivider title="DELIVERY NOTES / SPECIAL INSTRUCTIONS" />
          <View style={styles.infoCard}>
            <TextInput
              style={styles.notesBox}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="e.g. Please ring front bell..."
              placeholderTextColor={TEXT_SECONDARY}
              multiline
              textAlignVertical="top"
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.stickyFooter}>
          <TouchableOpacity style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfdfd" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Details Card */}
        <View style={styles.card}>
          {request.image_url ? (
            <Image
              source={{ uri: getImageUrl(request.image_url) }}
              style={styles.cardImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{request.meal_name}</Text>
            
            <View style={styles.portionBadge}>
              <Text style={styles.portionText}>{request.requested_portions} portions</Text>
            </View>
            
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
              <Text style={styles.metaText}>{request.donation_location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={11} color={TEXT_SECONDARY} style={styles.metaIcon} />
              <Text style={styles.metaText}>{formattedDate}, {formattedTime}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Request Status</Text>

        {/* Timeline Stepper */}
        <View style={styles.timeline}>
          {(() => {
            const status = request.request_status;
            const isCancelled = status === "Cancelled";
            const isRejected = status === "Rejected";
            const isApproved = status === "Approved" || status === "Completed";
            const isCompleted = status === "Completed";
            
            return (
              <>
                {/* Step 1 */}
                <View style={styles.step}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                      <Feather name="check" size={12} color={GREEN} />
                    </View>
                    <View style={[styles.stepLine, styles.stepLineCompleted]} />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitleCompleted}>Request Sent</Text>
                    <Text style={styles.stepSubtitle}>{formattedDate}, {formattedTime}</Text>
                  </View>
                </View>

                {/* Step 2 */}
                <View style={styles.step}>
                  <View style={styles.stepIndicator}>
                    <View style={[
                      styles.stepCircle, 
                      isApproved ? styles.stepCircleCompleted : (isCancelled || isRejected) ? { borderColor: "#c62828", backgroundColor: "#c62828" } : styles.stepCircleActive
                    ]}>
                      {(isCancelled || isRejected) ? (
                        <Feather name="x" size={12} color="#ffffff" style={styles.checkIconActive} />
                      ) : isApproved ? (
                        <Feather name="check" size={12} color={GREEN} />
                      ) : (
                        <Feather name="check" size={12} color="#ffffff" style={styles.checkIconActive} />
                      )}
                    </View>
                    {(!isCancelled && !isRejected) && (
                      <View style={[styles.stepLine, isApproved && styles.stepLineCompleted]} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    {isCancelled || isRejected ? (
                      <>
                        <Text style={[styles.stepTitleCompleted, { color: "#c62828" }]}>{status}</Text>
                        <Text style={styles.stepSubtitle}>Request was {status.toLowerCase()}</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.stepTitleCompleted}>Pending Approval</Text>
                        <Text style={styles.stepSubtitle}>{isApproved ? "Approved" : "Waiting for donor response"}</Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Steps 3-5 only if not cancelled/rejected */}
                {(!isCancelled && !isRejected) && (
                  <>
                    {/* Step 3 */}
                    <View style={styles.step}>
                      <View style={styles.stepIndicator}>
                        <View style={[styles.stepCircle, isApproved ? styles.stepCircleCompleted : {}]}>
                           {isApproved && <Feather name="check" size={12} color={GREEN} />}
                        </View>
                        <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={isApproved ? styles.stepTitleCompleted : styles.stepTitle}>Approved</Text>
                        <Text style={styles.stepSubtitle}>{isApproved ? "Donor has approved" : "You will be notified"}</Text>
                      </View>
                    </View>

                    {/* Step 4 */}
                    <View style={styles.step}>
                      <View style={styles.stepIndicator}>
                        <View style={[styles.stepCircle, isCompleted ? styles.stepCircleCompleted : (isApproved && !isCompleted ? styles.stepCircleActive : {})]}>
                          {isCompleted ? (
                            <Feather name="check" size={12} color={GREEN} />
                          ) : (isApproved && !isCompleted) ? (
                            <Feather name="check" size={12} color="#ffffff" style={styles.checkIconActive} />
                          ) : null}
                        </View>
                        <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={((isApproved && !isCompleted) || isCompleted) ? styles.stepTitleCompleted : styles.stepTitle}>Food Pickup</Text>
                        <Text style={styles.stepSubtitle}>{isCompleted ? "Picked up" : "Pending"}</Text>
                      </View>
                    </View>

                    {/* Step 5 */}
                    <View style={styles.step}>
                      <View style={styles.stepIndicator}>
                        <View style={[styles.stepCircle, isCompleted ? styles.stepCircleCompleted : {}]}>
                          {isCompleted && <Feather name="check" size={12} color={GREEN} />}
                        </View>
                        {/* No line for last step */}
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={isCompleted ? styles.stepTitleCompleted : styles.stepTitle}>Completed</Text>
                        <Text style={styles.stepSubtitle}>{isCompleted ? "Request completed successfully" : "Pending"}</Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            );
          })()}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Request ID</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{request.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requested On</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fulfillment</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{request.fulfillment_method}</Text>
          </View>
          {request.fulfillment_method === "Volunteer Driver Delivery" && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.infoValue}>{request.delivery_address}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.infoValue}>{request.contact_phone}</Text>
          </View>
          {request.special_instructions && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Note</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.infoValue}>{request.special_instructions}</Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        {request.request_status === "Pending" && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsEditing(true)}>
            <Feather name="edit-2" size={16} color={GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Edit Delivery Details</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace("/(recipient)")}>
          <FontAwesome name="home" size={24} color="#999" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace("/(recipient)/my-requests")}>
          <FontAwesome name="heart" size={24} color={GREEN} />
          <Text style={styles.tabLabelActive}>My Requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#fdfdfd",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#f0f0f0",
  },
  cardImagePlaceholder: {
    backgroundColor: "#f0f0f0",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  portionBadge: {
    backgroundColor: GREEN_LIGHT,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  portionText: {
    fontSize: 11,
    fontWeight: "700",
    color: GREEN,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  
  /* Timeline */
  timeline: {
    marginLeft: 8,
    marginBottom: 24,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    borderColor: GREEN,
  },
  stepCircleActive: {
    borderColor: "#1a1a1a",
    backgroundColor: "#1a1a1a",
  },
  checkIconActive: {
    marginTop: 1,
  },
  stepLine: {
    width: 2,
    height: 38,
    backgroundColor: "#ddd",
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: GREEN,
  },
  stepContent: {
    flex: 1,
    paddingTop: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  stepTitleCompleted: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    color: "#888",
  },

  /* Info Card */
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: RADIUS,
    padding: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    width: 100,
    fontSize: 13,
    color: "#666",
  },
  colon: {
    fontSize: 13,
    color: "#666",
    marginRight: 12,
  },
  infoValue: {
    fontSize: 13.5,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  tabLabelActive: {
    fontSize: 11,
    color: GREEN,
    fontWeight: "700",
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
    borderColor: GREEN,
    backgroundColor: "#e8f5e9",
    width: "100%",
  },
  secondaryBtnText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700"
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
    color: "#aaa",
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
    borderColor: "#c8e6c9",
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
    borderColor: "#c8e6c9",
    padding: 10,
    backgroundColor: "#fafffe",
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  geocodingHint: {
    fontSize: 12,
    color: "#388e3c",
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

// ── Shared UI Subcomponents for Edit Form ──
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
