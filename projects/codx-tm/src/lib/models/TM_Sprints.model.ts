export class TM_Sprints {
  iterationID: string;
  iterationType: string;
  iterationName: string;
  interval: string;
  year: number;
  month: number;
  week: number;
  startDate: Date;
  endDate: Date;
  memo: string;
  status: string = '1';
  areaID: string;
  projectID: string;
  resources: string;
  viewMode: string;
  viewTemplate: string;
  isShared: boolean = true;
  owner: string;
  bUID: string;
  note: string;
  closed: boolean;
  closedOn: Date;
  closedBy: string;
  attachments?: number;
  comments?: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  employeeID: string;
  positionID: string;
  orgUnitID: string;
  divisionID: string;
}

export class TabModelSprints {
  name: 'Dashboard' | 'Công việc' | 'Lịch sử' | 'Bình luận' | 'Họp định kì' | string;
  textDefault: string;
  isActive: boolean;
}
