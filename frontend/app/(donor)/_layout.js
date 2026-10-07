import { Stack } from "expo-router";

export default function DonorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="donate" />
      <Stack.Screen name="food-items" />
      <Stack.Screen name="history" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="guidelines" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
