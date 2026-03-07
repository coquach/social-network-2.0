# @repo/shared

Shared business logic package for Social Network 2.0 monorepo.

## Purpose

This package contains platform-agnostic code that can be reused across both web (Next.js) and mobile (Expo) applications:

- **API Client**: HTTP client with authentication and interceptors
- **Types**: TypeScript types, interfaces, and DTOs
- **Hooks**: React Query hooks for data fetching
- **Utils**: Utility functions (formatting, validation, etc.)
- **Store**: Zustand state management stores
- **Constants**: Application constants and configurations

## Installation

This package is part of the monorepo and should not be installed separately.

In your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/shared": "workspace:*"
  }
}
```

## Usage

### Initialize API Client

Each platform must initialize the API client with platform-specific configuration:

**Web (Next.js with Clerk):**

```typescript
import { initializeApiClient } from '@repo/shared/api';
import { useAuth } from '@clerk/nextjs';

// In your root layout or app component
const { getToken } = useAuth();

initializeApiClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL!,
  getAuthToken: async () => {
    const token = await getToken();
    return token;
  },
});
```

**Mobile (Expo):**

```typescript
import { initializeApiClient } from '@repo/shared/api';
import * as SecureStore from 'expo-secure-store';

initializeApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL!,
  getAuthToken: async () => {
    return await SecureStore.getItemAsync('auth_token');
  },
});
```

### Use Hooks

```typescript
import { usePostsFeed, useCreatePost } from '@repo/shared/hooks';

function MyComponent() {
  const { data, isLoading } = usePostsFeed();
  const { mutate } = useCreatePost();

  // ...
}
```

### Use Types

```typescript
import type { Post, User, Comment } from '@repo/shared/types';
```

### Use Utils

```typescript
import { formatCount, formatRelativeTime } from '@repo/shared/utils';

const formattedCount = formatCount(1234); // "1.2K"
const relativeTime = formatRelativeTime(new Date()); // "just now"
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Type Check

```bash
npm run typecheck
```

## Architecture

This package follows the dependency injection pattern for platform-specific code (like authentication) while keeping all business logic platform-agnostic.

## Migration Status

- [x] Phase 1: Package structure and configuration
- [ ] Phase 2: Types and DTOs migration
- [ ] Phase 3: API client and services
- [ ] Phase 4: Hooks migration
- [ ] Phase 5: Utils migration
- [ ] Phase 6: State management migration
