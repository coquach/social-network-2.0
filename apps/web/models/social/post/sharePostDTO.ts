import z from 'zod';
import { PostDTO, PostSnapshotDTO } from './postDTO';
import { Audience, ReactionType } from '../enums/social.enum';

export const SharePostSchema = z.object({
  postId: z.uuid(),
  audience: z.enum(Audience).optional(),
  content: z.string().min(1).max(2000, 'Mô tả quá dài!'),
});

export type CreateSharePostForm = z.infer<typeof SharePostSchema>;

export const UpdateSharePostSchema = SharePostSchema.partial().extend({});

export type UpdateSharePostForm = z.infer<typeof UpdateSharePostSchema>;

export interface SharePostStatDTO {
  reactions: number;
  likes: number;
  loves: number;
  hahas: number;
  wows: number;
  angrys: number;
  sads: number;
  comments: number;
}

export interface SharePostDTO {
  id: string;
  userId: string;
  audience: Audience;
  content: string;
  post: PostDTO;
  createdAt: Date;
  updatedAt: Date;
  shareStat: SharePostStatDTO;
  reactedType?: ReactionType;
}

export interface SharePostSnapshotDTO {
  shareId: string;
  userId: string;
  audience: Audience;
  content?: string;
  post: PostSnapshotDTO;
  createdAt: Date;
  reactedType?: ReactionType;
  shareStat?: SharePostStatDTO;
}
