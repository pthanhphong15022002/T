import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  FormModel,
} from 'codx-core';
import { tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';
import { Item } from '../../settings/items/interfaces/Item.interface';

@Injectable({
  providedIn: 'root',
})
export class SalesInvoiceService {
  fmSalesInvoicesLines: FormModel = {
    entityName: 'SM_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
    entityPer: 'SM_SalesInvoicesLines',
    funcID: 'ACT0605',
  };
  gvsSalesInvoicesLines: any;
  vats: any[];
  items: Item[];

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
      .loadComboboxData('VATCodesAC', 'BS')
      .subscribe((res) => (this.vats = res));

    const options = new DataRequest();
    options.entityName = 'IV_Items';
    options.pageLoading = false;
    this.acService.loadDataAsync('IV', options).subscribe((res) => {
      this.items = res;
    });
  }

  deleteLinesByTransID(transId: string): void {
    this.apiService
      .exec('SM', 'SalesInvoicesLinesBusiness', 'DeleteByTransIDAsync', transId)
      .pipe(tap((t) => console.log(t)))
      .subscribe();
  }
}
