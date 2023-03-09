import { Util } from "codx-core";

export class ExchangeRates {
  autoUpdated: any;
  createdBy: any;
  createdOn: any;
  currencyID: any;
  exchangeRate: any = '';
  modifiedBy: any;
  modifiedOn: any;
  note: any = '';
  recID: any = Util.uid();
  sourceType: any = '';
  toDate: any = '';
  toTime: any;
}