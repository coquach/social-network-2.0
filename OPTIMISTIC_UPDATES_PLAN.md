# Optimistic Updates Implementation Plan

## 1. Tại sao cần Optimistic Updates?

### Trải nghiệm người dùng
- ⚡ **Instant feedback**: UI update ngay lập tức, không đợi server
- 🚀 **Perceived performance**: Ứng dụng cảm thấy nhanh hơn 3-5x
- ✨ **Smooth UX**: Quan trọng cho mobile với network không ổn định

### So sánh

**Không có optimistic updates:**
```
User clicks "Add Friend" 
  ↓ (waiting...)
Server responds after 500ms
  ↓
UI updates
Total perceived time: 500ms+ ❌
```

**Có optimistic updates:**
```
User clicks "Add Friend"
  ↓ UI updates immediately (0ms) ✅
Server responds after 500ms (background)
  ↓ Confirm or rollback if error
Total perceived time: ~0ms ⚡
```

## 2. Implementation Strategy

### Phase 1: Core Infrastructure (Shared package)

```typescript
// packages/shared/src/hooks/utils/optimistic-helpers.ts

/**
 * Platform-agnostic optimistic update utilities
 * Works on Web, React Native, and Expo
 */

import { QueryClient } from '@tanstack/react-query';
import { UserDTO } from '../../types';

export type RelationStatus = 
  | 'FRIEND' 
  | 'BLOCKED' 
  | 'REQUESTED_OUT' 
  | 'REQUESTED_IN' 
  | 'NONE';

export interface OptimisticContext<T = any> {
  previousData?: T;
  snapshotQueries?: Array<{
    queryKey: any[];
    data: any;
  }>;
}

/**
 * Update user relationship status optimistically
 */
export const updateUserRelationship = (
  queryClient: QueryClient,
  userId: string,
  status: RelationStatus
): UserDTO | undefined => {
  const queryKey = ['user', 'detail', userId];
  
  const previousUser = queryClient.getQueryData<UserDTO>(queryKey);
  
  if (previousUser) {
    queryClient.setQueryData<UserDTO>(queryKey, {
      ...previousUser,
      relation: {
        ...previousUser.relation,
        status,
      },
    });
  }
  
  return previousUser;
};

/**
 * Rollback optimistic update on error
 */
export const rollbackOptimisticUpdate = <T>(
  queryClient: QueryClient,
  queryKey: any[],
  previousData?: T
) => {
  if (previousData) {
    queryClient.setQueryData(queryKey, previousData);
  }
};

/**
 * Generic optimistic list update
 */
export const optimisticallyAddToList = <T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: any[],
  newItem: T
) => {
  const previousData = queryClient.getQueryData(queryKey);
  
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old;
    
    // Handle infinite query format
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page, index) => 
          index === 0
            ? { ...page, data: [newItem, ...page.data] }
            : page
        ),
      };
    }
    
    // Handle regular array
    if (Array.isArray(old)) {
      return [newItem, ...old];
    }
    
    return old;
  });
  
  return previousData;
};

export const optimisticallyRemoveFromList = <T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: any[],
  itemId: string
) => {
  const previousData = queryClient.getQueryData(queryKey);
  
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old;
    
    // Handle infinite query format
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          data: page.data.filter((item: T) => item.id !== itemId),
        })),
      };
    }
    
    // Handle regular array
    if (Array.isArray(old)) {
      return old.filter((item: T) => item.id !== itemId);
    }
    
    return old;
  });
  
  return previousData;
};
```

### Phase 2: Update Friend Hooks

```typescript
// packages/shared/src/hooks/useUser.ts

import { 
  updateUserRelationship, 
  rollbackOptimisticUpdate,
  OptimisticContext 
} from './utils/optimistic-helpers';

/**
 * Send friend request with optimistic update
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, OptimisticContext<UserDTO>>({
    mutationFn: (userId) => userService.sendFriendRequest(userId),
    
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'detail', userId] });
      
      // Snapshot previous state
      const previousUser = updateUserRelationship(
        queryClient, 
        userId, 
        'REQUESTED_OUT'
      );
      
      return { previousData: previousUser };
    },
    
    onError: (error, userId, context) => {
      // Rollback on error
      rollbackOptimisticUpdate(
        queryClient,
        ['user', 'detail', userId],
        context?.previousData
      );
      
      // Note: Toast/notification should be handled by platform-specific code
    },
    
    onSuccess: (_, userId) => {
      // Revalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'detail', userId] });
    },
  });
};

/**
 * Accept friend request with optimistic update
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, OptimisticContext>({
    mutationFn: (requestId) => userService.acceptFriendRequest(requestId),
    
    onMutate: async (requestId) => {
      // Note: We'd need to know the userId to update their relation
      // This requires API to return userId or pass it separately
      
      await queryClient.cancelQueries({ queryKey: ['friends', 'requests'] });
      
      const previousRequests = queryClient.getQueryData(['friends', 'requests']);
      
      // Optimistically remove from request list
      queryClient.setQueryData(['friends', 'requests'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter((id: string) => id !== requestId),
          })),
        };
      });
      
      return { previousData: previousRequests };
    },
    
    onError: (error, requestId, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        ['friends', 'requests'],
        context?.previousData
      );
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'all'] });
    },
  });
};

/**
 * Remove friend with optimistic update
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, OptimisticContext<UserDTO>>({
    mutationFn: (userId) => userService.removeFriend(userId),
    
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['user', 'detail', userId] });
      
      const previousUser = updateUserRelationship(
        queryClient,
        userId,
        'NONE'
      );
      
      return { previousData: previousUser };
    },
    
    onError: (error, userId, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        ['user', 'detail', userId],
        context?.previousData
      );
    },
    
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'detail', userId] });
    },
  });
};

/**
 * Block user with optimistic update
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, OptimisticContext<UserDTO>>({
    mutationFn: (userId) => userService.blockUser(userId),
    
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['user', 'detail', userId] });
      
      const previousUser = updateUserRelationship(
        queryClient,
        userId,
        'BLOCKED'
      );
      
      return { previousData: previousUser };
    },
    
    onError: (error, userId, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        ['user', 'detail', userId],
        context?.previousData
      );
    },
    
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'all'] });
    },
  });
};
```

### Phase 3: Platform-Specific Notification Layer

**Web (apps/web/hooks/use-friend-notifications.ts):**
```typescript
import { useSendFriendRequest as useBaseSendFriendRequest } from '@repo/shared';
import { toast } from 'sonner';

/**
 * Web-specific wrapper with toast notifications
 */
export const useSendFriendRequest = () => {
  const mutation = useBaseSendFriendRequest();
  
  return {
    ...mutation,
    mutate: (userId: string, options?) => {
      mutation.mutate(userId, {
        ...options,
        onError: (error, ...args) => {
          toast.error('Không thể gửi lời mời kết bạn');
          options?.onError?.(error, ...args);
        },
        onSuccess: (...args) => {
          toast.success('Đã gửi lời mời kết bạn!');
          options?.onSuccess?.(...args);
        },
      });
    },
  };
};
```

**Mobile (apps/native/hooks/use-friend-notifications.ts):**
```typescript
import { useSendFriendRequest as useBaseSendFriendRequest } from '@repo/shared';
import { Alert } from 'react-native';
// Or use: import Toast from 'react-native-toast-message';

/**
 * Mobile-specific wrapper with native alerts
 */
export const useSendFriendRequest = () => {
  const mutation = useBaseSendFriendRequest();
  
  return {
    ...mutation,
    mutate: (userId: string, options?) => {
      mutation.mutate(userId, {
        ...options,
        onError: (error, ...args) => {
          Alert.alert('Lỗi', 'Không thể gửi lời mời kết bạn');
          // Or: Toast.show({ type: 'error', text1: 'Lỗi', text2: '...' });
          options?.onError?.(error, ...args);
        },
        onSuccess: (...args) => {
          Alert.alert('Thành công', 'Đã gửi lời mời kết bạn!');
          // Or: Toast.show({ type: 'success', text1: 'Thành công' });
          options?.onSuccess?.(...args);
        },
      });
    },
  };
};
```

## 3. Migration Steps

### Step 1: Create optimistic helpers
```bash
mkdir -p packages/shared/src/hooks/utils
# Create optimistic-helpers.ts with utility functions
```

### Step 2: Update friend hooks with optimistic updates
```bash
# Edit packages/shared/src/hooks/useUser.ts
# Add onMutate, onError with rollback
```

### Step 3: Test on web first
```bash
cd apps/web
npm run dev
# Test all friend actions: add, remove, block, accept, reject
```

### Step 4: Test on mobile
```bash
cd apps/native
npm run ios # or npm run android
# Test same actions on mobile
```

### Step 5: Update group hooks (similar pattern)
```bash
# packages/shared/src/hooks/useGroup.ts
# Apply same optimistic update pattern
```

## 4. Benefits

### ✅ **Platform Compatibility**
- Same optimistic logic works on Web & Mobile
- React Query handles cache synchronization
- No platform-specific code in business logic

### ✅ **Better UX**
- Instant UI feedback
- Automatic rollback on errors
- Network-independent perceived performance

### ✅ **Maintainability**
- Single source of truth in shared package
- Platform-specific concerns (toast/alerts) separated
- Easier to test and debug

### ✅ **Mobile-Friendly**
- Critical for slow/unstable mobile networks
- Reduces perceived latency
- Works offline (with proper cache config)

## 5. Example: Complete Flow

```typescript
// User taps "Add Friend" button on mobile

1. Component calls mutation:
   const { mutate } = useSendFriendRequest();
   mutate(userId);

2. onMutate fires (0ms):
   - Cancel pending queries
   - Snapshot current user state
   - Update cache: relation.status = 'REQUESTED_OUT'
   - UI updates immediately ⚡ (user sees "Request Sent")

3. API call starts (background)
   - Network request to server
   - Takes 200-800ms depending on connection

4. Two possible outcomes:
   
   ✅ Success (onSuccess):
   - Invalidate queries to refetch
   - Show success notification
   - User already sees correct state!
   
   ❌ Error (onError):
   - Rollback cache to snapshot
   - UI reverts to "Add Friend" button
   - Show error notification

Total perceived time: ~0ms vs 500ms+ ⚡
```

## 6. Testing Checklist

### Friend Actions
- [ ] Send friend request (optimistic)
- [ ] Cancel friend request (optimistic)
- [ ] Accept friend request (optimistic)
- [ ] Reject friend request (optimistic)
- [ ] Remove friend (optimistic)
- [ ] Block user (optimistic)
- [ ] Unblock user (optimistic)

### Error Handling
- [ ] Network error rollback
- [ ] Server error rollback
- [ ] Concurrent mutations handling
- [ ] Cache consistency

### Platforms
- [ ] Web (Chrome, Firefox, Safari)
- [ ] iOS (Simulator + Device)
- [ ] Android (Emulator + Device)
- [ ] React Native Web (if used)

## 7. Performance Metrics

Expected improvements:
- **Perceived latency**: 500ms → ~0ms (-100%)
- **Time to interactive**: Same mutation, instant feedback
- **User satisfaction**: Significantly better feel
- **Mobile experience**: Critical on 3G/4G networks

## 8. Advanced: Offline Support

With optimistic updates foundation, you can add:

```typescript
// Automatically retry failed mutations
export const useSendFriendRequestWithRetry = () => {
  const mutation = useSendFriendRequest();
  
  // Use React Query's built-in retry
  return {
    ...mutation,
    mutationOptions: {
      ...mutation.options,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  };
};

// Queue mutations when offline
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});
```

## Next Steps

1. **Immediate**: Create PR with optimistic helpers utility
2. **Phase 1**: Update friend hooks (highest ROI)
3. **Phase 2**: Update group hooks
4. **Phase 3**: Add platform-specific notification wrappers
5. **Phase 4**: Mobile testing & refinement
6. **Future**: Advanced offline support

---

**Kết luận:** Optimistic updates trong shared package sẽ hoạt động tốt cho cả web và mobile, mang lại trải nghiệm người dùng tốt hơn đáng kể với minimal effort! 🚀
