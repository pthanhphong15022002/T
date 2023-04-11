export class CM_Products {
  recID: string;
  productID: string;
  productType: string;
  productName: string;
  unitPrice: number;
  specifications: string;
  isCompanyProduct: boolean = false;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Quotations {
  recID: string;
  quotationID: string;
  objectType: string;
  objectID: string;
  quotationName: string;
  startDate: string;
  endDate: string;
  status: string;
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
  contacts: CM_Products[]=[];
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
  permissions: CM_Permissions[]=[];
  tags: string;
  stepID: string;
  // templates: objects;
  // datas: Json;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;bit

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
