export class TM_Tasks {
  recID:string;
  taskID: string;
  taskName: string;
  tags: string;
  taskType: string;
  category: string;
  taskGroupID: string;
  parentID: string;
  sourceID: string;
  sourceType: string;
  projectID: string;
  activityID: string;
  iterationID: string;
  recurrence: boolean;
  interval: string;
  weekday: string;
  memo: string;
  memo2: string;
  location: string;
  objectID: string;
  objectType: string;
  status: string = '1';
  statusCode: string;
  reasonCode: string;
  priority: string;
  rank: string;
  points: number;
  estimated: number;
  estimatedCost: number;
  remaining: number;
  assignTo: string;
  assignedOn: Date;
  dueDate: Date;
  startDate: Date;
  startTime: string;
  endDate: Date;
  startedOn: Date;
  percentage: number
  completed: number;
  completedOn: any;
  completedTime: string;
  completedQty: number;
  duration: number;
  lateCode: string;
  refID: any;
  refType: string;
  refNo: string;
  refNote: string;
  note: string;
  owner: string;
  bUID: string;
  attachment: string;
  approvalRule: string;
  approveStatus: string;
  approvers: string;
  approvedOn: any;
  approvedBy: string;
  privateTask: boolean;
  remainder: boolean;
  remainderDays: number;
  reOpens: number;
  splitedNo: number;
  closed: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: any;
  modifiedBy: string;
  employeeID: string;
  positionID: string;
  orgUnitID: string;
  divisionID: string;
  departmentID: string
  companyID :string
  write: boolean;
  extended :boolean;
  isAssign:boolean;
  isOverdue:boolean;
}

export class tmpTaskResource {
  recID: string;
  taskID: string;
  resourceID: string;
  resourceName: string;
  roleType: string;
  memo: string;
  refID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  assign: boolean;
  delete: boolean;
  write: boolean;
  share: boolean;
  position : string
}
