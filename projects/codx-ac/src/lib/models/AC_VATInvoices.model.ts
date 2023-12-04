import { Util } from 'codx-core';

export class AC_VATInvoices {
  
  recID: string = Util.uid();

  transID: string;

  lineID: string;

  rowNo: number = 0;

  selected: boolean;

  invoiceType: string;

  invoiceForm: string;

  invoiceSeri: string;

  invoiceNo: string;

  invoiceDate: Date = new Date();

  dueDate: Date = new Date();

  objectType: string;

  objectID: string;

  objectName: string;

  address: string;

  taxCode: string;

  buyer: string;

  pmtMethodID: string;

  exchangeRate2: number = 0;

  multi: boolean;

  goods: string;

  UMID: string;

  quantity: number = 0;

  unitPrice: number = 0;

  VATBase: number = 0;

  VATID: string;

  VATPct: number = 0;

  VATAmt: number = 0;

  VATBase2: number = 0;

  VATAmt2: number = 0;

  VATBase3: number = 0;

  VATAmt3: number = 0;

  VATAcctID: string;

  accountID: string;

  offsetAcctID: string;

  DIM1: string;

  DIM2: string;

  DIM3: string;

  projectID: string;

  note: string;

  eInvoiceID: string;

  eInvoiceNo: string;

  cancelled: boolean;

  cancelledReason: string;

  cancelledNote: string;

  createdOn: Date | string;

  createdBy: string;

  modifiedOn: Date | string | null;

  modifiedBy: string;

  journalNo : string;

  itemID : string;
}
