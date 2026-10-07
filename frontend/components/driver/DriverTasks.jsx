import React from "react";
import { View, Text, StyleSheet } from "react-native";

import DriverTaskCard from "./DriverTaskCard";

const tasks = [
  {
    id: "1",
    title: "Fresh Meals Pickup",
    portions: "25",
    location: "Colombo",
    time: "10:30 AM",
    status: "PENDING",
  },
  {
    id: "2",
    title: "Restaurant Donation",
    portions: "40",
    location: "Dehiwala",
    time: "12:00 PM",
    status: "PENDING",
  },
  {
    id: "3",
    title: "Food Bank Delivery",
    portions: "30",
    location: "Nugegoda",
    time: "2:30 PM",
    status: "PENDING",
  },
];

export default function DriverTasks({ onTaskPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Tasks</Text>
        <Text style={styles.count}>{tasks.length} tasks</Text>
      </View>

      {tasks.map((task) => (
        <DriverTaskCard
          key={task.id}
          title={task.title}
          portions={task.portions}
          location={task.location}
          time={task.time}
          status={task.status}
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