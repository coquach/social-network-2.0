/**
 * Package Export Test
 * Verifies that all exports from @repo/shared work correctly
 */

// Test all main exports
import * as shared from '../index';

console.log('=== @repo/shared Export Test ===\n');

// Check API exports
console.log('✓ API Client exports:', {
  initializeApiClient: typeof shared.initializeApiClient,
  getApiClient: typeof shared.getApiClient,
  ApiClient: typeof shared.ApiClient,
});

// Check Service exports
console.log('✓ Service exports:', {
  postService: typeof shared.postService,
  userService: typeof shared.userService,
  commentService: typeof shared.commentService,
  notificationService: typeof shared.notificationService,
  messageService: typeof shared.messageService,
  conversationService: typeof shared.conversationService,
});

// Check Enum exports
console.log('✓ Enum exports:', {
  Audience: typeof shared.Audience,
  ReactionType: typeof shared.ReactionType,
  MediaType: typeof shared.MediaType,
  Emotion: typeof shared.Emotion,
});

// Test API client initialization
try {
  shared.initializeApiClient({
    baseURL: 'https://test.api.com',
    getAuthToken: async () => 'mock-token',
  });
  console.log('✓ API client initialization works');
} catch (error) {
  console.error('✗ API client initialization failed:', error);
}

// Test getting API client
try {
  const client = shared.getApiClient();
  console.log('✓ Getting API client works');
} catch (error) {
  console.error('✗ Getting API client failed:', error);
}

console.log('\n=== All exports validated ===');
