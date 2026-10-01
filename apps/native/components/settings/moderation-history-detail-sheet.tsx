import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  useModerationRecordDetail,
  useCreateModerationAppeal,
  formatAbsoluteTime,
  TargetType,
  AppealStatus,
} from '@repo/shared';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Text, View, TextInput, Pressable, Keyboard, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '~/providers/theme-provider';

interface ModerationHistoryDetailSheetProps {
  moderationId: string | null;
  onClose: () => void;
}

export const ModerationHistoryDetailSheet = React.forwardRef<
  BottomSheetModal,
  ModerationHistoryDetailSheetProps
>(({ moderationId, onClose }, ref) => {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  const { data, isLoading, refetch } = useModerationRecordDetail(moderationId ?? '');
  const appealMutation = useCreateModerationAppeal();
  
  const [appealReason, setAppealReason] = useState('');

  useEffect(() => {
    if (moderationId) {
      setAppealReason('');
    }
  }, [moderationId]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const moderation = data?.moderation;
  const target = data?.target;
  const appeals = data?.appeals ?? [];
  const hasPendingAppeal = appeals.some(a => a.status === AppealStatus.PENDING);

  const handleSendAppeal = async () => {
    if (!moderationId || !appealReason.trim() || hasPendingAppeal) return;
    
    try {
      await appealMutation.mutateAsync({
        moderationId,
        reason: appealReason.trim(),
      });
      setAppealReason('');
      Keyboard.dismiss();
      refetch();
    } catch (error) {
      console.error('Failed to send appeal:', error);
    }
  };

  const snapPoints = useMemo(() => ['85%'], []);

  if (!moderationId) return null;

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#334155' : '#e2e8f0',
      }}
    >
      <BottomSheetView className="flex-1">
        <View className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Chi tiết kiểm duyệt
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#0284c7" />
          </View>
        ) : moderation ? (
          <BottomSheetScrollView
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            {/* Header Info */}
            <View className="mb-6 flex-row flex-wrap gap-2">
              <View className="rounded-full bg-sky-100 px-3 py-1 dark:bg-sky-900/40">
                <Text className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  {moderation.maxSeverity} SEVERITY
                </Text>
              </View>
              <View className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                <Text className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {Math.round(moderation.confidence * 100)}% CONFIDENCE
                </Text>
              </View>
            </View>

            <View className="mb-8 space-y-4">
              <DetailItem
                label="ID bản ghi"
                value={moderation.id}
                icon="finger-print-outline"
              />
              <DetailItem
                label="Loại nội dung"
                value={moderation.targetType === TargetType.POST ? 'Bài viết' : moderation.targetType === TargetType.COMMENT ? 'Bình luận' : 'Chia sẻ'}
                icon="layers-outline"
              />
              <DetailItem
                label="Trạng thái"
                value={moderation.finalDecision === 'APPROVED' || moderation.finalDecision === 'NO_VIOLATION' ? 'Hợp lệ' : moderation.finalDecision === 'PENDING' ? 'Đang xử lý' : 'Vi phạm'}
                icon="shield-checkmark-outline"
                status={moderation.finalDecision}
              />
              <DetailItem
                label="Thời gian"
                value={formatAbsoluteTime(moderation.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                icon="time-outline"
              />
            </View>

            <View className="mb-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Nội dung kiểm duyệt
              </Text>
              <Text className="text-[14px] leading-6 text-slate-700 dark:text-slate-300">
                {moderation.displayMessage || 'Không có dữ liệu văn bản'}
              </Text>
            </View>

            {target ? (
              <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nội dung gốc
                </Text>
                
                {target.content ? (
                  <Text className="text-[14px] leading-6 text-slate-700 dark:text-slate-300 mb-3">
                    {target.content}
                  </Text>
                ) : (
                  <Text className="text-[14px] italic leading-6 text-slate-400 mb-3">
                    Không có văn bản
                  </Text>
                )}
                
                {'images' in target && Array.isArray(target.images) && target.images.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {target.images.map((img: any, idx: number) => (
                      <Image
                        key={idx}
                        source={{ uri: typeof img === 'string' ? img : img.url || img.secure_url }}
                        style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}
                
                {'media' in target && Array.isArray(target.media) && target.media.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {target.media.map((img: any, idx: number) => (
                      <Image
                        key={idx}
                        source={{ uri: typeof img === 'string' ? img : img.url || img.secure_url }}
                        style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : moderation.targetPreview ? (
              <View className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Preview nội dung gốc
                </Text>
                {moderation.targetPreview.content && (
                  <Text className="text-[14px] leading-6 text-slate-600 dark:text-slate-400 mb-3">
                    {moderation.targetPreview.content}
                  </Text>
                )}
                {moderation.targetPreview.imageUrl && (
                  <Image 
                    source={{ uri: moderation.targetPreview.imageUrl }} 
                    style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }} 
                    resizeMode="cover" 
                  />
                )}
              </View>
            ) : null}

            {moderation.violations && moderation.violations.length > 0 && (
              <View className="mb-8">
                <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Danh mục vi phạm ({moderation.violations.length})
                </Text>
                {moderation.violations.map((v, i) => (
                  <View 
                    key={i} 
                    className="mb-3 rounded-2xl border border-rose-100 bg-rose-50/30 p-4 dark:border-rose-900/30 dark:bg-rose-950/20"
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      <Ionicons name="alert-circle" size={16} color="#e11d48" />
                      <Text className="text-[14px] font-bold text-rose-700 dark:text-rose-400">
                        {v.category}
                      </Text>
                    </View>
                    <Text className="text-[13px] text-rose-600/80 dark:text-rose-300/70">
                      {v.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Appeal Section */}
            <View className="mb-8 rounded-3xl border border-sky-100 bg-sky-50/30 p-5 dark:border-sky-900/30 dark:bg-sky-950/10">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-sky-900 dark:text-sky-100">
                  Gửi kháng cáo
                </Text>
                {hasPendingAppeal && (
                  <View className="rounded-full bg-amber-100 px-2 py-0.5 dark:bg-amber-900/40">
                    <Text className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      CHỜ XỬ LÝ
                    </Text>
                  </View>
                )}
              </View>

              {hasPendingAppeal ? (
                <Text className="text-[13px] leading-5 text-slate-500 dark:text-slate-400">
                  Bản ghi này đã có kháng cáo đang chờ xử lý. Bạn không thể gửi thêm kháng cáo cho đến khi có kết quả.
                </Text>
              ) : (
                <>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    value={appealReason}
                    onChangeText={setAppealReason}
                    placeholder="Nhập lý do kháng cáo của bạn..."
                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                    textAlignVertical="top"
                    className="mb-4 min-h-[100px] rounded-2xl border border-sky-200 bg-white p-4 text-[14px] text-slate-900 dark:border-sky-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <Pressable
                    onPress={handleSendAppeal}
                    disabled={!appealReason.trim() || appealMutation.isPending}
                    className={`h-12 items-center justify-center rounded-2xl ${
                      !appealReason.trim() || appealMutation.isPending
                        ? 'bg-slate-200 dark:bg-slate-800'
                        : 'bg-sky-600 dark:bg-sky-500'
                    }`}
                  >
                    {appealMutation.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-base font-bold text-white">Gửi kháng cáo</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>

            {/* Appeal History */}
            {appeals.length > 0 && (
              <View>
                <Text className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">
                  Lịch sử kháng nghị
                </Text>
                <View className="space-y-4">
                  {appeals.map((appeal) => (
                    <View 
                      key={appeal.id} 
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className={`rounded-full px-2 py-0.5 ${
                          appeal.status === AppealStatus.APPROVED ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                          appeal.status === AppealStatus.REJECTED ? 'bg-rose-100 dark:bg-rose-900/40' :
                          'bg-amber-100 dark:bg-amber-900/40'
                        }`}>
                          <Text className={`text-[10px] font-bold ${
                            appeal.status === AppealStatus.APPROVED ? 'text-emerald-700 dark:text-emerald-400' :
                            appeal.status === AppealStatus.REJECTED ? 'text-rose-700 dark:text-rose-400' :
                            'text-amber-700 dark:text-amber-400'
                          }`}>
                            {appeal.status}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-slate-400">
                          {formatAbsoluteTime(appeal.createdAt, 'dd/MM/yyyy')}
                        </Text>
                      </View>
                      <Text className="text-[13px] text-slate-700 dark:text-slate-300">
                        {appeal.reason}
                      </Text>
                      {appeal.reviewNote && (
                        <View className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                            Phản hồi từ hệ thống
                          </Text>
                          <Text className="text-[13px] text-slate-500 italic dark:text-slate-400">
                            "{appeal.reviewNote}"
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </BottomSheetScrollView>
        ) : (
          <View className="flex-1 items-center justify-center p-10">
            <Text className="text-center text-slate-500">Không tìm thấy thông tin chi tiết</Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

function DetailItem({ 
  label, 
  value, 
  icon, 
  status 
}: { 
  label: string; 
  value: string; 
  icon: keyof typeof Ionicons.glyphMap;
  status?: string;
}) {
  const isViolation = status === 'VIOLATION' || status === 'REJECTED';
  const isSuccess = status === 'APPROVED' || status === 'NO_VIOLATION';
  const isPending = status === 'PENDING';

  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <Ionicons name={icon} size={18} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</Text>
        <Text className={`text-[15px] font-bold ${
          isViolation ? 'text-rose-600 dark:text-rose-400' : 
          isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 
          isPending ? 'text-amber-600 dark:text-amber-400' :
          'text-slate-900 dark:text-slate-100'
        }`}>
          {value}
        </Text>
      </View>
    </View>
  );
}
