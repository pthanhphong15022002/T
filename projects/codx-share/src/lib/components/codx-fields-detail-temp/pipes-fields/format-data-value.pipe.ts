import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';
import { mergeMap, of } from 'rxjs';

@Pipe({
  name: 'formatDataValue',
})
export class FormatDataValuePipe implements PipeTransform {
  constructor(private cache: CacheService, private api: ApiHttpService) {}
  transform(value, dataFormat, refValue): any {
    if (dataFormat == 'C') return this.formatCombox(value, refValue);
    return value;
  }

  formatCombox(value, refValue): any {
    return this.cache.combobox(refValue).pipe(
      mergeMap((data) => {
        if (data) {
          let gridModel = new DataRequest();
          gridModel.entityName = data.entityName;
          gridModel.entityPermission = data.entityName;
          gridModel.pageLoading = false;
          gridModel.comboboxName = data.comboboxName;
          gridModel.currentValue = value;
          return this.api
            .execSv<any>(
              data.service,
              'ERM.Business.Core',
              'DataBusiness',
              'LoadOneDataCbxAsync',
              gridModel
            )
            .pipe(
              mergeMap((cbbData) => {
                if (cbbData && cbbData?.length > 0) {
                  let map = JSON.parse(cbbData[0]);
                  if (map?.length > 0) {
                    let crr = map.find((x) => (x[data.valueMember] = value));
                    value = crr[data.viewMember];
                  }
                }
                return of(value || '');
              })
            );
        } else return of(value || '');
      })
    );
  }
}
