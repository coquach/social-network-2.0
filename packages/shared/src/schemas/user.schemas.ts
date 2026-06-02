import { z } from 'zod';
import { PrivacyLevel, MessagePrivacy } from '../types/user.types';

export const UserPrivacySettingsSchema = z.object({
  profileVisibility: z.nativeEnum(PrivacyLevel),
  messagePrivacy: z.nativeEnum(MessagePrivacy),
  friendListVisibility: z.nativeEnum(PrivacyLevel),
});

export const INTEREST_OPTIONS = [
  'Công nghệ',
  'Thiết kế',
  'Kinh doanh',
  'Khởi nghiệp',
  'Marketing',
  'Nhiếp ảnh',
  'Du lịch',
  'Âm nhạc',
  'Điện ảnh',
  'Sách',
  'Game',
  'Thể thao',
  'Bóng đá',
  'Chạy bộ',
  'Gym',
  'Yoga',
  'Nấu ăn',
  'Cà phê',
  'Tình nguyện',
  'Ngoại ngữ',
] as const;

export const InterestSchema = z.enum(INTEREST_OPTIONS);

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  coverImageUrl: z.string().optional(),
  coverImage: z
    .object({
      url: z.string().optional(),
      publicId: z.string().optional(),
    })
    .optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  school: z.string().optional(),
  interests: z.array(InterestSchema).optional(),
  privacySettings: UserPrivacySettingsSchema.optional(),
});

export const UpdateUserInputSchema = z.object({
  firstName: z.string().trim().min(1, 'Tên là bắt buộc').max(100, 'Tên tối đa 100 ký tự').optional(),
  lastName: z
    .string()
    .trim()
    .min(1, 'Họ và tên đệm là bắt buộc')
    .max(100, 'Họ và tên đệm tối đa 100 ký tự')
    .optional(),
  bio: z.string().trim().max(255, 'Tiểu sử tối đa 255 ký tự').optional(),
  location: z.string().trim().max(120, 'Khu vực tối đa 120 ký tự').optional(),
  jobTitle: z.string().trim().max(120, 'Chức danh tối đa 120 ký tự').optional(),
  company: z.string().trim().max(120, 'Công ty tối đa 120 ký tự').optional(),
  school: z.string().trim().max(120, 'Trường học tối đa 120 ký tự').optional(),
  interests: z.array(InterestSchema).max(10, 'Chỉ chọn tối đa 10 sở thích').optional(),
  avatarUrl: z.url().optional(),
  coverImageUrl: z.url().optional(),
  isActive: z.boolean().optional(),
  privacySettings: UserPrivacySettingsSchema.optional(),
});
