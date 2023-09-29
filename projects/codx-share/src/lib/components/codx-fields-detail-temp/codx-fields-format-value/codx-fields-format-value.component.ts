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
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit(): void {
    if (this.data.dataType == 'D')
      this.cache.valueList('DP0274').subscribe((res) => {
        if (res) this.dtFormatDate = res.datas;
      });
  }

  parseValue(dataValue) {
    return JSON.parse(dataValue);
  }

  listValue(dataValue) {
    return dataValue?.split(';');
  }

  //--------------format table---------------//
  formatTable(data) {
    if (!data.dataFormat) return [];
    return JSON.parse(data.dataFormat);
  }

  formatData(dataValue) {
    if (!dataValue) return [];
    return JSON.parse(dataValue);
  }

  formatViewTable(data, value) {
    let arrColumn = JSON.parse(data.dataFormat);
    let arrField = [];
    if (Array.isArray(arrColumn)) {
      arrColumn.forEach((x) => {
        let object = Object.assign(x, {
          dataValue: value?.[x.fieldName],
        });
        arrField.push(arrField);
      });
    }
    return arrField;
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
