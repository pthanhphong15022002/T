import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';

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

  constructor(cacheService: CacheService, private apiService: ApiHttpService) {
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
}
