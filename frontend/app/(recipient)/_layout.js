import { Stack } from "expo-router";

export default function RecipientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirm-request" />
      <Stack.Screen name="request-status" />
      <Stack.Screen name="my-requests" />
      <Stack.Screen name="request-details" />
    </Stack>
  );
}
