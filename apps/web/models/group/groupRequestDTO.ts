import { InviteStatus } from "./enums/group-invite-status.enum";

export interface JoinRequestResponseDTO {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: InviteStatus;
}