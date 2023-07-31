import { Injectable } from '@angular/core';
import { CacheService, FormModel } from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';

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

  constructor(cacheService: CacheService) {
    cacheService
      .gridViewSetup(
        this.fmVATInvoices.formName,
        this.fmVATInvoices.gridViewName
      )
      .subscribe();
  }
}
