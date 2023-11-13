import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CacheService, FormModel } from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'codx-fields-format-value',
  templateUrl: './codx-fields-format-value.component.html',
  styleUrls: ['./codx-fields-format-value.component.scss'],
})
export class CodxFieldsFormatValueComponent implements OnInit {
  @Input() data: any;
  listColumns = []; //columfield TA
  dtFormatDate: any;
  formModelContact: FormModel = {
    formName: 'CMContacts',
    gridViewName: 'grvCMContacts',
    entityName: 'CM_Contacts',
  };

  formModel: FormModel = {
    formName: 'DPInstancesStepsFields',
    gridViewName: 'grvDPInstancesStepsFields',
    entityName: 'DP_Instances_Steps_Fields',
  };
  columns: any[];
  arrDataValue: any[];
  settingWidth = false;
  settingCount = false;
  count: number = 0;
  dataValueTypeC: any = [];
  dataValueTypeV: any = [];

  constructor(
    private cache: CacheService,
    private changeRef: ChangeDetectorRef
  ) {}

  // ngOnChanges() {
  //   // if (this.data.dataType == 'TA') this.getColumnTable(this.data);
  //   //this.changeRef.detectChanges();
  // }
  ngOnInit(): void {
    switch (this.data.dataType) {
      case 'TA':
        this.getColumnTable(this.data);
        break;
      case 'C':
        this.dataValueTypeC = this.parseValue(this.data.dataValue);
        break;
      case 'L':
        if (this.data.dataFormat == 'V')
          this.dataValueTypeV = this.listValue(this.data.dataValue);
        break;
    }
  }

  parseValue(dataValue) {
    return JSON.parse(dataValue);
  }

  listValue(dataValue) {
    return dataValue?.split(';');
  }

  //--------------format table---------------//
  getColumnTable(data) {
    if (!data.dataFormat) {
      this.columns = [];
      return;
    }
    let arr = JSON.parse(data.dataFormat);
    if (Array.isArray(arr)) {
      this.columns = arr;
      this.settingWidth = this.columns[0]?.settingWidth ?? false;
      this.settingCount = this.columns[0]?.settingCount ?? false;
    } else this.columns = [];

    this.arrDataValue = [];
    if (data.dataValue) {
      let arrDataValue = JSON.parse(data.dataValue);
      if (Array.isArray(arrDataValue)) {
        this.arrDataValue = arrDataValue;
      }
    }

    this.changeRef.detectChanges();
  }

  formatViewTable(value) {
    let arrTable = [];
    if (this.columns?.length > 0) {
      this.columns.forEach((x) => {
        let object = Object.assign(x, {
          dataValue: value?.[x.fieldName],
        });
        arrTable.push(object);
      });
    }
    return arrTable;
  }
  //--------------end------------//

  //===========FORMART DATETIME=====================//
  // getFormatTime(dv) {
  //   if (!dv) return '';
  //   var arrTime = dv.split(':');
  //   return moment(new Date())
  //     .set({ hour: arrTime[0], minute: arrTime[1] })
  //     .toDate();
  // }
  // formatNumber(dt) {
  //   if (!dt.dataValue) return '';
  //   if (dt.dataFormat == 'I') return Number.parseFloat(dt.dataValue).toFixed(0);
  //   return (
  //     Number.parseFloat(dt.dataValue).toFixed(2) +
  //     (dt.dataFormat == 'P' ? ' %' : '')
  //   );
  // }
  // partNum(num): number {
  //   return Number.parseInt(num);
  // }

  // fomatvalue(df) {
  //   //xu ly tam
  //   if (!this.dtFormatDate) {
  //     this.cache.valueList('DP0274').subscribe((res) => {
  //       if (res) {
  //         this.dtFormatDate = res.datas;
  //         return this.getFormatValue(df);
  //       }
  //     });
  //   } else {
  //     return this.getFormatValue(df);
  //   }
  // }

  // getFormatValue(df) {
  //   var index = this.dtFormatDate?.findIndex((x) => x.value == df);
  //   if (index == -1) return '';
  //   return this.dtFormatDate[index]?.text;
  // }

  // getFormatStringType6(dt) {
  //   if (!this.dtFormatDate) {
  //     this.cache.valueList('DP0274').subscribe((res) => {
  //       if (res) {
  //         this.dtFormatDate = res.datas;
  //         return this.formatValueType6(dt);
  //       }
  //     });
  //   } else {
  //     return this.formatValueType6(dt);
  //   }
  // }

  // formatValueType6(dt) {
  //   var index = this.dtFormatDate?.findIndex((x) => x.value == dt.dataFormat);
  //   if (index == -1) return '';
  //   var tetxFormart = this.dtFormatDate[index]?.text;
  //   var day = moment(dt.dataValue).toDate();
  //   let date = day.getDate();
  //   let month = day.getMonth() + 1;
  //   let year = day.getFullYear();
  //   tetxFormart = tetxFormart.replace('dd', date);
  //   tetxFormart = tetxFormart.replace('mm', month);
  //   tetxFormart = tetxFormart.replace('yyyy', year);
  //   return tetxFormart;
  // }

  //=========== END - FORMART DATETIME=====================//
}
