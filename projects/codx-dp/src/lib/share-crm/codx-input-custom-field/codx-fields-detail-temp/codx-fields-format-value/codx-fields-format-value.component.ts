import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  FormModel,
} from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'codx-fields-format-value',
  templateUrl: './codx-fields-format-value.component.html',
  styleUrls: ['./codx-fields-format-value.component.scss'],
})
export class CodxFieldsFormatValueComponent implements OnInit {
  @Input() data: any;

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
  totalColumns = false;
  count: number = 0;
  dataValueTypeC: any = [];
  dataValueTypeV: any = [];
  dataValueTypePA: any = [];

  constructor(
    private cache: CacheService,
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService
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
        if (this.data.dataFormat == 'V' || this.data.dataFormat == 'S')
          this.dataValueTypeV = this.listValue(this.data.dataValue);
        break;
      case 'PA':
        this.parseValuePA(this.data.dataValue);
        break;
    }
  }

  parseValue(dataValue) {
    return JSON.parse(dataValue);
  }

  listValue(dataValue) {
    return dataValue?.split(';');
  }

  parseValuePA(dataValue) {
    this.dataValueTypePA = [];
    if (!this.data.dataFormat) return;
    this.cache.combobox(this.data.refValue).subscribe((res) => {
      let gridModel = new DataRequest();
      let entityName = res?.tableName;
      gridModel.entityName = entityName;
      gridModel.entityPermission = entityName;
      gridModel.pageLoading = false;

      let predicate = res.valueMember + '=@0';
      if (res.predicate) {
        predicate += ' and ' + res.predicate;
      }
      gridModel.predicate = predicate;
      gridModel.dataValue = dataValue;

      this.api
        .execSv<any>(
          res.service,
          'ERM.Business.Core',
          'DataBusiness',
          'LoadDataAsync',
          gridModel
        )
        .subscribe((dataRes) => {
          if (dataRes) {
            let crrData = dataRes[0][0];
            let dataFormat = JSON.parse(this.data.dataFormat);
            if (Array.isArray(dataFormat) && dataFormat?.length > 0) {
              dataFormat.forEach((x) => {
                let value = '';
                for (var key in crrData) {
                  if (
                    key.toLocaleLowerCase() == x.fieldName.toLocaleLowerCase()
                  ) {
                    value = crrData[key];
                  }
                }
                let obj = Object.assign(x, { dataValue: value });
                this.dataValueTypePA.push(obj);
              });
            }
          }
        });
    });
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
      this.totalColumns = this.columns.findIndex((x) => x?.totalColumns) != -1;
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
}
