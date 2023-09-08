import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, CacheService, DataRequest, Util } from 'codx-core';
import { mergeMap, of, map } from 'rxjs';
@Pipe({
  name: 'position',
})
export class PositionPipe implements PipeTransform {
  constructor(private cache: CacheService, private api: ApiHttpService) {}

  transform(id: any, cbbName: any): any {
    return this.cache.combobox(cbbName).pipe(
      mergeMap((st: any) => {
        if (st) {
          if (st.viewMember != st.valueMember) {
            return this.cache.getComboboxSource(cbbName).pipe(
              mergeMap((dts: any) => {
                if (dts && dts.length > 0) {
                  var data = dts.find((item: any) => {
                    return item[st.valueMember] === id;
                  });
                  if (data && data[st.viewMember]) id = data[st.viewMember];
                  return of(id || '');
                } else {
                  let dataRequest = new DataRequest();
                  dataRequest.comboboxName = cbbName;
                  dataRequest.pageLoading = true;
                  dataRequest.pageSize = 20;
                  dataRequest.page = 1;
                  return this.api
                    .execSv(
                      st.service,
                      'ERM.Business.Core',
                      'DataBusiness',
                      'LoadDataNameCbxAsync',
                      [dataRequest]
                    )
                    .pipe(
                      map((res: any) => {
                        if (res && res.length > 0) {
                          var dataCBB = JSON.parse(res[0]);
                          this.cache.setComboboxSource(cbbName, dataCBB);
                          if (dataCBB && dataCBB.length > 0) {
                            var data = dataCBB.find((item: any) => {
                              return item[st.valueMember] === id;
                            });
                            if (data && data[st.viewMember])
                              id = data[st.viewMember];
                          }
                        }
                        return id || '';
                        //this.setTextComboBox(grvSetup, res);
                      })
                    );
                }
              })
            );
          } else return of(id || '');
        } else return of(id || '');
      })
    );
    // return this.cacheService.combobox(cbbName).pipe((res: any) => {
    //   if (res) {
    //     let dataRequest = new DataRequest();
    //     dataRequest.comboboxName = cbbName;
    //     dataRequest.page = 1;
    //     dataRequest.pageSize = 10;
    //     return this.api.execSv(
    //       res.service,
    //       'ERM.Business.Core',
    //       'DataBusiness',
    //       'LoadOneDataCbxAsync',
    //       [dataRequest]
    //     ).pipe(map );
    //   }
    // });
  }
}
