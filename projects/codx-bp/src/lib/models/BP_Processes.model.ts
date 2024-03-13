import { Permission } from '@shared/models/file.model';

export class BP_Processes {
  recID: string;
  processNo: string;
  processName: string;
  processName2: string;
  category: string;
  applyFor: string;
  tags: string;
  groupID: string;
  memo: string;
  status: string;
  approveControl: string;
  publishOn: Date;
  expiredOn: Date;
  stop: boolean;
  note: string;;
  revision: boolean;
  revisionID: string;
  versionNo: string;
  versions: [];
  lastNo: number;
  permissions: BP_Processes_Permissions[];
  steps: BP_Processes_Steps[];
  rattings: [];
  reminder:[];
  settings: any;
  eventControl: string;
  documentControl: any;
  views: number;
  attachments: number;
  comments: number;
  owner: string;;
  buid: string;;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class BP_Processes_Steps {
  id: string;
  recID: string;
  stageID: string;
  parentID: string;
  activityType: string;
  stepNo: number;
  stepName: string;
  stepName2: string;
  memo: string;
  location: string;
  duration: number;
  interval: string;
  reminder: [];
  eventControl: string;
  extendInfo: Array<[]>;
  dependences: Array<[]>;
  note: string;
  owners: string;
  attachments: number;
  comments: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  settings: string;
  stepType:string;
  permissions: any;
  child:any
}
export class BP_ProcessRevisions {
  recID: string;
  versionName: string;
  versionNo: string;
  activedOn: Date;
  comment: string;
  approveStatus: string;
  approvedBy: string;
  approvedOn: Date;
  createdOn: Date;
  createdBy: string;
}
export class BP_ProcessOwners {
  id: string;
  recID: string;
  objectType: string;
  objectID: string;
  objectName: string;
  rAIC: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
// Thông tin Email để gửi
export class tmpInforSentEMail {
  subject: string;
  content: string;
  from: string;
  to: string;
  tenant: string;
  saveTemplate: boolean;
}

export class BP_Processes_Permissions {
  recID: string;
  id: string;
  objectName: string;
  objectID: string;
  objectType: string;
  roleType: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  edit: boolean;
  assign: boolean;
  share: boolean;
  upload: boolean;
  allowPermit: boolean;
  allowUpdateStatus: string;
  isActive: boolean;
  autoCreate: string;
  download: boolean;
  publish: boolean;
  memberType: string;
  startDate: Date;
  endDate: Date;
  approveStatus: string;
  approvers: string;
  approvalRule: string;
  approvedBy: string;
  approvedOn: Date;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  form: string;
  reason: string;
  memo: string;
}

export class BP_ProcessesRating {
  id: string;
  recID: string;
  objectID: string;
  objectName: string;
  positionName: string;
  comment: string;
  ratting: number;
  createdOn: Date;
}

export class tmpPermission {
  recIDProcess: string;
  form: string;
  titleEmail: string;
  contentEmail: string;
  sendEmail: boolean;
  postBlog: boolean;
  urlShare: string;
  urlPath: string;
  reason: string;
  memo: string;
  permissions: BP_Processes_Permissions[];
  toPermission: BP_Processes_Permissions[];
  byPermission: BP_Processes_Permissions[];
  ccPermission: BP_Processes_Permissions[];
  fromPermission: BP_Processes_Permissions[];
}

export class ColumnsModel {
  allowDrop: boolean = true;
  allowDrag: boolean = true;
  allowToggle: boolean = false;
  color: string;
  dataValue: string;
  headerText: string;
  isExpanded: boolean = false;
  keyField: string;
  maxCount: number = 0;
  minCount: number = 0;
  predicate: string;
  showAddButton: boolean = false;
  showItemCount: boolean = false;
  dataColums: any;
}

export class TabModel {
  name: 'ViewList' | 'Kanban' | 'FlowChart' | string;
  textDefault: string;
  template?: any;
  isActive: boolean = false;
  id: number;
}

export class BP_Processes_Steps_Reminder{
  type: string;
  control: string;
  times: string;
  autoComplete: string;
}

export class BP_Processes_Time{
  time: number;
  alertType: string;
  duration: number;
  email: string;
}

export class BP_Processes_EventControl{
  startEmail: string;
  isRequire: string;
  alertFail: string;
  alertFailTemplate: string;
}
