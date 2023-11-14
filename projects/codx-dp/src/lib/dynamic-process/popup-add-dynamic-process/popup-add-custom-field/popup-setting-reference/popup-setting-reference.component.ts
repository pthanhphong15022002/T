import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';

import { DP_Steps_Fields } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-popup-setting-reference',
  templateUrl: './popup-setting-reference.component.html',
  styleUrls: ['./popup-setting-reference.component.css'],
})
export class PopupSettingReferenceComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;

  dialog: DialogRef;
  datas: any;
  titleAction = '';
  data: any;
  listField = []; //mảng field
  entityName = 'entityName'; //test
  formModelField: FormModel = {
    gridViewName: 'grvDPStepsFields',
    formName: 'DPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  dataRef = [];
  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.datas = dt?.data?.datas;
    this.dataRef = dt?.data?.dataRef ?? [];
    this.entityName = dt?.data?.entityName;
    this.titleAction = dt?.data?.titleAction;
    this.getArrFields();
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}

  getArrFields() {
    this.listField = [];
    for (var key in this.datas) {
      let field = this.convertStepField(this.datas[key]);
      this.listField.push(field);
      //test
      // if (key == 'Address') this.dataRef.push(field);
    }
  }

  selectField(field) {
    let idx = this.dataRef.findIndex((x) => x.recID == field.recID);
    if (idx != -1) {
      this.dataRef.splice(idx, 1);
    } else this.dataRef.push(field);
  }

  check(recID) {
    let idx = this.dataRef.findIndex((x) => x.recID == recID);
    return idx != -1;
  }

  saveData() {
    this.dialog.close(this.dataRef);
  }
  convertStepField(data) {
    let field = this.dataRef.find((x) => x.fieldName == data.fieldName);
    if (field) return field;
    field = new DP_Steps_Fields();
    field.recID = data.recID; ///Util.uid();
    field.fieldName = data.fieldName;
    field.title = data.headerText;
    field.refType = data.referedType;
    field.refValue = data.referedValue;
    field.dataType = this.convertDataTypeAndFormat(
      data.dataType,
      data.dataFormat
    )[0];
    field.dataFormat = this.convertDataTypeAndFormat(
      data.dataType,
      data.dataFormat
    )[1];
    return field;
  }
  convertDataTypeAndFormat(dataType, dataFormat): any[] {
    let type = 'T';
    let format = 'S';
    //hoi laiKhanh
    switch (dataType.toLocaleLowerCase()) {
      case 'string':
      case 'guild':
        type = 'T';
        format = dataFormat.includes('ed') ? 'L' : 'S';
        break;
      case 'bool':
        type = 'T';
        format = '';
        break;
      case 'datetime':
        type = 'D';
        format = dataFormat == 'g' ? '3' : '2'; //DD/MM/YYYY
        break;
      case 'int':
      case 'short':
        type = 'N';
        format = 'I';
        break;
      case 'decimal':
        type = 'N';
        format = 'D';
        break;
    }
    return [type, format];
  }
}
