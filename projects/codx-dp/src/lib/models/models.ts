import { Util } from "codx-core";

export class DP_ProcessGroups {
  recID: string;
  groupID: string;
  groupName: string;
  groupName2: string;
  category: string;
  memo: string;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
export class DP_Processes {
  recID: string;
  category: string;
  processNo: string;
  processName: string;
  groupID: string;
  applyFor: string;
  memo: string;
  status: string;
  activedOn: Date;
  stopOn: Date;
  closeInstanceControl: number;
  showInstanceControl: string;
  note: string;
  options: string; // json
  attachments: number;
  comments: number;
  permissions: DP_Processes_Permission[]; // string
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  instanceNoSetting: string;
}

export class DP_Processes_Permission {
  recID: string;
  transID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  full: boolean;
  create: boolean;
  read: boolean;
  update: boolean;
  assign: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
export class DP_Steps {
  recID: string = Util.uid();
  processID: string;
  stepNo: number;
  stepName: string;
  memo: string;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  excludeDayoff: string;
  note: string;
  assignControl: string;
  transferControl: string ;
  taskControl: string;
  leadtimeControl: boolean;
  durationControl: boolean;
  startControl: string ; // update bit to string
  reScheduleTasks: boolean;
  options: string; // json
  roles: DP_Steps_Roles[]= []; // objects
  isSuccessStep: boolean;
  isFailStep: boolean;
  reasonControl: boolean;
  reasons: DP_Steps_Reasons[]= []; // objects
  taskGroups: DP_Steps_TaskGroups[]= []; // objects
  tasks: DP_Steps_Tasks[]= []; // objects
  fields: DP_Steps_Fields[]= []; // objects
  isUsed: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  showColumnControl: number;
  constructor(){
    this.recID = Util.uid();
    this.durationDay = 0;
    this.durationHour = 0;
    this.taskGroups = [];
    this.assignControl='1';
    this.transferControl = '0';
    this.durationDay = 0;
    this.reScheduleTasks = true;
    this.leadtimeControl = true;
    this.startControl ='0'
  }
}
export class DP_Steps_Roles {
  recID: string;
  instanceID: string;
  stepID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Steps_Reasons {
  recID: string;
  stepID: string;
  reasonName: string;
  reasonType: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Steps_TaskGroups {
  recID: string;
  stepID: string;
  indexNo: number;
  taskGroupName: String;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  roles: DP_Steps_TaskGroups_Roles[]= []; // objects
  statusCodeID: string;
  memo: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Steps_TaskGroups_Roles {
  recID: string;
  taskGroupID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Steps_Tasks {
  recID: string;
  stepID: string;
  indexNo: number;
  taskType: string;
  taskName: string;
  taskGroupID: string;
  parentID: string;
  reference: string;
  statusCodeID: string;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  reminders: string; // Json;
  reminderBy: string;
  dependOnTasks: string;
  dependRule: string;
  roles: DP_Steps_Tasks_Roles[]= []; // objects;
  assignControl: string;
  memo: string;
  requireCompleted: boolean;
  createTask: boolean;
  createTaskControl: string;
  stop: boolean;
  attachments: number;
  callType: boolean;
  isOnline: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Steps_Tasks_Roles {
  recID: string;
  taskID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  createdOn: Date;
  modifiedOn: Date;
  modifiedBy: string;
  createdBy: string;
}

export class DP_Steps_Fields {
  recID: string;
  processID: string;
  stepID: string;
  fieldName: string;
  title: string;
  dataType: string;
  dataFormat: string;
  refType: string;
  refValue: string;
  multiselect: boolean;
  rank: number;
  rankIcon: string;
  isRequired: boolean;
  defaultValue: string;
  note: string;
  sorting: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instances {
  recID: string;
  processID: string;
  instanceNo: string;
  title: string;
  memo: string;
  datas: string; // Json;
  taskGroups: DP_Instances_Steps_TaskGroups[]= []; // objects;
  tasks: DP_Instances_Steps_Tasks[]= []; // objects;
  currentStep: number;
  statusCodeID: string;
  status: string;
  lastUpdate: Date;
  attachments: number;
  comments: number;
  refType: string;
  refID: string;
  endDate: Date;
  objectType: string;
  objectID: string;
  closed: boolean;
  closedOn: Date;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  permissions: DP_Instances_Permissions[];
}

export class DP_Instances_Permissions {
  recID: string;
  instanceID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  create: boolean;
  read: boolean;
  update: boolean;
  assign: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  // publish:	; chưa có type
  // allowPermit:	; chưa có type
  // approveStatus:	; chưa có type
  // startDate:	; chưa có type
  // endDate:	; chưa có type
  // isActive:	; chưa có type
}

export class DP_Instances_Steps {
  recID: string;
  instanceID: string;
  indexNo: number;
  stepID: string;
  stepName: string;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  actualStart: Date;
  actualEnd: Date;
  actualHours: number;
  roles: DP_Instances_Steps_Roles[]= []; // objects;
  taskGroups: DP_Instances_Steps_TaskGroups[] = []; // objects;
  tasks: DP_Instances_Steps_Tasks[]= []; // objects;
  fields: DP_Instance_Steps_Fields[]= []; //	objects;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  reasons: DP_Instances_Steps_Reasons[]= []; // objects
}

export class DP_Instances_Steps_Roles {
  recID: string;
  instanceID: string;
  stepID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instances_Steps_TaskGroups {
  recID: string;
  instanceID: string;
  stepID: string;
  indexNo: number;
  taskGroupName: String;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  actualStart: Date;
  actualEnd: Date;
  actualHours: number;
  roles: DP_Instances_Steps_TaskGroups_Roles[] = [];
  statusCodeID: string;
  memo: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
export class DP_Instances_Steps_TaskGroups_Roles {
  recID: string;
  taskGroupID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instances_Steps_Tasks {
  recID: string;
  instanceID: string;
  stepID: string;
  indexNo: number;
  taskType: string;
  taskName: string;
  taskGroupID: string;
  parentID: string;
  reference: string;
  durationDay: number;
  durationHour: number;
  numbererval: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  actualStart: Date;
  actualEnd: Date;
  actualHours: number;
  statusCodeID: string;
  status: string;
  reminders: string;
  reminderBy: string;
  dependOnTasks: string;
  dependRule: string;
  assignControl: string;
  requireCompleted: boolean;
  roles: DP_Instances_Steps_Tasks_Roles[]= [];
  memo: string;
  createTask: boolean;
  createTaskControl: string;
  lastUpdate: Date;
  comment: string;
  attachments: number;
  comments: number;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instances_Steps_Tasks_Roles {
  recID: string;
  taskID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instance_Steps_Fields {
  recID: string;
  instanceID: string;
  stepID: string;
  fieldName: string;
  title: string;
  dataType: string;
  dataFormat: string;
  dataValue: string;
  refType: string;
  refValue: string;
  multiselect: boolean;
  rank: number;
  rankIcon: string;
  isRequired: boolean;
  defaultValue: string;
  note: string;
  sorting: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class DP_Instances_Steps_Reasons {
  recID: string;
  processID: string;
  instanceID: string;
  stepID: string;
  reasonName: string;
  reasonType: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class TabModel {
  name: 'Nhiệm vụ' | 'Dashboard' | string;
  textDefault: string;
  template?: any;
  isActive: boolean = false;
}
