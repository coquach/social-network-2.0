import { Ionicons } from '@expo/vector-icons';
import { 
  ContentModerationDTO, 
  formatAbsoluteTime,
  TargetType 
} from '@repo/shared';
import React from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { useAppTheme } from '~/providers/theme-provider';

interface ModerationHistoryItemProps {
  item: ContentModerationDTO;
  onPress: () => void;
}

const getTargetIcon = (targetType: string): keyof typeof Ionicons.glyphMap => {
  switch (targetType) {
    case TargetType.POST:
      return 'document-text-outline';
    case TargetType.COMMENT:
      return 'chatbubble-outline';
    case TargetType.SHARE:
      return 'share-social-outline';
    default:
      return 'shield-outline';
  }
};

const getStatusTheme = (decision?: string, isDark?: boolean) => {
  const normalized = decision?.toUpperCase();
  if (normalized === 'NO_VIOLATION' || normalized === 'APPROVED') {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200/50 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: isDark ? '#34d399' : '#10b981',
      label: normalized === 'NO_VIOLATION' ? 'Không vi phạm' : 'Đã phê duyệt'
    };
  }
  if (normalized === 'VIOLATION' || normalized === 'REJECTED') {
    return {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-200/50 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      icon: isDark ? '#fb7185' : '#e11d48',
      label: normalized === 'VIOLATION' ? 'Vi phạm' : 'Từ chối'
    };
  }
  if (normalized === 'PENDING') {
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200/50 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      icon: isDark ? '#fbbf24' : '#d97706',
      label: 'Chờ xử lý'
    };
  }
  return {
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    icon: isDark ? '#94a3b8' : '#64748b',
    label: 'Chưa rõ'
  };
};

export function ModerationHistoryItem({ item, onPress }: ModerationHistoryItemProps) {
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const statusTheme = getStatusTheme(item.finalDecision, isDark);
  const targetIcon = getTargetIcon(item.targetType);

  const reason = item.violations.map(v => v.reason).filter(Boolean).join(' • ') || item.displayMessage;

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 my-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:active:bg-slate-800/50"
    >
      <View className="absolute inset-y-0 left-0 w-1 bg-sky-500" />
      
      <View className="p-4 pl-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className={`rounded-full border px-2 py-0.5 ${statusTheme.bg} ${statusTheme.border}`}>
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${statusTheme.text}`}>
                  {statusTheme.label}
                </Text>
              </View>
              <View className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-700 dark:bg-slate-800">
                <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {item.targetType === TargetType.POST ? 'Bài viết' : item.targetType === TargetType.COMMENT ? 'Bình luận' : 'Chia sẻ'}
                </Text>
              </View>
            </View>
            
            <Text className="mt-2 text-[15px] font-bold text-slate-900 dark:text-slate-100" numberOfLines={1}>
              {item.displayMessage || 'Bản ghi kiểm duyệt'}
            </Text>
          </View>

          <View className="ml-2 items-end">
            <Text className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatAbsoluteTime(item.createdAt, 'dd/MM/yyyy')}
            </Text>
            <Text className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatAbsoluteTime(item.createdAt, 'HH:mm')}
            </Text>
          </View>
        </View>

        <View className="mt-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
          <Text className="text-[13px] leading-5 text-slate-600 dark:text-slate-300" numberOfLines={2}>
            {reason}
          </Text>
        </View>

        {item.targetPreview?.content || item.targetPreview?.imageUrl ? (
          <View className="mt-2 flex-row items-center gap-2 px-1">
            <Ionicons name="link-outline" size={12} color="#94a3b8" />
            {item.targetPreview.imageUrl && (
              <Image 
                source={{ uri: item.targetPreview.imageUrl }} 
                style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }} 
                resizeMode="cover" 
              />
            )}
            {item.targetPreview.content ? (
              <Text className="flex-1 text-[11px] text-slate-400 dark:text-slate-500" numberOfLines={1}>
                Preview: {item.targetPreview.content}
              </Text>
            ) : (
              <Text className="flex-1 text-[11px] italic text-slate-400 dark:text-slate-500">
                [Hình ảnh]
              </Text>
            )}
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <View className="flex-row items-center gap-1">
            <Ionicons name={targetIcon} size={14} color="#64748b" />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {item.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-row items-center gap-1">
            <Text className="text-[12px] font-semibold text-sky-600 dark:text-sky-400">
              Chi tiết
            </Text>
            <Ionicons name="chevron-forward" size={14} color={isDark ? '#38bdf8' : '#0284c7'} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
