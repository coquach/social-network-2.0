/**
 * Share Types
 * Platform-agnostic share-related type definitions
 */

import type { Audience, ReactionType } from './enums';
import type { PostDTO, PostSnapshotDTO } from './post.types';
import type { CursorPagination } from './common.types';

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

export interface CreateShareInput {
  postId: string;
  content?: string;
  audience?: Audience;
}

export interface UpdateShareInput {
  content?: string;
  audience?: Audience;
}

export interface GetShareQueryParams extends CursorPagination {
  userId?: string;
  postId?: string;
  audience?: Audience;
}
