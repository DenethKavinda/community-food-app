import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import {
  createFoodBankInventoryItem,
  deleteFoodBankInventoryItem,
  fetchFoodBankInventory,
} from "../../services/recipientService";

const statusConfig = {
  expired: { label: "Expired / Outdated", color: "#b91c1c", background: "#fee2e2" },
  expiring_soon: { label: "Expires within 2 days", color: "#b45309", background: "#fef3c7" },
  fresh: { label: "Fresh", color: "#047857", background: "#d1fae5" },
  unknown: { label: "Expiry not set", color: "#64748b", background: "#f1f5f9" },
};
const UNIT_OPTIONS = ["portions", "box", "packet", "kg", "liters"];

function formatExpiry(value) {
  if (!value) return "Expiry date/time not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InventoryScreen() {
  const { user, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total_items: 0, expired: 0, expiring_soon: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [webDate, setWebDate] = useState("");
  const [webTime, setWebTime] = useState("");
  const [unitPreset, setUnitPreset] = useState("portions");
  const [form, setForm] = useState({
    item_name: "",
    category: "",
    quantity: "",
    quantity_unit: "portions",
    expiry_at: "",
    notes: "",
  });

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFoodBankInventory();
      setItems(data?.items || []);
      setSummary(data?.summary || { total_items: 0, expired: 0, expiring_soon: 0 });
    } catch (loadError) {
      console.error("Failed to load food bank inventory:", loadError);
      setError(loadError.response?.data?.message || "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );

  const saveItem = async () => {
    if (!form.item_name.trim() || !form.quantity || Number(form.quantity) <= 0 || !form.quantity_unit.trim()) {
      setError("Enter an item name, quantity, and unit.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createFoodBankInventoryItem({
        ...form,
        item_name: form.item_name.trim(),
        quantity: Number(form.quantity),
        expiry_at: form.expiry_at || null,
      });
      setForm({ item_name: "", category: "", quantity: "", quantity_unit: "portions", expiry_at: "", notes: "" });
      setUnitPreset("portions");
      setExpiryDate(null);
      setWebDate("");
      setWebTime("");
      setModalVisible(false);
      await loadInventory();
    } catch (saveError) {
      console.error("Failed to save food bank inventory item:", saveError);
      setError(saveError.response?.data?.message || "Could not save inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const setNativeExpiry = (value, type) => {
    if (type === "date") {
      setExpiryDate(value);
      setDatePickerVisible(false);
      setTimePickerVisible(true);
    } else {
      setExpiryDate(value);
      setTimePickerVisible(false);
      setForm((current) => ({ ...current, expiry_at: value.toISOString() }));
    }
  };

  const setWebExpiry = (type, value) => {
    const nextDate = type === "date" ? value : webDate;
    const nextTime = type === "time" ? value : webTime;
    if (type === "date") setWebDate(value);
    if (type === "time") setWebTime(value);
    if (nextDate && nextTime) {
      const localDate = new Date(`${nextDate}T${nextTime}`);
      if (!Number.isNaN(localDate.getTime())) {
        setForm((current) => ({ ...current, expiry_at: localDate.toISOString() }));
      }
    }
  };

  const clearExpiry = () => {
    setExpiryDate(null);
    setWebDate("");
    setWebTime("");
    setForm((current) => ({ ...current, expiry_at: "" }));
  };

  const removeItem = async (item) => {
    if (item.source_type !== "manual") return;
    try {
      await deleteFoodBankInventoryItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setSummary((current) => ({ ...current, total_items: Math.max(0, current.total_items - 1) }));
    } catch (removeError) {
      console.error("Failed to remove inventory item:", removeError);
      setError(removeError.response?.data?.message || "Could not remove inventory item.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Bank Inventory</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || "Food Bank User"}</Text>
          <TouchableOpacity onPress={logout} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Inventory Overview</Text>
          <Text style={styles.subtitle}>Claimed donations and manually added stock</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={19} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={summary.total_items} label="Total Items" icon="cube-outline" />
        <StatCard value={summary.expiring_soon} label="Expiring Soon" icon="time-outline" warning />
        <StatCard value={summary.expired} label="Outdated" icon="alert-circle-outline" danger />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color="#16a34a" /><Text style={styles.emptyText}>Loading inventory...</Text></View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={38} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No inventory items yet</Text>
          <Text style={styles.emptyText}>Claimed donations and manual items will appear here.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>STOCK ITEMS</Text>
          {items.map((item) => {
            const status = statusConfig[item.expiry_status] || statusConfig.unknown;
            return (
              <View style={styles.itemCard} key={`${item.source_type}-${item.id}`}>
                <View style={styles.itemIcon}><Ionicons name={item.source_type === "donation" ? "gift-outline" : "cube-outline"} size={22} color="#16a34a" /></View>
                <View style={styles.itemCopy}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{item.item_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.quantity}>{item.quantity} {item.quantity_unit || "items"} {item.category ? `• ${item.category}` : ""}</Text>
                  <Text style={styles.expiry}>Expires: {formatExpiry(item.expiry_at || item.expiry_window)}</Text>
                  <Text style={styles.source}>{item.source_type === "donation" ? "Claimed donation" : "Manually added"}</Text>
                </View>
                {item.source_type === "manual" && (
                  <TouchableOpacity onPress={() => removeItem(item)} accessibilityLabel={`Remove ${item.item_name}`}>
                    <Ionicons name="trash-outline" size={19} color="#b91c1c" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Inventory Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#475569" /></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Item name *" value={form.item_name} onChangeText={(value) => setForm({ ...form, item_name: value })} />
            <TextInput style={styles.input} placeholder="Category (food, supplies, other)" value={form.category} onChangeText={(value) => setForm({ ...form, category: value })} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, styles.quantityInput]} placeholder="Quantity *" keyboardType="decimal-pad" value={form.quantity} onChangeText={(value) => setForm({ ...form, quantity: value })} />
              <TouchableOpacity style={[styles.input, styles.unitSelect]} onPress={() => setUnitModalVisible(true)}>
                <Text style={form.quantity_unit ? styles.selectText : styles.placeholderText}>{form.quantity_unit || "Select unit"}</Text>
                <Ionicons name="chevron-down" size={17} color="#64748b" />
              </TouchableOpacity>
            </View>
            {unitPreset === "other" && (
              <TextInput style={styles.input} placeholder="Type another unit *" value={form.quantity_unit} onChangeText={(value) => setForm({ ...form, quantity_unit: value })} />
            )}
            <Text style={styles.fieldLabel}>Expiry date and time (optional)</Text>
            {Platform.OS === "web" ? (
              <WebDateTimeInputs
                date={webDate}
                time={webTime}
                onDateChange={(value) => setWebExpiry("date", value)}
                onTimeChange={(value) => setWebExpiry("time", value)}
              />
            ) : (
              <View style={styles.inputRow}>
                <TouchableOpacity style={[styles.input, styles.pickerButton]} onPress={() => setDatePickerVisible(true)}>
                  <Ionicons name="calendar-outline" size={17} color="#16a34a" />
                  <Text style={styles.selectText}>{expiryDate ? expiryDate.toLocaleDateString() : "Select date"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.input, styles.pickerButton]} onPress={() => setTimePickerVisible(true)}>
                  <Ionicons name="time-outline" size={17} color="#16a34a" />
                  <Text style={styles.selectText}>{expiryDate ? expiryDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Select time"}</Text>
                </TouchableOpacity>
              </View>
            )}
            {(form.expiry_at || expiryDate || webDate || webTime) && (
              <TouchableOpacity onPress={clearExpiry}><Text style={styles.clearExpiry}>Clear expiry date/time</Text></TouchableOpacity>
            )}
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Additional notes" multiline value={form.notes} onChangeText={(value) => setForm({ ...form, notes: value })} />
            <TouchableOpacity style={styles.saveButton} disabled={saving} onPress={saveItem}>
              {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Save Inventory Item</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={unitModalVisible} transparent animationType="fade" onRequestClose={() => setUnitModalVisible(false)}>
        <TouchableOpacity style={styles.unitBackdrop} activeOpacity={1} onPress={() => setUnitModalVisible(false)}>
          <View style={styles.unitMenu}>
            <Text style={styles.unitMenuTitle}>Select unit</Text>
            {[...UNIT_OPTIONS, "other"].map((unit) => (
              <TouchableOpacity key={unit} style={styles.unitOption} onPress={() => {
                setUnitPreset(unit);
                setForm((current) => ({ ...current, quantity_unit: unit === "other" ? "" : unit }));
                setUnitModalVisible(false);
              }}>
                <Text style={styles.unitOptionText}>{unit === "other" ? "Other (type your own)" : unit}</Text>
                {unitPreset === unit && <Ionicons name="checkmark" size={18} color="#16a34a" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {Platform.OS !== "web" && datePickerVisible && (
        <DateTimePicker
          value={expiryDate || new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, value) => {
            if (event.type !== "dismissed" && value) setNativeExpiry(value, "date");
            else setDatePickerVisible(false);
          }}
        />
      )}
      {Platform.OS !== "web" && timePickerVisible && (
        <DateTimePicker
          value={expiryDate || new Date()}
          mode="time"
          onChange={(event, value) => {
            if (event.type !== "dismissed" && value) setNativeExpiry(value, "time");
            else setTimePickerVisible(false);
          }}
        />
      )}
    </ScrollView>
  );
}

function StatCard({ value, label, icon, warning, danger }) {
  const color = danger ? "#b91c1c" : warning ? "#b45309" : "#16a34a";
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={19} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 35 },
  header: { height: 55, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#172033" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  userName: { maxWidth: 110, fontSize: 12, fontWeight: "700", color: "#334155" },
  titleRow: { marginTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 19, fontWeight: "800", color: "#172033" },
  subtitle: { marginTop: 4, fontSize: 11, color: "#64748b" },
  addButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10, backgroundColor: "#16a34a" },
  addButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 9, marginTop: 20 },
  statCard: { flex: 1, minHeight: 92, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" },
  statValue: { marginTop: 4, fontSize: 20, fontWeight: "800", color: "#172033" },
  statLabel: { marginTop: 2, fontSize: 10, color: "#64748b", textAlign: "center" },
  sectionLabel: { marginTop: 25, marginBottom: 10, fontSize: 12, fontWeight: "800", letterSpacing: 0.7, color: "#475569" },
  itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 10, padding: 13, borderRadius: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" },
  itemIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#dcfce7" },
  itemCopy: { flex: 1 },
  itemTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  itemName: { flex: 1, fontSize: 14, fontWeight: "800", color: "#172033" },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: "800" },
  quantity: { marginTop: 5, fontSize: 12, fontWeight: "700", color: "#334155" },
  expiry: { marginTop: 5, fontSize: 11, color: "#475569" },
  source: { marginTop: 4, fontSize: 10, color: "#94a3b8" },
  loading: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyCard: { alignItems: "center", paddingVertical: 45 },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: "800", color: "#334155" },
  emptyText: { marginTop: 5, fontSize: 12, color: "#64748b", textAlign: "center" },
  errorText: { marginTop: 12, padding: 10, borderRadius: 8, color: "#b91c1c", backgroundColor: "#fee2e2", fontSize: 12 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  modalCard: { padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: "#ffffff" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#172033" },
  input: { minHeight: 44, marginTop: 10, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: "#cbd5e1", color: "#172033", backgroundColor: "#ffffff" },
  inputRow: { flexDirection: "row", gap: 8 },
  quantityInput: { flex: 1 },
  unitInput: { flex: 1 },
  unitSelect: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { fontSize: 13, color: "#172033" },
  placeholderText: { fontSize: 13, color: "#94a3b8" },
  fieldLabel: { marginTop: 13, fontSize: 12, fontWeight: "700", color: "#475569" },
  pickerButton: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
  webPicker: { flex: 1, minHeight: 44, marginTop: 10, paddingHorizontal: 10, borderRadius: 9, border: "1px solid #cbd5e1", color: "#172033", backgroundColor: "#ffffff", fontSize: 13 },
  clearExpiry: { marginTop: 7, color: "#b91c1c", fontSize: 11, fontWeight: "700" },
  unitBackdrop: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "rgba(15,23,42,0.45)" },
  unitMenu: { padding: 16, borderRadius: 16, backgroundColor: "#ffffff" },
  unitMenuTitle: { marginBottom: 8, fontSize: 16, fontWeight: "800", color: "#172033" },
  unitOption: { minHeight: 45, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  unitOptionText: { fontSize: 14, color: "#334155", textTransform: "capitalize" },
  notesInput: { minHeight: 70, textAlignVertical: "top", paddingTop: 11 },
  saveButton: { minHeight: 46, marginTop: 16, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#16a34a" },
  saveButtonText: { color: "#ffffff", fontWeight: "800" },
});

function WebDateTimeInputs({ date, time, onDateChange, onTimeChange }) {
  if (Platform.OS !== "web") return null;
  const inputStyle = {
    flex: 1,
    minHeight: 44,
    marginTop: 10,
    padding: "0 10px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    color: "#172033",
    backgroundColor: "#ffffff",
    fontSize: 13,
    boxSizing: "border-box",
  };
  return React.createElement(
    "div",
    { style: { display: "flex", gap: 8, width: "100%" } },
    React.createElement("input", {
      type: "date",
      value: date,
      onChange: (event) => onDateChange(event.target.value),
      style: inputStyle,
    }),
    React.createElement("input", {
      type: "time",
      value: time,
      onChange: (event) => onTimeChange(event.target.value),
      style: inputStyle,
    })
  );
}
