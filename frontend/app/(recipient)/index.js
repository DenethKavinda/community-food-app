import React, { useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function RecipientDashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipient Dashboard</Text>
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
    backgroundColor: "#e3f2fd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565c0",
  },
  welcome: { fontSize: 16, marginBottom: 20 },
});
