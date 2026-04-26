import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { MediaType } from '@repo/shared';

type PermissionAlertOptions = {
  title: string;
  message: string;
};

type PickSingleImageOptions = {
  source: 'camera' | 'library';
  permissionAlert: PermissionAlertOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
};

type PickLibraryMediaOptions = {
  permissionAlert: PermissionAlertOptions;
  mediaTypes: Array<'images' | 'videos'>;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  quality?: number;
};

async function ensurePermission(
  source: 'camera' | 'library',
  permissionAlert: PermissionAlertOptions,
) {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permission.granted) {
    return true;
  }

  Alert.alert(permissionAlert.title, permissionAlert.message);
  return false;
}

export async function pickSingleImage({
  source,
  permissionAlert,
  allowsEditing = true,
  aspect = [1, 1],
  quality = 1,
}: PickSingleImageOptions) {
  const hasPermission = await ensurePermission(source, permissionAlert);
  if (!hasPermission) {
    return null;
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing,
          aspect,
          quality,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing,
          aspect,
          quality,
        });

  if (result.canceled) {
    return null;
  }

  return result.assets[0] ?? null;
}

export async function pickLibraryMediaAssets({
  permissionAlert,
  mediaTypes,
  allowsMultipleSelection = true,
  selectionLimit,
  quality = 1,
}: PickLibraryMediaOptions) {
  const hasPermission = await ensurePermission('library', permissionAlert);
  if (!hasPermission) {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsMultipleSelection,
    selectionLimit,
    quality,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets;
}

type PickComposerMediaOptions = {
  mediaType: 'images' | 'videos';
  selectionLimit?: number;
  permissionAlert: PermissionAlertOptions;
};

type PickedComposerMediaItem = {
  key: string;
  preview: string;
  fileName: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
  type: MediaType;
};

export async function pickComposerMediaAssets({
  mediaType,
  selectionLimit,
  permissionAlert,
}: PickComposerMediaOptions): Promise<PickedComposerMediaItem[]> {
  const assets = await pickLibraryMediaAssets({
    permissionAlert,
    mediaTypes: [mediaType],
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 0.9,
  });

  return assets.map((asset, index) => {
    const type = mediaType === 'videos' ? MediaType.VIDEO : MediaType.IMAGE;
    const fallbackName = `${mediaType === 'videos' ? 'video' : 'image'}-${Date.now()}-${index}`;
    const fileName = asset.fileName?.trim() || fallbackName;
    const fileType =
      asset.mimeType?.trim() ||
      (type === MediaType.VIDEO ? 'video/mp4' : 'image/jpeg');

    return {
      key: `${fileName}-${asset.fileSize ?? 'na'}-${asset.assetId ?? asset.uri}`,
      preview: asset.uri,
      fileName,
      file: {
        uri: asset.uri,
        name: fileName,
        type: fileType,
      },
      type,
    };
  });
}
