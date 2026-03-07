export interface GroupLogDTO {
  id: string;
  groupId: string;
  userId: string;
  eventType: string;
  content: string;
  createdAt: Date;
}