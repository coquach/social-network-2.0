import z from 'zod';
import { Audience, Emotion, MediaDTO, MediaType, ReactionType } from '../enums/social.enum';




export const PostSchema = z.object({
  groupId: z.string().optional(),
  feeling: z.enum(Emotion).optional(),
  content: z
    .string()
    .min(1, 'Content cannot empty')
    .max(2000, 'Content is too long'),
  media: z
    .array(
      z.object({
        type: z.enum(MediaType),
        url : z.url(),
        publicId: z.string().optional(),
      })
    )
    .optional(),
  audience: z.enum(Audience).default(Audience.PUBLIC),
});

export type CreatePostForm = z.infer<typeof PostSchema>

export const UpdatePostSchema = PostSchema.partial().extend({})

export type UpdatePostForm = z.infer<typeof UpdatePostSchema>


export interface PostStatDTO  {
  reactions: number,
  likes: number,
  loves: number,
  hahas: number,
  wows: number,
  angrys: number,
  sads: number,
  comments: number,
  shares: number
} 

interface GroupInfoDTO {
  id: string,
  name: string,
  avatarUrl?: string,
}


export interface PostDTO {
  id: string,
  userId: string,
  group?: GroupInfoDTO,
  content: string,
  media: MediaDTO[],
  feeling: Emotion,
  audience: Audience,
  postStat: PostStatDTO,
  createdAt: Date,
  updatedAt: Date,
  reactedType?: ReactionType
}


export interface PostSnapshotDTO {
  postId: string,
  userId: string,
  group?: GroupInfoDTO,
  content?: string,
  audience: Audience,
  mediaPreviews?: MediaDTO[],
  mediaRemaining?: number,
  mainEmotion?: Emotion,
  postStat?: PostStatDTO,
  reactedType?: ReactionType,
  createdAt: Date,

}

export interface EditHistoryDTO {
  id: string,
  oldContent: string,
  editAt: Date,
}



