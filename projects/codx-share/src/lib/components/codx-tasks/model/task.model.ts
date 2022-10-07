import { FormControl, Validators } from '@angular/forms';
import { StatusTaskGoal } from './enum';

export class FileUpload {
  fileName: string;
  avatar: string;
  thumbnail: string;
  userName: string;
  uploadDate: any;
  extension: string;
  size: any;
  type: any;
  fullName: string;
  tags: any;
  subject: any;
  objectType: any;
  objectID: any;
  funcId: any;
  language: any;
  description: string;
  author: string;
  publisher: string;
  publisherYear: any;
  publisherDate: any;
  copyright: string;
  data: string;
  folderId: string;
  createdBy: any;
  createdOn: any;
  fileSize: any;
}
export class TaskGoal {
  status: StatusTaskGoal;
  text: string;
  recID: string;
}
export class ToDo {
  status: boolean;
  text: string;
}
export class InfoOpenForm {
  taskID: string;
  funtionID: string;
  view: string;
  action: string;
  constructor(taskID, funtionID, view, action = '') {
    this.taskID = taskID;
    this.funtionID = funtionID;
    this.view = view;
    this.action = action;
  }
}

export class CopyForm {
  id: string;
  view: string;
  functionID: string;
  constructor(id, funtionID, view) {
    this.id = id;
    this.view = view;
    this.functionID = funtionID;
  }
}

export class DataSv {
  data: any;
  view: string;
  constructor(data, view) {
    this.data = data;
    this.view = view;
  }
}
//Guid->string
export class RangeLine {
  recID: string;
  rangeID: string;
  breakName: string;
  breakValue: number;
  id: number;
}

export class rangeLine {
  recID: string;
  rangeID: string;
  breakName: string;
  breakValue: number;
  constructor(recID, rangeID, breakName, breakValue) {
    this.recID = recID;
    this.rangeID = rangeID;
    this.breakName = breakName;
    this.breakValue = breakValue;
  }
}

export const RangeLineFormGroup = {
  RecID: new FormControl(''),
  RangeID: new FormControl(''),
  BreakName: new FormControl(null, Validators.required),
  BreakValue: new FormControl(null, Validators.required),
};

//ModelTask
export class TM_Tasks {
  recID: string;
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
  percentage: number;
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
  approveControl: string;
  approveComments: string;
  approveStatus: string;
  approvers: string;
  approvedOn: any;
  approvedBy: string;
  isAssign: boolean;
  isOverdue: boolean;
  privateTask: boolean;
  remainder: boolean;
  remainderDays: number;
  reOpens: number;
  splitedNo: number;
  attachments: number;
  comments: number;
  avatar: string;
  confirmControl: string;
  confirmStatus: string;
  confirmDate: Date;
  confirmComment: string;
  verifyControl: string;
  verifyStatus: string;
  verifyDate: Date;
  verifyBy: string;
  verifyComment: string;
  extends: number;
  extendStatus: string;
  autoCompleted: string;
  closed: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: any;
  modifiedBy: string;
  employeeID: string;
  positionID: string;
  orgUnitID: string;
  divisionID: string;
  departmentID: string;
  companyID: string;
  write: boolean;
  // sprints: TM_Sprints
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
  positionName: string;
  departmentName: string;
}

export class TM_TaskExtends {
  recID: string;
  taskID: string;
  extendApprover: string;
  extendApproverName: string;
  status: string;
  reason: string;
  extendComment: string;
  dueDate: Date;
  extendDate: Date;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class TM_Parameter {
  AdjustHours: string;
  ApproveBy: string;
  ApproveControl: string;
  Approver: string;
  AutoCompleted: string;
  CalendarID: string;
  CompletedControl: string;
  ConfirmControl: string;
  DueDateControl: string;
  EditControl: string;
  ExtendBy: string;
  ExtendControl: string;
  LocationControl: string;
  MaxHours: string;
  MaxHoursControl: string;
  PlanControl: string;
  ProjectControl: string;
  SetPermissionAttachments: string;
  TaskDefault: string;
  UpdateControl: string;
  VerifyBy: string;
  VerifyByType: string;
  VerifyControl: string;
  ReOpenDays: string;
}

export class TM_TaskGroups {
  taskGroupID: string;
  taskGroupName: string;
  taskGroupName2: string;
  taskNoteStatus: string;
  note: string;
  approveControl: string;
  approvers: string;
  approveBy: string;
  maxHoursControl: string;
  maxHours: number;
  locationControl: string;
  planControl: string;
  updateControl: string;
  autoCompleted: string;
  completedControl: string;
  dueDateControl: string;
  extendControl: string;
  extendBy: string;
  confirmControl: string;
  verifyControl: string;
  verifyByType: string;
  verifyBy: string;
  editControl: string;
  projectControl: string;
  attachmentControl: string;
  checkListControl: string;
  checkList: string;
  category: string;
  carentID: string;
  createdOn: Date;
  createBy: string;
  divisionID: string;
  orgUnitID: string;
  positionID: string;
  employeeID: string;
  modifiedBy: string;
  modifiedOn: Date;
  bUID: string;
  owner: string;
  stop: boolean;
  createName: string;
}

export class tmpReferences { 
  recIDReferences : string ;
  refType : string ;
  memo :string ;
  createdBy :string ;
  createByName: string ;
  createdOn :Date ;
  attachments: number;
  comments: number
}


