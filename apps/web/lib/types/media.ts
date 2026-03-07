import { MediaType } from "@/models/social/enums/social.enum";

export interface MediaItem {
  file: File;
  type: MediaType;
}
