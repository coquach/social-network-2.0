import { Ionicons } from '@expo/vector-icons';
import { useEmotionAnalysis, useSubmitEmotionFeedback } from '@repo/shared/hooks/useEmotion';
import { TargetType } from '@repo/shared/types/enums';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Card } from 'heroui-native/card';
import { Spinner } from 'heroui-native/spinner';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '~/components/ui/app-header';

const getEmotionPremiumMeta = (emotion: string) => {
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

const FeedbackSection = ({ summary }: { summary: any }) => {
  const submitFeedbackMutation = useSubmitEmotionFeedback();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (isAccurate: boolean) => {
    submitFeedbackMutation.mutate({
      targetId: summary.targetId,
      targetType: summary.targetType,
      isAccurate,
    }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: () => {
        Alert.alert("Lỗi", "Không thể gửi phản hồi. Vui lòng thử lại.");
      }
    });
  };

  if (submitted) {
    return (
      <Card className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[24px] p-6 shadow-sm border border-emerald-200 dark:border-emerald-800 mt-2">
        <View className="flex-row items-center justify-center gap-3">
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-center">
            Cảm ơn bạn đã gửi đánh giá!
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1e293b] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-2">
      <View className="mb-4">
        <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
          Đánh giá kết quả
        </Text>
        <Text className="text-sm text-slate-500 mt-1">
          Phân tích này có chính xác với cảm xúc thực tế của bạn không?
        </Text>
      </View>
      
      <View className="flex-row gap-3">
        <TouchableOpacity 
          disabled={submitFeedbackMutation.isPending}
          onPress={() => handleSubmit(true)}
          className="flex-1 flex-row items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-[16px] border border-slate-200 dark:border-slate-700"
        >
          <Ionicons name="thumbs-up-outline" size={20} color="#10b981" />
          <Text className="font-bold text-slate-700 dark:text-slate-300">Chính xác</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={submitFeedbackMutation.isPending}
          onPress={() => handleSubmit(false)}
          className="flex-1 flex-row items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-[16px] border border-slate-200 dark:border-slate-700"
        >
          <Ionicons name="thumbs-down-outline" size={20} color="#f43f5e" />
          <Text className="font-bold text-slate-700 dark:text-slate-300">Chưa đúng</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default function EmotionAnalysisScreen() {
  const { targetId, targetType = TargetType.POST } = useLocalSearchParams<{ targetId: string; targetType: TargetType }>();

  const { data: analysis, isLoading } = useEmotionAnalysis(targetType, targetId);

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]">
      <AppHeader title="Chi tiết phân tích" subtitle={`Từ ${targetType === 'POST' ? 'bài viết' : 'bình luận'}`} />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" />
        </View>
      ) : analysis ? (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4 pb-12">
            
            {/* HERO CARD - KẾT QUẢ CHÍNH */}
            <LinearGradient
              colors={[getEmotionPremiumMeta(analysis.finalEmotion.toUpperCase()).bgStart, getEmotionPremiumMeta(analysis.finalEmotion.toUpperCase()).bgEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full rounded-[32px] overflow-hidden shadow-sm p-6"
            >
              <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
              
              <View className="flex-row items-center gap-3 z-10 mb-6">
                <View className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                  <Text className="text-3xl">{getEmotionPremiumMeta(analysis.finalEmotion.toUpperCase()).emoji}</Text>
                </View>
                <Text className="text-white/90 text-sm font-bold uppercase tracking-wider">
                  Cảm xúc chủ đạo
                </Text>
              </View>
              
              <View className="z-10 flex-row items-end justify-between">
                <Text className="text-white text-4xl font-extrabold shadow-sm">
                  {getEmotionPremiumMeta(analysis.finalEmotion.toUpperCase()).label}
                </Text>
                <View className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                  <Text className="text-white text-xs font-bold">
                    Độ tin cậy {(analysis.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* BENTO STATS */}
            <View className="flex-row justify-between gap-4">
              <Card className="flex-1 bg-white dark:bg-[#1e293b] rounded-[24px] p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <View className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 items-center justify-center mb-3">
                  <Ionicons name="pulse" size={20} color="#e11d48" />
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Căng thẳng
                </Text>
                <Text className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {analysis.riskLevel === 'low' ? 'Thấp' : analysis.riskLevel === 'medium' ? 'Vừa' : analysis.riskLevel === 'high' ? 'Cao' : 'Bình thường'}
                </Text>
              </Card>

              <Card className="flex-1 bg-indigo-50 dark:bg-indigo-950 rounded-[24px] p-5 shadow-sm border border-indigo-200 dark:border-indigo-800">
                <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mb-3">
                  <Ionicons name="hardware-chip" size={20} color="#4f46e5" />
                </View>
                <Text className="text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Đánh giá bởi
                </Text>
                <Text className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100">
                  Sentimeta AI
                </Text>
              </Card>
            </View>

            {/* CƯỜNG ĐỘ CẢM XÚC - PROGRESS BARS */}
            <Card className="bg-white dark:bg-[#1e293b] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-2">
              <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-5">
                Mật độ cấu thành
              </Text>
              {Object.entries(analysis.finalScores)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, score]) => {
                  const meta = getEmotionPremiumMeta(emotion.toUpperCase());
                  const percentage = (score * 100).toFixed(1);
                  return (
                    <View key={emotion} className="mb-4">
                      <View className="flex-row justify-between items-end mb-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base">{meta.emoji}</Text>
                          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{meta.label}</Text>
                        </View>
                        <Text className="text-sm font-bold text-slate-500">{percentage}%</Text>
                      </View>
                      <View className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <View className="h-full rounded-full" style={{ width: `${score * 100}%`, backgroundColor: meta.bgEnd }} />
                      </View>
                    </View>
                  );
                })}
            </Card>

            {/* CONTENT PREVIEW */}
            {analysis.content ? (
              <Card className="bg-white dark:bg-[#1e293b] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-2">
                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                      Nội dung phân tích
                    </Text>
                    <Text className="text-xs text-slate-500">
                      Từ {targetType === 'POST' ? 'bài viết' : 'bình luận'} gốc
                    </Text>
                  </View>
                  <View className="bg-sky-100 dark:bg-sky-900/30 px-3 py-1.5 rounded-full">
                    <Text className="text-sky-700 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                      {targetType}
                    </Text>
                  </View>
                </View>
                <View className="bg-slate-50 dark:bg-black/20 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/50">
                  <Text className="text-base text-slate-700 dark:text-slate-300 leading-6">
                    {analysis.content.content || 'Không có nội dung văn bản.'}
                  </Text>
                </View>
              </Card>
            ) : null}

            {/* FEEDBACK SECTION */}
            <FeedbackSection summary={analysis} />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={48} className="text-slate-400 mb-4" />
          <Text className="text-slate-500 font-medium">Không tìm thấy dữ liệu phân tích</Text>
        </View>
      )}
    </View>
  );
}
