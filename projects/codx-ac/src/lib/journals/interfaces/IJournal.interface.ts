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
  assignRule: string;
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
  drAcctControl: string;
  drAcctID: string;
  crAcctControl: string;
  crAcctID: string;
  diM1Control: string;
  diM2Control: string;
  diM3Control: string;
  diM1: string;
  diM2: string;
  diM3: string;
  idimControl: string;
  isSettlement: boolean;
  projectControl: string;
  assetControl: string;
  loanControl: boolean;
  inputControl: string;
  productionControl: string;
  illegalControl: string;
  noteControl: string;
  vatControl: string;
  useDutyTax: boolean | null;
  useExciseTax: boolean | null;
  otherControl: string;
  approvalControl: string;
  approver: any;
  autoPost: any;
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
  multiCurrency: any;
  thumbnail: string;
  vatType: string;
  voucherNoRule: string;
  creater: any;
  poster: any;
  unposter: any;
  sharer: any;
  duplicateVoucherNo: string;
  dataValue: string;
  approvalType: string;
  inputMode: string;
  invoiceSeriNo: string;
  currSourceType: string;
}
