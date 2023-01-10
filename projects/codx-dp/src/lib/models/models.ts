export class DP_Process {
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
  closeInstanceControl: Number;
  showInstanceControl: boolean;
  note: string;
  options: string;
  attachments: Number;
  comments: Number;
  permission: DP_ProcessPermission[];
  owner: string;
  buid: string;
  createdOn: Date;
  createdBy: Date;
  modifiedOn: Date;
  modifiedBy: Date;
}

export class DP_ProcessPermission {
  recID: string;
  transID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  adminsitrator: boolean;
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
