import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';

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

  constructor(
    private apiService: ApiHttpService,
    cacheService: CacheService,
    private acService: CodxAcService
  ) {
    cacheService
      .gridViewSetup(
        this.fmVATInvoices.formName,
        this.fmVATInvoices.gridViewName
      )
      .subscribe();
  }
}
