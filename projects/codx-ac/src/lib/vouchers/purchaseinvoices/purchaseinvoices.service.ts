import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceService {
  fmPurchaseInvoicesLines: FormModel = {
    entityName: 'AC_PurchaseInvoicesLines',
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityPer: 'AC_PurchaseInvoicesLines',
  };
  fmVATInvoices: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  journal: IJournal;

  constructor(cacheService: CacheService, private apiService: ApiHttpService) {
    cacheService
      .gridViewSetup(
        this.fmVATInvoices.formName,
        this.fmVATInvoices.gridViewName
      )
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
