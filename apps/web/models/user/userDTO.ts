import { z } from 'zod';

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

const interestSchema = z.enum(INTEREST_OPTIONS);

export const UserSchema = z.object({
  id: z.string(),
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
  interests: z.array(interestSchema).optional(),
});

export const ProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Tên là bắt buộc')
    .max(100, 'Tên tối đa 100 ký tự'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Họ và tên đệm là bắt buộc')
    .max(100, 'Họ và tên đệm tối đa 100 ký tự'),
  bio: z
    .string()
    .trim()
    .max(255, 'Tiểu sử tối đa 255 ký tự')
    .optional(),
  location: z
    .string()
    .trim()
    .max(120, 'Khu vực tối đa 120 ký tự')
    .optional(),
  jobTitle: z
    .string()
    .trim()
    .max(120, 'Chức danh tối đa 120 ký tự')
    .optional(),
  company: z
    .string()
    .trim()
    .max(120, 'Công ty tối đa 120 ký tự')
    .optional(),
  school: z
    .string()
    .trim()
    .max(120, 'Trường học tối đa 120 ký tự')
    .optional(),
  interests: z
    .array(interestSchema)
    .max(10, 'Chỉ chọn tối đa 10 sở thích')
    .optional(),
  avatarUrl: z.union([z.url(), z.instanceof(File)]).optional(),
  coverImageUrl: z.union([z.url(), z.instanceof(File)]).optional(),
  isActive: z.boolean().optional(),
});

export type UserCreateForm = z.infer<typeof UserSchema>;
export type ProfileUpdateForm = z.infer<typeof ProfileUpdateSchema>;

export type { UserDTO } from '@repo/shared';
