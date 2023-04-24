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

export class CM_Deals {
  recID: string;
  dealID: string;
  dealName: string;
  dealName2: string;
  category: string;
  customerID: string;
  channelID: string;
  campaignID: string;
  businessLineID: string;
  memo: string;
  tags: string;
  dealValue: number;
  probability: number;
  expectedClosed: number;
  status: string;
  statusCodeID: string;
  currentStep: string;
  nextStep: string;
  lastUpdated: Date;
  closed: boolean;
  closedOn: Date;
  closedBy: string;
  closeReason: string;
  closeComment: string;
  refType: string;
  refNo: string;
  refID: string;
  attachments: number;
  comments: number;
  salespersonID: string;
  consultantID: string;
  processID: string;
  startDate: Date;
  endDate: Date;
  // datas: Json; hỏi kiểu dữ liệu sau
  owner: string;
  bUID: string;
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

export class CM_Customers {
  recID: string;
  customerID: string;
  customerName: string;
  customerName2: string;
  shortName: string;
  taxCode: string;
  custGroupID: string;
  industries: string;
  segmentID: string;
  channelID: string;
  address: string;
  phone: string;
  faxNo: string;
  email: string;
  webPage: string;
  establishDate: Date;
  headcounts: number;
  annualRevenue: number;
  workingDays: string;
  officialHour: boolean;
  countryID: string;
  provinceID: string;
  districtID: string;
  regionID: string;
  consultantID: string;
  invoiceAccount: string;
  isBlackList: boolean;
  stop: boolean;
  stopReason: string;
  customerFrom: Date;
  customerResource: string;
  bankAccount: string;
  bankID: string;
  memo: string;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Contacts {
  recID: string;
  contactID: string;
  contactName: string;
  contactType: string;
  category: string;
  firstName: string;
  lastName: string;
  gender: string;
  salutation: string;
  birthday: Date;
  birthPlace: string;
  iDCardNo: string;
  issuedOn: Date;
  issuedBy: string;
  maritalStatus: string;
  nationality: string;
  ethnicGroup: string;
  religion: string;
  education: string;
  occupation: string;
  jobTitle: string;
  department: string;
  income: number;
  bankAccount: string;
  bankID: string;
  birthAddress: string;
  address: string;
  countryID: string;
  provinceID: string;
  districtID: string;
  wardID: string;
  postalCode: string;
  mobile: string;
  phone: string;
  phoneExt: string;
  email: string;
  personalEmail: string;
  webPage: string;
  objectType: string;
  objectID: string;
  objectName: string;
  cumulatedPoints: number;
  loyaltyGroupID: string;
  vIP: boolean;
  isDefault: boolean;
  memo: string;
  stop: boolean;
  userID: string;
  allowCall: boolean;
  allowEmail: boolean;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class BS_AddressBook {
  recID: string;
  adressType: string;
  adressName: string;
  objectType: string;
  objectID: string;
  street: string;
  city: string;
  countryID: string;
  provinceID: string;
  districtID: string;
  postalCode: string;
  regionID: string;
  timeZone: string;
  longitude: string;
  latitude: string;
  distance: string;
  primaryContact: string;
  secondContact: string;
  phone: string;
  phoneExt: string;
  faxNo: string;
  mobile: string;
  email: string;
  sMS: string;
  webPage: string;
  delRouteID: string;
  calendarID: string;
  interval: string;
  duration: string;
  lastUpdated: Date;
  note: string;
  stop: boolean;
  isDefault: boolean;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  owner: string;
  bUID: string;
  employeeID: string;
  positionID: string;
  orgUnitID: string;
  divisionID: string;
}
