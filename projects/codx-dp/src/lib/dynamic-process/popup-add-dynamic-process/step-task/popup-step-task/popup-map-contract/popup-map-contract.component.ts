import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';

import { DP_Steps_Fields } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'popup-map-contract',
  templateUrl: './popup-map-contract.component.html',
  styleUrls: ['./popup-map-contract.component.scss'],
})
export class PopupMapContractComponent implements OnInit, AfterViewInit {
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
  dataSelect;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.datas = dt?.data?.datas;
    this.dataRef = dt?.data?.dataRef ?? [];
    this.titleAction = dt?.data?.titleAction;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}


  selectField(field) {
    field.check = true;
    if(this.dataSelect){
      this.dataSelect.check = false;
    }
    this.dataSelect = field;
  }

  check(recID) {
    let idx = this.dataRef.findIndex((x) => x.recID == recID);
    return idx != -1;
  }

  saveData() {
    this.dialog.close(this.dataSelect);
  }
  
}
