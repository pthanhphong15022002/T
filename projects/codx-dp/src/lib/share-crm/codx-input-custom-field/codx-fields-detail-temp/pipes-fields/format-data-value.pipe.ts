import { Pipe, PipeTransform } from '@angular/core';
import { Internationalization } from '@syncfusion/ej2-base';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DataRequest,
  DatePipe,
} from 'codx-core';
import moment from 'moment';
import { DateFormatPipe } from 'ngx-moment';
import { map, mergeMap, of } from 'rxjs';

@Pipe({
  name: 'formatDataValue',
})
export class FormatDataValuePipe implements PipeTransform {
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authstore: AuthStore
  ) {}
  transform(value, dataType, dataFormat, refValue = null): any {
    switch (dataType) {
      case 'L':
        if (dataFormat == 'C') return this.formatCombox(value, refValue);
        if (dataFormat == 'B') return this.formatBool(value);
        break;
      case 'N':
        return this.formatNumber(value, dataFormat);
        break;
      case 'D':
        return this.formatDateTime(value, dataFormat);
        break;
      case 'CF':
        if (!Number.parseFloat(value)) value = '_';
        else return this.formatNumber(value, 'B');
    }

    return of(value || '');
  }

  formatCombox(value, refValue): any {
    return this.cache.combobox(refValue).pipe(
      mergeMap((data) => {
        if (data) {
          let gridModel = new DataRequest();
          let entityName = data?.tableName; //quang bảo vậy
          // data.entityName.includes('.') || !data?.entityName // // "LV.Poco.BS_AddressBook" => xu ly
          //   ? data?.tableName
          //   : data?.entityName;
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

  formatNumber(dataValue, dataFormat): any {
    if (!dataValue) return of(dataValue || '');
    let intl = new Internationalization();
    let nFormatter = intl.getNumberFormat({
      skeleton: 'n6',
    });
    if (dataFormat == 'I') {
      dataValue = Number.parseFloat(dataValue).toFixed(0);
    } else dataValue = Number.parseFloat(dataValue).toFixed(2);
    return of(nFormatter(dataValue) + (dataFormat == 'P' ? ' %' : '') || '');
  }

  //----------Format  Data time --------------------//
  //mergeMap - dung ma data
  formatDateTime(dataValue, dataFormat) {
    return this.cache.valueList('DP0274').pipe(
      mergeMap((res) => {
        if (res) {
          let dtFormatDate = res.datas;
          switch (dataFormat) {
            case '1':
            case '2':
            case '3':
            case '7':
            case '8':
              dataValue = this.getFormatValue(
                dtFormatDate,
                dataValue,
                dataFormat
              );
              break;
            case '6':
              dataValue = this.formatValueType6(
                dtFormatDate,
                dataValue,
                dataFormat
              );
              break;
            case '4':
            case '5':
              dataValue = this.getFormatTime(
                dtFormatDate,
                dataValue,
                dataFormat
              );
              break;
          }
          return of(dataValue || '');
        } else return of(dataValue || '');
      })
    );
  }

  getFormatValue(dtFormatDate, dataValue, dataFormat) {
    var index = dtFormatDate.findIndex((x) => x.value == dataFormat);
    if (index == -1) return '';
    let tetxFormart = dtFormatDate[index]?.text.toUpperCase();
    dataValue = moment(new Date(dataValue)).format(tetxFormart).toUpperCase();
    return dataValue;
  }

  getFormatTime(dtFormatDate, dataValue, dataFormat) {
    if (!dataValue) return '';
    var arrTime = dataValue.split(':');
    let dtValue = moment(new Date())
      .set({ hour: arrTime[0], minute: arrTime[1] })
      .toDate();
    return this.getFormatValue(dtFormatDate, dtValue, dataFormat);
  }

  formatValueType6(dtFormatDate, dataValue, dataFormat) {
    var index = dtFormatDate?.findIndex((x) => x.value == dataFormat);
    if (index == -1) return dataValue;
    var tetxFormart = dtFormatDate[index]?.text;
    var day = moment(dataValue).toDate();
    let date = day.getDate();
    let month = day.getMonth() + 1;
    let year = day.getFullYear();
    tetxFormart = tetxFormart.replace('dd', date);
    tetxFormart = tetxFormart.replace('mm', month);
    tetxFormart = tetxFormart.replace('yyyy', year);

    return tetxFormart;
  }

  //fort mat bool
  formatBool(value) {
    return this.cache.valueList('DP0272').pipe(
      mergeMap((res) => {
        if (res && res?.datas?.length > 0) {
          var text = res?.datas.filter((x) => x.value == 'B')[0]?.text;
          if (text) {
            let arr = text.split('/');
            if (arr?.length > 1) {
              value = arr[Number.parseInt(value)];
            }
          }
        }
        return of(value || '');
      })
    );
  }
}
