import { CashPayment } from './models/CashPayment.model';
import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxAcService {
  constructor(private cache: CacheService, private api: ApiHttpService) {}
  setCacheFormModel(formModel: FormModel) {
    this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
      this.cache.setGridView(formModel.gridViewName, gridView);
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((gridViewSetup) => {
          this.cache.setGridViewSetup(
            formModel.formName,
            formModel.gridViewName,
            gridViewSetup
          );
        });
    });
  }
  loadData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }
  addData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }
  checkDataContactAddress(
    assemblyName: any,
    className: any,
    methodName: any,
    data: any
  ) {
    return this.api.exec(assemblyName, className, methodName, data);
  }

  setMemo(master: any, text: string, idx: number) {
    let newMemo = '';

    let aMemo = [];

    if (master.memo) aMemo = master.memo.split('-');
    if (aMemo.length == 0) return '';

    aMemo[idx] = text;

    for (let i = 0; i < aMemo.length; i++) {
      newMemo += aMemo[i] + ' ';
    }
    return newMemo;
  }
}
