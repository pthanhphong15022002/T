import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../../journals/interfaces/IJournal.interface';

export enum MF {
  GuiDuyet = 'ACT060504',
  GhiSo = 'ACT060506',
  HuyYeuCauDuyet = 'ACT060505',
  KhoiPhuc = 'ACT060507',
  KiemTraTinhHopLe = 'ACT060503',
  In = 'ACT060508',
}

export const fmSalesInvoicesLines: FormModel = {
  entityName: 'AC_SalesInvoicesLines',
  formName: 'SalesInvoicesLines',
  gridViewName: 'grvSalesInvoicesLines',
  entityPer: 'AC_SalesInvoicesLines',
  funcID: 'ACT0605',
};

@Injectable({
  providedIn: 'root',
})
export class SalesInvoiceService {
  gvsSalesInvoicesLines: any;
  vats: any[];
  journal: IJournal;

  constructor(
    private apiService: ApiHttpService,
    private cacheService: CacheService,
    private acService: CodxAcService
  ) {
    cacheService
      .gridViewSetup(
        fmSalesInvoicesLines.formName,
        fmSalesInvoicesLines.gridViewName
      )
      .subscribe((res) => {
        this.gvsSalesInvoicesLines = res;
      });

    this.acService
      .loadComboboxData$('VATCodesAC', 'AC')
      .subscribe((res) => (this.vats = res));
  }
}
