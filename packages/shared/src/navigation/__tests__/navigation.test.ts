import { describe, expect, it } from 'vitest';
import {
  buildDestinationHref,
  DESTINATION_CATALOG,
  resolveSurfaceFromPathname,
} from '../destinations';
import { getAssistantMessageActions } from '../actions';

describe('Navigation Destination Allowlist & Router', () => {
  it('resolves standard destinations to correct Web and Native paths', () => {
    // Home
    expect(buildDestinationHref('home', undefined, 'web')).toBe('/');
    expect(buildDestinationHref('home', undefined, 'native')).toBe('/newfeeds');

    // Friends
    expect(buildDestinationHref('friends', undefined, 'web')).toBe('/friends');
    expect(buildDestinationHref('friends', undefined, 'native')).toBe('/friends');

    // Groups
    expect(buildDestinationHref('groups.explore', undefined, 'web')).toBe('/groups/explore');
    expect(buildDestinationHref('groups.explore', undefined, 'native')).toBe('/groups');

    // Settings
    expect(buildDestinationHref('settings', undefined, 'web')).toBe('/settings');
    expect(buildDestinationHref('settings.privacy', undefined, 'web')).toBe('/settings/privacy');
    expect(buildDestinationHref('settings.privacy', undefined, 'native')).toBe('/settings/privacy-settings');
  });

  it('correctly formats query parameters for search destination', () => {
    const webSearch = buildDestinationHref('search', { q: 'học máy' }, 'web');
    expect(webSearch).toBe('/search?q=h%E1%BB%8Dc+m%C3%A1y');

    const nativeSearch = buildDestinationHref('search', { q: 'khoa học' }, 'native');
    expect(nativeSearch).toBe('/search?q=khoa+h%E1%BB%8Dc');

    // Without params
    expect(buildDestinationHref('search', undefined, 'web')).toBe('/search');
  });

  it('rejects unknown or unlisted destination IDs (returns null)', () => {
    expect(buildDestinationHref('admin.secret_backdoor', undefined, 'web')).toBeNull();
    expect(buildDestinationHref('https://evil-phishing.com', undefined, 'web')).toBeNull();
    expect(buildDestinationHref('unknown_dest', undefined, 'native')).toBeNull();
  });

  it('has consistent definitions for all catalog entries', () => {
    for (const [key, item] of Object.entries(DESTINATION_CATALOG)) {
      expect(item.id).toBe(key);
      expect(typeof item.labelVi).toBe('string');
      expect(item.labelVi.length).toBeGreaterThan(0);
      expect(typeof item.webPath).toBe('function');
      expect(typeof item.nativePath).toBe('function');
      expect(item.webPath().startsWith('/')).toBe(true);
      expect(item.nativePath().startsWith('/')).toBe(true);
    }
  });
});

describe('getAssistantMessageActions Validator', () => {
  it('extracts valid navigate actions from message metadata', () => {
    const metadata = {
      actions: [
        {
          type: 'navigate',
          id: 'act-1',
          label: 'Mở Cài đặt',
          payload: { destinationId: 'settings' },
        },
        {
          type: 'navigate',
          id: 'act-2',
          label: 'Tìm kiếm',
          payload: { destinationId: 'search', params: { q: 'ai' } },
        },
      ],
    };

    const actions = getAssistantMessageActions(metadata);
    expect(actions).toHaveLength(2);
    expect(actions[0].label).toBe('Mở Cài đặt');
    expect(actions[1].payload.destinationId).toBe('search');
  });

  it('filters out invalid or malicious action objects', () => {
    const metadata = {
      actions: [
        { type: 'execute_shell', id: 'hack', label: 'Hack' }, // missing navigate type & destinationId
        { type: 'navigate', id: 'act-ok', label: 'OK', payload: { destinationId: 'home' } },
        null,
        'string action',
        { type: 'navigate', label: 'No ID' }, // missing id
        { type: 'navigate', id: 'no-dest', label: 'No Dest', payload: {} }, // missing destinationId
      ],
    };

    const actions = getAssistantMessageActions(metadata);
    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe('act-ok');
  });

  it('returns empty array when metadata has no actions or is null/undefined', () => {
    expect(getAssistantMessageActions(null)).toEqual([]);
    expect(getAssistantMessageActions(undefined)).toEqual([]);
    expect(getAssistantMessageActions({})).toEqual([]);
    expect(getAssistantMessageActions({ actions: 'not-an-array' })).toEqual([]);
  });
});

describe('resolveSurfaceFromPathname', () => {
  it('correctly maps URL paths to surfaces and extracts entity IDs', () => {
    // Standard pages
    expect(resolveSurfaceFromPathname('/')).toEqual({ screen: 'home' });
    expect(resolveSurfaceFromPathname('/friends')).toEqual({ screen: 'friends' });
    expect(resolveSurfaceFromPathname('/friends/requests')).toEqual({ screen: 'friends.requests' });
    expect(resolveSurfaceFromPathname('/emotions')).toEqual({ screen: 'emotions' });

    // Entity extractions
    expect(resolveSurfaceFromPathname('/groups/ai-builders')).toEqual({
      screen: 'groups.detail',
      entityId: 'ai-builders',
    });
    expect(resolveSurfaceFromPathname('/posts/post_abc123')).toEqual({
      screen: 'posts.detail',
      entityId: 'post_abc123',
    });
    expect(resolveSurfaceFromPathname('/profile/user_999')).toEqual({
      screen: 'profile',
      entityId: 'user_999',
    });
    expect(resolveSurfaceFromPathname('/conversations/conv_555')).toEqual({
      screen: 'conversations.detail',
      entityId: 'conv_555',
    });

    // Native paths
    expect(resolveSurfaceFromPathname('/newfeeds', 'native')).toEqual({ screen: 'home' });
    expect(resolveSurfaceFromPathname('/sentiment', 'native')).toEqual({ screen: 'emotions' });
    expect(resolveSurfaceFromPathname('/chat/conv_888', 'native')).toEqual({
      screen: 'conversations.detail',
      entityId: 'conv_888',
    });
  });
});
