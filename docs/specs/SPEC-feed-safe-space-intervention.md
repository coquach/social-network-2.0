# Spec: Feed Safe Space Intervention & Emotion DTO Integration

## Assumptions
Các giả định đang sử dụng dựa trên đi chiếu giữa tài liệu API và mã nguồn thực tế (`social-network-2.0` + `SE121-microservices`):
1. **Cả `my-feed` và `trending` đều trả về `CursorPageResponse<FeedItemDTO>`**: Đã xác nhận từ `TrendingService.getTrendingPosts` ở Backend rằng `/feeds/trending` trả về mảng đa hình (`POST | SHARE | INTERVENTION`), không còn trả `PostDTO[]` trực tiếp.
2. **Giữ tên DTO hiện tại của Frontend (`PostDTO`, `MediaDTO`, `FeedDTO`)**: Không đổi tên sang `PostResponseDTO` / `MediaItemDTO` để tránh phá vỡ import hiện có trong `packages/shared`, `apps/web`, và `apps/native`.
3. **Cooldown Safe Space do Backend quản lý hoàn toàn**: Redis cooldown 12h được Backend set ngay khi chèn thẻ ở trang 1; Frontend không cần gọi API dismiss hay lưu cooldown local. Backend chỉ chèn thẻ khi `offset === 0`, distress > 0.5 và `limit >= 5` (hoặc không truyền `limit`), nên Frontend phải giữ `limit >= 5` (hiện dùng 10). Đã đối chiếu với `SE121-microservices`.
4. **Mở AI Chatbot dùng `useAssistantStore`**: Khi user bấm nút trên thẻ `INTERVENTION`, Frontend tái sử dụng `useAssistantStore` (trên Web mở Assistant Sheet, trên Native mở Assistant Chat Modal) thay vì tạo route/màn hình chat mới tách biệt.

---

## Objective
Tích hợp đầy đủ hai thay đổi từ Backend vào toàn bộ monorepo (`packages/shared`, `apps/web`, `apps/native`):
1. **Polymorphic Feed & Safe Space Intervention Card**:
   - Hỗ trợ `FeedType.INTERVENTION` (`AI_CHATBOT_SAFE_SPACE`) trên cả **Personal Feed** (`/feeds/my-feed`) và **Trending Feed** (`/feeds/trending`).
   - Hiển thị thẻ **"Góc nhỏ lắng nghe"** đúng dữ liệu từ Backend (`title`, `description`, `buttonText`) với giao diện nhẹ nhàng, không phán xét; khi nhấn nút sẽ mở AI Chatbot Safe Space.
   - Đảm bảo không crash mapper/UI khi `feed.item` không tồn tại (với item `INTERVENTION`, payload nằm ở `feed.intervention`).
2. **Emotion DTOs (`mainEmotion`, `secondaryEmotions`, `mainEmotionScore`)**:
   - Mở rộng `PostDTO` và `PostSnapshotDTO` để nhận `mainEmotion` (nullable), `secondaryEmotions` (mảng cảm xúc phụ), và `mainEmotionScore` (ở chi tiết bài viết).
   - Ưu tiên `post.mainEmotion ?? post.feeling` khi chuẩn hóa snapshot; hiển thị `mainEmotion` làm badge chính và `secondaryEmotions` làm badge phụ nhỏ hơn trên `PostHeader` (Web & Native), ẩn khi `null` hoặc mảng rỗng `[]`.

---

## Tech Stack
- **Monorepo**: Turborepo + npm workspaces
- **Shared (`packages/shared`)**: TypeScript, `@tanstack/react-query`, `zustand`, `axios`, `zod`
- **Web (`apps/web`)**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Clerk (`@clerk/nextjs`)
- **Native (`apps/native`)**: Expo SDK 55, React Native 0.83, Expo Router, Uniwind, HeroUI Native, Clerk (`@clerk/expo`)
- **Testing**: Vitest (`vitest run`)

---

## Commands
```bash
# Kiểm tra toàn bộ (lint + typecheck + build)
npm run ci

# Chạy unit tests (Vitest)
npm run test

# Kiểm tra từng bước
npm run lint
npm run typecheck
npm run build
npm run format

# Chạy dev
npm run dev
npm run dev --workspace web
npm run dev --workspace sentimeta-native
```

---

## Project Structure
```text
packages/shared/src/
├── types/feed.types.ts              # FeedType.INTERVENTION, FeedInterventionDTO, FeedDTO, FeedItem
├── types/post.types.ts              # PostDTO & PostSnapshotDTO (mainEmotion, secondaryEmotions, mainEmotionScore)
├── lib/mapper/feed.mapper.ts        # normalizeFeedItem (hỗ trợ POST, SHARE, INTERVENTION), toPostSnapshot
├── api/services/feed.service.ts     # getMyFeed & getTrendingFeed cùng trả CursorPageResponse<FeedDTO>
├── hooks/useFeed.ts                 # useMyFeed & useTrendingFeed cùng map ra FeedItem[]
└── hooks/__tests__/useFeed.test.tsx # Unit tests cho personal & trending feed + intervention

apps/web/
├── app/(platform)/(main)/(home)/_components/personal-feed.tsx
├── app/(platform)/(main)/(home)/_components/trending-feed.tsx
└── components/post/post-header.tsx  # Hiển thị mainEmotion + secondaryEmotions

apps/native/
├── components/newfeeds/feed/personal-feed.tsx
├── components/newfeeds/feed/trending-feed.tsx
└── components/post/post-header.tsx  # Hiển thị mainEmotion + secondaryEmotions
```

---

## Code Style
Tuân thủ convention **Shared Domain First**: định nghĩa type & mapper tại `@repo/shared` bằng discriminated union, sau đó Web và Native chỉ consume hook/type từ `@repo/shared`.

```typescript
export enum FeedType {
  POST = 'POST',
  SHARE = 'SHARE',
  INTERVENTION = 'INTERVENTION',
}

export interface FeedInterventionDTO {
  id: string;
  type: 'AI_CHATBOT_SAFE_SPACE';
  title: string;
  description: string;
  buttonText: string;
}

export type PersonalFeedItem =
  | { id: string; type: FeedType.POST; data: PostSnapshotDTO }
  | { id: string; type: FeedType.SHARE; data: ShareSnapshotDTO }
  | { id: string; type: FeedType.INTERVENTION; data: FeedInterventionDTO };
```

- Web sử dụng Tailwind CSS v4 utility classes; Native sử dụng Uniwind + HeroUI Native.
- Không dùng `any` mới; giữ nguyên docstrings và comments không liên quan.

---

## Testing Strategy
- **Unit Tests (`vitest run`)**:
  - Cập nhật `packages/shared/src/hooks/__tests__/useFeed.test.tsx` để test cả `useMyFeed` và `useTrendingFeed` với payload chứa `POST`, `SHARE`, và `INTERVENTION`.
  - Test `feed.mapper.ts`: đảm bảo `INTERVENTION` không rơi vào nhánh `POST`, `mainEmotion: null` được giữ nguyên, và `toPostSnapshot` ưu tiên `post.mainEmotion ?? post.feeling` cùng `secondaryEmotions`.
- **Static & Build Verification (`npm run ci`)**:
  - Toàn bộ workspaces (`shared`, `web`, `native`) phải pass `lint`, `typecheck`, và `build` không lỗi.

---

## Boundaries
- **Always**:
  - Cập nhật `packages/shared` trước rồi mới cập nhật `apps/web` và `apps/native`.
  - Chạy `npm run test` và `npm run ci` trước khi kết thúc triển khai.
  - Xử lý an toàn khi `mainEmotion` là `null`/`undefined` hoặc `secondaryEmotions` rỗng/không có.
- **Ask first**:
  - Thay đổi API contract hoặc thêm endpoint mới không có trong spec.
  - Thêm dependency bên ngoài mới vào `package.json`.
- **Never**:
  - Xóa hoặc skip các unit test hiện có để ép pass CI.
  - Sửa đổi mã nguồn Backend (`../SE121-microservices`) trong phạm vi task Frontend này.
  - Hardcode text của thẻ Safe Space thay vì đọc từ `intervention.title`, `intervention.description`, `intervention.buttonText`.

---

## Success Criteria
1. `useMyFeed` và `useTrendingFeed` parse được cả 3 loại `FeedType` (`POST`, `SHARE`, `INTERVENTION`) mà không phát sinh lỗi runtime hay TypeScript.
2. Khi API trả về item `INTERVENTION` ở trang 1 (index 4 hoặc cuối mảng), cả Web và Native hiển thị đúng thẻ Safe Space với `title`, `description`, `buttonText` từ API; nhấn nút mở được AI Chatbot overlay.
3. Khi bài viết có `mainEmotion` và `secondaryEmotions`, `PostHeader` trên Web & Native hiển thị badge cảm xúc chính và các badge cảm xúc phụ; khi `mainEmotion` là `null` hoặc `secondaryEmotions` là `[]` thì ẩn gọn, không lỗi layout.
4. `npm run test` và `npm run ci` pass 100%.

---

## Resolved Decisions (đã triển khai)
1. **Trending Feed không có `SHARE`**: Backend chỉ trả `POST | INTERVENTION` cho `/feeds/trending`. Mapper và `TrendingFeed` vẫn xử lý `SHARE` một cách phòng thủ (render `ShareCard`) để không crash nếu Backend đổi, nhưng đây không phải case cần hỗ trợ/test.
2. **Mở Chatbot từ thẻ Safe Space**: `SafeSpaceCard` gọi `useAssistantStore.openWithProactiveContext({ interventionId, promptContext: "<title>. <description>" })` — mở Assistant với ngữ cảnh mở đầu từ thẻ.
3. **`secondaryEmotions` & `mainEmotionScore`**:
   - `PostHeader` (Web & Native) hiển thị tối đa **2** badge phụ, phần còn lại gom thành `+N`.
   - `mainEmotionScore` chỉ giữ trong DTO, **không** hiển thị cho user thường (dành cho admin/tính năng sau).
4. **Item lỗi (thiếu payload)**: `useMyFeed`/`useTrendingFeed` bỏ qua item malformed (cảnh báo ở dev) thay vì làm crash cả feed.

---

## Implementation Status
| Hạng mục | Trạng thái |
|---|---|
| `FeedType.INTERVENTION`, `FeedInterventionDTO`, `FeedItem` (`feed.types.ts`) | Done |
| `normalizeFeedItem`, `toPostSnapshot` (`mainEmotion ?? feeling`) | Done |
| `useMyFeed` / `useTrendingFeed` trả `FeedItem[]` | Done |
| Web: `SafeSpaceCard` + `personal-feed` / `trending-feed` / `PostHeader` | Done |
| Native: `SafeSpaceCard` + `personal-feed` / `trending-feed` / `PostHeader` | Done |
| Unit tests (`useFeed.test.tsx`, `feed.mapper.test.ts`) | Done — `npm run test`: 23 files / 98 tests pass |
| `npm run typecheck` (shared, ui, web, native) | Pass |
| `lint` web | Pass |
| `lint` native (`expo lint`) | Chưa xác nhận — bị chặn bởi môi trường (EPERM ghi `~/.expo`), cần chạy lại local |
| `npm run build` / `npm run ci` đầy đủ | Chưa chạy — cần chạy local trước khi merge |
