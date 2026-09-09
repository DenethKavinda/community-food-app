import React, { useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function BankDashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Bank Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.name}</Text>
      <Button title="Logout" color="#d32f2f" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff3e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ef6c00",
  },
  welcome: { fontSize: 16, marginBottom: 20 },
});
