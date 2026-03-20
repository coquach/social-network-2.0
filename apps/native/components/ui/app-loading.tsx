import { Card } from 'heroui-native/card';
import { Spinner } from 'heroui-native/spinner';
import React from 'react';
import { View } from 'react-native';

import { AppModal } from '~/components/ui/app-modal';

type AppLoadingContentProps = {
  label?: string;
  description?: string;
};

type AppLoadingOverlayProps = AppLoadingContentProps & {
  visible: boolean;
};

export function AppLoadingBlock({
  label = 'Dang xu ly',
  description,
}: AppLoadingContentProps) {
  return (
    <Card className="items-center gap-3 rounded-3xl border border-app-border bg-app-surface px-5 py-6 dark:border-app-border-dark dark:bg-app-surface-dark">
      <Spinner size="sm" color="default" />
      <Card.Title className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
        {label}
      </Card.Title>
      {description ? (
        <Card.Description className="text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
          {description}
        </Card.Description>
      ) : null}
    </Card>
  );
}

export function AppLoadingOverlay({
  visible,
  label = 'Dang xu ly',
  description,
}: AppLoadingOverlayProps) {
  return (
    <AppModal visible={visible} onClose={() => {}} dismissible={false}>
      <View className="w-full max-w-xs">
        <AppLoadingBlock label={label} description={description} />
      </View>
    </AppModal>
  );
}
