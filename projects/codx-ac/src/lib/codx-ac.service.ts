import { Injectable } from '@angular/core';
import { CacheService, FormModel } from 'codx-core';

@Injectable({
  providedIn: 'root'
})
export class CodxAcService {

  constructor(
    private cache: CacheService,
  ) { }
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
}
