import type { Emotion } from '@repo/shared';

export type EmotionEnum = Emotion;

export type FeedTab = 'trending' | 'personal';

export type FeedEmotion =
  | 'all'
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'disgust'
  | 'surprise'
  | 'neutral';

export type FeedFilter = {
  feedType: FeedTab;
  emotion: FeedEmotion;
};
