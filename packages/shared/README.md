# @repo/shared

## Overview
Shared client logic and data layer package for Sentimeta, providing platform-agnostic API client services, Zod validation schemas, Zustand state stores, React Query hooks, React contexts, and domain TypeScript types shared across the Web (`apps/web`) and Mobile (`apps/native`) clients.

## Interface
- **API Services** (`./src/api`): `ApiClient`, `chatbotService`, `userService`, `postService`, `chatService`, `emotionService`, `callService`, `commentService`, `conversationService`, `feedService`, `friendService`, `groupService`, `messageService`, `moderationService`, `musicService`, `notificationService`, `reactionService`, `searchService`, `shareService`, `userActivityService`
- **React Contexts** (`./src/contexts`): `AuthContext`, `SocketContext`, `UploadContext`
- **Zustand State Stores** (`./src/store`): `useChatStore`, `useCallStore`, `usePresenceStore`, `useCreatePostModal`, `usePostModel`
- **React Query Hooks** (`./src/hooks`): `useChatbot`, `useAssistantConversations`, `useAssistantHistory`, `useFeed`, `useConversation`, `useGroup`, `useNotification`, `useMusic`, `usePost`, `useShare`, `useEmotion`, `useUserActivity`
- **Validation Schemas** (`./src/schemas`): Zod schemas for user profiles, posts, comments, direct messages, shares, and moderation reports
- **Domain Types** (`./src/types`): Core domain models (`User`, `Post`, `Comment`, `Conversation`, `Message`, `EmotionReport`, `Notification`, `AssistantConversationDTO`, `ChatbotHistoryMessageDTO`, `AssistantRespondDataDTO`)
- **Navigation & Utilities** (`./src/navigation`, `./src/utils`): Cross-platform deep linking, query client configuration, and data normalizers

## Invariants
- Code within `@repo/shared` must remain strictly platform-agnostic, avoiding direct DOM `window`/`document` references or React Native native-only modules.
- Single source of truth for Zod schemas to ensure frontend validation matches backend microservice DTO contracts.
- Network requests must resolve through `ApiClient` configured with authentication token interceptors.

## Side Effects
- Issues asynchronous HTTP/REST requests to Sentimeta backend services via API Gateway.
- Establishes and manages persistent WebSocket connections for real-time messaging, calling, and presence.
- Updates in-memory Zustand and TanStack Query client caches.

## Verification
- Run: `npm run typecheck`
