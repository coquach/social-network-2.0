import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '~/providers/theme-provider';
import { setOnboardingSeen } from '~/utils/storage';
import { PrimaryButton } from '~/components/ui/app-button';

type OnboardingItem = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
};

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: '1',
    image: require('../../assets/onboarding/image1.png'),
    title: 'Chào mừng đến với Sentimeta',
    description: 'Nơi bạn chia sẻ câu chuyện và cảm xúc theo cách chân thật nhất.',
  },
  {
    id: '2',
    image: require('../../assets/onboarding/image2.png'),
    title: 'Chia sẻ cảm xúc thật của bạn',
    description:
      'Mỗi bài đăng không chỉ kể điều đã xảy ra, mà còn nói lên điều bạn đang cảm nhận.',
  },
  {
    id: '3',
    image: require('../../assets/onboarding/image3.png'),
    title: 'Kết nối sâu hơn mỗi ngày',
    description:
      'Kết nối đúng người, trò chuyện sâu hơn và xây dựng cộng đồng tích cực mỗi ngày.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, resolvedTheme } = useAppTheme();
  const listRef = React.useRef<FlatList<OnboardingItem> | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const finishOnboarding = React.useCallback(async () => {
    await setOnboardingSeen();
    router.replace('/(auth)/sign-in');
  }, [router]);

  const onMomentumEnd = React.useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(nextIndex);
    },
    [width],
  );

  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-end px-6 pt-16">
        <Pressable onPress={() => void finishOnboarding()}>
          <Text className="text-sm font-medium" style={{ color: colors.mutedForeground }}>
            Bỏ qua
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_DATA}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index }) => (
          <View style={{ width }} className="px-6">
            <View className="mt-2 overflow-hidden rounded-[28px]">
              <Image source={item.image} resizeMode="contain" className="h-[370px] w-full" />
            </View>
            <View className="mt-4 gap-2 px-3">
              <Text
                className="text-center text-3xl font-bold leading-tight"
                style={{ color: colors.foreground }}
              >
                {item.title}
              </Text>
              <Text
                className="text-center text-base leading-6"
                style={{ color: colors.mutedForeground }}
              >
                {item.description}
              </Text>

              {index === ONBOARDING_DATA.length - 1 ? (
                <View className="mt-4">
                  <PrimaryButton
                    label="Hoàn tất"
                    onPress={() => void finishOnboarding()}
                  />
                </View>
              ) : null}
            </View>
          </View>
        )}
      />

      <View
        className="flex-row items-center justify-center gap-2"
        style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 14 }}
      >
        {ONBOARDING_DATA.map((_, index) => (
          <Pressable key={String(index)} >
            <View
              className={`h-2.5 rounded-full ${activeIndex === index ? 'w-8' : 'w-2.5'}`}
              style={{
                backgroundColor:
                  activeIndex === index
                    ? colors.primary
                    : resolvedTheme === 'dark'
                      ? 'rgba(255,255,255,0.35)'
                      : 'rgba(15,23,42,0.25)',
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
