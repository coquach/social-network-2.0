import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { ProfileCover } from '~/components/profile/profile-cover';
import { ProfileFriendsSection } from '~/components/profile/profile-friends-section';
import { ProfileHero } from '~/components/profile/profile-hero';
import { ProfileLogoutModal } from '~/components/profile/profile-logout-modal';
import {
  fallbackAvatarImage,
  friendItems,
  photoItems,
  postItems,
  profileBio,
  profileCoverImage,
} from '~/components/profile/profile-mock-data';
import { ProfilePhotosSection } from '~/components/profile/profile-photos-section';
import { ProfilePostsSection } from '~/components/profile/profile-posts-section';
import { styles } from '~/components/profile/profile-styles';
import { INDIGO_ETHER } from '~/components/profile/profile-theme';
import { ProfileTopBar } from '~/components/profile/profile-top-bar';
import { useProfileLogout } from '~/components/profile/use-profile-logout';
import { useAppTheme } from '~/providers/theme-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { resolvedTheme } = useAppTheme();
  const { handleScroll } = useTabBarAutoHide();
  const insets = useSafeAreaInsets();

  const colors = React.useMemo(
    () => INDIGO_ETHER[resolvedTheme === 'dark' ? 'dark' : 'light'],
    [resolvedTheme],
  );

  const elevatedCardStyle = React.useMemo(
    () => ({
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: resolvedTheme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 14,
      elevation: resolvedTheme === 'dark' ? 1 : 3,
    }),
    [colors.shadow, colors.surface, resolvedTheme],
  );

  const topBarPaddingTop = insets.top + 8;

  const {
    isLogoutModalOpen,
    isSigningOut,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  } = useProfileLogout(() => signOut());

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ProfileTopBar
          colors={colors}
          paddingTop={topBarPaddingTop}
          onBack={() => router.replace('/(main)/newfeeds')}
          onOpenSettings={openLogoutModal}
        />

        <ScrollView
          style={styles.scrollView}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 110, 130),
          }}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <ProfileCover colors={colors} imageUri={profileCoverImage} />

          <View style={styles.contentWrap}>
            <ProfileHero
              colors={colors}
              elevatedCardStyle={elevatedCardStyle}
              avatarUri={user?.imageUrl ?? fallbackAvatarImage}
              userName={user?.fullName ?? 'Alexandria Sterling'}
              bio={profileBio}
              onEditPress={() => {}}
            />

            <ProfileFriendsSection
              colors={colors}
              elevatedCardStyle={elevatedCardStyle}
              items={friendItems}
            />

            <ProfilePhotosSection
              colors={colors}
              elevatedCardStyle={elevatedCardStyle}
              items={photoItems}
            />

            <ProfilePostsSection
              colors={colors}
              elevatedCardStyle={elevatedCardStyle}
              items={postItems}
            />
          </View>
        </ScrollView>
      </View>

      <ProfileLogoutModal
        visible={isLogoutModalOpen}
        isSigningOut={isSigningOut}
        colors={colors}
        onClose={closeLogoutModal}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}
