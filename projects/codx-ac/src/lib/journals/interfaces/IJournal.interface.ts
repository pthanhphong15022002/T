export interface IJournal {
  recID: string;
  journalNo: string;
  journalName: string;
  journalDesc: string;
  journalType: string;
  subType: string;
  postedLayer: string;
  fiscalYear: number | null;
  periodID: string;
  transCount: number;
  reasonID: string;
  status: string;
  voucherFormat: string;
  assignRule: Vll075;
  allowEdited: boolean;
  invoiceForm: string;
  currencyID: string;
  exchangeRate: number;
  fixedCurrency: boolean;
  cashBookID: string;
  warehouseIssue: string;
  warehouseReceipt: string;
  mixedPayment: boolean;
  subControl: string;
  settleControl: string;
  brigdeAcctControl: string;
  drAcctControl: Vll067;
  drAcctID: string;
  crAcctControl: Vll067;
  crAcctID: string;
  diM1Control: Vll067;
  diM2Control: Vll067;
  diM3Control: Vll067;
  diM1: string;
  diM2: string;
  diM3: string;
  idimControl: string;
  isSettlement: boolean;
  projectControl: Vll004;
  assetControl: Vll004;
  loanControl: Vll004;
  inputControl: string;
  productionControl: string;
  illegalControl: string;
  noteControl: string;
  vatControl: string | boolean;
  useDutyTax: boolean | null;
  useExciseTax: boolean | null;
  otherControl: string;
  approvalControl: string;
  approver: any;
  autoPost: boolean;
  unpostControl: boolean;
  unPostDays: number | null;
  exported: boolean;
  attachments: number | null;
  comments: number | null;
  stop: boolean;
  owner: string;
  buid: string;
  createdOn: string;
  createdBy: string;
  modifiedOn: string | null;
  modifiedBy: string;
  transLimit: number | null;
  transControl: string;
  transConfirmUser: string;
  exchType: string;
  multiCurrency: boolean;
  extras: string;
  hasImage: number;
  addNewMode: string;
  postingMode: string;
  isTemplate: boolean;
  unbounds: any;
  entryMode: string;
}

export enum Vll075 {
  ThuCong = '0',
  TuDongKhiTao = '1',
  TuDongKhiLuu = '2',
}

export enum Vll067 {
  KhongKiemSoat = '0',
  GiaTriCoDinh = '1',
  TrongDanhSach = '2',
  TuyChon = '3',
  MacDinh = '4',
}

export enum Vll004 {
  KhongSuDung = '0',
  CoSuDung = '1',
}
