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
    this.dialog.close([this.dataRef, true]);
  }
  convertStepField(data) {
    let field = this.dataRef.find((x) => x.fieldName == data.fieldName);
    if (field) return field;
    field = new DP_Steps_Fields();
    field.recID = data.recID; ///Util.uid();
    field.fieldName = data.fieldName;
    field.title = data.headerText;
    field = this.convertDataTypeAndFormat(data, field);

    return field;
  }
  convertDataTypeAndFormat(data, field): any[] {
    let type = 'T';
    let format = 'S';
    let refType = data.referedType;
    let refValue = data.referedValue;
    switch (data.dataType.toLocaleLowerCase()) {
      case 'string':
      case 'guild':
        if (refType && refValue) {
          type = 'L';
          format = refType == '2' ? 'V' : 'C';
        } else {
          let fiedname = data.fieldName.toLocaleLowerCase();
          let convert = this.defaultConvertData(fiedname, data.dataFormat);
          type = convert[0];
          format = convert[1];
          refType = convert[2];
          refValue = convert[3];
        }
        break;
      case 'bool':
        type = 'L';
        format = 'B';
        break;
      case 'datetime':
        type = 'D';
        format = data.dataFormat == 'g' ? '3' : '2'; //DD/MM/YYYY
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
    field.dataType = type;
    field.dataFormat = format;
    field.refType = refType;
    field.refValue = refValue;

    return field;
  }

  defaultConvertData(fiedname, dataFormatGrv) {
    let type = 'L';
    let format = 'C';
    let refType = '3';
    let refValue = '';
    switch (fiedname) {
      case 'createdby':
      case 'owner':
      case 'modifiedby':
        refValue = 'Users';
        break;
      case 'deepartmentid':
        refValue = 'Share_Departments';
        break;
      case 'divisionid':
        refValue = 'Divisions';
        break;
      case 'employeeid':
        refValue = 'EmployeeUser';
        break;
      case 'orgunitid':
        refValue = 'Share_OrgUnits';
        break;
      case 'positionid':
        refValue = 'Share_Positions';
        break;
      case 'buid':
        refValue = 'BusinessUnits';
        break;
      default:
        type = 'T';
        format = dataFormatGrv.includes('ed') ? 'L' : 'S';
        refType = '';
        refValue = '';
        break;
    }
    return [type, format, refType, refValue];
  }
}
