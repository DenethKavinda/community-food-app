import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

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
