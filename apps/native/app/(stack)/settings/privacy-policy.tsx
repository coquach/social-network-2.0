import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '~/components/ui/app-card';
import { AppHeader } from '~/components/ui/app-header';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface PrivacyItem {
    id: string;
    title: string;
    description: string;
    icon: IoniconsName;
}

interface PrivacySection {
    id: string;
    heading: string;
    items: PrivacyItem[];
}

export default function PrivacyScreen() {
    const insets = useSafeAreaInsets();

    const privacySections: PrivacySection[] = [
        {
            id: 'collection',
            heading: 'Thu thập dữ liệu',
            items: [
                {
                    id: 'collect',
                    title: 'Dữ liệu được thu thập',
                    description: 'Chúng tôi chỉ thu thập dữ liệu cần thiết để cải thiện trải nghiệm của bạn, bao gồm tên, địa chỉ email và thông tin thiết bị.',
                    icon: 'finger-print-outline',
                },
                {
                    id: 'purpose',
                    title: 'Mục đích sử dụng',
                    description: 'Dữ liệu được dùng để cá nhân hóa nội dung, cải thiện tính năng và đảm bảo bảo mật tài khoản của bạn.',
                    icon: 'analytics-outline',
                },
                {
                    id: 'retention',
                    title: 'Thời gian lưu trữ',
                    description: 'Dữ liệu của bạn được lưu trữ trong vòng 24 tháng kể từ lần tương tác cuối cùng, sau đó sẽ tự động được xóa.',
                    icon: 'time-outline',
                },
            ],
        },
        {
            id: 'sharing',
            heading: 'Chia sẻ & Bên thứ ba',
            items: [
                {
                    id: 'third-party',
                    title: 'Chia sẻ dữ liệu',
                    description: 'Thông tin cá nhân của bạn sẽ không bao giờ được chia sẻ với bên thứ ba vì mục đích tiếp thị.',
                    icon: 'share-social-outline',
                },
                {
                    id: 'partners',
                    title: 'Đối tác tin cậy',
                    description: 'Một số đối tác kỹ thuật (như dịch vụ lưu trữ đám mây) có thể xử lý dữ liệu theo thỏa thuận bảo mật nghiêm ngặt.',
                    icon: 'business-outline',
                },
                {
                    id: 'legal',
                    title: 'Yêu cầu pháp lý',
                    description: 'Chúng tôi chỉ tiết lộ thông tin khi có yêu cầu hợp lệ từ cơ quan pháp luật và sẽ thông báo cho bạn khi được phép.',
                    icon: 'shield-checkmark-outline',
                },
            ],
        },
        {
            id: 'control',
            heading: 'Quyền của bạn',
            items: [
                {
                    id: 'manage',
                    title: 'Quản lý dữ liệu',
                    description: 'Bạn có thể xem lại, chỉnh sửa và xóa dữ liệu của mình bất cứ lúc nào từ phần Cài đặt tài khoản.',
                    icon: 'settings-outline',
                },
                {
                    id: 'export',
                    title: 'Xuất dữ liệu',
                    description: 'Yêu cầu xuất toàn bộ dữ liệu của bạn dưới định dạng JSON hoặc CSV trong vòng 72 giờ làm việc.',
                    icon: 'download-outline',
                },
                {
                    id: 'delete',
                    title: 'Xóa tài khoản',
                    description: 'Khi xóa tài khoản, toàn bộ dữ liệu cá nhân của bạn sẽ được xóa vĩnh viễn khỏi hệ thống trong vòng 30 ngày.',
                    icon: 'trash-outline',
                },
                {
                    id: 'opt-out',
                    title: 'Từ chối phân tích',
                    description: 'Bạn có thể tắt việc thu thập dữ liệu phân tích bất cứ lúc nào mà không ảnh hưởng đến các tính năng cốt lõi.',
                    icon: 'eye-off-outline',
                },
            ],
        },
        {
            id: 'security',
            heading: 'Bảo mật',
            items: [
                {
                    id: 'encryption',
                    title: 'Mã hóa dữ liệu',
                    description: 'Toàn bộ dữ liệu được mã hóa bằng AES-256 khi lưu trữ và TLS 1.3 khi truyền tải.',
                    icon: 'lock-closed-outline',
                },
                {
                    id: 'access',
                    title: 'Kiểm soát truy cập',
                    description: 'Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu, và mọi truy cập đều được ghi nhật ký.',
                    icon: 'key-outline',
                },
                {
                    id: 'breach',
                    title: 'Thông báo vi phạm',
                    description: 'Trong trường hợp xảy ra sự cố bảo mật, chúng tôi cam kết thông báo cho bạn trong vòng 72 giờ.',
                    icon: 'notifications-outline',
                },
            ],
        },
        {
            id: 'contact',
            heading: 'Liên hệ & Cập nhật',
            items: [
                {
                    id: 'dpo',
                    title: 'Liên hệ bộ phận bảo mật',
                    description: 'Nếu có thắc mắc về quyền riêng tư, hãy gửi email đến privacy@example.com để được hỗ trợ.',
                    icon: 'mail-outline',
                },
                {
                    id: 'updates',
                    title: 'Cập nhật chính sách',
                    description: 'Chính sách này có thể được cập nhật định kỳ. Chúng tôi sẽ thông báo qua email hoặc thông báo trong ứng dụng khi có thay đổi quan trọng.',
                    icon: 'document-text-outline',
                },
                {
                    id: 'effective',
                    title: 'Ngày có hiệu lực',
                    description: 'Chính sách quyền riêng tư này có hiệu lực từ ngày 1 tháng 1 năm 2025.',
                    icon: 'calendar-outline',
                },
            ],
        },
    ];

    return (
        <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
            <AppHeader title="Quyền riêng tư" variant="default" />
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
                        <Ionicons name="shield-outline" size={18} color="#334155" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-app-fg dark:text-app-fg-dark mb-1">
                            Cam kết bảo vệ quyền riêng tư
                        </Text>
                        <Text className="text-[12px] leading-[18px] text-app-muted-fg dark:text-app-muted-fg-dark">
                            Chúng tôi tin rằng quyền riêng tư là quyền cơ bản. Chính sách này giải thích rõ ràng cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
                        </Text>
                    </View>
                </View>

                {/* Sections */}
                {privacySections.map((section) => (
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