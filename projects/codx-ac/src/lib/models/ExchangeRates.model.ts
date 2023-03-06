export class ExchangeRates {
  autoUpdated: any;
  createdBy: any;
  createdOn: any;
  currencyID: any;
  exchangeRate: any = '';
  modifiedBy: any;
  modifiedOn: any;
  note: any = '';
  recID: any = Guid.newGuid();
  sourceType: any = '';
  toDate: any;
  toTime: any;
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}