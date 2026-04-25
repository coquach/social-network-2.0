import { Emotion } from '@repo/shared';
import { create } from 'zustand';

import type {
  FeedEmotion,
  FeedTab,
} from '~/components/newfeeds/feed-header/types';

export type FeedFilterState = {
  feedType: FeedTab;
  emotion: FeedEmotion;
  setFeedType: (type: FeedFilterState['feedType']) => void;
  setEmotion: (emotion: FeedFilterState['emotion']) => void;
};

const EMOTION_TO_API_MAP: Record<FeedEmotion, Emotion | undefined> = {
  all: undefined,
  joy: Emotion.JOY,
  sadness: Emotion.SADNESS,
  anger: Emotion.ANGER,
  fear: Emotion.FEAR,
  disgust: Emotion.DISGUST,
  surprise: Emotion.SURPRISE,
  neutral: Emotion.NEUTRAL,
};

export const useFeedFilterStore = create<FeedFilterState>((set) => ({
  feedType: 'trending',
  emotion: 'all',
  setFeedType: (feedType) => set({ feedType }),
  setEmotion: (emotion) => set({ emotion }),
}));

export const mapFeedEmotionToApiEmotion = (
  emotion: FeedEmotion,
): Emotion | undefined => {
  return EMOTION_TO_API_MAP[emotion];
};
