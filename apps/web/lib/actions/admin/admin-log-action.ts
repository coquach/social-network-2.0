import api from "@/lib/api-client";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { AuditLogResponseDTO, LogType } from "@/models/log/logDTO";

export interface AuditLogQuery extends CursorPagination {
  logType?: LogType;
  actorId?: string;
}

export const getAuditLogs = async (
  token: string,
  filter: AuditLogQuery
): Promise<CursorPageResponse<AuditLogResponseDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<AuditLogResponseDTO>>(
      `/logs`,
      { 
        params: filter,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
};