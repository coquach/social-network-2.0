import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useTabBarVisibility } from './tab-bar-visibility-context';

const TOP_THRESHOLD = 12;
const DELTA_THRESHOLD = 8;

export function useTabBarAutoHide() {
  const { setIsVisible } = useTabBarVisibility();
  const lastOffsetYRef = React.useRef(0);
  const isVisibleRef = React.useRef(true);

  const setVisibility = React.useCallback(
    (nextVisible: boolean) => {
      if (isVisibleRef.current === nextVisible) {
        return;
      }

      isVisibleRef.current = nextVisible;
      setIsVisible(nextVisible);
    },
    [setIsVisible],
  );

  useFocusEffect(
    React.useCallback(() => {
      lastOffsetYRef.current = 0;
      isVisibleRef.current = true;
      setIsVisible(true);

      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible]),
  );

  const handleOffsetChange = React.useCallback(
    (offsetY: number) => {
      const nextOffset = Math.max(0, offsetY);
      const delta = nextOffset - lastOffsetYRef.current;

      if (nextOffset <= TOP_THRESHOLD) {
        setVisibility(true);
        lastOffsetYRef.current = nextOffset;
        return;
      }

      if (delta > DELTA_THRESHOLD) {
        setVisibility(false);
      } else if (delta < -DELTA_THRESHOLD) {
        setVisibility(true);
      }

      lastOffsetYRef.current = nextOffset;
    },
    [setVisibility],
  );

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      handleOffsetChange(event.nativeEvent.contentOffset.y);
    },
    [handleOffsetChange],
  );

  return {
    handleOffsetChange,
    handleScroll,
  };
}
