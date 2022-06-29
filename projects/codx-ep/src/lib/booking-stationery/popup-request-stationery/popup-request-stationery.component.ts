import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
@Component({
  selector: 'lib-popup-request-stationery',
  templateUrl: './popup-request-stationery.component.html',
  styleUrls: ['./popup-request-stationery.component.scss'],
})
export class PopupRequestStationeryComponent implements OnInit {
  @Input() data = {};
  @Input() isAdd = true;
  dialog: any;
  selectDate = null;
  CbxName: any;
  isAfterRender = false;
  dialogRequest: FormGroup;
  headerText = 'Yêu cầu văn phòng phẩm';
  subHeaderText = 'Yêu cầu cho phòng';
  constructor(
    private bookingService: CodxEpService,
    private callFuncService: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.bookingService
      .getComboboxName(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('Cbx', this.CbxName);
      });
    this.initForm();
    console.log('Dialog: ', this.dialog);
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
  }
  initForm() {
    this.bookingService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.dialogRequest = res;
        this.isAfterRender = true;
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
    if (this.dialogRequest.invalid == true) {
      console.log(this.dialogRequest);
      return;
    }
    if (!this.dialogRequest.value.linkType) {
      this.dialogRequest.value.linkType = '0';
    }
    this.dialogRequest.value.resourceType = '1';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }
  valueDateChange(event: any) {
    this.selectDate = event.data.fromDate;
    if (this.selectDate) {
      this.dialogRequest.patchValue({ bookingOn: this.selectDate });
    }
  }
  valueChange(evt) {}
  valueCbxChange(evt) {}

  openFormFuncID() {}
  click() {}
}
