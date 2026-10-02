import { Stack } from "expo-router";

export default function RecipientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirm-request" />
    </Stack>
  );
}
