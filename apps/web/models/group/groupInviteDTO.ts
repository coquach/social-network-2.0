import { GroupDTO } from './groupDTO';

export interface InvitedGroupDTO extends GroupDTO {
  inviterNames: string[];
}
