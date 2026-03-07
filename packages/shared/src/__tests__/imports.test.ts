/**
 * Manual test file to verify exports and imports work correctly
 * This file should compile without errors
 */

// Test: Import types
import type {
  UserDTO,
  PostDTO,
  CommentDTO,
  NotificationDTO,
  MessageDTO,
  ConversationDTO,
  CursorPaginatedResponse,
  CreatePostInput,
  UpdatePostInput,
} from '../types';

// Test: Import enums (as values, not types)
import { Audience, ReactionType, MediaType } from '../types';

// Test: Import API client
import { initializeApiClient, getApiClient, ApiClient } from '../api/client';

// Test: Import services
import {
  postService,
  userService,
  commentService,
  notificationService,
  messageService,
  conversationService,
  friendService,
  feedService,
} from '../api/services';

/**
 * Test: Initialize API client
 */
const testInitApiClient = () => {
  const client = initializeApiClient({
    baseURL: 'https://api.example.com',
    timeout: 10000,
    getAuthToken: async () => 'test-token',
  });

  console.log('API client initialized:', client instanceof ApiClient);
};

/**
 * Test: Type checking
 */
const testTypes = () => {
  const post: PostDTO = {
    id: '1',
    userId: 'user-1',
    content: 'Test post',
    media: [],
    audience: Audience.PUBLIC,
    postStat: {
      reactions: 0,
      likes: 0,
      loves: 0,
      hahas: 0,
      wows: 0,
      angrys: 0,
      sads: 0,
      comments: 0,
      shares: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createInput: CreatePostInput = {
    content: 'New post',
    audience: Audience.FRIENDS,
  };

  console.log('Types work correctly', { post, createInput });
};

/**
 * Test: Service methods exist
 */
const testServices = () => {
  const services = {
    postService: {
      getPost: typeof postService.getPost === 'function',
      getMyPosts: typeof postService.getMyPosts === 'function',
      getUserPosts: typeof postService.getUserPosts === 'function',
      getGroupPosts: typeof postService.getGroupPosts === 'function',
      createPost: typeof postService.createPost === 'function',
      createPostInGroup: typeof postService.createPostInGroup === 'function',
      updatePost: typeof postService.updatePost === 'function',
      deletePost: typeof postService.deletePost === 'function',
      approvePostInGroup: typeof postService.approvePostInGroup === 'function',
      rejectPostInGroup: typeof postService.rejectPostInGroup === 'function',
      getPostEditHistory: typeof postService.getPostEditHistory === 'function',
    },
    feedService: {
      getMyFeed: typeof feedService.getMyFeed === 'function',
      getTrendingFeed: typeof feedService.getTrendingFeed === 'function',
      trackViews: typeof feedService.trackViews === 'function',
    },
    friendService: {
      getRelationshipStatus: typeof friendService.getRelationshipStatus === 'function',
      getFriendRequests: typeof friendService.getFriendRequests === 'function',
      getFriends: typeof friendService.getFriends === 'function',
      sendFriendRequest: typeof friendService.sendFriendRequest === 'function',
      blockUser: typeof friendService.blockUser === 'function',
    },
    userService: {
      getCurrentUser: typeof userService.getCurrentUser === 'function',
      getUser: typeof userService.getUser === 'function',
      updateProfile: typeof userService.updateProfile === 'function',
      searchUsers: typeof userService.searchUsers === 'function',
    },
    commentService: {
      getComments: typeof commentService.getComments === 'function',
      createComment: typeof commentService.createComment === 'function',
    },
    notificationService: {
      getNotifications: typeof notificationService.getNotifications === 'function',
      markAsRead: typeof notificationService.markAsRead === 'function',
    },
    messageService: {
      getMessages: typeof messageService.getMessages === 'function',
      sendMessage: typeof messageService.sendMessage === 'function',
    },
    conversationService: {
      getConversations: typeof conversationService.getConversations === 'function',
      createConversation: typeof conversationService.createConversation === 'function',
    },
  };

  console.log('All services available:', services);
};

/**
 * Test: Pagination response type
 */
const testPaginationResponse = () => {
  const response: CursorPaginatedResponse<PostDTO> = {
    data: [],
    hasMore: false,
  };

  console.log('Pagination response type works:', response);
};

// Export test functions
export { testInitApiClient, testTypes, testServices, testPaginationResponse };

// Type-only test - this should compile without errors
type TestCompilation = {
  post: PostDTO;
  user: UserDTO;
  comment: CommentDTO;
  notification: NotificationDTO;
  message: MessageDTO;
  conversation: ConversationDTO;
  paginatedPosts: CursorPaginatedResponse<PostDTO>;
  reactionType: ReactionType;
  mediaType: MediaType;
};

console.log('✅ All imports and types validated successfully');
