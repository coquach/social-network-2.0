import { MediaItem } from '@/lib/types/media';
import { Emotion, MediaType } from '@/models/social/enums/social.enum';

/**
 * Shared state for CreatePost compound components
 */
export interface CreatePostContextValue {
  // Form state (using any to avoid tanstack/react-form type complexity)
  form: any;

  // Media state
  media: MediaItem[];
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>;

  previews: {
    key: string;
    file: File;
    type: MediaType;
    preview: string;
  }[];

  // Feeling state
  openFeeling: boolean;
  setOpenFeeling: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFeeling: { emoji: string; name: string; type: Emotion; color: string } | null;

  // Submit state
  isPending: boolean;
  handleSubmit: () => void;

  // Config
  groupId?: string;
  isPrivacyChangeable: boolean;
  placeholder: string;
  userId: string;

  // Constants
  maxMedia: number;
  maxWords: number;
}

/**
 * Props for CreatePost root component
 */
export interface CreatePostProps {
  placeholder?: string;
  groupId?: string;
  isPrivacyChangeable?: boolean;
  children?: React.ReactNode;
}

/**
 * Props for compound components that access context
 */
export interface CreatePostComponentProps {
  className?: string;
  children?: React.ReactNode;
}
