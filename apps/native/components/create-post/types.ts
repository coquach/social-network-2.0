import type {
  Audience,
  Emotion,
  MediaType,
  UploadableFile,
} from '@repo/shared';

export type ComposerUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type ComposerMediaItem = UploadableFile & {
  key: string;
  preview: string;
  fileName: string;
  file: ComposerUploadFile;
  type: MediaType;
};

export type ComposerFeeling = {
  emoji: string;
  name: string;
  type: Emotion;
  color: string;
};

export type CreatePostView = 'composer' | 'audience';

export type CreatePostProviderProps = {
  children: React.ReactNode;
  placeholder?: string;
  groupId?: string;
  isPrivacyChangeable?: boolean;
  autoFocusInput?: boolean;
  maxLength?: number;
};

export type CreatePostContextValue = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  audience: Audience;
  setAudience: React.Dispatch<React.SetStateAction<Audience>>;
  media: ComposerMediaItem[];
  previews: ComposerMediaItem[];
  addMedia: (items: ComposerMediaItem[]) => boolean;
  removeMedia: (key: string) => void;
  feeling?: Emotion;
  setFeeling: React.Dispatch<React.SetStateAction<Emotion | undefined>>;
  selectedFeeling: ComposerFeeling | null;
  openFeeling: boolean;
  setOpenFeeling: React.Dispatch<React.SetStateAction<boolean>>;
  view: CreatePostView;
  setView: React.Dispatch<React.SetStateAction<CreatePostView>>;
  openAudienceSelector: () => void;
  closeAudienceSelector: () => void;
  appendContent: (text: string) => void;
  submit: () => Promise<boolean>;
  clearForm: () => void;
  errorMessage: string | null;
  isPending: boolean;
  isSubmitDisabled: boolean;
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  groupId?: string;
  isPrivacyChangeable: boolean;
  placeholder: string;
  autoFocusInput: boolean;
  maxWords: number;
  maxMedia: number;
  maxLength: number;
  charCount: number;
};
