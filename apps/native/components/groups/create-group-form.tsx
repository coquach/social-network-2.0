import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Import các Interface và Enum từ shared của bạn
import { useCreateGroup } from '@repo/shared/hooks';
import { CreateGroupInput, GroupPrivacy, MediaType } from '@repo/shared/types';

interface CreateGroupFormProps {
    onClose: () => void;
}

export const CreateGroupForm = ({ onClose }: CreateGroupFormProps) => {
    const router = useRouter();
    const { mutate: createGroup, isPending } = useCreateGroup();

    // State để hiển thị ảnh preview local
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const { control, handleSubmit, setValue } = useForm<CreateGroupInput>({
        defaultValues: {
            name: '',
            description: '',
            privacy: GroupPrivacy.PUBLIC,
            rules: '',
        },
    });

    // Hàm chọn ảnh từ thư viện
    const handlePickImage = async (type: 'avatar' | 'coverImage') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const fileData = {
                uri,
                type: 'image/jpeg',
                name: type === 'avatar' ? 'avatar.jpg' : 'cover.jpg',
            };

            if (type === 'avatar') {
                setAvatarPreview(uri);
                // Gán vào field uploadAvatar (tương ứng với hook useCreateGroup)
                (setValue as any)('uploadAvatar', fileData);
            } else {
                setCoverPreview(uri);
                (setValue as any)('uploadCover', fileData);
            }
        }
    };

    const onSubmit = (data: CreateGroupInput) => {
        if (!data.name) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên nhóm');
            return;
        }

        createGroup(data, {
            onSuccess: () => {
                Alert.alert('Thành công', 'Nhóm của bạn đã được tạo.');
                onClose();
            },
            onError: (error) => {
                Alert.alert('Lỗi', error.message || 'Không thể tạo nhóm');
            },
        });
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            {/* 1. Stickey Header dành cho Modal */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={26} color="#64748b" />
                </TouchableOpacity>

                <Text className="text-lg font-bold text-slate-900 dark:text-white">Tạo nhóm mới</Text>

                {/* Nút Tạo nhanh ở góc phải nếu muốn (Optional) */}
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending}>
                    <Text className={`font-bold ${isPending ? 'text-slate-300' : 'text-sky-500'}`}>Tạo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="p-5 gap-6">
                    {/* Subtitle giới thiệu */}
                    <View className="mb-2">
                        <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5">
                            Tạo một cộng đồng mới để kết nối mọi người, chia sẻ nội dung và tương tác trong hệ thống SE-CV.
                        </Text>
                    </View>

                    {/* 2. Image Pickers Section (Avatar & Cover) */}
                    <View className="flex-row gap-4 items-end">
                        <View className="gap-2">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Ảnh đại diện</Text>
                            <TouchableOpacity
                                onPress={() => handlePickImage('avatar')}
                                className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden"
                            >
                                {avatarPreview ? (
                                    <Image source={{ uri: avatarPreview }} className="w-full h-full" />
                                ) : (
                                    <Ionicons name="camera-outline" size={28} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 gap-2">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Ảnh bìa nhóm</Text>
                            <TouchableOpacity
                                onPress={() => handlePickImage('coverImage')}
                                className="h-24 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden"
                            >
                                {coverPreview ? (
                                    <Image source={{ uri: coverPreview }} className="w-full h-full" />
                                ) : (
                                    <Ionicons name="image-outline" size={28} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. Group Name Input */}
                    <View className="gap-2">
                        <View className="flex-row">
                            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên nhóm</Text>
                            <Text className="text-red-500 ml-1">*</Text>
                        </View>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="Ví dụ: Lập trình .NET & NestJS UIT"
                                    placeholderTextColor="#94a3b8"
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>

                    {/* 4. Description Input */}
                    <View className="gap-2">
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Mô tả nhóm</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="Giới thiệu ngắn gọn về mục đích của nhóm..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white h-28"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>

                    {/* 5. Privacy Selector */}
                    <View className="gap-2">
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Chế độ riêng tư</Text>
                        <Controller
                            control={control}
                            name="privacy"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row gap-2">
                                    {[
                                        { label: 'Công khai', val: GroupPrivacy.PUBLIC, icon: 'earth-outline' },
                                        { label: 'Riêng tư', val: GroupPrivacy.PRIVATE, icon: 'lock-closed-outline' },
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.val}
                                            onPress={() => onChange(item.val)}
                                            className={`flex-1 p-4 rounded-2xl border flex-row items-center justify-center gap-2 ${value === item.val
                                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                                                }`}
                                        >
                                            <Ionicons
                                                name={item.icon as any}
                                                size={18}
                                                color={value === item.val ? '#0ea5e9' : '#94a3b8'}
                                            />
                                            <Text className={`font-bold ${value === item.val ? 'text-sky-600' : 'text-slate-500'}`}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        />
                    </View>

                    {/* 6. Rules Input */}
                    <View className="gap-2">
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Nội quy (Tùy chọn)</Text>
                        <Controller
                            control={control}
                            name="rules"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="Ví dụ: Không spam, tôn trọng các thành viên..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white h-24"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>

                    {/* 7. Bottom Action Buttons */}
                    <View className="flex-row gap-3 mt-4 mb-12">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 h-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"
                        >
                            <Text className="font-bold text-slate-600 dark:text-slate-400">Hủy bỏ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isPending}
                            className={`flex-[2] h-14 items-center justify-center rounded-2xl ${isPending ? 'bg-sky-300' : 'bg-sky-500 shadow-md shadow-sky-200'
                                }`}
                        >
                            <Text className="font-bold text-white text-lg">
                                {isPending ? 'Đang tạo nhóm...' : 'Xác nhận tạo'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};