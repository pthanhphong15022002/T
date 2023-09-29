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
  constructor(
    private cache: CacheService,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    // if (this.data.dataType == 'TA') this.getColumnTable(this.data);
    this.changeRef.detectChanges();
  }
  ngOnInit(): void {
    switch (this.data.dataType) {
      case 'D':
        this.cache.valueList('DP0274').subscribe((res) => {
          if (res) this.dtFormatDate = res.datas;
        });
        break;
      case 'TA':
        this.getColumnTable(this.data);
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
      // this.columns.forEach((x) => {
      //   this.modelJSON += '"' + x.fieldName + '":"' + '",';
      // });
      // let format = this.modelJSON.substring(0, this.modelJSON.length - 1);
      // this.modelJSON = '{' + format + '}';
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

  getFormatTime(dv) {
    if (!dv) return '';
    var arrTime = dv.split(':');
    return moment(new Date())
      .set({ hour: arrTime[0], minute: arrTime[1] })
      .toDate();
  }
  formatNumber(dt) {
    if (!dt.dataValue) return '';
    if (dt.dataFormat == 'I') return Number.parseFloat(dt.dataValue).toFixed(0);
    return (
      Number.parseFloat(dt.dataValue).toFixed(2) +
      (dt.dataFormat == 'P' ? '%' : '')
    );
  }
  partNum(num): number {
    return Number.parseInt(num);
  }

  fomatvalue(df) {
    //xu ly tam
    var index = this.dtFormatDate.findIndex((x) => x.value == df);
    if (index == -1) return '';
    return this.dtFormatDate[index]?.text;
  }
}
