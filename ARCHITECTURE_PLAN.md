# Kế hoạch Migration - Kiến trúc Turborepo
**Dự án: Social Network 2.0**  
**Ngày: March 7, 2026**

---

## 📊 Phân tích Cấu trúc Hiện tại

### Web App Structure (apps/web)
```
apps/web/
├── app/                    # Next.js App Router (pages & layouts)
├── components/             # UI Components (platform-specific)
├── lib/                    # Business Logic & Actions
│   ├── actions/           # Server actions (social, chat, notification, etc.)
│   ├── types/             # TypeScript types & DTOs
│   ├── auth/              # Authentication logic
│   ├── api-client.ts      # Axios instance
│   ├── query-client.ts    # React Query config
│   └── utils              # Utility functions
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
├── utils/                  # Helper functions
├── models/                 # Data models & DTOs
├── config/                 # Configuration
└── contexts/               # React contexts
```

### Tech Stack Hiện tại
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **State Management**: React Query + Zustand
- **API Client**: Axios
- **UI Library**: Radix UI
- **Styling**: Tailwind CSS + CSS Modules
- **Form**: React Hook Form + Zod
- **File Upload**: Cloudinary

---

## 🎯 Mục tiêu Migration

### 1. Tạo Monorepo Structure
```
social-network-2.0/
├── apps/
│   ├── web/              # Next.js (keep platform-specific code)
│   └── native/           # Expo React Native
├── packages/
│   ├── shared/           # 🆕 Shared business logic
│   │   ├── api/          # API client & services
│   │   ├── types/        # Shared types & DTOs
│   │   ├── hooks/        # Platform-agnostic hooks
│   │   ├── utils/        # Utility functions
│   │   ├── constants/    # Constants & configs
│   │   └── store/        # State management
│   ├── ui/               # Shared UI components (React Native)
│   └── typescript-config/
```

### 2. Tách Business Logic
- ✅ API client và HTTP configuration
- ✅ All service layers (posts, users, comments, etc.)
- ✅ Types, DTOs, Enums
- ✅ Utility functions (formatting, validation)
- ✅ Custom hooks (data fetching)
- ✅ State management stores
- ✅ Constants và configurations

### 3. Giữ Platform-Specific
- ❌ Next.js pages và layouts (apps/web/app)
- ❌ Web-only components (apps/web/components)
- ❌ Clerk authentication wrapper (web-specific)
- ❌ Next.js middleware
- ❌ Server actions (Next.js specific)
- ❌ SSR logic

---

## 📦 Chi tiết Migration Plan

### Phase 1: Setup Shared Package Infrastructure

#### 1.1. Tạo packages/shared structure
```bash
packages/shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── api/
│   │   ├── client.ts              # Base axios client
│   │   ├── interceptors.ts        # Request/response interceptors
│   │   └── services/
│   │       ├── post.service.ts
│   │       ├── user.service.ts
│   │       ├── comment.service.ts
│   │       ├── reaction.service.ts
│   │       ├── friend.service.ts
│   │       ├── notification.service.ts
│   │       ├── chat.service.ts
│   │       └── group.service.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── post.types.ts
│   │   ├── user.types.ts
│   │   ├── comment.types.ts
│   │   ├── reaction.types.ts
│   │   ├── notification.types.ts
│   │   ├── chat.types.ts
│   │   ├── media.types.ts
│   │   ├── pagination.types.ts
│   │   └── enums.ts
│   ├── hooks/
│   │   ├── usePost.ts
│   │   ├── useUser.ts
│   │   ├── useComment.ts
│   │   ├── useReaction.ts
│   │   ├── useFriends.ts
│   │   ├── useNotifications.ts
│   │   ├── useChat.ts
│   │   └── useAuth.ts
│   ├── utils/
│   │   ├── format.ts              # Date, number formatting
│   │   ├── validation.ts          # Input validation
│   │   ├── string.ts              # String utilities
│   │   ├── media.ts               # Media processing
│   │   └── pagination.ts          # Pagination helpers
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── notification.store.ts
│   │   ├── chat.store.ts
│   │   └── post.store.ts
│   └── constants/
│       ├── api-endpoints.ts
│       ├── validation-rules.ts
│       └── app-config.ts
```

#### 1.2. Dependencies cho shared package
```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "zustand": "^4.4.0",
    "date-fns": "^4.1.0",
    "@tanstack/react-query": "^5.90.2"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

---

### Phase 2: Migrate Core Types & DTOs

#### 2.1. Migration Mapping

| Từ (Web)                          | Đến (Shared)                           |
|-----------------------------------|----------------------------------------|
| `models/social/post/postDTO.ts`   | `types/post.types.ts`                  |
| `models/user/userDTO.ts`          | `types/user.types.ts`                  |
| `models/social/comment/`          | `types/comment.types.ts`               |
| `models/social/reaction/`         | `types/reaction.types.ts`              |
| `models/notification/`            | `types/notification.types.ts`          |
| `models/chat/`                    | `types/chat.types.ts`                  |
| `lib/types/media.ts`              | `types/media.types.ts`                 |
| `lib/cursor-pagination.dto.ts`    | `types/pagination.types.ts`            |
| `models/social/enums/social.enum` | `types/enums.ts`                       |

#### 2.2. Ví dụ Migration (Post Types)

**Trước (apps/web/models/social/post/postDTO.ts):**
```typescript
// In web app - tightly coupled with Clerk
export interface PostDTO {
  id: string;
  content: string;
  authorId: string;
  // ... other fields
}
```

**Sau (packages/shared/src/types/post.types.ts):**
```typescript
// Platform-agnostic types
export interface Post {
  id: string;
  content: string;
  author: User;
  media?: MediaItem[];
  reactions: ReactionCount[];
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  groupId?: string;
  feeling?: Feeling;
  audience: PostAudience;
}

export interface CreatePostInput {
  content: string;
  media?: MediaItem[];
  groupId?: string;
  feeling?: string;
  audience: PostAudience;
}

export interface UpdatePostInput {
  content?: string;
  audience?: PostAudience;
}

export type PostAudience = 'public' | 'friends' | 'private';
```

---

### Phase 3: Migrate API Client & Services

#### 3.1. Base API Client

**File: packages/shared/src/api/client.ts**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  getAuthToken?: () => Promise<string | null>;
}

export class ApiClient {
  private client: AxiosInstance;
  private getAuthToken?: () => Promise<string | null>;

  constructor(config: ApiConfig) {
    this.getAuthToken = config.getAuthToken;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - inject auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Get token from platform-specific implementation
        if (this.getAuthToken) {
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle 401 - token refresh logic
        if (error.response?.status === 401) {
          // Platform will handle logout
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Singleton instance - will be initialized by apps
let apiClientInstance: ApiClient | null = null;

export const initializeApiClient = (config: ApiConfig) => {
  apiClientInstance = new ApiClient(config);
  return apiClientInstance;
};

export const getApiClient = () => {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call initializeApiClient first.');
  }
  return apiClientInstance;
};
```

#### 3.2. Service Layer - Post Service

**File: packages/shared/src/api/services/post.service.ts**
```typescript
import { getApiClient } from '../client';
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  CursorPaginatedResponse,
} from '../../types';

export const postService = {
  // Get posts (feed)
  async getPosts(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<Post>> {
    return getApiClient().get('/posts', { params });
  },

  // Get single post
  async getPost(postId: string): Promise<Post> {
    return getApiClient().get(`/posts/${postId}`);
  },

  // Create post
  async createPost(data: CreatePostInput): Promise<Post> {
    return getApiClient().post('/posts', data);
  },

  // Update post
  async updatePost(postId: string, data: UpdatePostInput): Promise<Post> {
    return getApiClient().patch(`/posts/${postId}`, data);
  },

  // Delete post
  async deletePost(postId: string): Promise<void> {
    return getApiClient().delete(`/posts/${postId}`);
  },

  // Get user posts
  async getUserPosts(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPaginatedResponse<Post>> {
    return getApiClient().get(`/users/${userId}/posts`, { params });
  },

  // Get group posts
  async getGroupPosts(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPaginatedResponse<Post>> {
    return getApiClient().get(`/groups/${groupId}/posts`, { params });
  },

  // React to post
  async reactToPost(postId: string, reactionType: string): Promise<void> {
    return getApiClient().post(`/posts/${postId}/reactions`, { reactionType });
  },

  // Remove reaction
  async removeReaction(postId: string): Promise<void> {
    return getApiClient().delete(`/posts/${postId}/reactions`);
  },

  // Share post
  async sharePost(postId: string, content?: string): Promise<Post> {
    return getApiClient().post(`/posts/${postId}/share`, { content });
  },
};
```

#### 3.3. Migration List - All Services

**Cần tạo các service files:**

1. ✅ `post.service.ts` - CRUD posts, reactions, shares
2. ✅ `user.service.ts` - User profile, follow, search
3. ✅ `comment.service.ts` - Comments, replies, reactions
4. ✅ `friend.service.ts` - Friend requests, accept, reject
5. ✅ `notification.service.ts` - Get notifications, mark read
6. ✅ `chat.service.ts` - Conversations, messages
7. ✅ `group.service.ts` - Group CRUD, members, posts
8. ✅ `search.service.ts` - Search posts, users, groups
9. ✅ `emotion.service.ts` - Emotion journal (nếu có)

---

### Phase 4: Migrate Custom Hooks

#### 4.1. Migration Strategy for Hooks

**Trước (apps/web/hooks/use-post-hook.ts):**
```typescript
'use client';
import { useAuth } from '@clerk/nextjs'; // Web-specific
import { useQuery } from '@tanstack/react-query';

export const useGetPost = (postId: string) => {
  const { getToken } = useAuth(); // Clerk-specific
  return useQuery<PostDTO>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: async () => {
      const token = await getToken();
      return getPost(postId, token);
    },
  });
};
```

**Sau (packages/shared/src/hooks/usePost.ts):**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../api/services/post.service';
import type { Post, CreatePostInput, UpdatePostInput } from '../types';

// Query keys - reusable
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: string) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  userPosts: (userId: string) => [...postKeys.all, 'user', userId] as const,
};

// Get single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
  });
};

// Get posts feed (infinite query)
export const usePostsFeed = () => {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam }) =>
      postService.getPosts({ cursor: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostInput) => postService.createPost(data),
    onSuccess: () => {
      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Update post mutation
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: UpdatePostInput }) =>
      postService.updatePost(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// React to post
export const useReactToPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      postService.reactToPost(postId, reactionType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
    },
  });
};
```

#### 4.2. Hooks cần migrate

**Priority List:**
1. ✅ `usePost` - Post CRUD và reactions
2. ✅ `useComment` - Comment CRUD
3. ✅ `useUser` - User profile, follow
4. ✅ `useFriends` - Friend management
5. ✅ `useNotifications` - Notifications
6. ✅ `useChat` - Messages & conversations
7. ✅ `useSearch` - Search functionality
8. ✅ `useGroup` - Group management

---

### Phase 5: Migrate Utilities

#### 5.1. Core Utilities to Migrate

**From apps/web/utils/ to packages/shared/src/utils/**

| File (Web)              | File (Shared)        | Purpose                      |
|-------------------------|----------------------|------------------------------|
| `format-count.ts`       | `format.ts`          | Number formatting (1.2K)     |
| `count-chars.ts`        | `string.ts`          | String utilities             |
| `user.utils.ts`         | `user.ts`            | User-related utilities       |
| `constants.ts`          | `constants/`         | App constants                |
| Custom validators       | `validation.ts`      | Input validation             |

**Example: packages/shared/src/utils/format.ts**
```typescript
// Date formatting
export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(d);
};

// Number formatting
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Text truncation
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
```

---

### Phase 6: Migrate State Management (Zustand)

#### 6.1. Zustand Stores Migration

**From apps/web/store/ to packages/shared/src/store/**

**Example: packages/shared/src/store/notification.store.ts**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  hasNewNotification: boolean;
  
  // Actions
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setHasNewNotification: (value: boolean) => void;
}

// Platform-agnostic storage
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return createJSONStorage(() => localStorage);
  }
  return undefined;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      unreadCount: 0,
      notifications: [],
      hasNewNotification: false,

      setUnreadCount: (count) => set({ unreadCount: count }),
      
      incrementUnreadCount: () =>
        set((state) => ({
          unreadCount: state.unreadCount + 1,
          hasNewNotification: true,
        })),
      
      resetUnreadCount: () =>
        set({ unreadCount: 0, hasNewNotification: false }),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      
      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        })),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),
      
      setHasNewNotification: (value) =>
        set({ hasNewNotification: value }),
    }),
    {
      name: 'notification-storage',
      storage: getStorage(),
    }
  )
);
```

**Stores cần migrate:**
1. ✅ `notification.store.ts` - Notification state
2. ✅ `chat.store.ts` - Chat/messaging state
3. ✅ `post.store.ts` - Post-related state (if any)

---

### Phase 7: Update Web App Configuration

#### 7.1. Update apps/web/package.json

```json
{
  "name": "web",
  "dependencies": {
    "@repo/shared": "workspace:*",
    "@repo/ui": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    
    // Keep web-specific
    "@clerk/nextjs": "^6.31.10",
    "next": "^15.5.9",
    "next-cloudinary": "^6.17.0",
    
    // Remove (now in shared)
    // "axios": "^1.12.2" - moved to shared
    // "zustand": "^4.4.0" - moved to shared
  }
}
```

#### 7.2. Update apps/web/tsconfig.json

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@repo/shared": ["../../packages/shared/src"],
      "@repo/shared/*": ["../../packages/shared/src/*"],
      "@repo/ui": ["../../packages/ui/src"]
    }
  }
}
```

#### 7.3. Initialize API Client in Web App

**File: apps/web/lib/api-client-init.ts**
```typescript
'use client';

import { initializeApiClient } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';

// Initialize once with Clerk token getter
export const useInitApiClient = () => {
  const { getToken } = useAuth();
  
  React.useEffect(() => {
    initializeApiClient({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL!,
      timeout: 10000,
      getAuthToken: async () => {
        const token = await getToken();
        return token;
      },
    });
  }, [getToken]);
};
```

**File: apps/web/app/layout.tsx**
```typescript
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClientProvider } from '@tanstack/react-query';
import { useInitApiClient } from '@/lib/api-client-init';
import { getQueryClient } from '@repo/shared';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <QueryClientProvider client={queryClient}>
            <ApiInitializer />
            {children}
          </QueryClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

function ApiInitializer() {
  useInitApiClient();
  return null;
}
```

#### 7.4. Update Web Components to Use Shared Hooks

**Before:**
```typescript
// apps/web/components/post-list.tsx
import { useGetPosts } from '@/hooks/use-post-hook';

export function PostList() {
  const { data: posts, isLoading } = useGetPosts();
  // ...
}
```

**After:**
```typescript
// apps/web/components/post-list.tsx
import { usePostsFeed } from '@repo/shared';

export function PostList() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePostsFeed();
  const posts = data?.pages.flatMap(page => page.data) ?? [];
  // ...
}
```

---

### Phase 8: Configure Expo App

#### 8.1. Initialize API Client in Expo

**File: apps/native/lib/api-client-init.ts**
```typescript
import { initializeApiClient } from '@repo/shared';
import * as SecureStore from 'expo-secure-store';

// Get token from SecureStore
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Initialize API client for Expo
export const initializeExpoApiClient = () => {
  initializeApiClient({
    baseURL: process.env.EXPO_PUBLIC_API_URL!,
    timeout: 10000,
    getAuthToken,
  });
};
```

**File: apps/native/app/_layout.tsx**
```typescript
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@repo/shared';
import { initializeExpoApiClient } from '@/lib/api-client-init';
import { useEffect } from 'react';

export default function RootLayout() {
  const queryClient = getQueryClient();
  
  useEffect(() => {
    initializeExpoApiClient();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

#### 8.2. Use Shared Hooks in Expo

**File: apps/native/app/index.tsx**
```typescript
import { View, FlatList } from 'react-native';
import { usePostsFeed, Post } from '@repo/shared';
import { PostCard } from '@/components/PostCard';

export default function HomeScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePostsFeed();
  
  const posts = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        refreshing={isLoading}
      />
    </View>
  );
}
```

---

## 📋 Migration Checklist

### Phase 1: Infrastructure ✅
- [ ] Tạo `packages/shared` structure
- [ ] Setup package.json và tsconfig
- [ ] Configure build scripts
- [ ] Add to turborepo workspaces

### Phase 2: Types & DTOs ✅
- [ ] Migrate Post types
- [ ] Migrate User types
- [ ] Migrate Comment types
- [ ] Migrate Reaction types
- [ ] Migrate Notification types
- [ ] Migrate Chat types
- [ ] Migrate Media types
- [ ] Migrate Pagination types
- [ ] Migrate Enums

### Phase 3: API Layer ✅
- [ ] Create base API client
- [ ] Setup interceptors
- [ ] Migrate Post service
- [ ] Migrate User service
- [ ] Migrate Comment service
- [ ] Migrate Friend service
- [ ] Migrate Notification service
- [ ] Migrate Chat service
- [ ] Migrate Group service
- [ ] Migrate Search service

### Phase 4: Hooks ✅
- [ ] Migrate usePost hooks
- [ ] Migrate useUser hooks
- [ ] Migrate useComment hooks
- [ ] Migrate useFriend hooks
- [ ] Migrate useNotification hooks
- [ ] Migrate useChat hooks
- [ ] Migrate useSearch hooks

### Phase 5: Utilities ✅
- [ ] Migrate format utilities
- [ ] Migrate validation utilities
- [ ] Migrate string utilities
- [ ] Migrate date utilities

### Phase 6: State Management ✅
- [ ] Migrate notification store
- [ ] Migrate chat store
- [ ] Configure platform-specific storage

### Phase 7: Web App Updates ✅
- [ ] Update package.json
- [ ] Update tsconfig.json
- [ ] Initialize API client with Clerk
- [ ] Update components to use shared hooks
- [ ] Update imports across codebase
- [ ] Test all features

### Phase 8: Expo Configuration ✅
- [ ] Setup metro config for monorepo
- [ ] Initialize API client
- [ ] Create screen components
- [ ] Implement navigation
- [ ] Test shared hooks
- [ ] Test state management

---

## 🚀 Implementation Timeline

### Week 1: Setup & Core Types
- Days 1-2: Create shared package structure
- Days 3-4: Migrate types and DTOs
- Day 5: Setup API client base

### Week 2: Services & Hooks
- Days 1-3: Migrate all API services
- Days 4-5: Migrate custom hooks

### Week 3: Utils & State
- Days 1-2: Migrate utilities
- Days 3-4: Migrate state management
- Day 5: Documentation

### Week 4: Integration & Testing
- Days 1-2: Update web app
- Days 3-4: Configure Expo app
- Day 5: End-to-end testing

---

## ⚠️ Important Considerations

### 1. Authentication Strategy
- **Web**: Continue using Clerk
- **Mobile**: Need to implement custom auth or use Clerk Expo SDK
- **Shared**: API client accepts token getter function

### 2. File Upload
- **Web**: Continue using Cloudinary with Next.js
- **Mobile**: Need Expo Image Picker + upload to same Cloudinary
- **Shared**: Service layer accepts file URLs, upload logic stays platform-specific

### 3. Real-time Features
- If using WebSockets/Socket.io, keep connection logic platform-specific
- Share message/notification data structures
- Share event handlers where possible

### 4. Platform-Specific Code
Keep these web-only:
- Next.js Server Actions
- Middleware
- SSR/SSG logic
- Next.js Image optimization

Keep these mobile-only:
- Native modules (Camera, Location, etc.)
- Navigation (Expo Router vs Next.js App Router)
- Platform UI components

### 5. Environment Variables
- Web: `NEXT_PUBLIC_*`
- Expo: `EXPO_PUBLIC_*`
- Backend URL must be accessible from both platforms

---

## 📝 Best Practices

1. **Type Safety**: Use TypeScript strict mode
2. **Error Handling**: Consistent error handling in shared code
3. **Testing**: Write tests for shared logic
4. **Documentation**: Document all shared APIs
5. **Version Control**: Use semantic versioning for packages
6. **Code Review**: Review all migrations thoroughly
7. **Gradual Migration**: Migrate module by module, not all at once

---

## 🔍 Example: Complete Flow

### Creating a Post (Both Platforms)

**1. Shared Hook (packages/shared)**
```typescript
export const useCreatePost = () => {
  return useMutation({
    mutationFn: (data: CreatePostInput) => postService.createPost(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      return newPost;
    },
  });
};
```

**2. Web Component**
```typescript
// apps/web/components/create-post.tsx
import { useCreatePost } from '@repo/shared';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Web-specific

export function CreatePost() {
  const { mutate, isPending } = useCreatePost();
  
  const handleSubmit = async (content: string, files: File[]) => {
    // Upload files (web-specific)
    const media = await uploadToCloudinary(files);
    
    // Create post (shared logic)
    mutate({
      content,
      media: media.map(m => ({ url: m.url, type: m.type })),
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**3. Mobile Component**
```typescript
// apps/native/components/CreatePost.tsx
import { useCreatePost } from '@repo/shared';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Mobile-specific
import * as ImagePicker from 'expo-image-picker';

export function CreatePost() {
  const { mutate, isPending } = useCreatePost();
  
  const handleSubmit = async (content: string) => {
    // Pick images (mobile-specific)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    
    if (!result.canceled) {
      // Upload files (mobile-specific)
      const media = await uploadToCloudinary(result.assets);
      
      // Create post (shared logic)
      mutate({
        content,
        media: media.map(m => ({ url: m.url, type: 'image' })),
      });
    }
  };
  
  return <View>...</View>;
}
```

---

## 🎯 Success Criteria

### Technical Success
- ✅ Zero duplication of business logic
- ✅ Both apps can create, view, update posts
- ✅ Authentication works on both platforms
- ✅ Real-time updates synchronized
- ✅ All tests passing
- ✅ TypeScript compilation successful

### Business Success
- ✅ Feature parity between web and mobile
- ✅ Faster development of new features
- ✅ Easier maintenance
- ✅ Code reusability > 60%

---

**Next Steps: Begin Phase 1 - Setup Shared Package**
