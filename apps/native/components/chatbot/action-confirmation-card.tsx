import { AntDesign, Ionicons } from "@expo/vector-icons";
import type { AssistantProposeAction, ExecuteActionResultDTO } from "@repo/shared";
import { chatbotService } from "@repo/shared";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type ActionConfirmationCardProps = {
  proposals: AssistantProposeAction[];
  onExecuted?: (result: ExecuteActionResultDTO) => void;
};

type CardStatus = "idle" | "executing" | "success" | "cancelled" | "error";

type ActionState = {
  status: CardStatus;
  message?: string;
};

export function ActionConfirmationCard({
  proposals,
  onExecuted,
}: ActionConfirmationCardProps) {
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});

  if (!proposals || proposals.length === 0) return null;

  const handleConfirm = async (proposal: AssistantProposeAction) => {
    const key = proposal.payload.idempotencyKey || proposal.id;
    setActionStates((prev) => ({
      ...prev,
      [key]: { status: "executing" },
    }));

    try {
      const result = await chatbotService.executeAction({
        actionId: proposal.id,
        actionName: proposal.payload.actionName,
        params: proposal.payload.params,
        idempotencyKey: proposal.payload.idempotencyKey,
      });

      if (result.success) {
        setActionStates((prev) => ({
          ...prev,
          [key]: {
            status: "success",
            message: result.message || "Thao tác đã được thực hiện thành công.",
          },
        }));
        onExecuted?.(result);
      } else {
        setActionStates((prev) => ({
          ...prev,
          [key]: {
            status: "error",
            message: result.message || "Không thể thực hiện thao tác.",
          },
        }));
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Lỗi kết nối máy chủ.";
      setActionStates((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: errMsg,
        },
      }));
    }
  };

  const handleCancel = (proposal: AssistantProposeAction) => {
    const key = proposal.payload.idempotencyKey || proposal.id;
    setActionStates((prev) => ({
      ...prev,
      [key]: {
        status: "cancelled",
        message: "Đã hủy thao tác.",
      },
    }));
  };

  const renderIcon = (actionName: string, category?: string) => {
    switch (actionName) {
      case "send_friend_request":
        return <Ionicons name="person-add" size={18} color="#0ea5e9" />;
      case "accept_friend_request":
        return <Ionicons name="checkmark-done" size={18} color="#10b981" />;
      case "decline_friend_request":
      case "cancel_friend_request":
        return <Ionicons name="person-remove" size={18} color="#f59e0b" />;
      case "unfriend_user":
        return <Ionicons name="person-remove-outline" size={18} color="#ef4444" />;
      case "block_user":
        return <Ionicons name="ban" size={18} color="#dc2626" />;
      case "join_group":
      case "leave_group":
        return <Ionicons name="people" size={18} color="#6366f1" />;
      case "react_post":
        return <Ionicons name="heart" size={18} color="#f43f5e" />;
      case "mark_all_notifications_read":
        return <Ionicons name="notifications-outline" size={18} color="#0284c7" />;
      default:
        if (category === "social") return <Ionicons name="person-outline" size={18} color="#0ea5e9" />;
        if (category === "group") return <Ionicons name="people-outline" size={18} color="#6366f1" />;
        if (category === "content") return <Ionicons name="heart-outline" size={18} color="#f43f5e" />;
        if (category === "notification") return <Ionicons name="notifications-outline" size={18} color="#0284c7" />;
        return <Ionicons name="sparkles" size={18} color="#0ea5e9" />;
    }
  };

  return (
    <View className="mt-2.5 gap-2 pt-1 border-t border-app-border/40">
      {proposals.map((proposal) => {
        const key = proposal.payload.idempotencyKey || proposal.id;
        const current = actionStates[key] || { status: "idle" };
        const { actionName, title, description, confirmLabel, cancelLabel, category, isDestructive } = proposal.payload;

        return (
          <View
            key={key}
            className={`rounded-xl p-3 border ${
              isDestructive
                ? "bg-rose-500/[0.06] dark:bg-rose-500/[0.12] border-rose-500/30"
                : "bg-app-primary/[0.06] dark:bg-app-primary/[0.12] border-app-primary/30"
            }`}
          >
            {/* Header: Icon & Text */}
            <View className="flex-row items-start gap-2.5">
              <View className="h-9 w-9 rounded-lg bg-white dark:bg-app-surface-dark items-center justify-center border border-app-border/60">
                {renderIcon(actionName, category)}
              </View>
              <View className="flex-1">
                <Text
                  className="text-xs font-semibold text-app-fg dark:text-app-fg-dark"
                  numberOfLines={2}
                >
                  {title}
                </Text>
                {description ? (
                  <Text
                    className="text-[11px] text-app-fg/60 dark:text-app-fg-dark/60 mt-0.5"
                    numberOfLines={2}
                  >
                    {description}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Actions / Status */}
            <View className="mt-3 flex-row items-center justify-end gap-2">
              {current.status === "idle" && (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    onPress={() => handleCancel(proposal)}
                    className="rounded-lg px-3 py-1.5 border border-app-border/80"
                  >
                    <Text className="text-xs text-app-fg/70 dark:text-app-fg-dark/70">
                      {cancelLabel || "Hủy"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    onPress={() => handleConfirm(proposal)}
                    className={`rounded-lg px-3 py-1.5 flex-row items-center gap-1 ${
                      isDestructive ? "bg-rose-600" : "bg-app-primary"
                    }`}
                  >
                    <Text className="text-xs font-medium text-white">
                      {confirmLabel || "Xác nhận"}
                    </Text>
                    <AntDesign name="arrow-right" size={10} color="#ffffff" />
                  </TouchableOpacity>
                </>
              )}

              {current.status === "executing" && (
                <View className="flex-row items-center gap-1.5 py-1">
                  <ActivityIndicator size="small" color="#0ea5e9" />
                  <Text className="text-xs font-medium text-app-primary">
                    Đang thực hiện...
                  </Text>
                </View>
              )}

              {current.status === "success" && (
                <View className="flex-row items-center gap-1.5 py-1">
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {current.message || "Đã hoàn tất"}
                  </Text>
                </View>
              )}

              {current.status === "cancelled" && (
                <View className="flex-row items-center gap-1.5 py-1">
                  <Ionicons name="close-circle" size={16} color="#94a3b8" />
                  <Text className="text-xs text-app-fg/50 dark:text-app-fg-dark/50">
                    Đã hủy thao tác
                  </Text>
                </View>
              )}

              {current.status === "error" && (
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center gap-1 flex-1 mr-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text
                      className="text-xs text-rose-500 flex-1"
                      numberOfLines={1}
                    >
                      {current.message}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleConfirm(proposal)}
                    className="rounded-lg border border-rose-300 px-2 py-1"
                  >
                    <Text className="text-[11px] font-medium text-rose-500">
                      Thử lại
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
