import React from 'react';

type TabBarVisibilityContextValue = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

const TabBarVisibilityContext = React.createContext<TabBarVisibilityContextValue | null>(null);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = React.useState(true);

  const value = React.useMemo(
    () => ({
      isVisible,
      setIsVisible,
    }),
    [isVisible],
  );

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = React.useContext(TabBarVisibilityContext);

  if (!context) {
    throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider');
  }

  return context;
}
