import { dynamicProcessPermissions } from "./dynamicProcessPermissions.model";

export interface dynamicProcess{
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
  options:	string;
  attachments:	number;
  comments:	number;
  permission:	dynamicProcessPermissions[];
  owner:	string;
  bUID:	string;
  createdOn:	Date;
  createdBy:	string;
  modifiedOn:	Date;
  modifiedBy:	string;
}
