import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import BottomNavbar from "./_components/bottomNavbar";

export default function BankLayout() {
  return (
    <View style={styles.container}>
      {/* Active Screen View */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Shared Bank Bottom Navbar */}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
