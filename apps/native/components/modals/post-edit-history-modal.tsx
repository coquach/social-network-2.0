import React from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { usePostEditHistory } from '@repo/shared';

export interface EditHistoryDTO {
  id: string;
  oldContent: string;
  editAt: Date | string;
}

export function PostEditHistoryModal({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId?: string;
}) {
  const enabled = open && !!postId;

  const {
    data: histories = [],
    isLoading,
    isFetching,
    isError,
  } = usePostEditHistory(enabled ? postId! : '');

  const sorted = React.useMemo(() => {
    return (histories ?? [])
      .slice()
      .sort(
        (a, b) => new Date(b.editAt).getTime() - new Date(a.editAt).getTime(),
      );
  }, [histories]);

  const loading = isLoading || isFetching;

  return (
    <BottomSheet isOpen={open} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/40" />

        <BottomSheet.Content
          enableDynamicSizing
          backgroundClassName="rounded-t-[24px] bg-app-bg"
          contentContainerClassName="pb-6 pt-2"
          handleIndicatorClassName="w-10 bg-slate-400"
        >
          {/* ─── HEADER ───────────────────── */}
          <View className="flex-row items-center gap-3 px-4 pb-3 border-b border-app-border">
            <View className="h-10 w-10 rounded-2xl bg-sky-50 items-center justify-center">
              <Ionicons name="time-outline" size={20} color="#0284c7" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold text-app-fg">
                Lịch sử chỉnh sửa
              </Text>

              <Text className="text-sm text-app-muted-fg mt-0.5">
                {loading
                  ? 'Đang tải...'
                  : sorted.length > 0
                    ? `Có ${sorted.length} lần chỉnh sửa`
                    : 'Chưa có chỉnh sửa nào'}
              </Text>
            </View>
          </View>

          {/* ─── BODY ───────────────────── */}
          <ScrollView className="max-h-[70vh] px-4 py-4">
            {!postId ? (
              <Empty text="Không có postId để tải lịch sử." />
            ) : isError ? (
              <Empty text="Không tải được lịch sử chỉnh sửa" />
            ) : loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator />
              </View>
            ) : sorted.length === 0 ? (
              <Empty text="Chưa có lịch sử chỉnh sửa" />
            ) : (
              <View className="gap-5">
                {sorted.map((h, i) => {
                  const d = new Date(h.editAt);
                  const valid = !Number.isNaN(d.getTime());

                  const abs = valid ? format(d, 'dd/MM/yyyy HH:mm') : '';

                  const isLatest = i === 0;

                  return (
                    <View key={h.id} className="flex-row gap-4">
                      {/* timeline */}
                      <View className="items-center">
                        <View
                          className={`h-4 w-4 rounded-full border ${
                            isLatest
                              ? 'bg-sky-500 border-sky-300 scale-110'
                              : 'bg-white border-sky-300'
                          }`}
                        />
                        {i !== sorted.length - 1 && (
                          <View className="w-[2px] flex-1 bg-sky-200 mt-1" />
                        )}
                      </View>

                      {/* content */}
                      <View
                        className={`flex-1 rounded-2xl border px-4 py-3 shadow-sm ${
                          isLatest
                            ? 'bg-sky-50 border-sky-200'
                            : 'bg-app-bg border-app-border'
                        }`}
                      >
                        {/* header */}
                        <View className="flex-row items-start justify-between gap-2">
                          <View className="flex-row items-center gap-2 flex-wrap">
                            <Text
                              className={`text-xs px-2 py-1 rounded-full ${
                                isLatest
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              Phiên bản #{sorted.length - i}
                            </Text>

                            {isLatest && (
                              <Text className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white">
                                Mới nhất
                              </Text>
                            )}
                          </View>

                          {abs ? (
                            <Text className="text-[11px] text-app-muted-fg">
                              {abs}
                            </Text>
                          ) : null}
                        </View>

                        {/* content */}
                        <Text className="mt-3 text-[14px] leading-6 text-app-fg">
                          {h.oldContent?.trim()
                            ? h.oldContent
                            : '(Không có nội dung)'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

// ─── Empty State ─────────────────────────

function Empty({ text }: { text: string }) {
  return (
    <View className="items-center py-10">
      <Ionicons name="document-text-outline" size={30} color="#94a3b8" />
      <Text className="mt-3 text-sm text-app-muted-fg text-center">{text}</Text>
    </View>
  );
}
