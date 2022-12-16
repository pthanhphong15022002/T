export class InvoiceLine {
  no: number;
  itemDesc?: string;
  umid?: string;
  quantity?: number;
  salesPrice?: any;
  salesAmt?: any;
  vatid?: any;
  vatAmt?: any;
  totalAmt?: any;
  lineType?: any;
  note?: string;
}

export class Invoices {
  recID: any;
  invoiceType?: any;
  invoiceForm?: any;
  invoiceSymbol?: any;
  invoiceNo?: any;
  invoiceDate?: any;
  taxCode?: any;
  customerName?: any;
  adddess?: any;
  buyer?: any;
  email?: any;
  phone?: any;
  pmtMethodID?: any;
  bankAccount?: any;
  bankName?: any;
  currencyID?: any;
  exchangeRate?: any;
  memo?: any;
  totalAmt?: any;
  status?: any;
  orderNo?: any;
  contractNo?: any;
  refNo?: any;
  refDate?: any;
  refNote?: any;
  balanceAmt?: any;
  oldValue?: any;
  newValue?: any;
  fromDate?: any;
  toDate?: any;
  eInvoiceNo?: any;
  eInvoiceID?: any;
  refInvoiceNo?: any;
  refInvoiceDate?: any;
  refInvoiceNote?: any;
  signed?: any;
  printed?: any;
  sendEmail?: any;
  sendSMS?: any;
  owner?: any;

  //Biến ảo
  quantity: number = 0;
  salesAmt: any = 0;
  vatAmt: any = 0;
}
