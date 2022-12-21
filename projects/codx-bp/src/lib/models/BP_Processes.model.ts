import { Permission } from '@shared/models/file.model';

export class BP_Processes {
  id:string;
  recID: string;
  category: string;
  processNo: string;
  processName: string;
  processName2: string;
  processType: string;
  memo: string;
  groupID: string;
  status: string;
  flowchart: string;
  activedOn: Date;
  expiredOn: Date;
  stopOn: Date;
  note: string;
  url: string;
  revision: boolean;
  revisionID: string;
  versionNo: string;
  versionOn: Date;
  versions: BP_ProcessRevisions[];
  permissions: BP_ProcessPermissions[];
  phases: number;
  activities: number;
  views: number;
  attachments: number;
  comments: number;
  rattings: BP_ProcessesRating[];
  positionID: string;
  deptID: string;
  divisionID: string;
  companyID: string;
  owner: string;
  bUID: string;
  approvedOn: Date;
  approvedBy: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  tags: string;
  actived : boolean
}

export class BP_ProcessSteps {
  id: string;
  recID: string;
  processID: string;
  parentID: string;
  stepNo: number;
  stepName: string;
  stepName2: string;
  stepType: string;
  reference: string;
  memo: string;
  location: string;
  duration: number;
  interval: string;
  perUnit: string;
  eventBase: string;
  reminder: string;
  isAlert: boolean;
  isEmail: boolean;
  note: string;
  color: string;
  stopOn: Date;
  attachments: number;
  comments: number;
  refID: string;
  refLineID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  owners: Array<BP_ProcessOwners>;
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

export class BP_ProcessPermissions {
  recID: string;
  id: string;
  objectName: string;
  objectID: string;
  objectType: string;
  full: boolean;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  edit: boolean;
  assign: boolean;
  share: boolean;
  upload: boolean;
  allowPermit: boolean;
  isActive: boolean;
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
  autoCreate: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  form: string;
  reason: string;
  memo: string;
}

export class BP_ProcessesRating{
  id: string;
  recID: string;
  objectID: string;
  objectName: string;
  positionName: string;
  comment: string;
  ratting: number;
  createdOn: Date;
}

export class tmpPermission{
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
  permissions: BP_ProcessPermissions[];
  toPermission: BP_ProcessPermissions[];
  byPermission: BP_ProcessPermissions[];
  ccPermission: BP_ProcessPermissions[];
  fromPermission: BP_ProcessPermissions[];
}

export class ColumnsModel{
   allowDrop :boolean = true;
   allowDrag :boolean = true;
   allowToggle :boolean = false;  
   color :string;
   dataValue : string
   headerText :string;
   isExpanded:boolean =false ;
   keyField :string;
   maxCount :number = 0 
   minCount :number = 0
   predicate :string
   showAddButton :boolean =false ;
   showItemCount :boolean =false ;
   dataColums : any;
}

export class TabModel {
  name: 'ViewList' | 'Kanban' | 'FlowChart' | string;
  textDefault: string;
  template?: any;
  isActive: boolean = false;
  id :number
}
