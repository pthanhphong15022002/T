import { Double } from '@syncfusion/ej2-angular-charts';
import { Util } from 'codx-core';

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
  write: boolean = true;
  download: boolean = true;
  delete: boolean = true;
  share: boolean = true;
  read: boolean = true;
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
  dealID: string;
  quotationID: string;
  quotationName: string;
  quotationName2: string;
  category: string;
  orderPoolID: string;
  customerID: string;
  salespersonID: string;
  contactID: string;
  consultantID: string;
  delTermID: string;
  delModeID: string;
  pmtTermID: string;
  pmtMethodID: string;
  currencyID: string;
  status: string = '1';
  exchangeRate: number;
  deadline: Date;
  memo: string;
  totalAmt: number;
  totalTaxAmt: number;
  totalSalesAmt: number;
  discPct: number;
  discAmt: number;
  tags: string;
  refType: string;
  refNo: string;
  refID: string;
  versionNo: string;
  versionName: string;
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

export class CM_QuotationsLines {
  recID: string;
  transID: string;
  contractID: string;
  rowNo: number;
  lineType: string;
  lineStatus: string;
  barcode: string;
  itemID: string;
  itemNote: string;
  idiM0: string;
  idiM1: string;
  idiM2: string;
  idiM3: string;
  idiM4: string;
  quantity: number;
  umid: string;
  conversion: number;
  cWUM: string;
  cWConversion: number;
  cWQty: number;
  cWOnhand: number;
  onhand: number;
  currencyID: string;
  costPrice: number;
  exchangeRate: number;
  costAmt: number;
  stdPrice: number;
  salesPrice: number;
  salesAmt: number;
  discPct: number;
  discAmt: number;
  netAmt: number;
  commissionPct: number;
  commissionAmt: number;
  salesTaxPct: number;
  salesTaxAmt: number;
  exciseTaxPct: number;
  exciseTaxAmt: number;
  vATID: string;
  vatRate: number;
  vatBase: number;
  vatAmt: number;
  refType: string;
  refNo: string;
  refID: string;
  refLineID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Deals {
  recID: string = Util.uid();
  dealID: string;
  dealName: string;
  dealName2: string;
  category: string = '1';
  customerID: string;
  channelID: string;
  campaignID: string;
  businessLineID: string;
  memo: string;
  tags: string;
  dealValue: number = 0;
  probability: number = 0;
  expectedClosed: Date;
  status: string = '1';
  statusCodeID: string;
  stepID: string;
  nextStep: string;
  lastUpdated: Date;
  closed: boolean = false;
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
  boolean;
  note: string;
  currencyID: string;
  exchangeRate: number;
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
  headcounts: string;
  annualRevenue: number;
  workingDays: string;
  officialHour: boolean;
  countryID: string;
  provinceID: string;
  districtID: string;
  wardID: string;
  regionID: string;
  consultantID: string;
  invoiceAccount: string;
  isBlackList: boolean;
  isNew: boolean;
  isSale: boolean;
  stop: boolean;
  stopReason: string;
  customerFrom: Date;
  customerResource: string;
  bankAccount: string;
  bankID: string;
  memo: string;
  tags: string;
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
  refID: string;
  provinceID: string;
  districtID: string;
  wardID: string;
  regionID: string;
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
  cumulatedPonumbers: number;
  loyaltyGroupID: string;
  vIP: boolean;
  isDefault: boolean;
  memo: string;
  stop: boolean;
  userID: string;
  allowCall: boolean = false;
  allowEmail: boolean = false;
  tags: string;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  checked: boolean;
  role: string;
  assign: boolean = true;
  delete: boolean = true;
  write: boolean = true;
  share: boolean = true;
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
  numbererval: string;
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
  wardID: string;
  assign: boolean = true;
  delete: boolean = true;
  write: boolean = true;
  share: boolean = true;
}
export class CM_ContractsPayments {
  recID: string = Util.uid(); //Mã thanh toán
  transID: string; //Mã giao dịch
  lineType: string; //Loại: Lịch thanh toán, Lịch sử thanh toán
  rowNo: number; //Số thứ tự hàng
  scheduleDate: Date; //Ngày hẹn thanh toán
  schedulePct: number; //
  scheduleBaseOn: string; //
  scheduleAmt: number; //Số tiền hẹn thanh toán
  numbererestAmt: number; //Số tiền lãi
  adjustedAmt: number; //Số tiền được điều chỉnh
  vATAmt: number; //Số tiền thuế VAT
  totalAmt: number; //Tổng tiền
  remainAmt: number; //Dư nợ còn lại
  memo: string; //Ghi chú
  status: string; //Trạng thái
  paidDate: Date; //Ngày đã thanh toán
  paidAmt: number; //Số tiền đã thanh toán
  paidnumbererest: number; //Số tiền lãi đã thanh toán
  paidVAT: number; //Số tiền thuế VAT đã thanh toán
  paidNote: string; //Ghi chú thanh toán
  refNo: string; //Mã hợp đồng
  refDate: Date; //Ngày tham chiếu
  refLineID: string; //Mã dòng tham chiếu
  extendOn: Date; //Ngày gia hạn
  invoiced: string; //Đã xuất hóa đơn
  posted: string; //
  note: string; //Ghi chú lịch thanh toán
  autoCreated: boolean; //Tạo tự động
  createdOn: Date; //Ngày tạo
  createdBy: string; //Người tạo
  modifiedOn: Date; //Ngày chỉnh sửa
  modifiedBy: string; //Người chỉnh sửa
}
export class CM_Contracts {
  recID: string = Util.uid(); //Mã hợp đồng
  contractID: string; //Mã hợp đồng
  contractDate: Date; //Ngày lập hợp đồng
  contractName: string; //Tên hợp đồng
  contractType: string; //Loại hợp đồng
  useType: string; //Loại hợp đồng sử dụng: Một lần, nhiều lần
  category: string; //Phân loại
  assetID: string; //Mã tài sản
  projectID: string; //Mã dự án
  quotationID: string; //Báo giá
  orderID: string; //Đơn hàng
  dealID: string; //Cơ hội
  objectType: string; //Loại đối tượng
  objectID: string; //Mã đối tượng
  objectName: string; //Tên đối tượng
  contactID: string; //Liên hệ
  customerID: string; //Khách hàng
  currencyID: string; //Tiền tệ
  exchangeRate: number; //Tỷ giá hối đoái
  contractAmt: number; //Giá trị hợp đồng
  VATID: string; //VAT
  paymentStatus: string; //Trạng thái thanh toán
  paidAmt: number; //Số tiền đã thanh toán
  remainAmt: number; //Số tiền còn lại
  terms: string; //Điều khoản hợp đồng -- thiếu vll
  status: string; //Trạng thái
  periods: number; //Giai đoạn
  numbererval: string; //Khoảng thời gian
  effectiveFrom: Date; //Hiệu lực từ
  effectiveTo: Date; //Hiệu lực đến
  extendOn: Date; //Ngày gia hạn
  disposalOn: Date; //Ngày thanh lý
  warantyMonths: number; //Số tháng bảo hành
  warantyExpired: Date; //Ngày hết hạn bảo hành
  salespersonID: string; //Mã nhân viên kinh doanh
  consultantID: string; //Mã nhân viên tư vấn
  pmtMethodID: string; //Phương thức thanh toán
  pmtTermID: string; //Điều khoản thanh toán
  pmtStatus: string; //Tình trạng thanh toán
  delModeID: string; //Hình thức giao hàng
  delTermID: string; //Điều khoản giao hàng
  delPrice: number; //Phí vận chuyển
  delStatus: string; //Tình trạng giao hàng
  parentID: string; //Tham chiếu cha
  refType: string; //Loại tham chiếu
  refID: string; //Mã tham chiếu
  refNo: string; //Số tham chiếu
  attachments: number; //Số lượng file đính kèm
  note: string; //Diễn giải
  stop: boolean; //Tạm ngừng
  companyID: string; //Bên A
  companyName: string; //Tên công ty
  taxCode: string; //Mã số thuế
  address: string; //Địa chỉ
  phone: string; //Số điện thoại
  faxNo: string; //Số Fax
  representative: string; //Người đại diện
  jobTitle: string; //Chức vụ
  bankAccount: string; //Tài khoản ngân hàng
  bankID: string; //Mở tại ngân hàng
  owner: string; //Người sở hữu
  bUID: string; //Đơn vị
  createdOn: Date; //Ngày tạo
  createdBy: string; //Người tạo
  modifiedOn: Date; //Ngày chỉnh sửa
  modifiedBy: string; //Người chỉnh sửa

  contactName: string; //Người đại diện -- thiếu
  pmtDeadline: Date; // Hạn thanh toán
  delDeadline: Date; // Hạn giao hàng

  delActualDate: Date; // Ngày giao hàng
  delAddress: string; // Địa chỉ giao hàng
  delPhone: string;
  delContactID: string; // Liên hệ giao hàng

  // Điều khoản hồ sơ liên quan -- memo
}

export class CM_DealsCompetitors {
  recID: string;
  dealID: string;
  competitorID: string;
  strengths: string;
  weaknesses: string;
  rating: string;
  status: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Cases {
  recID: string;
  caseNo: string;
  caseName: string;
  caseType: string = '2';
  category: string;
  channelID: string;
  objectType: string;
  objectID: string;
  objectName: string;
  contactID: string;
  customerID: string;
  contactName: string;
  mobile: string;
  email: string;
  address: string;
  businessLineID: string;
  tags: string;
  productSeri: string;
  productID: string;
  productBrand: string;
  severity: string;
  priority: string;
  occuredOn: Date;
  detectedOn: Date;
  occuredPlace: string;
  reality: string;
  memo: string;
  state: string;
  reason: string;
  status: string;
  statusID: string;
  stepID: string;
  nextStep: string;
  lastUpdated: Date;
  refType: string;
  refID: string;
  refNo: string;
  leadtime: Number;
  deadline: Date;
  processStatus: string;
  processHours: Number;
  approvalStatus: string;
  consulted: boolean;
  solution: string;
  closed: boolean;
  closedOn: Date;
  closedBy: string;
  closeComment: string;
  rating: string;
  reOpens: Number;
  called: string;
  sendMail: string;
  sendSMS: string;
  attachments: Number = 0;
  processID: string;
  startDate: Date;
  endDate: Date;
  // datas: Json;
  bUID: string;
  owner: string;
  createdOn: Date = new Date();
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Partners {
  recID: string;
  partnerID: string;
  partnerName: string;
  partnerName2: string;
  shortName: string;
  website: string;
  partnerFrom: Date;
  taxCode: string;
  establishDate: Date;
  memo: string;
  address: string;
  countryID: string;
  provinceID: string;
  districtID: string;
  wardID: string;
  regionID: string;
  industries: string;
  phone: string;
  faxNo: string;
  email: string;
  channelID: string;
  segmentID: string;
  capital: number;
  annualRevenue: number;
  headcounts: number;
  cEO: string;
  owner: string;
  bUID: string;
  tags: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Competitors {
  recID: string;
  competitorID: string;
  competitorName: string;
  competitorName2: string;
  shortName: string;
  category: string;
  channelID: string;
  segmentID: string;
  capital: number;
  annualRevenue: number;
  headcounts: number;
  establishDate: number;
  rating: string;
  cEO: string;
  status: string;
  address: string;
  countryID: string;
  provinceID: string;
  districtID: string;
  wardID: string;
  regionID: string;
  phone: string;
  faxNo: string;
  email: string;
  webPage: string;
  memo: string;
  taxCode: string;
  industries: string;
  tags: string;
  owner: string;
  bUID: string;
  createdOn: number;
  createdBy: string;
  modifiedOn: number;
  modifiedBy: string;
}

export class CM_Leads {
  recID: string = Util.uid();
  leadID: string;
  leadName: string;
  leadName2: string;
  category: string;
  channelID: string;
  campaignID: string;
  businessLineID: string;
  memo: string;
  companyName: string;
  tags: string;
  industries: string;
  annualRevenue: number;
  headcounts: string;
  establishDate: Date;
  addresses: string;
  countryID: string;
  provinceID: string;
  districtID: string;
  postalCode: string;
  companyPhone: string;
  faxNo: string;
  webPage: string;
  contactName: string;
  firstName: string;
  salutation: string;
  jobTitle: string;
  occupation: string;
  email: string;
  phone: string;
  phoneExt: string;
  mobile: string;
  status: string;
  statusCode: string;
  stepID: string;
  nextStep: string;
  lastUpdated: Date;
  note: string;
  attachments: number;
  comments: number;
  isDuplicated: boolean;
  contactID: string = Util.uid();
  customerID: string;
  salespersonID: string;
  consultantID: string;
  // datas: Json;
  customerResource: string;
  owner: string;
  bUID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  processID: string;
  convertedOn: string;
  dealID: string;
  endDate: Date;
  startDate: Date;
  refID: string;
  refNo: string;
  refType: string;
  closedBy: string;
  closedOn: Date;
  closed: boolean;
  currencyID: string;
  exchangeRate: number;
  dealValue: number;
}
