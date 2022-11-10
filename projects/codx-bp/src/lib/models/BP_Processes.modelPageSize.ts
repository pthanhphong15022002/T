import { BP_Processes } from './BP_Processes.model';

export class BP_ProcessesPageSize {
  listProcess: BP_Processes[];
  userParama: UserParama[];
}
export class UserParama {
  pageNumber: number;
  pageSize: number;
}
