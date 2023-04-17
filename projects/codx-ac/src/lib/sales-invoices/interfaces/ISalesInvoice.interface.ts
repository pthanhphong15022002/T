export interface ISalesInvoice {
  recID: string;
  journalNo: string;
  journalType: string;
  voucherNo: string;
  voucherDate: string;
  voucherType: string;
  invoiceType: string;
  invoiceForm: string;
  invoiceSeriNo: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceDueDate: string | null;
  invoiceName: string;
  invoiceAdddess: string;
  invoiceTaxCode: string;
  objectType: string;
  objectID: string;
  currencyID: string;
  exchangeRate: number;
  multi: boolean;
  memo: string;
  memo2: string;
  status: string;
  validated: boolean;
  autoCreated: boolean;
  autoSettlement: string;
  settleID: string | null;
  settleVouchers: string;
  totalDR: number;
  totalCR: number;
  totalAmt: number;
  totalDiscPct: number;
  totalDiscAmt: number;
  totalDiscAllo: boolean;
  fixedCost: boolean;
  issueReason: string;
  warehouse: string;
  orderOriginID: string;
  orderPoolID: string;
  contractNo: string;
  salesUnitID: string;
  salespersonID: string;
  supervisorID: string;
  delModeID: string;
  delTermID: string;
  pmtMethodID: string;
  pmtTermID: string;
  pmtSchedID: string;
  cashDiscID: string;
  cashDiscDate: string | null;
  cashDiscPct: number;
  paytoThirdParty: boolean;
  thirdPartyID: string;
  thirdParty: string;
  vATID: string;
  vATAmt: number;
  vATAmt2: number;
  vATAmt3: number;
  taxExchRate: number;
  taxMulti: boolean;
  taxNote: string;
  cancelled: boolean;
  cancelReason: string;
  cancelRefNo: string;
  cancelRefDate: string | null;
  cancelNote: string;
  reasonCode: string;
  returnReason: string;
  returnReference: string;
  returnNote: string;
  adjustmentType: string;
  shipmentID: string | null;
  orderType: string;
  orderNo: string;
  orderer: string;
  refID: string | null;
  refNo: string;
  refDate: string | null;
  bLNo: string;
  bLDate: string | null;
  dIM1: string;
  dIM2: string;
  dIM3: string;
  projectID: string;
  printed: boolean;
  integration: boolean;
  eInvoiceID: string;
  eInvoiceNo: string;
  owner: string;
  bUID: string;
  approvedBy: string;
  approvedOn: string | null;
  createdOn: string;
  createdBy: string;
  postedLayer: string;
  postedOn: string | null;
  postedBy: string;
  modifiedOn: string | null;
  modifiedBy: string;
}
