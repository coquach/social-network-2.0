import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '~/components/ui/app-card';
import { AppHeader } from '~/components/ui/app-header';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SupportItem {
    id: string;
    title: string;
    description: string;
    icon: IoniconsName;
    meta?: string; // thông tin phụ như email, số điện thoại, giờ làm việc
}

interface SupportSection {
    id: string;
    heading: string;
    items: SupportItem[];
}

export default function SupportScreen() {
    const insets = useSafeAreaInsets();

    const supportSections: SupportSection[] = [
        {
            id: 'self-help',
            heading: 'Tài liệu',
            items: [
                {
                    id: 'faq',
                    title: 'Câu hỏi thường gặp',
                    description: 'Xem câu trả lời cho các vấn đề phổ biến nhất của người dùng.',
                    icon: 'chatbox-ellipses-outline',
                },
                {
                    id: 'guide',
                    title: 'Hướng dẫn sử dụng',
                    description: 'Tìm hiểu cách sử dụng ứng dụng một cách tối ưu và hiệu quả.',
                    icon: 'book-outline',
                },
            ],
        },
        {
            id: 'contact',
            heading: 'Liên hệ hỗ trợ',
            items: [
                {
                    id: 'email',
                    title: 'Email hỗ trợ',
                    description: 'Gửi thắc mắc hoặc vấn đề kỹ thuật. Chúng tôi phản hồi trong vòng 24 giờ làm việc.',
                    icon: 'mail-outline',
                    meta: 'support@example.com',
                },
                {
                    id: 'hotline',
                    title: 'Hotline',
                    description: 'Hỗ trợ trực tiếp qua điện thoại trong giờ làm việc.',
                    icon: 'call-outline',
                    meta: '1800 1234 · T2–T6, 8:00–17:00',
                },
                {
                    id: 'chat',
                    title: 'Chat trực tuyến',
                    description: 'Trò chuyện với nhân viên hỗ trợ theo thời gian thực.',
                    icon: 'chatbubbles-outline',
                    meta: 'Mở cửa 8:00–22:00 hàng ngày',
                },
            ],
        },
        {
            id: 'feedback',
            heading: 'Góp ý & Phản hồi',
            items: [
                {
                    id: 'bug',
                    title: 'Báo cáo lỗi',
                    description: 'Phát hiện lỗi trong ứng dụng? Hãy báo cho chúng tôi.',
                    icon: 'bug-outline',
                    meta: 'bugs@example.com',
                },
                {
                    id: 'suggest',
                    title: 'Đề xuất tính năng',
                    description: 'Chia sẻ ý tưởng để giúp chúng tôi cải thiện sản phẩm tốt hơn.',
                    icon: 'bulb-outline',
                    meta: 'feedback@example.com',
                },
                {
                    id: 'rate',
                    title: 'Đánh giá ứng dụng',
                    description: 'Nếu hài lòng, hãy để lại đánh giá trên App Store hoặc Google Play.',
                    icon: 'star-outline',
                },
            ],
        },
    ];

    return (
        <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
            <AppHeader title="Trợ giúp & Hỗ trợ" variant="default" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: Math.max(insets.bottom + 24, 32),
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    gap: 24,
                }}
            >
                {/* Intro banner */}
                <View className="rounded-3xl bg-app-surface dark:bg-app-surface-dark px-4 py-4 flex-row items-start gap-3">
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark mt-0.5">
                        <Ionicons name="headset-outline" size={18} color="#334155" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-app-fg dark:text-app-fg-dark mb-1">
                            Chúng tôi luôn sẵn sàng hỗ trợ
                        </Text>
                        <Text className="text-[12px] leading-[18px] text-app-muted-fg dark:text-app-muted-fg-dark">
                            Tìm câu trả lời trong tài liệu hoặc liên hệ trực tiếp với đội ngũ của chúng tôi bất cứ lúc nào.
                        </Text>
                    </View>
                </View>

                {/* Sections */}
                {supportSections.map((section) => (
                    <View key={section.id} className="gap-y-2">
                        <Text className="ml-1 text-[11px] font-semibold uppercase tracking-widest text-app-muted-fg dark:text-app-muted-fg-dark">
                            {section.heading}
                        </Text>
                        <AppCard className="rounded-3xl p-2 gap-y-1">
                            {section.items.map((item, index) => (
                                <View key={item.id}>
                                    <View className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                                        <View className="h-9 w-9 items-center justify-center rounded-xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
                                            <Ionicons
                                                name={item.icon}
                                                size={18}
                                                color="#334155"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                                                {item.title}
                                            </Text>
                                            <Text className="mt-0.5 text-[12px] leading-[17px] text-app-muted-fg dark:text-app-muted-fg-dark">
                                                {item.description}
                                            </Text>
                                            {item.meta ? (
                                                <Text className="mt-1 text-[12px] font-medium text-app-fg dark:text-app-fg-dark opacity-60">
                                                    {item.meta}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                    {index < section.items.length - 1 ? (
                                        <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
                                    ) : null}
                                </View>
                            ))}
                        </AppCard>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}