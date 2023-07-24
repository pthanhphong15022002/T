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

  constructor(
    private apiService: ApiHttpService,
    private cacheService: CacheService,
    private acService: CodxAcService
  ) {}
}
