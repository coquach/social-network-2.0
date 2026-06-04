import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Spinner } from 'heroui-native/spinner';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useEmotionDashboardDistribution,
  useEmotionDashboardInsights,
  useEmotionDashboardSummary,
  useEmotionDashboardTrend,
} from '@repo/shared/hooks/useEmotion';
import { EmotionInsightTone, EmotionLabel } from '@repo/shared/types/emotion.types';
import { RecommendedMusicSection } from '~/components/newfeeds/recommended-music-section';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const BENTO_WIDTH = (width - CARD_MARGIN * 3) / 2; // 2 columns with gaps


const getEmotionPremiumMeta = (emotion: EmotionLabel) => {
  switch (emotion) {
    case 'JOY': return { emoji: '😄', bgStart: '#34d399', bgEnd: '#059669', iconColor: '#ecfdf5', label: 'Tích cực' };
    case 'SADNESS': return { emoji: '😢', bgStart: '#60a5fa', bgEnd: '#2563eb', iconColor: '#eff6ff', label: 'Buồn bã' };
    case 'ANGER': return { emoji: '😡', bgStart: '#fb7185', bgEnd: '#e11d48', iconColor: '#fff1f2', label: 'Tức giận' };
    case 'FEAR': return { emoji: '😨', bgStart: '#c084fc', bgEnd: '#9333ea', iconColor: '#faf5ff', label: 'Sợ hãi' };
    case 'DISGUST': return { emoji: '🤢', bgStart: '#a3e635', bgEnd: '#65a30d', iconColor: '#f7fee7', label: 'Khó chịu' };
    case 'SURPRISE': return { emoji: '😲', bgStart: '#fbbf24', bgEnd: '#d97706', iconColor: '#fffbeb', label: 'Bất ngờ' };
    case 'NEUTRAL': default: return { emoji: '😐', bgStart: '#94a3b8', bgEnd: '#475569', iconColor: '#f8fafc', label: 'Bình tĩnh' };
  }
};

const getToneColor = (tone: EmotionInsightTone) => {
  switch (tone) {
    case 'positive': return { bgClass: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700', text: '#059669', icon: 'trending-up' as const };
    case 'warning': return { bgClass: 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700', text: '#d97706', icon: 'alert-circle' as const };
    case 'critical': return { bgClass: 'bg-rose-100 dark:bg-rose-900 border-rose-300 dark:border-rose-700', text: '#e11d48', icon: 'warning' as const };
    case 'neutral': default: return { bgClass: 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700', text: '#475569', icon: 'information-circle' as const };
  }
};

export default function SentimentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useEmotionDashboardSummary();
  const { data: insights, isLoading: loadingInsights, refetch: refetchInsights } = useEmotionDashboardInsights();
  const { data: distribution, isLoading: loadingDist, refetch: refetchDist } = useEmotionDashboardDistribution({
    window: '7d',
  });
  const { data: trendData, isLoading: loadingTrend, refetch: refetchTrend } = useEmotionDashboardTrend({
    window: '7d',
  });

  const onRefresh = () => {
    refetchSummary();
    refetchInsights();
    refetchDist();
    refetchTrend();
  };

  const isLoading = loadingSummary || loadingInsights || loadingDist || loadingTrend;

  const distributionList = useMemo(() => {
    if (!distribution?.distribution) return [];
    return Object.entries(distribution.distribution)
      .map(([key, value]) => ({
        emotion: key.toUpperCase() as EmotionLabel,
        count: value,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [distribution]);

  const pieData = useMemo(() => {
    const total = distributionList.reduce((acc, curr) => acc + curr.count, 0);
    return distributionList.map((item) => {
      const meta = getEmotionPremiumMeta(item.emotion);
      return {
        value: item.count,
        color: meta.bgEnd,
        gradientCenterColor: meta.bgStart,
        text: total > 0 ? `${Math.round((item.count / total) * 100)}%` : '',
        textColor: '#fff',
        focused: item.emotion === summary?.dominantEmotion,
      };
    });
  }, [distributionList, summary?.dominantEmotion]);

  const lineChartData = useMemo(() => {
    if (!trendData?.data || !Array.isArray(trendData.data)) return [];
    return trendData.data.map((point: any, idx: number) => {
      let dateValue = point.timestamp || point.createdAt || point.date;
      let date = new Date(dateValue);
      
      // Handle timestamp sent as number string
      if (isNaN(date.getTime()) && dateValue && !isNaN(Number(dateValue))) {
        date = new Date(Number(dateValue));
      }

      // Handle YYYY/MM/DD HH:mm:ss from custom backend interceptor
      if (isNaN(date.getTime()) && typeof dateValue === 'string') {
        const parts = dateValue.split(' ');
        if (parts.length === 2 && parts[0].includes('/')) {
          const [year, month, day] = parts[0].split('/').map(Number);
          if (year && month && day) {
            date = new Date(year, month - 1, day);
          }
        } else if (parts.length === 1 && parts[0].includes('/')) {
          const [year, month, day] = parts[0].split('/').map(Number);
          if (year && month && day) {
            date = new Date(year, month - 1, day);
          }
        }
      }

      // If absolutely no valid date, fallback to Ngày 1, Ngày 2, vv.
      const isDateValid = dateValue && !isNaN(date.getTime());
      const label = isDateValid ? `${date.getDate()}/${date.getMonth() + 1}` : `Ngày ${idx + 1}`;

      return {
        value: Number((Number(point.negativeRatio || 0) * 100).toFixed(2)), // convert to percentage with 2 decimals
        label,
        hideDataPoint: false,
      };
    });
  }, [trendData]);

  const dominantMeta = summary?.dominantEmotion ? getEmotionPremiumMeta(summary.dominantEmotion) : getEmotionPremiumMeta('NEUTRAL');

const getInsightTypeLabel = (type: string) => {
    switch(type) {
      case 'ABOVE_BASELINE': return 'Vượt mức bình thường';
      case 'DETERIORATING_TREND': return 'Dấu hiệu đi xuống';
      case 'HIGH_NEGATIVITY': return 'Tiêu cực cao';
      case 'HIGH_RISK': return 'Cảnh báo rủi ro';
      case 'HIGH_VOLATILITY': return 'Biến động mạnh';
      case 'NEGATIVE_STREAK': return 'Chuỗi tiêu cực';
      case 'NORMALIZING': return 'Đang cân bằng lại';
      case 'POSITIVE_STATE': return 'Trạng thái tích cực';
      case 'RECOVERING_TREND': return 'Đang phục hồi';
      case 'STABLE_STATE': return 'Trạng thái ổn định';
      default: return 'Phân tích nhanh';
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={dominantMeta.bgEnd}
          />
        }
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: insets.top + 20,
        }}
      >
        {/* HEADER */}
        <View className="px-5 mb-6">
          <Text className="text-3xl font-extrabold text-app-primary dark:text-app-primary-dark">
            Nhật ký cảm xúc
          </Text>
        </View>

        <View className="px-4 gap-4">
          {/* HERO CARD - DOMINANT EMOTION */}
          <Pressable onPress={() => router.push('/(stack)/sentiment/history')}>
            <LinearGradient
              colors={[dominantMeta.bgStart, dominantMeta.bgEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full rounded-[32px] p-6 overflow-hidden shadow-lg"
              style={{
                shadowColor: dominantMeta.bgEnd,
                shadowOpacity: 0.3,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
              <View className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/10" />

              <View className="flex-row items-center justify-between z-10">
                <View className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Text className="text-3xl">{dominantMeta.emoji}</Text>
                </View>
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
                  <Text className="text-white text-xs font-bold uppercase tracking-wider mr-1">
                    Lịch sử
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </View>
              </View>

              <View className="mt-8 z-10">
                <Text className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">
                  Cảm xúc nổi bật
                </Text>
                <Text className="text-white text-4xl font-extrabold shadow-sm">
                  {dominantMeta.label}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* BENTO GRID: STATS */}
          <View className="flex-row justify-between w-full">
            {/* Box 1: Risk Score (Căng thẳng) */}
            <View
              style={{ width: BENTO_WIDTH }}
              className="bg-red-100 dark:bg-rose-900 rounded-[24px] p-5 border border-red-300 dark:border-rose-700"
            >
              <View className="w-10 h-10 rounded-full bg-red-200 dark:bg-rose-800 items-center justify-center mb-4">
                <Ionicons name="pulse" size={20} color="#e11d48" />
              </View>
              <Text className="text-red-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                Căng thẳng
              </Text>
              <Text className="text-3xl font-extrabold text-red-900 dark:text-rose-100">
                {summary?.riskScore ? (summary.riskScore * 10).toFixed(1) : 0}
              </Text>
            </View>

            {/* Box 2: Momentum (Biến động) */}
            <View
              style={{ width: BENTO_WIDTH }}
              className="bg-blue-100 dark:bg-indigo-900 rounded-[24px] p-5 border border-blue-300 dark:border-indigo-700"
            >
              <View className="w-10 h-10 rounded-full bg-blue-200 dark:bg-indigo-800 items-center justify-center mb-4">
                <Ionicons name="analytics" size={20} color="#2563eb" />
              </View>
              <Text className="text-blue-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                Biến động
              </Text>
              <Text className="text-3xl font-extrabold text-blue-900 dark:text-indigo-100">
                {summary?.emotionMomentum
                  ? summary.emotionMomentum > 0
                    ? `+${summary.emotionMomentum.toFixed(1)}`
                    : summary.emotionMomentum.toFixed(1)
                  : 0}
              </Text>
            </View>
          </View>

          {/* PIE CHART BENTO */}
          <View className="bg-slate-100 dark:bg-[#1e293b] rounded-[32px] p-6 border border-slate-200/50 dark:border-slate-800/50 mt-2">
            <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6">
              Bức tranh Cảm xúc
            </Text>

            <View className="flex-row items-center">
              <View className="w-[140px] items-center justify-center">
                {pieData.length > 0 ? (
                  <PieChart
                    data={pieData}
                    donut
                    showGradient
                    sectionAutoFocus
                    radius={70}
                    innerRadius={45}
                    innerCircleColor="transparent"
                  />
                ) : (
                  <View className="items-center justify-center py-4">
                    <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-2 shadow-sm border border-black/5 dark:border-white/5">
                      <Ionicons
                        name="pie-chart-outline"
                        size={28}
                        color="#94a3b8"
                      />
                    </View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Trống
                    </Text>
                  </View>
                )}
              </View>

              {/* Custom Legend */}
              <View className="bg-slate-100 dark:bg-[#1e293b] rounded-[32px] p-6 border border-slate-200/50 dark:border-slate-800/50 mt-2">
                {distributionList.slice(0, 4).map((item, index) => {
                  const meta = getEmotionPremiumMeta(item.emotion);
                  return (
                    <View
                      key={item.emotion}
                      className={`flex-row items-center justify-between ${index !== 0 ? 'mt-3' : ''}`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: meta.bgEnd }}
                        />
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {meta.label}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-slate-500">
                        {(item.count * 100).toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* LINE CHART: TREND */}
          <View className="mt-4 mb-4 bg-slate-100 dark:bg-[#1e293b] rounded-[32px] p-6 border border-slate-200/50 dark:border-slate-800/50">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-xl font-extrabold text-app-fg dark:text-app-fg-dark">
                Biểu đồ Biến động
              </Text>
              <Text className="text-xs font-bold text-slate-400">
                7 ngày qua
              </Text>
            </View>
            <View className="p-2">
              {lineChartData.length > 0 ? (
                <View className="items-center justify-center">
                  <LineChart
                    data={lineChartData}
                    height={160}
                    width={width - 80}
                    spacing={(width - 80) / Math.max(lineChartData.length, 1)}
                    initialSpacing={10}
                    color="#0ea5e9"
                    thickness={3}
                    dataPointsColor="#0284c7"
                    dataPointsRadius={4}
                    yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                    hideRules
                    yAxisColor="transparent"
                    xAxisColor="#e2e8f0"
                    formatYLabel={(label: string) => Number(label).toFixed(2)}
                    curved
                    animateOnDataChange
                    animationDuration={1000}
                    isAnimated
                  />
                </View>
              ) : (
                <View className="items-center justify-center py-8">
                  <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4 shadow-sm border border-black/5 dark:border-white/5">
                    <Ionicons
                      name="trending-up-outline"
                      size={40}
                      color="#94a3b8"
                    />
                  </View>
                  <Text className="text-center text-slate-500 dark:text-slate-400 font-medium">
                    Chưa có đủ dữ liệu biến động
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* MUSIC RECOMMENDATION BENTO */}
          <View className="mb-4">
            <RecommendedMusicSection />
          </View>

          {/* AI ADVICE BENTO */}
          <View className="mt-4 mb-8">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-xl font-extrabold text-app-fg dark:text-app-fg-dark">
                Trạm chữa lành
              </Text>
              {loadingInsights && <Spinner size="sm" />}
            </View>

            <View className="gap-4">
              {insights?.length ? (
                insights.map((signal, index) => {
                  const toneMeta = getToneColor(signal.tone);
                  return (
                    <View
                      key={index}
                      className={`rounded-[24px] p-5 border ${toneMeta.bgClass}`}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="w-10 h-10 rounded-full items-center justify-center bg-white/60 dark:bg-black/20">
                          <Ionicons
                            name={toneMeta.icon}
                            size={20}
                            color={toneMeta.text}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-sm font-bold uppercase tracking-wider mb-1"
                            style={{ color: toneMeta.text }}
                          >
                            {getInsightTypeLabel(signal.type)}
                          </Text>
                          <Text className="text-base text-slate-800 dark:text-slate-200 leading-6 font-medium">
                            {signal.message}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : !loadingInsights ? (
                <View className="bg-slate-100 dark:bg-slate-800/50 rounded-[24px] p-8 items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Ionicons
                    name="leaf-outline"
                    size={48}
                    color="#94a3b8"
                    className="mb-3"
                  />
                  <Text className="text-base text-slate-500 text-center font-medium">
                    Tâm trí bạn đang tĩnh lặng. Hãy ghi lại cảm xúc hôm nay nhé!
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
