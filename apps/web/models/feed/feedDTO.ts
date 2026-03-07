import { PostSnapshotDTO } from "../social/post/postDTO";
import { SharePostSnapshotDTO } from "../social/post/sharePostDTO";

export enum FeedType {
  POST= 'POST',
  SHARE= 'SHARE',
}
export interface FeedDTO {
  id: string,
  type: FeedType,
  item: PostSnapshotDTO | SharePostSnapshotDTO,
}