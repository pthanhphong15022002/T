import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class RoundService {
  sysSetting: any;
  companySetting: any;
  stores = new Map<string, any>();
  constructor(private cache: CacheService, private api: ApiHttpService) {}
  //#region  Cache
  initCache() {
    this.cache.systemSetting().subscribe((res) => {
      if (res) this.sysSetting = res;
    });
    this.cache.companySetting().subscribe((res) => {
      if (res) this.companySetting = res[0];
    });
    this.api
      .execSv<any>('AC', 'Core', 'CMBusiness', 'InitCurrencyAsync')
      .subscribe((res) => {
        if (res) if (res) this.stores.set('currencies', res);
      });
    this.api
      .execSv<any>('AC', 'Core', 'CMBusiness', 'InittUnitsOfMearsureAsync')
      .subscribe((res) => {
        if (res) if (res) this.stores.set('unit', res);
      });
  }
  //#endregion

  //#region roundOff
  amount(value: number, currId: string) {
    if (!currId) return value;
    let v = 0;
    var c = this.getCacheValue('currencies', currId);

    if (c) v = this.evenRound(value, c.aRounding);
    else v = this.evenRound(value, this.sysSetting.dSourceCurr);
    return v;
  }

  price(value: number, currId: string) {
    if (!currId) return value;
    let v = 0;
    var c = this.getCacheValue('currencies', currId);

    if (c) v = this.evenRound(value, c.pRoundOff);
    else v = this.evenRound(value, this.sysSetting.dSalesPrice);
    return v;
  }

  taxCurr(value: number, currId: string) {
    if (!currId) return value;
    let v = 0;
    var c = this.getCacheValue('currencies', currId);

    if (c) v = this.evenRound(value, c.aRoundOff);
    return v;
  }

  baseCurr(value: number, isPrice: boolean = false) {
    let v = 0;
    var c = this.getBaseCurr();
    if (!c) v = this.evenRound(value, c.dBaseCurr);
    else if (isPrice) v = this.evenRound(value, c.aRoundOff);
    else v = this.evenRound(value, this.sysSetting.dBaseCurr);
    return v;
  }

  baseAmount(value: number) {
    let v = 0;
    var c = this.getBaseCurr();

    if (c) v = this.evenRound(value, c.aRoundOff);
    else v = this.evenRound(value, this.sysSetting.dBaseCurr);
    return v;
  }

  basePrice(value: number) {
    let v = 0;
    var c = this.getBaseCurr();

    if (c) v = this.evenRound(value, c.pRoundOff);
    else v = this.evenRound(value, this.sysSetting.dCostPrice);
    return v;
  }

  rounding(value: number, currId: string, isPrice: boolean = false) {
    if (!currId) return value;
    let bPRoundOff = 2;
    let bCRoundOff = 2;

    let v = 0;
    var c = this.getBaseCurr();

    if (c) {
      bPRoundOff = c.pRounding;
      bCRoundOff = c.aRounding;
    }
    if (isPrice) v = this.evenRound(value, bPRoundOff);
    else v = this.evenRound(value, bCRoundOff);
    return v;
  }
  //#endregion

  //#region Quantity
  quantity(value: number, umid: string) {
    if (!umid) return value;
    let v = 0;
    var c = this.getCacheValue('unit', umid);

    if (c) v = this.evenRound(value, c.roundOff);
    else v = this.evenRound(value, this.sysSetting.dQuantity);
    return v;
  }

  cwQty(value: number, umid: string) {
    if (!umid) return value;
    let v = 0;
    var c = this.getCacheValue('unit', umid);

    if (c) v = this.evenRound(value, c.roundOff);
    else v = this.evenRound(value, this.sysSetting.dCatchWeight);
    return v;
  }
  //#endregion

  //#region  helper
  evenRound(num, decimalPlaces) {
    var d = decimalPlaces || 0;
    var m = Math.pow(10, d);
    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    var i = Math.floor(n),
      f = n - i;
    var e = 1e-8; // Allow for rounding errors in f
    var r =
      f > 0.5 - e && f < 0.5 + e ? (i % 2 == 0 ? i : i + 1) : Math.round(n);
    return d ? r / m : r;
  }

  getBaseCurr() {
    let curr = this.companySetting?.baseCurr;
    if (!curr) curr = 'VND';
    return this.getCacheValue('currencies', curr);
  }

  getCacheValue(storeName: string, value: string) {
    let v: any;
    if (this.stores.has(storeName)) v = this.stores.get(storeName)[value];
    return v;
  }
  //#endregion
}
