import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import API from "../../services/api";

const deliveries = [
  {
    title: "Rice & Curry",
    portions: "10 portions",
    date: "2024-09-14",
    from: "ABC Restaurant",
    to: "Community Center",
    time: "11:30 AM",
    location: "Colombo 03",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
  },
  {
    title: "Sandwiches",
    portions: "20 portions",
    date: "2024-09-13",
    from: "City Bakery",
    to: "Hope Welfare",
    time: "01:30 PM",
    location: "Wellawatte",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300",
  },
  {
    title: "Fruits (Mixed)",
    portions: "35 portions",
    date: "2024-09-12",
    from: "Grand Hotel",
    to: "Nugegoda Shelter",
    time: "02:30 PM",
    location: "Nugegoda",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300",
  },
  {
    title: "Bread Packs",
    portions: "50 portions",
    date: "2024-09-10",
    from: "Home Kitchen",
    to: "Elder Home",
    time: "10:15 AM",
    location: "Boralesgamuwa",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
  },
  {
    title: "Cooked Meals",
    portions: "30 portions",
    date: "2024-09-08",
    from: "Grand Hotel",
    to: "Street Relief",
    time: "04:00 PM",
    location: "Fort",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=300",
  },
];

export default function DeliveryHistory() {
  const router = useRouter();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      const response = await API.get("/driver/history");

      if (response.data?.success) {
        const history = Array.isArray(response.data.deliveries)
          ? response.data.deliveries
          : [];

        const formattedDeliveries = history.map((item) => {
          const completedDate = item.completed_at
            ? new Date(item.completed_at)
            : null;

          return {
            title: item.title || "Food Delivery",

            status: item.status || "Completed",

            portions:
              item.quantity != null
                ? `${item.quantity} ${
                    item.quantity_unit || "portions"
                  }`
                : "Quantity unavailable",

            date: completedDate
              ? completedDate.toISOString().split("T")[0]
              : "-",

            from:
              item.pickup_address ||
              "Pickup address unavailable",

            to:
              item.destination_address ||
              "Destination unavailable",

            time: completedDate
              ? completedDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",

            location:
              item.destination_address ||
              "Location unavailable",

            image:
              item.image_url ||
              "https://images.unsplash.com/photo-1547592180-85f173990554?w=300",
          };
        });

        setDeliveries(formattedDeliveries);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error(
        "Get driver history error:",
        error?.response?.data || error.message
      );

      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };


  const getFilteredDeliveries = () => {
  if (activeFilter === "All") {
    return deliveries;
  }

  if (activeFilter === "Completed") {
    return deliveries.filter(
      (delivery) => delivery.status === "Completed"
    );
  }

  if (activeFilter === "This Month") {
    const now = new Date();

    return deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.date);

      return (
        deliveryDate.getMonth() === now.getMonth() &&
        deliveryDate.getFullYear() === now.getFullYear()
      );
    });
  }

  return deliveries;
};

const filteredDeliveries = getFilteredDeliveries();

  

  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#374151"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Delivery History
        </Text>

        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons
            name="calendar-outline"
            size={21}
            color="#374151"
          />
        </TouchableOpacity>

      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= FILTERS ================= */}

        <View style={styles.filtersRow}>

          <TouchableOpacity
            style={
              activeFilter === "All"
                ? styles.activeFilter
                : styles.filter
            }
            onPress={() => setActiveFilter("All")}
          >
            <Text
              style={
                activeFilter === "All"
                  ? styles.activeFilterText
                  : styles.filterText
              }
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              activeFilter === "Completed"
                ? styles.activeFilter
                : styles.filter
            }
            onPress={() => setActiveFilter("Completed")}
          >
            <Text
              style={
                activeFilter === "Completed"
                  ? styles.activeFilterText
                  : styles.filterText
              }
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              activeFilter === "This Month"
                ? styles.activeFilter
                : styles.filter
            }
            onPress={() => setActiveFilter("This Month")}
          >
            <Text
              style={
                activeFilter === "This Month"
                  ? styles.activeFilterText
                  : styles.filterText
              }
            >
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons
              name="options-outline"
              size={17}
              color="#6B7280"
            />
          </TouchableOpacity>

        </View>

        {/* ================= STATISTICS ================= */}

        <View style={styles.statsCard}>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {deliveries.length}
            </Text>

            <Text style={styles.statLabel}>
              DELIVERIES
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumberGreen}>
              142 km
            </Text>

            <Text style={styles.statLabel}>
              DISTANCE
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              36h
            </Text>

            <Text style={styles.statLabel}>
              HOURS ACTIVE
            </Text>
          </View>

        </View>

        {/* ================= MONTH HEADER ================= */}

        <View style={styles.monthHeader}>

          <Text style={styles.monthTitle}>
            {deliveries.length > 0
              ? new Date(deliveries[0].date)
                  .toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                  .toUpperCase()
              : "DELIVERY HISTORY"}
          </Text>

          <Text style={styles.taskCount}>
            {deliveries.length} Completed Tasks
          </Text>

        </View>

        {/* ================= DELIVERY LIST ================= */}

        <View style={styles.deliveryList}>
          {loading ? (
            <Text style={styles.emptyText}>
              Loading delivery history...
            </Text>
          ) : deliveries.length === 0 ? (
            <Text style={styles.emptyText}>
              No completed deliveries found.
            </Text>
          ) : (
            filteredDeliveries.map((delivery, index) => (
              <DeliveryCard
                key={`${delivery.date}-${index}`}
                delivery={delivery}
              />
            ))
          )}
        </View>

      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(driver)")}
        >
          <Ionicons
            name="home-outline"
            size={23}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(driver)/map")}
        >
          <Ionicons
            name="map-outline"
            size={23}
            color="#9CA3AF"
          />

          <Text style={styles.navText}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Ionicons
            name="time-outline"
            size={23}
            color="#16A34A"
          />

          <Text
            style={[
              styles.navText,
              styles.activeNavText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

/* =====================================================
   DELIVERY CARD
===================================================== */

function DeliveryCard({ delivery }) {
  return (
    <TouchableOpacity
      style={styles.deliveryCard}
      activeOpacity={0.85}
    >

      {/* IMAGE */}

      <Image
        source={{ uri: delivery.image }}
        style={styles.foodImage}
      />

      {/* MAIN INFO */}

      <View style={styles.deliveryInfo}>

        <View style={styles.deliveryTitleRow}>

          <View style={styles.titleContainer}>
            <Text style={styles.deliveryTitle}>
              {delivery.title}
            </Text>

            <Text style={styles.deliverySubTitle}>
              {delivery.portions} • {delivery.date}
            </Text>
          </View>

          <View style={styles.deliveredBadge}>
            <Text style={styles.deliveredText}>
              Delivered
            </Text>
          </View>

        </View>

        {/* FROM */}

        <View style={styles.routeRow}>

          <View
            style={[
              styles.routeDot,
              styles.fromDot,
            ]}
          />

          <Text style={styles.routeLabel}>
            From:
          </Text>

          <Text
            style={styles.routeText}
            numberOfLines={1}
          >
            {delivery.from}
          </Text>

        </View>

        {/* TO */}

        <View style={styles.routeRow}>

          <View
            style={[
              styles.routeDot,
              styles.toDot,
            ]}
          />

          <Text style={styles.routeLabel}>
            To:
          </Text>

          <Text
            style={styles.routeText}
            numberOfLines={1}
          >
            {delivery.to}
          </Text>

        </View>

        {/* TIME / LOCATION */}

        <View style={styles.bottomInfoRow}>

          <View style={styles.timeRow}>

            <Ionicons
              name="time-outline"
              size={12}
              color="#9CA3AF"
            />

            <Text style={styles.timeText}>
              {delivery.time}
            </Text>

          </View>

          <Text style={styles.locationText}>
            {delivery.location}
          </Text>

        </View>

      </View>

    </TouchableOpacity>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },

  /* ================= HEADER ================= */

  header: {
    height: 92,
    paddingTop: 38,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= FILTERS ================= */

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },

  activeFilter: {
    backgroundColor: "#16A34A",
    borderRadius: 35,
    paddingHorizontal: 35,
    paddingVertical: 10,
  },

  activeFilterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  filter: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 17,
    paddingVertical: 10,
  },

  filterText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },

  filterIconButton: {
    width: 40,
    height: 35,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= STATS ================= */

  statsCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2937",
  },

  statNumberGreen: {
    fontSize: 17,
    fontWeight: "800",
    color: "#16A34A",
  },

  statLabel: {
    fontSize: 7,
    fontWeight: "700",
    color: "#9CA3AF",
    marginTop: 3,
    letterSpacing: 0.3,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },

  /* ================= MONTH ================= */

  monthHeader: {
    marginTop: 17,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  monthTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.6,
  },

  taskCount: {
    fontSize: 9,
    color: "#9CA3AF",
  },

  /* ================= DELIVERY LIST ================= */

  deliveryList: {
    gap: 9,
  },

  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    minHeight: 155,
  },

  foodImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 15,
  },

  deliveryInfo: {
    flex: 1,
  },

  deliveryTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    paddingRight: 5,
  },

  deliveryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },

  deliverySubTitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 10,
  },

  deliveredBadge: {
    backgroundColor: "#DDF7E7",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  deliveredText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700",
  },

  /* ================= ROUTE ================= */

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  routeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  fromDot: {
    backgroundColor: "#16A34A",
  },

  toDot: {
    backgroundColor: "#EF4444",
  },

  routeLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 6,
  },

  routeText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
  },

  /* ================= BOTTOM INFO ================= */

  bottomInfoRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },

  locationText: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    height: 75,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },

  navText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },

  activeNavText: {
    color: "#16A34A",
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    paddingVertical: 30,
  },

});