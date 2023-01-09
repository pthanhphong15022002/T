export class DP_Process{
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

export class DP_ProcessPermission{
  recID:	string;
  transID:	string;
  roleType:	string;
  objectType:	string;
  objectName:	string;
  objectID:	string;
  adminsitrator:	boolean;
  create:	boolean;
  read:	boolean;
  update:	boolean;
  assign:	boolean;
  delete:	boolean;
  share:	boolean;
  upload:	boolean;
  download:	boolean;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;
}
