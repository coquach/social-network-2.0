import { Ionicons } from "@expo/vector-icons";
import { Alert } from "heroui-native/alert";
import React from "react";
import { Pressable, View } from "react-native";

import { cn } from "~/lib/cn";

export type AppAlertVariant = "default" | "warning" | "danger" | "success";

type AppAlertProps = {
  title: string;
  description?: string;
  variant?: AppAlertVariant;
  onClose?: () => void;
  className?: string;
};

const statusMap = {
  default: "accent",
  warning: "warning",
  danger: "danger",
  success: "success",
} as const;

const closeIconColorMap: Record<AppAlertVariant, string> = {
  default: "#0ea5e9",
  warning: "#d97706",
  danger: "#e11d48",
  success: "#059669",
};

export function AppAlert({
  title,
  description,
  variant = "default",
  onClose,
  className,
}: AppAlertProps) {
  return (
    <Alert
      status={statusMap[variant]}
      className={cn("rounded-[22px] border shadow-none", className)}
    >
      <Alert.Indicator iconProps={{ size: 18 }} />
      <Alert.Content>
        <Alert.Title className="text-sm font-bold">{title}</Alert.Title>
        {description ? (
          <Alert.Description className="mt-1 text-[13px] leading-5">
            {description}
          </Alert.Description>
        ) : null}
      </Alert.Content>
      {onClose ? (
        <View className="ml-3 justify-start">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng cảnh báo"
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Ionicons
              name="close"
              size={16}
              color={closeIconColorMap[variant]}
            />
          </Pressable>
        </View>
      ) : null}
    </Alert>
  );
}
