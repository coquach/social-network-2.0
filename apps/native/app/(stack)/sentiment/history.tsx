import { Ionicons } from '@expo/vector-icons';
import { useEmotionHistory } from '@repo/shared/hooks/useEmotion';
import { EmotionLabel } from '@repo/shared/types/emotion.types';
import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from 'heroui-native/card';
import { Spinner } from 'heroui-native/spinner';
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '~/components/ui/app-header';

const getEmotionMeta = (emotion: EmotionLabel) => {
  switch (emotion) {
    case 'JOY': return { emoji: '😄', color: '#059669', bg: 'bg-emerald-100 dark:bg-emerald-900', border: 'border-emerald-300 dark:border-emerald-700', label: 'Tích cực' };
    case 'SADNESS': return { emoji: '😢', color: '#2563eb', bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-300 dark:border-blue-700', label: 'Buồn bã' };
    case 'ANGER': return { emoji: '😡', color: '#e11d48', bg: 'bg-rose-100 dark:bg-rose-900', border: 'border-rose-300 dark:border-rose-700', label: 'Tức giận' };
    case 'FEAR': return { emoji: '😨', color: '#9333ea', bg: 'bg-purple-100 dark:bg-purple-900', border: 'border-purple-300 dark:border-purple-700', label: 'Sợ hãi' };
    case 'DISGUST': return { emoji: '🤢', color: '#65a30d', bg: 'bg-lime-100 dark:bg-lime-900', border: 'border-lime-300 dark:border-lime-700', label: 'Khó chịu' };
    case 'SURPRISE': return { emoji: '😲', color: '#d97706', bg: 'bg-amber-100 dark:bg-amber-900', border: 'border-amber-300 dark:border-amber-700', label: 'Bất ngờ' };
    case 'NEUTRAL': default: return { emoji: '😐', color: '#475569', bg: 'bg-slate-200 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-600', label: 'Bình tĩnh' };
  }
};

const EMOTION_TABS: EmotionLabel[] = ['JOY', 'SADNESS', 'ANGER', 'FEAR', 'DISGUST', 'SURPRISE', 'NEUTRAL'];

export default function EmotionHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ emotion?: string }>();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionLabel | 'ALL'>((params.emotion as EmotionLabel) || 'ALL');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useEmotionHistory();

  const filteredData = useMemo(() => {
    const allData = data?.pages.flatMap((p) => p.data) || [];
    if (selectedEmotion === 'ALL') return allData;
    
    return allData.filter((item: any) => {
      const emotionKey = (item.emotion || item.finalEmotion || 'NEUTRAL').toUpperCase();
      return emotionKey === selectedEmotion;
    });
  }, [data, selectedEmotion]);

  const renderItem = ({ item }: { item: any }) => {
    const rawEmotion = item.emotion || item.finalEmotion || 'NEUTRAL';
    const emotionKey = rawEmotion.toUpperCase();
    const meta = getEmotionMeta(emotionKey as EmotionLabel);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/(stack)/sentiment/analysis/${item.targetId}?targetType=${item.targetType}`)}
      >
        <Card className={`mb-3 p-4 rounded-[24px] border ${meta.bg} ${meta.border} shadow-sm`}>
        <View className="flex-row gap-3 w-full">
          {/* Emoji Container */}
          <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white dark:bg-black/40 shadow-sm border border-black/5 dark:border-white/5">
            <Text className="text-3xl">{meta.emoji}</Text>
          </View>
          
          <View className="flex-1 justify-center">
            {/* Header: Label and Time */}
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                {meta.label}
              </Text>
              <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {(() => {
                  let parsedDate = new Date(item.createdAt);
                  if (isNaN(parsedDate.getTime()) && typeof item.createdAt === 'string') {
                    const parts = item.createdAt.split(' ');
                    if (parts.length >= 1 && parts[0].includes('/')) {
                      const [year, month, day] = parts[0].split('/').map(Number);
                      if (year && month && day) {
                        parsedDate = new Date(year, month - 1, day);
                      }
                    }
                  }
                  return !isNaN(parsedDate.getTime())
                    ? formatDistanceToNow(parsedDate, { addSuffix: true, locale: vi })
                    : 'Gần đây';
                })()}
              </Text>
            </View>
            
            {/* Metadata Badges */}
            <View className="flex-row mt-1.5 items-center gap-2">
              <View className="flex-row items-center bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-full">
                <Ionicons 
                  name={item.targetType === 'POST' ? 'document-text' : 'chatbubble'} 
                  size={12} 
                  color={meta.color} 
                  style={{ marginRight: 4 }}
                />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {item.targetType === 'POST' ? 'Bài viết' : item.targetType === 'COMMENT' ? 'Bình luận' : item.targetType}
                </Text>
              </View>
              
              <View className="flex-row items-center bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-full">
                <Ionicons 
                  name={item.riskHintLevel === 'high' ? 'warning' : 'pulse'} 
                  size={12} 
                  color={meta.color} 
                  style={{ marginRight: 4 }}
                />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {item.riskHintLevel === 'low' ? 'An toàn' : item.riskHintLevel === 'medium' ? 'Lưu ý' : item.riskHintLevel === 'high' ? 'Căng thẳng' : 'Bình thường'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]">
      <AppHeader title="Lịch sử cảm xúc"   />
      
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }} 
          className="border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#1e293b]"
        >
          <TouchableOpacity 
            onPress={() => setSelectedEmotion('ALL')} 
            className={`px-5 py-2.5 rounded-full border ${selectedEmotion === 'ALL' ? 'bg-app-primary/10 border-app-primary/30 dark:bg-app-primary-dark/20 dark:border-app-primary-dark/40' : 'bg-transparent border-slate-200 dark:border-slate-700'}`}
          >
            <Text className={`font-bold ${selectedEmotion === 'ALL' ? 'text-app-primary dark:text-app-primary-dark' : 'text-slate-600 dark:text-slate-400'}`}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {EMOTION_TABS.map(emotion => {
            const meta = getEmotionMeta(emotion);
            const isSelected = selectedEmotion === emotion;
            return (
              <TouchableOpacity 
                key={emotion} 
                onPress={() => setSelectedEmotion(emotion)} 
                className={`flex-row items-center px-5 py-2.5 rounded-full border ${isSelected ? `${meta.bg} border-transparent` : 'bg-transparent border-slate-200 dark:border-slate-700'}`}
              >
                <Text className="text-base mr-1.5">{meta.emoji}</Text>
                <Text className={`font-bold ${isSelected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" />
        </View>
      ) : (
        <View className="flex-1">
          <FlashList
            data={filteredData}
            keyExtractor={(item: any) => item.targetId + item.createdAt}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            ListFooterComponent={isFetchingNextPage ? <View className="my-4 items-center"><Spinner size="sm" /></View> : null}
          ListEmptyComponent={
            <View className="items-center justify-center mt-32">
              <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                <Ionicons name="leaf-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-center text-lg font-bold text-slate-700 dark:text-slate-300">
                Chưa có ghi nhận nào
              </Text>
              <Text className="text-center text-slate-500 mt-2">
                Hãy bắt đầu tương tác để AI ghi lại cảm xúc của bạn.
              </Text>
            </View>
            }
          />
        </View>
      )}
    </View>
  );
}
