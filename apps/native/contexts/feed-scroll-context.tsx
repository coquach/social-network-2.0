import React from 'react';

type FeedScrollContextValue = {
  scrollEnabled: boolean;
  setScrollEnabled: (enabled: boolean) => void;
};

const noop = () => {};

const FeedScrollContext = React.createContext<FeedScrollContextValue>({
  scrollEnabled: true,
  setScrollEnabled: noop,
});

type FeedScrollProviderProps = {
  children: React.ReactNode;
  value: FeedScrollContextValue;
};

export function FeedScrollProvider({
  children,
  value,
}: FeedScrollProviderProps) {
  return (
    <FeedScrollContext.Provider value={value}>
      {children}
    </FeedScrollContext.Provider>
  );
}

export function useFeedScroll() {
  return React.useContext(FeedScrollContext);
}
