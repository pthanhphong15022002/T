import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, CacheService, DataRequest, Util } from 'codx-core';
import { map, mergeMap, of } from 'rxjs';
@Pipe({
  name: 'formatCombobox'
})
export class FormatComboboxPipe implements PipeTransform {

  constructor(private api: ApiHttpService, private cache: CacheService) {}

  transform(value, referedValue: string) {
    if (!value || !referedValue) return of(value || '');
    return this.cache.combobox(referedValue).pipe(
      mergeMap((data) => {
        if (data) {
          let gridModel = new DataRequest();
          let entityName = data?.tableName;
          gridModel.entityName = entityName;
          gridModel.entityPermission = entityName;
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
