export class CM_Products {
recID: string;
productID: string;
productName: string;
productName2: string;
businessLineID: string;
parentID: string;
note: string;
sorting: number;
stop: boolean;
detail: string;
onHand: number;
sales: number;
unit: string;
unitPrice: number;
currencyID: string;
owner: string;
bUID: string;
createdOn: Date;
createdBy: string;
modifiedOn: Date;
modifiedBy: string;

}
export class CM_BusinessLines {
  recID: string;
  businessLineID: string;
  businessLineName: string;
  businessLineName2: string;
  parentID: string;
  note: string;
  sorting: number;
  stop: boolean;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Quotations {
recID: string;
quotationID: string;
quotationName: string;
quotationName2: string;
category: string;
orderPoolID: string;
customerID: string;
salespersonID: string;
consultantID: string;
delTermID: string;
delModeID: string;
pmtTermID: string;
pmtMethodID: string;
currencyID: string;
status: string;
deadline: Date;
memo: string;
totalAmt: number;
discPct: number;
discAmt: number;
tags: string;
refType: string;
refNo: string;
refID: string;
versionNo: string;
revision: number;
parentID: string;
attachments: number;
comments: number;
owner: string;
bUID: string;
createdOn: Date;
createdBy: string;
modifiedOn: Date;
modifiedBy: string;

}

export class CM_Opportunities {
  recID: string;
  opportunityID: string;
  processID: string;
  productTypeID: string;
  campaignID: string;
  objectType: string;
  objectID: string;
  contacts: CM_Products[] = [];
  // opponents: objects;
  // products: objects;
  title: string;
  startDate: Date;
  endDate: Date;
  successRate: number;
  expectedRevenue: number;
  memo: string;
  status: string;
  attachments: number;
  comments: number;
  refType: string;
  refID: string;
  closed: boolean;
  closedOn: Date;
  owner: string;
  bUID: string;
  permissions: CM_Permissions[] = [];
  tags: string;
  stepID: string;
  // templates: objects;
  // datas: Json;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  bit;
}

export class CM_Permissions {
  recID: string;
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
  edit: boolean;
  allowPermit: boolean;
  publish: boolean;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  approvalRule: string;
  approverType: string;
  approvers: string;
  approvedBy: string;
  approveStatus: string;
  approvedOn: Date;
  autoCreate: string;
  allowUpdateStatus: string;
}
