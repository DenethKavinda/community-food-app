import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Parses expiry window string and created_at into an absolute Date object
 * using existing backend calculation rules.
 */
export function getExpiryDate(expiryWindowStr, createdAtStr) {
  if (!expiryWindowStr || typeof expiryWindowStr !== "string") return null;
  const str = expiryWindowStr.trim();
  const now = new Date();

  let baseDate = now;
  if (createdAtStr) {
    const parsedBase = createdAtStr instanceof Date ? createdAtStr : new Date(createdAtStr);
    if (!isNaN(parsedBase.getTime())) {
      baseDate = parsedBase;
    }
  }

  let targetDate = new Date(baseDate);

  const lower = str.toLowerCase();
  if (lower.startsWith("today")) {
    targetDate = new Date(baseDate);
  } else if (lower.startsWith("yesterday")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (lower.startsWith("tomorrow")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lower.startsWith("in 2 days")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + 2);
  } else {
    // Custom calendar date e.g. "Oct 10, 09:00 PM"
    const datePart = str.split(",")[0].trim();
    const withYear = `${datePart} ${baseDate.getFullYear()}`;
    const parsed = new Date(withYear);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    } else {
      const fullParsed = new Date(str);
      if (!isNaN(fullParsed.getTime())) {
        targetDate = fullParsed;
      } else {
        return null;
      }
    }
  }

  // Extract time portion e.g. "05:00 PM" or "17:00"
  const timeMatch = str.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    // End of day fallback
    targetDate.setHours(23, 59, 59, 999);
  }

  return targetDate;
}

/**
 * Calculates remaining seconds until targetDate from now.
 */
function getRemainingSeconds(targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.floor(diffMs / 1000);
}

/**
 * Formats seconds into human readable countdown string
 */
function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return "Expired";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * Determines color indicator category based on remaining seconds:
 * - Green: > 2 hours (7200 seconds)
 * - Orange: 30 minutes to 2 hours (1800 to 7200 seconds)
 * - Red: < 30 minutes (> 0 and < 1800 seconds)
 * - Expired: <= 0 seconds
 */
function getIndicatorTheme(remainingSeconds) {
  if (remainingSeconds <= 0) {
    return {
      bg: "#F3F4F6",
      border: "#E5E7EB",
      text: "#6B7280",
      iconName: "alert-circle-outline",
      label: "Expired",
    };
  }

  // Less than 30 minutes (1800 seconds)
  if (remainingSeconds < 1800) {
    return {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "#DC2626",
      iconName: "flame-outline",
      label: "Urgent",
    };
  }

  // 30 minutes to 2 hours (1800 to 7200 seconds)
  if (remainingSeconds <= 7200) {
    return {
      bg: "#FFFBEB",
      border: "#FDE68A",
      text: "#D97706",
      iconName: "time-outline",
      label: "Expiring Soon",
    };
  }

  // More than 2 hours
  return {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#087A3D",
    iconName: "timer-outline",
    label: "Fresh",
  };
}

/**
 * Smart Expiry Countdown Component (Donor Module ONLY)
 *
 * Props:
 * - expiryWindow: string (e.g. "Today, 05:00 PM")
 * - createdAt: string | Date (timestamp from database)
 * - status: string ("Pending", "Active", "Expired", etc.)
 * - compact: boolean (optional, true for tight spaces)
 * - style: object (optional custom container style)
 */
export default function ExpiryCountdown({
  expiryWindow,
  createdAt,
  status = "Pending",
  compact = false,
  style,
}) {
  // Rule 4: Show countdown only for eligible donations (Pending and Active).
  // For Expired donations, display Expired indicator.
  // For Completed, Picked Up, or Cancelled, do not display active countdown.
  const isTerminalResolved = ["Completed", "Picked Up", "Cancelled"].includes(status);
  const isAlreadyExpired = status === "Expired";
  const isEligible = ["Pending", "Active"].includes(status);

  if (isTerminalResolved) {
    return null;
  }

  const targetDate = useMemo(() => {
    return getExpiryDate(expiryWindow, createdAt);
  }, [expiryWindow, createdAt]);

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (isAlreadyExpired) return 0;
    return getRemainingSeconds(targetDate);
  });

  useEffect(() => {
    if (!isEligible || !targetDate) {
      if (isAlreadyExpired) setRemainingSeconds(0);
      return;
    }

    // Initial sync
    setRemainingSeconds(getRemainingSeconds(targetDate));

    // Update countdown every second
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds(targetDate);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEligible, isAlreadyExpired, targetDate]);

  const theme = getIndicatorTheme(remainingSeconds);
  const formattedTime = formatCountdown(remainingSeconds);

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        compact && styles.compactBadge,
        style,
      ]}
    >
      <Ionicons
        name={theme.iconName}
        size={compact ? 11 : 12}
        color={theme.text}
        style={styles.icon}
      />
      <Text
        style={[
          styles.countdownText,
          { color: theme.text },
          compact && styles.compactText,
        ]}
        numberOfLines={1}
      >
        {remainingSeconds <= 0 ? "Expired" : formattedTime}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  compactBadge: {
    paddingHorizontal: 7.5,
    paddingVertical: 2.5,
    borderRadius: 20,
  },
  icon: {
    marginRight: 4,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  compactText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
});
