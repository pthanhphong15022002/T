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
    this.entityName = dt?.data?.entityName;
    this.titleAction = dt?.data?.titleAction;
    this.getArrFields();
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}

  saveData() {}

  getArrFields() {
    this.listField = [];
    for (var key in this.datas) {
      let field = new DP_Steps_Fields();
      field.recID = Util.uid();
      field.fieldName = this.datas[key].fieldName;
      field.title = this.datas[key].headerText;
      field.refType = this.datas[key].referedType;
      field.refValue = this.datas[key].referedValue;
      this.listField.push(field);
    }
  }

  selectField(fieldName) {}

  check(recID) {
    return false;
  }
}
