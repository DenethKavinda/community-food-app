import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FeedbackModal({
  visible,
  type = "success", // "success" | "error" | "warning" | "info"
  title,
  message,
  onClose,
  buttonText = "OK",
}) {
  if (!visible) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarning = type === "warning";

  const getIcon = () => {
    if (isSuccess) return { name: "checkmark-circle", color: "#16A34A", bg: "#DCFCE7" };
    if (isError) return { name: "alert-circle", color: "#DC2626", bg: "#FEE2E2" };
    if (isWarning) return { name: "warning", color: "#D97706", bg: "#FEF3C7" };
    return { name: "information-circle", color: "#2563EB", bg: "#DBEAFE" };
  };

  const iconConfig = getIcon();
  const defaultTitle = isSuccess
    ? "Success!"
    : isError
    ? "Error"
    : isWarning
    ? "Warning"
    : "Notice";

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Top Icon Badge */}
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
                <Ionicons name={iconConfig.name} size={48} color={iconConfig.color} />
              </View>

              {/* Title & Message */}
              <Text style={styles.titleText}>{title || defaultTitle}</Text>
              <Text style={styles.messageText}>{message}</Text>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isError ? "#DC2626" : "#087A3D" },
                ]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  messageText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
