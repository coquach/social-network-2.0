export type ProfilePalette = {
  background: string;
  surface: string;
  surfaceLow: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  primaryForeground: string;
  outline: string;
  glass: string;
  coverOverlay: string;
  shadow: string;
  divider: string;
};

export type FriendItem = {
  name: string;
  image: string;
};

export type PostItem = {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isQuote?: boolean;
};
