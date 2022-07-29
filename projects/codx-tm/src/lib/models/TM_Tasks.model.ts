import { TM_Sprints } from "./TM_Sprints.model";

export class TM_Tasks {
  recID:string;
  taskID: string;
  taskName: string;
  tags: string;
  taskType: string;
  category: string;
  taskGroupID: string;
  parentID: string;
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
  status: string = '10';
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
  approveControl :string
  approveComments :string
  approveStatus: string;
  approvers: string;
  approvedOn: any;
  approvedBy: string;
  isAssign:boolean;
  isOverdue:boolean;
  privateTask: boolean;
  remainder: boolean;
  remainderDays: number;
  reOpens: number;
  splitedNo: number;
  attachments: number;
  comments : number;
  avatar :string;
  confirmControl: string;
  confirmStatus: string;
  confirmDate: Date;
  confirmComment:string
  verifyControl:string ;
  verifyStatus:string ;
  verifyDate:Date ;
	verifyBy :string;
	verifyComment:string
  extends : number ;
  extendStatus:string;
  autoCompleted:string;
  closed : boolean;
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
	sprints: TM_Sprints
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
  positionName : string;
  departmentName : string ;
}
