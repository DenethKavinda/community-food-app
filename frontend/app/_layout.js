import React from "react";
import { Stack } from "expo-router";
import { LogBox, Platform } from "react-native";
import { AuthProvider } from "../context/AuthContext";

// Suppress React Native Web development warnings in the browser console
if (Platform.OS === "web") {
  LogBox.ignoreLogs([
    "props.pointerEvents is deprecated",
    "Animated: `useNativeDriver` is not supported",
  ]);
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(donor)" />
        <Stack.Screen name="(bank)" />
        <Stack.Screen name="(driver)" />
        <Stack.Screen name="(recipient)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </AuthProvider>
  );
}
