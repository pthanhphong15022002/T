import { CodxEpService } from './../../../codx-ep.service';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Component, EventEmitter, Injector, Input, OnInit, Optional, Output } from '@angular/core';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: './popup-add-drivers.component.html',
  styleUrls: ['./popup-add-drivers.component.scss']
})
export class PopupAddDriversComponent extends UIComponent {
  
  @Input() isAdd = true;
  @Output() closeEdit = new EventEmitter();
  headerText = 'Thêm mới lái xe';
  subHeaderText = 'Tạo & upload file văn bản';
  dialogAddDriver: FormGroup;
  isAfterRender = false;
  data: any;
  dialog: any;  
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
    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((item) => {
        this.dialogAddDriver = item;
        this.dialogAddDriver.patchValue({
          ranking: '1',
          category: '1',
          owner: '',
        });

        if (this.data) {
          this.dialogAddDriver.patchValue(this.data);
        }
        this.isAfterRender = true;
      });
  }
 

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddDriver.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }
  // openPopupDevice(template: any) {
  //   var dialog = this.callFuncService.openForm(template, '', 550, 430);
  //   this.changeDetectorRef.detectChanges();
  // }
  // checkedChange(event: any, device: any) {
  //   let index = this.tmplstDevice.indexOf(device);
  //   if (index != -1) {
  //     this.tmplstDevice[index].isSelected = event.target.checked;
  //   }
  // }
  onSaveForm() {
    if (this.dialogAddDriver.invalid == true) {
      console.log(this.dialogAddDriver);
      return;
    }    
    if (!this.dialogAddDriver.value.linkType) {
      this.dialogAddDriver.value.linkType = '0';
    }
    this.dialogAddDriver.value.resourceType = '3';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
