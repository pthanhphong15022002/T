export class WR_WorkOrders {
  recID: string;
  orderNo: string;
  orderDate?: Date;
  orderType: string;
  category: string;
  subType: string;
  custGroupID: string;
  customerID: string;
  customerName: string;
  contactName: string;
  mobile: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  province: string;
  district: string;
  postalCode: string;
  serviceLocator: string;
  distance: number;
  zone: string;
  zone2: string;
  seriNo: string;
  serviceTag: string;
  lob: string;
  productID: string;
  productType: string;
  productBrand: string;
  productModel: string;
  productDesc: string;
  warrantyExpired?: Date;
  oow: boolean;
  problem: string;
  priority: string;
  comment: string;
  currentState: string;
  solution: string;
  sla: string;
  slA24x7: boolean;
  deadline?: Date;
  siteID: string;
  teamLeader: string;
  engineerID: string;
  status: string;
  statusCode: string;
  lastUpdatedOn?: Date;
  testedOn?: Date;
  testResult: string;
  totalAmt: number;
  paidAmt: number;
  remainAmt: number;
  invoicing: string;
  partStatus: string;
  partETA?: Date;
  partATA?: Date;
  partUpdatedOn?: Date;
  kyhd: boolean;
  kyc: boolean;
  poh: boolean;
  pOHExpiredOn?: Date;
  scheduleStart?: Date;
  scheduleEnd?: Date;
  fixedSchedule: boolean;
  eta?: Date;
  ata?: Date;
  callDTS?: Date;
  deferral: boolean;
  deferedOn?: Date;
  cancelled: string;
  cancelledOn: Date;
  cancelledNote: string;
  completedOn: Date;
  duration: number;
  actionTaken: string;
  eTR?: Date;
  aTR?: Date;
  closedOn?: Date;
  feedbackRating: string;
  feedbackComment: string;
  feedbackDate?: Date;
  extendInfo: string;
  refType: string;
  refNo: string;
  refID: string;
  note: string;
  mobility: boolean;
  doSMS: boolean;
  rDR: number;
  comments: number;
  attachments: number;
  owner: string;
  buID: string;
  createdBy: string;
  createdOn: Date;
  modifiedBy: string;
  modifiedOn?: Date;
}

export class WR_WorkOrderUpdates {
  recID: string;
  transID: string;
  lineType: string;
  statusCode: string;
  comment: string;
  status: string;
  leadTime: number;
  scheduleTime: string;
  startDate: Date;
  endDate: Date;
  scheduleStart: Date;
  scheduleEnd: Date;
  engineerID: string;
  deadLine: Date;
  hours: string;
  note: string;
  extendInfo: string;
  refNo: string;
  fromMobile: boolean;
  autoCreated: boolean;
  exported: boolean;
  attachments: number;
  owner: string;
  bUID: string;
  createdBy: string;
  createdOn: Date;
  modifiedBy: string;
  modifiedOn?: Date;
}

export class WR_WorkOrderParts {
  recID: string;
  transID: string;
  lineType: string;
  partGroup: string;
  partNo: string;
  partDesc: string;
  qty: string;
  onhand: number;
  ordered: number;
  registered: number;
  invoiced: number;
  costPrice: number;
  salesPrice: number;
  salesAmt: number;
  discPct: number;
  discAmt: number;
  vATID: number;
  vATBase: number;
  vATPct: number;
  vATAmt: number;
  status: string;
  statusCode: string;
  statusDate?: Date;
  eTA?: Date;
  aTA?: Date;
  rDP?: Date;
  pOH: boolean;
  returnDefective: boolean;
  serialControl: boolean;
  failReason: string;
  failComment: string;
  pPIDOld: string;
  pPIDNew: string;
  partNew: string;
  note: string;
  commodityCode: string;
  commodityName: string;
  audited: boolean;
  auditOn?: Date;
  auditComment: string;
  refNo: string;
  refID?: Date;
  refLineNo: string;
  extendInfo: string;
  fromMobile: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn?: Date;
  modifiedBy: string;
}

export class WR_Products {
  productID: string;
  productName: string;
  productName2: string;
  productType: string;
  productBrand: string;
  category: string;
  extendInfo: string;
  note: string;
  sorting: number;
  isDetail: boolean;
  stop: boolean;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn?: Date;
  modifiedBy: string;
}

export class WR_ServiceTags {
  seriNo: string;
  serviceTag: string;
  lOB: string;
  productType: string;
  productModel: string;
  productBrand: string;
  productDesc: string;
  productID: string;
  warrantyExpired?: Date;
  custGroupID: string;
  customerID: string;
  customerName: string;
  contactName: string;
  mobile: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  province: string;
  district: string;
  postalCode: string;
  serviceLocator: string;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn?: Date;
  modifiedBy: string;
}
