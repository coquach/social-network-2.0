import { MediaDTO, TargetType } from "../enums/social.enum";

export enum ContentStatus {
  ACTIVE = 'ACTIVE', // hiển thị bình thường
  //   HIDDEN = 'HIDDEN',        // admin ẩn
  //   DELETED = 'DELETED',      // xóa vĩnh viễn (nếu có)
  //   PENDING = 'PENDING',      // chờ duyệt
  VIOLATED = 'VIOLATED', // vi phạm
}


export interface ContentEntryDTO {
  id: string;
  type: TargetType;
  content: string;
  medias?: MediaDTO[];
  reportPendingCount: number;
  status: ContentStatus;
  createdAt: Date;
}