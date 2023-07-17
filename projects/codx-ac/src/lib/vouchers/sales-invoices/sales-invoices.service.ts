import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  FormModel
} from 'codx-core';
import { tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';

@Injectable({
  providedIn: 'root',
})
export class SalesInvoiceService {
  fmSalesInvoicesLines: FormModel = {
    entityName: 'AC_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
    entityPer: 'AC_SalesInvoicesLines',
    funcID: 'ACT0605',
  };
  gvsSalesInvoicesLines: any;
  vats: any[];

  constructor(
    private apiService: ApiHttpService,
    private cacheService: CacheService,
    private acService: CodxAcService
  ) {
    cacheService
      .gridViewSetup(
        this.fmSalesInvoicesLines.formName,
        this.fmSalesInvoicesLines.gridViewName
      )
      .subscribe((res) => {
        this.gvsSalesInvoicesLines = res;
      });

    this.acService
      .loadComboboxData('VATCodesAC', 'AC')
      .subscribe((res) => (this.vats = res));
  }

  deleteLinesByTransID(transId: string): void {
    this.apiService
      .exec('AC', 'SalesInvoicesLinesBusiness', 'DeleteByTransIDAsync', transId)
      .pipe(tap((t) => console.log(t)))
      .subscribe();
  }
}
