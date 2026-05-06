import React from 'react';

type SignOutHandler = () => Promise<void>;

export function useProfileLogout(signOut: SignOutHandler) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const openLogoutModal = React.useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = React.useCallback(() => {
    if (!isSigningOut) {
      setIsLogoutModalOpen(false);
    }
  }, [isSigningOut]);

  const confirmLogout = React.useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutModalOpen(false);
    }
  }, [isSigningOut, signOut]);

  return {
    isLogoutModalOpen,
    isSigningOut,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  };
}
