export class DP_ProcessGroups{
  recID:	string;
  groupID:	string;
  groupName:	string;
  groupName2:	string;
  category:	string;
  memo:	string;
  owner:	string;
  bUID:	string;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;
}
export class DP_Processes {
  recID:	string;
  category:	string;
  processNo:	string;
  processName:	string;
  groupID:	string;
  applyFor:	string;
  memo:	string;
  status:	string;
  activedOn:	Date;
  stopOn:	Date;
  closeInstanceControl:	number;
  showInstanceControl:	boolean;
  note:	string;
  options:	string; // json
  attachments:	number;
  comments:	number;
  permission:	DP_Processes_Permission[]; // string
  owner:	string;
  bUID:	string;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;
  instanceNoSetting: string;
}

export class DP_Processes_Permission{
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
export class DP_Steps{
  recID:	string;
  processID:	string;
  stepNo:	number;
  stepName:	string;
  memo:	string;
  durationDay:	number;
  durationHour:	number;
  numbererval:	string;
  excludeDayoff:	string;
  note:	string;
  assignControl:	string;
  transferControl:	string;
  taskControl:	string;
  leadtimeControl:	boolean;
  durationControl:	boolean;
  startControl:	boolean;
  reScheduleTasks:	boolean;
  options:	string; // json
  roles:	string; // objects
  isSuccessStep:	boolean;
  isFailStep:	boolean;
  reasonControl:	boolean;
  reasons:	string; // objects
  taskGroups:	string; // objects
  tasks:	string; // objects
  fields:	string; // objects
  isUsed:	boolean;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;
  showColumnControl:	number;

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

export class DP_Steps_Reasons {
  recID:	string;
  stepID:	string;
  reasonName:	string;
  reasonType:	boolean;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;

}
