# Sentimeta Monorepo: GEMINI Instructions

You are Gemini CLI, an elite senior Full-stack engineer working on the **Sentimeta** project—a social network ecosystem. This workspace is a Turbo-managed monorepo containing Web (Next.js) and Mobile (Expo) applications sharing a common domain layer.

## 🏗 Project Overview

- **Web App (`apps/web`)**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Clerk Auth.
- **Native App (`apps/native`)**: Expo SDK 55, React Native 0.83, Expo Router, Uniwind (Tailwind for RN), HeroUI Native.
- **Shared Layer (`packages/shared`)**: The "source of truth" for domain logic. Contains API clients (Axios), Zod schemas, React Query hooks, Zustand stores, and DTO types.
- **UI Layer (`packages/ui`)**: Shared UI primitives and design system components.
- **Backend**: NestJS microservices (located in the sibling repository `../SE121-microservices`).

## 🛠 Building and Running

### Setup
- **Install Dependencies**: `npm ci`
- **Environment Variables**:
  - Copy `.env.example` to `.env` in `apps/web` and `apps/native`.
  - Native requires `EXPO_PUBLIC_` prefix for client-side variables.

### Development
- **Start All**: `npm run dev` (Runs turbo dev)
- **Web Only**: `npm run dev --workspace web`
- **Native Only**: `npm run dev --workspace sentimeta-native`
- **Native Platforms**: 
  - `npm run android --workspace sentimeta-native`
  - `npm run ios --workspace sentimeta-native`

### Validation & Code Quality
- **Full CI Check**: `npm run ci` (lint + typecheck + build)
- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Formatting**: `npm run format` (Runs Prettier)

## 📐 Development Conventions

### Shared Domain First
1. **Define DTOs**: Create/update types in `packages/shared/src/types`.
2. **Define Schemas**: Create Zod validation schemas in `packages/shared/src/schemas`.
3. **API Clients**: Implement request logic in `packages/shared/src/api`.
4. **React Query Hooks**: Wrap API calls in hooks in `packages/shared/src/hooks`.
5. **Consume**: Import these hooks into both `apps/web` and `apps/native`.

### Styling
- **Web**: Use **Tailwind CSS v4** (utility-first).
- **Native**: Use **Uniwind** (Tailwind v4 syntax for React Native) and **HeroUI Native** components.

### Authentication
- Use **Clerk** for all authentication flows.
- Web uses `@clerk/nextjs`.
- Native uses `@clerk/expo`.

### Realtime
- WebSocket communication is handled via `socket.io-client`.
- Shared socket logic should reside in `@repo/shared`.

## 📂 Repository Map

- `apps/web/`: Next.js application.
- `apps/native/`: Expo React Native application.
- `packages/shared/`: Business logic, hooks, types, and schemas.
- `packages/ui/`: Shared UI component library.
- `packages/typescript-config/`: Shared TS configurations.

---
*Note: This file is a foundational mandate for Gemini CLI. Always adhere to these patterns when modifying the codebase.*
