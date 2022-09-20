import { FormGroup } from '@angular/forms';
import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, FormModel, UIComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'lib-popup-update-inventory',
  templateUrl: './popup-update-inventory.component.html',
  styleUrls: ['./popup-update-inventory.component.scss'],
})
export class PopupUpdateInventoryComponent
  extends UIComponent
{
  data: any;
  dialog: DialogRef;
  headerText: string = 'Cập nhật số lượng';
  subheaderText: string =
    'Cho phép nhập thêm số lượng mới của từng loại văn phòng phẩm';
  formModel: FormModel;
  dialogUpdateInventory: FormGroup;
  isAfterRender: boolean = false;

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.formModel = dt?.data[0];
    this.data = dt?.data[1];
    this.dialog = dialog;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogUpdateInventory = item;
        this.isAfterRender = true;
      });
  }

  beforeSave(option: any) {
    let itemData = this.dialogUpdateInventory.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, false];
    return true;
  }

  onSaveForm() {
    console.log(this.dialogUpdateInventory);
    console.log(this.dialog);
    // this.dialog.dataService
    //   .save((opt: any) => this.beforeSave(opt))
    //   .subscribe((res) => {
    //     this.dialog.close();
    //   });
  }
}
