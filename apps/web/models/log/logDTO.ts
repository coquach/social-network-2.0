export enum LogType {
  USER_LOG = 'USER_LOG',
  POST_LOG = 'POST_LOG',
  GROUP_LOG = 'GROUP_LOG',
}

export interface AuditLogResponseDTO {
  id: string;
  actorId: string;
  targetId: string;
  logType: LogType;
  action: string;
  detail: string;
  createdAt: Date;
}


