import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { AuditLogResponseDTO, LogType } from "@/models/log/logDTO";

export interface AuditLogQuery extends CursorPagination {
  logType?: LogType;
  actorId?: string;
}

export const getAuditLogs = async (
  token: string,
  filter: AuditLogQuery,
): Promise<CursorPageResponse<AuditLogResponseDTO>> => {
  try {
    const response = await getApiClient().get<
      CursorPageResponse<AuditLogResponseDTO>
    >(`/logs`, {
      params: filter,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
