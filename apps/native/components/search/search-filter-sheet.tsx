import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Emotion, SearchGroupSortBy } from '@repo/shared';

import { cn } from '~/lib/cn';
import type { Tab } from '~/components/search/search-tabs';

export type FilterOrder = 'ASC' | 'DESC';

export type UserFilter = {
  sortOrder: FilterOrder;
};

export type PostFilter = {
  emotion?: Emotion;
  sortOrder: FilterOrder;
};

export type GroupFilter = {
  sortBy: SearchGroupSortBy;
  order: FilterOrder;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  activeTab: Tab;
  userFilter: UserFilter;
  postFilter: PostFilter;
  groupFilter: GroupFilter;
  onUserFilterChange: (next: UserFilter) => void;
  onPostFilterChange: (next: PostFilter) => void;
  onGroupFilterChange: (next: GroupFilter) => void;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

type RadioOptionProps = {
  active: boolean;
  label: string;
  description?: string;
  onPress: () => void;
};

type ChipProps = {
  active: boolean;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
};

function FilterSection({ title, children }: SectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
        {title}
      </Text>

      <View className="gap-2">{children}</View>
    </View>
  );
}

function FilterRadioOption({
  active,
  label,
  description,
  onPress,
}: RadioOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-80',
        active
          ? 'border-app-primary bg-app-primary/10 dark:border-app-primary-dark dark:bg-app-primary-dark/10'
          : 'border-app-border bg-app-surface/70 dark:border-app-border-dark dark:bg-app-surface-dark/70',
      )}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2',
          active
            ? 'border-app-primary dark:border-app-primary-dark'
            : 'border-app-border dark:border-app-border-dark',
        )}
      >
        {active ? (
          <View className="h-2.5 w-2.5 rounded-full bg-app-primary dark:bg-app-primary-dark" />
        ) : null}
      </View>

      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            'text-[15px] font-semibold',
            active
              ? 'text-app-primary dark:text-app-primary-dark'
              : 'text-app-fg dark:text-app-fg-dark',
          )}
        >
          {label}
        </Text>

        {description ? (
          <Text className="mt-0.5 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function FilterChip({ active, label, icon, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-2 rounded-full border px-3 py-2 active:opacity-80',
        active
          ? 'border-app-primary bg-app-primary/10 dark:border-app-primary-dark dark:bg-app-primary-dark/10'
          : 'border-app-border bg-app-surface/70 dark:border-app-border-dark dark:bg-app-surface-dark/70',
      )}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#0ea5e9' : '#64748b'}
        />
      ) : null}

      <Text
        className={cn(
          'text-sm font-medium',
          active
            ? 'text-app-primary dark:text-app-primary-dark'
            : 'text-app-fg dark:text-app-fg-dark',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function UserFilterContent({
  value,
  onChange,
}: {
  value: UserFilter;
  onChange: (next: UserFilter) => void;
}) {
  return (
    <FilterSection title="Sắp xếp">
      <FilterRadioOption
        active={value.sortOrder === 'DESC'}
        label="Mới nhất"
        description="Hiển thị kết quả mới trước"
        onPress={() => onChange({ sortOrder: 'DESC' })}
      />

      <FilterRadioOption
        active={value.sortOrder === 'ASC'}
        label="Cũ nhất"
        description="Hiển thị kết quả cũ trước"
        onPress={() => onChange({ sortOrder: 'ASC' })}
      />
    </FilterSection>
  );
}

const POST_EMOTION_OPTIONS: Array<{
  value?: Emotion;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  {
    value: undefined,
    label: 'Tất cả',
    icon: 'apps-outline',
  },
  {
    value: Emotion.JOY,
    label: 'Vui vẻ',
    icon: 'happy-outline',
  },
  {
    value: Emotion.SADNESS,
    label: 'Buồn',
    icon: 'sad-outline',
  },
  {
    value: Emotion.ANGER,
    label: 'Tức giận',
    icon: 'flame-outline',
  },
  {
    value: Emotion.FEAR,
    label: 'Lo lắng',
    icon: 'warning-outline',
  },
  {
    value: Emotion.DISGUST,
    label: 'Khó chịu',
    icon: 'close-circle-outline',
  },
  {
    value: Emotion.SURPRISE,
    label: 'Bất ngờ',
    icon: 'sparkles-outline',
  },
  {
    value: Emotion.NEUTRAL,
    label: 'Trung tính',
    icon: 'ellipse-outline',
  },
];

function PostFilterContent({
  value,
  onChange,
}: {
  value: PostFilter;
  onChange: (next: PostFilter) => void;
}) {
  return (
    <View className="gap-5">
      <FilterSection title="Sắp xếp">
        <FilterRadioOption
          active={value.sortOrder === 'DESC'}
          label="Mới nhất"
          description="Hiển thị bài viết mới trước"
          onPress={() =>
            onChange({
              ...value,
              sortOrder: 'DESC',
            })
          }
        />

        <FilterRadioOption
          active={value.sortOrder === 'ASC'}
          label="Cũ nhất"
          description="Hiển thị bài viết cũ trước"
          onPress={() =>
            onChange({
              ...value,
              sortOrder: 'ASC',
            })
          }
        />
      </FilterSection>

      <FilterSection title="Cảm xúc">
        <View className="flex-row flex-wrap gap-2">
          {POST_EMOTION_OPTIONS.map((option) => {
            const active = (value.emotion ?? undefined) === option.value;

            return (
              <FilterChip
                key={option.label}
                active={active}
                label={option.label}
                icon={option.icon}
                onPress={() =>
                  onChange({
                    ...value,
                    emotion: option.value,
                  })
                }
              />
            );
          })}
        </View>
      </FilterSection>
    </View>
  );
}

const GROUP_FIELD_OPTIONS: Array<{
  value: SearchGroupSortBy;
  label: string;
}> = [
  {
    value: SearchGroupSortBy.MEMBERS,
    label: 'Thành viên',
  },
  {
    value: SearchGroupSortBy.CREATED_AT,
    label: 'Ngày tạo',
  },
];

function GroupFilterContent({
  value,
  onChange,
}: {
  value: GroupFilter;
  onChange: (next: GroupFilter) => void;
}) {
  return (
    <View className="gap-5">
      <FilterSection title="Sắp xếp theo">
        {GROUP_FIELD_OPTIONS.map((option) => (
          <FilterRadioOption
            key={option.value}
            active={value.sortBy === option.value}
            label={option.label}
            onPress={() =>
              onChange({
                ...value,
                sortBy: option.value,
              })
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Thứ tự">
        <FilterRadioOption
          active={value.order === 'DESC'}
          label="Giảm dần"
          description={
            value.sortBy === SearchGroupSortBy.MEMBERS
              ? 'Nhiều thành viên nhất'
              : 'Mới tạo nhất'
          }
          onPress={() =>
            onChange({
              ...value,
              order: 'DESC',
            })
          }
        />

        <FilterRadioOption
          active={value.order === 'ASC'}
          label="Tăng dần"
          description={
            value.sortBy === SearchGroupSortBy.MEMBERS
              ? 'Ít thành viên nhất'
              : 'Cũ nhất'
          }
          onPress={() =>
            onChange({
              ...value,
              order: 'ASC',
            })
          }
        />
      </FilterSection>
    </View>
  );
}

export function SearchFilterSheet({
  onClose,
  activeTab,
  userFilter,
  postFilter,
  groupFilter,
  onUserFilterChange,
  onPostFilterChange,
  onGroupFilterChange,
}: Props) {
  const insets = useSafeAreaInsets();

  const snapPoints = React.useMemo(() => ['75%'], []);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
      handleIndicatorStyle={{
        backgroundColor: '#94a3b8',
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 20),
          gap: 20,
        }}
      >
        <View className="pb-2">
          <Text className="text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
            Bộ lọc
          </Text>
        </View>

        {activeTab === 'users' ? (
          <UserFilterContent value={userFilter} onChange={onUserFilterChange} />
        ) : activeTab === 'posts' ? (
          <PostFilterContent value={postFilter} onChange={onPostFilterChange} />
        ) : (
          <GroupFilterContent
            value={groupFilter}
            onChange={onGroupFilterChange}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

export default React.memo(SearchFilterSheet);
