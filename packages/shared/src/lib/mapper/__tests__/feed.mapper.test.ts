import { describe, it, expect } from 'vitest';
import { FeedType } from '../../../types';
import { normalizeFeedItem, toPostSnapshot } from '../feed.mapper';

const basePost = {
  id: 'p1',
  userId: 'u1',
  content: 'Hello',
  audience: 'PUBLIC',
  media: [],
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
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('toPostSnapshot', () => {
  it('prefers post.mainEmotion over post.feeling', () => {
    const snapshot = toPostSnapshot({
      ...basePost,
      feeling: 'JOY',
      mainEmotion: 'SADNESS',
      secondaryEmotions: ['ANGER', 'FEAR'],
    } as never);

    expect(snapshot.mainEmotion).toBe('SADNESS');
    expect(snapshot.secondaryEmotions).toEqual(['ANGER', 'FEAR']);
  });

  it('falls back to post.feeling when mainEmotion is undefined', () => {
    const snapshot = toPostSnapshot({
      ...basePost,
      feeling: 'JOY',
    } as never);

    expect(snapshot.mainEmotion).toBe('JOY');
  });

  it('keeps falsy mainEmotion instead of throwing (null -> feeling -> undefined)', () => {
    const snapshot = toPostSnapshot({
      ...basePost,
      mainEmotion: null,
      feeling: undefined,
    } as never);

    expect(snapshot.mainEmotion == null).toBe(true);
  });

  it('carries mainEmotion through for an already-snapshot post', () => {
    const snapshot = toPostSnapshot({
      postId: 'p1',
      userId: 'u1',
      audience: 'PUBLIC',
      mainEmotion: null,
      secondaryEmotions: ['SURPRISE'],
      createdAt: new Date('2026-01-01T00:00:00Z'),
    } as never);

    expect(snapshot.mainEmotion).toBeNull();
    expect(snapshot.secondaryEmotions).toEqual(['SURPRISE']);
  });
});

describe('normalizeFeedItem', () => {
  it('maps INTERVENTION items reading feed.intervention (not feed.item)', () => {
    const intervention = {
      id: 'i1',
      type: 'AI_CHATBOT_SAFE_SPACE' as const,
      title: 'Góc nhỏ lắng nghe',
      description: 'Bạn có muốn trò chuyện cùng Trợ lý AI không?',
      buttonText: 'Trò chuyện cùng Trợ lý AI',
    };

    const item = normalizeFeedItem({
      id: 'f1',
      type: FeedType.INTERVENTION,
      intervention,
    });

    expect(item.type).toBe(FeedType.INTERVENTION);
    expect(item).toEqual({
      id: 'f1',
      type: FeedType.INTERVENTION,
      data: intervention,
    });
  });

  it('does not read INTERVENTION payload from feed.item', () => {
    expect(() =>
      normalizeFeedItem({
        id: 'f2',
        type: FeedType.INTERVENTION,
        item: { id: 'i2' } as never,
      }),
    ).toThrow(/missing intervention payload/);
  });

  it('maps POST items through toPostSnapshot', () => {
    const item = normalizeFeedItem({
      id: 'f3',
      type: FeedType.POST,
      item: { ...basePost, mainEmotion: 'JOY' } as never,
    });

    expect(item.type).toBe(FeedType.POST);
    expect((item.data as { postId: string }).postId).toBe('p1');
    expect((item.data as { mainEmotion: string }).mainEmotion).toBe('JOY');
  });

  it('maps SHARE items through toShareSnapshot', () => {
    const item = normalizeFeedItem({
      id: 'f4',
      type: FeedType.SHARE,
      item: {
        shareId: 's1',
        userId: 'u2',
        audience: 'PUBLIC',
        post: { ...basePost },
        shareStat: {
          reactions: 0,
          likes: 0,
          loves: 0,
          hahas: 0,
          wows: 0,
          angrys: 0,
          sads: 0,
          comments: 0,
        },
        createdAt: new Date('2026-01-01T00:00:00Z'),
      } as never,
    });

    expect(item.type).toBe(FeedType.SHARE);
    expect((item.data as { shareId: string }).shareId).toBe('s1');
  });

  it('throws for INTERVENTION without payload so hooks can skip it safely', () => {
    expect(() =>
      normalizeFeedItem({ id: 'f5', type: FeedType.INTERVENTION }),
    ).toThrow(/missing intervention payload/);
  });

  it('throws for POST without item payload so hooks can skip it safely', () => {
    expect(() => normalizeFeedItem({ id: 'f6', type: FeedType.POST })).toThrow(
      /missing item payload/,
    );
  });
});
