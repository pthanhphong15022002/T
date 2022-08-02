import { UIComponent } from 'codx-core';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { EventEmitter } from 'stream';
import { CodxEpService } from '../../codx-ep.service';
import { BookingStationeryComponent } from '../booking-stationery.component';
@Component({
  selector: 'lib-popup-request-stationery',
  templateUrl: './popup-request-stationery.component.html',
  styleUrls: ['./popup-request-stationery.component.scss'],
})
export class PopupRequestStationeryComponent extends UIComponent {
  data = {};
  isAdd = true
  dialog: any;
  selectDate = null;
  CbxName: any;
  isAfterRender = false;
  dialogRequest: FormGroup;
  headerText = 'Yêu cầu văn phòng phẩm';
  subHeaderText = 'Yêu cầu cho phòng';
  count: any;
  listItem: any;
  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.count = dt?.data[2];
    this.listItem = dt?.data[1];
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

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 430);
    this.detectorRef.detectChanges();
  }

  initForm() {
    this.epService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        if (res) {
          this.dialogRequest = res;
          this.isAfterRender = true;
        } else {

        }

      });
  }

  beforeSave(option: any) {
    let itemData = this.dialogRequest.value;
    if (!itemData.resourceID) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
    option.method = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    // if (this.dialogRequest.invalid == true) {
    //   return;
    // }
    // if (!this.dialogRequest.value.linkType) {
    //   this.dialogRequest.value.linkType = '0';
    // }
    // this.dialogRequest.value.resourceType = '1';
    // this.dialog.dataService
    //   .save((opt: any) => this.beforeSave(opt))
    //   .subscribe();
  }

  valueDateChange(event: any) {
    this.selectDate = event.data.fromDate;
    if (this.selectDate) {
      this.dialogRequest.patchValue({ bookingOn: this.selectDate });
    }
  }

  valueChange(evt) { }
  valueCbxChange(evt) { }

  openFormFuncID() { }
  click() { }
}
