import { UIComponent } from 'codx-core';
import { Component, Injector, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
@Component({
  selector: 'lib-popup-request-stationery',
  templateUrl: './popup-request-stationery.component.html',
  styleUrls: ['./popup-request-stationery.component.scss'],
})
export class PopupRequestStationeryComponent extends UIComponent {
  data = {};
  isAdd = true;
  dialog: any;
  selectDate = null;
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
    this.listItem = dt?.data[0];
    this.count = dt?.data[1];
    this.dialog = dialog;
  }

  onInit(): void {
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
    option.className = 'BookingsBusiness';
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd, '', this.listItem];
    return true;
  }

  onSaveForm() {
    if (this.dialogRequest.invalid == true) {
      return;
    }
    if (!this.dialogRequest.value.linkType) {
      this.dialogRequest.patchValue({ linkType: '0' });
    }
    this.dialogRequest.patchValue({ resourceType: '3' });
    this.dialogRequest.patchValue({ category: '5' });
    this.dialogRequest.patchValue({ hours: '0' });
    //this.dialogRequest.patchValue({ comments: '0' });

    console.log(this.listItem);
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

  valueChange(event) {
    debugger;
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogRequest.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogRequest.patchValue({ [event['field']]: event.data });
      }
    }
  }

  click() {}
}
