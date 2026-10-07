import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import DriverTaskCard from "./DriverTaskCard";
import API from "../../services/api";

export default function DriverTasks({ onTaskPress }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await API.get("/driver/pickups");

      setTasks(response.data?.pickups || []);
    } catch (error) {
      console.error(
        "Failed to load driver tasks:",
        error?.response?.data || error.message
      );

      setTasks([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Tasks</Text>

        <Text style={styles.count}>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Text>
      </View>

      {tasks.map((task) => (
        <DriverTaskCard
          key={`${task.task_type}-${task.claim_id || task.request_id}-${task.donation_id}`}
          title={task.meal_name || "Food Delivery"}
          portions={`${task.quantity || 0} ${
            task.quantity_unit || "portions"
          }`}
          location={
            task.destination_address ||
            task.pickup_address ||
            "Location unavailable"
          }
          time={
            task.expiry_window
              ? task.expiry_window
              : "Available now"
          }
          status="PENDING"
          onPress={() => onTaskPress?.(task)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  count: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
});