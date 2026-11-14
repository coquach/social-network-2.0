import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../client', () => ({
  getApiClient: () => ({
    getAxiosInstance: () => ({ defaults: { baseURL: 'https://api.example.com' } }),
    getToken: async () => 'test-token',
  }),
}));

import { chatbotService } from '../chatbot.service';

const SSE_BODY =
  'data: {"reply":"hi","conversationId":"c1","sources":[],"suggestedActions":[]}\n\n';

const capturedUrls: string[] = [];

const collectStream = async (input: Parameters<typeof chatbotService.streamRespond>[0]) => {
  const chunks = [];
  for await (const chunk of chatbotService.streamRespond(input)) {
    chunks.push(chunk);
  }
  return chunks;
};

describe('chatbotService.streamRespond surface serialization', () => {
  beforeEach(() => {
    capturedUrls.length = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        capturedUrls.push(url);
        return new Response(SSE_BODY, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes surface with a top-level "surface" key (v2 contract)', async () => {
    await collectStream({ message: 'hello', surface: { screen: 'feed' } });

    const url = new URL(capturedUrls[0]);
    expect(url.pathname).toBe('/assistant/messages-stream');
    expect(url.searchParams.get('surface')).toBe('{"surface":"feed"}');
  });

  it('preserves entityId and metadata alongside the surface key', async () => {
    await collectStream({
      message: 'hello',
      surface: {
        screen: 'post_detail',
        entityId: 'post_1',
        metadata: { role: 'admin' },
      },
    });

    const url = new URL(capturedUrls[0]);
    expect(JSON.parse(url.searchParams.get('surface') ?? '{}')).toEqual({
      surface: 'post_detail',
      entityId: 'post_1',
      metadata: { role: 'admin' },
    });
  });

  it('drops entityId and metadata when undefined', async () => {
    await collectStream({ message: 'hello', surface: { screen: 'feed' } });

    const url = new URL(capturedUrls[0]);
    const parsed = JSON.parse(url.searchParams.get('surface') ?? '{}');
    expect(Object.keys(parsed)).toEqual(['surface']);
  });

  it('omits the surface param entirely when not provided', async () => {
    await collectStream({ message: 'hello' });

    const url = new URL(capturedUrls[0]);
    expect(url.searchParams.has('surface')).toBe(false);
    expect(url.searchParams.get('message')).toBe('hello');
  });
});
