import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Only declare static top-level routes */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}
