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

const capturedRequests: Array<{ url: string; init?: RequestInit }> = [];

const collectStream = async (input: Parameters<typeof chatbotService.streamRespond>[0]) => {
  const chunks = [];
  for await (const chunk of chatbotService.streamRespond(input)) {
    chunks.push(chunk);
  }
  return chunks;
};

describe('chatbotService.streamRespond surface serialization', () => {
  beforeEach(() => {
    capturedRequests.length = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        capturedRequests.push({ url, init });
        return new Response(SSE_BODY, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes surface with the AI service "screen" key', async () => {
    await collectStream({ message: 'hello', surface: { screen: 'feed' } });

    expect(capturedRequests[0].url).toBe(
      'https://api.example.com/assistant/respond-stream',
    );
    expect(JSON.parse(String(capturedRequests[0].init?.body))).toEqual({
      message: 'hello',
      surface: { screen: 'feed' },
    });
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

    expect(JSON.parse(String(capturedRequests[0].init?.body))).toEqual({
      message: 'hello',
      surface: {
        screen: 'post_detail',
        entityId: 'post_1',
        metadata: { role: 'admin' },
      },
    });
  });

  it('drops entityId and metadata when undefined', async () => {
    await collectStream({ message: 'hello', surface: { screen: 'feed' } });

    expect(JSON.parse(String(capturedRequests[0].init?.body))).toEqual({
      message: 'hello',
      surface: { screen: 'feed' },
    });
  });

  it('omits the surface param entirely when not provided', async () => {
    await collectStream({ message: 'hello' });

    expect(JSON.parse(String(capturedRequests[0].init?.body))).toEqual({
      message: 'hello',
    });
  });

  it('rejects stream error payloads instead of appending undefined to the reply', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          'data: {"error":{"message":"Assistant unavailable"}}\n\n',
          { headers: { 'Content-Type': 'text/event-stream' } },
        );
      }),
    );

    await expect(collectStream({ message: 'hello' })).rejects.toThrow(
      'Assistant unavailable',
    );
  });

  it('rejects chunks without a reply field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response('data: {"status":"done"}\n\n', {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }),
    );

    await expect(collectStream({ message: 'hello' })).rejects.toThrow(
      'invalid assistant response',
    );
  });
});
