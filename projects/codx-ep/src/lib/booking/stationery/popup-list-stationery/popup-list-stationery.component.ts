import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'lib-popup-list-stationery',
  templateUrl: './popup-list-stationery.component.html',
  styleUrls: ['./popup-list-stationery.component.scss'],
})
export class PopupListStationeryComponent extends UIComponent {
  headerText: string = 'Danh sách yêu cầu';
  subHeaderText: string = 'Yêu cầu cho phòng';
  data: any;
  dialog: any;
  CbxName: any;
  isAfterRender = false;
  dialogListStationery: FormGroup;

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
  }

  onInit(): void {
    this.epService
      .getComboboxName(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
      });
    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        if (res) {
          this.dialogListStationery = res;
          this.isAfterRender = true;
        } else {
        }
      });
  }

  valueChange(event) {}

  search(event) {}
}
