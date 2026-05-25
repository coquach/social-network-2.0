import { MediaDTO, MediaType } from '@repo/shared';
import { z } from 'zod';

export enum MusicGenre {
  LOFI = 'lofi',
  EDM = 'edm',
  POP = 'pop',
  ACOUSTIC = 'acoustic',
  ROCK = 'rock',
  OTHER = 'other',
}

// ==================== AUDIO ====================

export const AudioSchema = z
  .object({
    url: z.string().min(1),
    publicId: z.string().min(1),
    duration: z.number().optional(),
  })
  .strip();

export type AudioDTO = z.infer<typeof AudioSchema>;

// ==================== RESPONSE ====================

export interface MusicFeatureResponseDTO {
  id: string;

  audio: AudioDTO;

  coverImage: MediaDTO;

  artist?: string;

  title: string;

  genre?: MusicGenre;

  valence: number;

  arousal: number;

  createdAt: Date;
}

// ==================== CREATE ====================

export const CreateMusicFeatureSchema = z
  .object({
    audio: AudioSchema,

    coverImage: z
      .array(
        z.object({
          type: z.enum(MediaType),
          url: z.url(),
          publicId: z.string().optional(),
        }),
      )
      .optional(),

    artist: z.string().optional(),

    title: z.string().min(1, 'Title is required'),

    genre: z.nativeEnum(MusicGenre).optional(),

    valence: z.number(),

    arousal: z.number(),
  })
  .strip();

export type CreateMusicFeatureDTO = z.infer<typeof CreateMusicFeatureSchema>;

// ==================== UPDATE ====================

export const UpdateMusicFeatureSchema = z
  .object({
    coverImage: z
      .array(
        z.object({
          type: z.enum(MediaType),
          url: z.url(),
          publicId: z.string().optional(),
        }),
      )
      .optional(),

    artist: z.string().optional(),

    title: z.string().optional(),

    genre: z.nativeEnum(MusicGenre).optional(),

    valence: z.number().optional(),

    arousal: z.number().optional(),
  })
  .strip();

export type UpdateMusicFeatureDTO = z.infer<typeof UpdateMusicFeatureSchema>;

// ==================== ANALYZE ====================

export const AnalyzeMusicSchema = z
  .object({
    url: z.string().url(),
  })
  .strip();

export type AnalyzeMusicDTO = z.infer<typeof AnalyzeMusicSchema>;

export interface AnalyzeMusicResponseDTO {
  success: boolean;

  result: {
    valence: number;
    arousal: number;
  } | null;
}
