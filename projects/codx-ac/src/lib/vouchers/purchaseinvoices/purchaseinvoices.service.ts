import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';

export enum MF {
  GuiDuyet = 'ACT060102',
  GhiSo = 'ACT060103',
  HuyYeuCauDuyet = 'ACT060104',
  KhoiPhuc = 'ACT060105',
  KiemTraTinhHopLe = 'ACT060106',
  In = 'ACT060107',
}

export const fmPurchaseInvoicesLines: FormModel = {
  entityName: 'AC_PurchaseInvoicesLines',
  formName: 'PurchaseInvoicesLines',
  gridViewName: 'grvPurchaseInvoicesLines',
  entityPer: 'AC_PurchaseInvoicesLines',
};

export const fmVATInvoices: FormModel = {
  entityName: 'AC_VATInvoices',
  formName: 'VATInvoices',
  gridViewName: 'grvVATInvoices',
  entityPer: 'AC_VATInvoices',
};

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceService {
  journal: IJournal;

  constructor(
    cacheService: CacheService,
    private notiService: NotificationsService,
    private apiService: ApiHttpService
  ) {
    cacheService
      .gridViewSetup(fmVATInvoices.formName, fmVATInvoices.gridViewName)
      .subscribe();
  }

  initCache(): void {
    this.apiService
      .exec('IV', 'IVBusiness', 'InitItemInfoListCacheAsync')
      .subscribe();

    this.apiService
      .exec('IV', 'IVBusiness', 'InitDimGroupListCacheAsync')
      .subscribe();

    this.apiService
      .exec('IV', 'IVBusiness', 'InitDimSetupListCacheAsync')
      .subscribe();
  }

  validate(e: any, data: IPurchaseInvoice): void {
    this.apiService
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValidateAsync', data)
      .subscribe((res) => {
        if (res) {
          Object.assign(data, res);
          this.notiService.notifyCode('AC0029', 0, e.text);
        }
      });
  }

  post(e: any, data: IPurchaseInvoice): void {
    this.apiService
      .exec('AC', 'PurchaseInvoicesBusiness', 'PostAsync', data)
      .subscribe((res) => {
        if (res) {
          Object.assign(data, res);
          this.notiService.notifyCode('AC0029', 0, e.text);
        }
      });
  }
}
