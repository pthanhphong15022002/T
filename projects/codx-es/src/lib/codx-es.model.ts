export class SetupShowSignature {
  showFullName: boolean = false;
  showSign: boolean = false;
  showSignature1: boolean = false;
  showSignature2: boolean = false;
  showStamp: boolean = false;
}

export class File {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = false;
  areas: object = null;
  comment: string = null;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class ES_SignFile {
  abstract: string = null;
  approveControl: string = '3';
  approveStatus: string = '1';
  approveSteps: string = null;
  assign: boolean = true;
  attachments: number = 0;
  autoCreated: boolean = false;
  buid: string = null;
  categoryID: string = null;
  categoryName: string = null;
  comments: number = 0;
  companyID: string = null;
  copies: number = 0;
  createdBy: string = null;
  createdOn: Date = new Date();
  delete: boolean = true;
  deptID: string = null;
  divisionID: string = null;
  employeeID: string = null;
  files: File[] = null;
  includeTables = null;
  isTemplate: boolean = false;
  memo: string = null;
  modifiedBy: string = null;
  modifiedOn = null;
  moved: boolean = false;
  orgUnitID: string = null;
  owner: string = null;
  pages: number = 0;
  permissions = null;
  personalFolder = null;
  priority = '1';
  processID: string = null;
  qrCode = null;
  recID: string = null;
  refDate = null;
  refId: string = null;
  refNo: string = null;
  refType: string = null;
  share: boolean = true;
  signAreas = null;
  tags = null;
  title: string;
  updateColumns = '';
  write = true;
}

export class EmailSendTo {
  transID: string;
  sendType: string;
  objectType: string;
  objectID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  text: string;
  icon: string = null;
}

export class tmpBG_TrackLogs {
  objectType: string;
  objectID: string;
  actionType: string;
  functionID: string;
  sendToObjects: string;
}

export class Approvers {
  recID: string;
  roleType: string;
  approver: string;
  name: string = null;
  position: string = null;
  email: string = null;
  phone: string = null;
  leadTime: any = null;
  allowEditAreas: boolean;
  confirmControl: string;
  comment: string = null;
  icon: string = null;
  createdOn: any = new Date();
  delete: boolean = true;
  write: boolean = false;
}
