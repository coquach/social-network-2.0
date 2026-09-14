import { describe, it, expect } from 'vitest';
import * as apiClients from '../api/client';
import * as services from '../api/services';
import * as enums from '../types/enums';

describe('@repo/shared Export Test', () => {
  it('exports API Client correctly', () => {
    expect(typeof apiClients.initializeApiClient).toBe('function');
    expect(typeof apiClients.getApiClient).toBe('function');
    expect(typeof apiClients.ApiClient).toBe('function');
  });

  it('exports Services correctly', () => {
    expect(typeof services.postService).toBe('object');
    expect(typeof services.userService).toBe('object');
    expect(typeof services.commentService).toBe('object');
    expect(typeof services.notificationService).toBe('object');
    expect(typeof services.messageService).toBe('object');
    expect(typeof services.conversationService).toBe('object');
  });

  it('exports Enums correctly', () => {
    expect(typeof enums.Audience).toBe('object');
    expect(typeof enums.ReactionType).toBe('object');
    expect(typeof enums.MediaType).toBe('object');
    expect(typeof enums.Emotion).toBe('object');
  });

  it('initializes API client correctly', () => {
    const client = apiClients.initializeApiClient({
      baseURL: 'https://api.example.com',
      timeout: 10000,
      getAuthToken: async () => 'test-token',
    });
    expect(client).toBeInstanceOf(apiClients.ApiClient);
  });
});
