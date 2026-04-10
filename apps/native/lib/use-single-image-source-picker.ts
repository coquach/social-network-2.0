import {
  MediaType,
  type NativeUploadFileDescriptor,
  type UploadableFile,
} from "@repo/shared";
import React from "react";

import { pickSingleImage } from "~/lib/media-picker";

export type SelectedUploadImage = {
  previewUri: string;
  uploadFile: UploadableFile<NativeUploadFileDescriptor>;
};

type UseSingleImageSourcePickerOptions = {
  permissionAlert: {
    title: string;
    cameraMessage: string;
    libraryMessage: string;
  };
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  fileNamePrefix?: string;
};

function buildNativeFileDescriptor(
  params: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
  },
  fileNamePrefix: string,
): NativeUploadFileDescriptor {
  return {
    uri: params.uri,
    name:
      params.fileName?.trim() ||
      `${fileNamePrefix}-${Date.now().toString()}.jpg`,
    type: params.mimeType?.trim() || "image/jpeg",
  };
}

export function useSingleImageSourcePicker({
  permissionAlert,
  allowsEditing = true,
  aspect = [1, 1],
  quality = 1,
  fileNamePrefix = "image",
}: UseSingleImageSourcePickerOptions) {
  const [selectedImage, setSelectedImage] =
    React.useState<SelectedUploadImage | null>(null);

  const pickImage = React.useCallback(
    async (source: "library" | "camera") => {
      const asset = await pickSingleImage({
        source,
        permissionAlert: {
          title: permissionAlert.title,
          message:
            source === "camera"
              ? permissionAlert.cameraMessage
              : permissionAlert.libraryMessage,
        },
        allowsEditing,
        aspect,
        quality,
      });

      if (!asset) {
        return null;
      }

      const nextImage: SelectedUploadImage = {
        previewUri: asset.uri,
        uploadFile: {
          file: buildNativeFileDescriptor(
            {
              uri: asset.uri,
              fileName: asset.fileName,
              mimeType: asset.mimeType,
            },
            fileNamePrefix,
          ),
          type: MediaType.IMAGE,
          previewUri: asset.uri,
        },
      };

      setSelectedImage(nextImage);
      return nextImage;
    },
    [
      allowsEditing,
      aspect,
      fileNamePrefix,
      permissionAlert.cameraMessage,
      permissionAlert.libraryMessage,
      permissionAlert.title,
      quality,
    ],
  );

  const clearImage = React.useCallback(() => {
    setSelectedImage(null);
  }, []);

  return {
    selectedImage,
    setSelectedImage,
    pickImage,
    clearImage,
  };
}
