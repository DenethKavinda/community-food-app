import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { fetchAvailableFoods } from "../../services/recipientService";

// ── Food data is fetched from the backend API ─────────────────────────────────
// (DUMMY_FOOD removed – data will come from /api/recipient/foods)

// ── Icons (pure SVG-free, emoji-free approach using Text characters) ───────────
const SearchIcon = () => (
  <Text style={styles.inputIcon}>🔍</Text>
);

const FilterIcon = () => (
  <Text style={styles.filterIconText}>⫸</Text>
);

const LocationIcon = () => (
  <Text style={styles.metaIcon}>📍</Text>
);

const ClockIcon = () => (
  <Text style={styles.metaIcon}>🕐</Text>
);

const HomeIcon = ({ active }) => (
  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>🏠</Text>
);

const HeartIcon = () => (
  <Text style={styles.tabIcon}>🤍</Text>
);

const MenuIcon = () => (
  <Text style={styles.headerIcon}>☰</Text>
);

const PersonIcon = () => (
  <Text style={styles.headerIcon}>👤</Text>
);

const LogoutIcon = () => (
  <Text style={styles.headerIcon}>↩</Text>
);

const CATEGORIES = ["All", "Prepared Food", "Fruits", "Bakery"];

// ── Placeholder food card image ───────────────────────────────────────────────
const FoodPlaceholder = ({ color, name }) => (
  <View style={[styles.foodImagePlaceholder, { backgroundColor: color }]}>
    <Text style={styles.foodImageEmoji}>
      {name.includes("Rice") ? "🍛" : name.includes("Bread") ? "🍞" : "🥗"}
    </Text>
  </View>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RecipientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAvailableFoods()
      .then((data) => setFoods(data.donations || []))
      .catch((err) => console.error("Failed to fetch foods:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredFood = foods.filter((item) => {
    const matchesSearch =
      (item.meal_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.donor_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "All";

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn}>
          <MenuIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Recipient Dashboard</Text>

        <View style={styles.headerRight}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name ?? "Recipient"}
          </Text>
          <TouchableOpacity style={styles.headerIconBtn}>
            <PersonIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={logout}>
            <LogoutIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Welcome ── */}
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeInner}>
          <Text style={styles.welcomeGreeting}>👋  Welcome back,</Text>
          <Text style={styles.welcomeName}>{user?.name ?? "User"}</Text>
          <Text style={styles.welcomeSub}>Find and claim available food donations near you.</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Search & Filter ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food..."
              placeholderTextColor="#aaaaaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>⊞</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section title ── */}
        <Text style={styles.sectionTitle}>Available Food</Text>

        {/* ── Category Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Food Cards ── */}
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading available food...</Text>
          </View>
        ) : filteredFood.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No food listings found.</Text>
          </View>
        ) : (
          filteredFood.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onView={() => {
                console.log("VIEW BUTTON CLICKED");
                router.push({
                  pathname: "/(recipient)/confirm-request",
                  params: {
                    itemData: JSON.stringify(item),
                  },
                });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <HomeIcon active />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/(recipient)/my-requests")}>
          <HeartIcon />
          <Text style={styles.tabLabel}>My Requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Food Card Component ────────────────────────────────────────────────────────
function FoodCard({ item, onView }) {
  const [cardHovered, setCardHovered] = useState(false);
  const [btnHovered,  setBtnHovered]  = useState(false);

  return (
    <View
      style={[
        styles.card,
        cardHovered && styles.cardHovered,
      ]}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      <FoodPlaceholder color={"#e8f5e9"} name={item.meal_name || ""} />

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.meal_name}</Text>
        <Text style={styles.cardQuantity}>
          {item.available_portions !== undefined ? `${item.available_portions} available` : item.quantity}
        </Text>

        <View style={styles.cardMeta}>
          <LocationIcon />
          <Text style={styles.cardMetaText}>{item.location}</Text>
        </View>
        <View style={styles.cardMeta}>
          <ClockIcon />
          <Text style={styles.cardMetaText}>{item.expiry_window}</Text>
        </View>

        <Text style={styles.cardDonor}>
          Donor ID: <Text style={styles.cardDonorName}>{item.donor_id}</Text>
        </Text>
        <Text style={styles.cardLocation}>
          📍 {item.location}
        </Text>
      </View>

      {item.available_portions > 0 ? (
        <Pressable
          style={[
            styles.viewBtn,
            btnHovered && styles.viewBtnHovered,
          ]}
          onHoverIn={() => setBtnHovered(true)}
          onHoverOut={() => setBtnHovered(false)}
          onPress={onView}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>
      ) : (
        <View style={[styles.viewBtn, { backgroundColor: '#e0e0e0', borderColor: '#ccc' }]}>
          <Text style={[styles.viewBtnText, { color: '#888' }]}>Out of Stock</Text>
        </View>
      )}
    </View>
  );
}


// ── Styles ─────────────────────────────────────────────────────────────────────
const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const QUANTITY_GREEN = "#388e3c";
const BORDER = "#e8e8e8";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userName: {
    maxWidth: 105,
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 20,
    color: TEXT_PRIMARY,
  },

  // ── Welcome ──
  welcomeRow: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#c8e6c9",
  },
  welcomeInner: {
    gap: 3,
  },
  welcomeGreeting: {
    fontSize: 13,
    color: "#4caf50",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 0.3,
  },
  welcomeSub: {
    fontSize: 12,
    color: "#5a7a5a",
    marginTop: 2,
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // ── Search ──
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    height: 44,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 6,
    color: "#aaaaaa",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnText: {
    fontSize: 18,
    color: TEXT_PRIMARY,
  },
  filterIconText: {
    fontSize: 18,
    color: TEXT_PRIMARY,
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },

  // ── Categories ──
  categoryScroll: {
    marginBottom: 14,
  },
  categoryContent: {
    gap: 8,
    paddingRight: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryChipText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },

  // ── Card ──
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHovered: {
    backgroundColor: "#f0faf0",
    borderColor: "#81c784",
    shadowOpacity: 0.14,
  },
  foodImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  foodImageEmoji: {
    fontSize: 32,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 1,
  },
  cardQuantity: {
    fontSize: 13,
    fontWeight: "600",
    color: QUANTITY_GREEN,
    marginBottom: 3,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaIcon: {
    fontSize: 11,
  },
  cardMetaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  cardDonor: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  cardDonorName: {
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  cardLocation: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },

  viewBtn: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
    alignSelf: "center",
    overflow: "hidden",
  },
  viewBtnHovered: {
    backgroundColor: "#c8e6c9",
    borderWidth: 1,
    borderColor: "#66bb6a",
  },
  viewBtnText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Tab Bar ──
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
    color: TEXT_SECONDARY,
  },
  tabIconActive: {
    color: GREEN,
  },
  tabLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
  },
  tabLabelActive: {
    color: GREEN,
    fontWeight: "600",
  },
});
