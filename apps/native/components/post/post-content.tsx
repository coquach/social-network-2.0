import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface PostContentProps {
  text?: string | null;
  isShared?: boolean;
  collapsedLines?: number;
  defaultExpanded?: boolean;
}

export function PostContent({
  text,
  isShared = false,
  collapsedLines = 4,
  defaultExpanded = false,
}: PostContentProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [isTruncated, setIsTruncated] = React.useState(false);

  const content = (text ?? '').toString();
  const hasContent = content.trim().length > 0;

  if (!hasContent) return null;

  return (
    <View className="gap-1.5">
      <Text
        numberOfLines={expanded ? undefined : collapsedLines}
        // Detect truncation based on measured lines when collapsed.
        onTextLayout={(e) => {
          if (expanded) return;
          const lineCount = e.nativeEvent.lines.length;
          setIsTruncated(lineCount > collapsedLines);
        }}
        className={
          isShared
            ? 'text-base leading-6 text-app-muted-fg dark:text-app-muted-fg-dark'
            : 'text-base leading-6 text-app-fg dark:text-app-fg-dark'
        }
        style={{ includeFontPadding: false }}
      >
        {content}
      </Text>

      {isTruncated && (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setExpanded((prev) => !prev)}
          className="self-start rounded-md px-1 py-0.5 active:opacity-70"
        >
          <Text className="text-xs font-semibold text-app-primary dark:text-sky-600">
            {expanded ? 'Thu gon' : '... Xem them'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
