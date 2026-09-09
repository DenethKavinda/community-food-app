import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // Load stored session on app launch
  useEffect(() => {
    loadStorageData();
  }, []);

  // Monitor auth state and redirect automatically
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      // Redirect to login if unauthenticated
      router.replace("/(auth)/login");
    } else if (token && user) {
      // Redirect to specific role dashboard if logged in
      switch (user.role) {
        case "DONOR":
          router.replace("/(donor)");
          break;
        case "RECIPIENT":
          router.replace("/(recipient)");
          break;
        case "FOOD_BANK":
          router.replace("/(bank)");
          break;
        case "DRIVER":
          router.replace("/(driver)");
          break;
        case "ADMIN":
          router.replace("/(admin)");
          break;
      }
    }
  }, [token, user, loading, segments]);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("jwt_token");
      const storedUser = await AsyncStorage.getItem("user_data");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Attach token to Axios headers globally
        API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.error("Failed to load session:", e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await API.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    await AsyncStorage.setItem("jwt_token", newToken);
    await AsyncStorage.setItem("user_data", JSON.stringify(userData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("jwt_token");
    await AsyncStorage.removeItem("user_data");
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
