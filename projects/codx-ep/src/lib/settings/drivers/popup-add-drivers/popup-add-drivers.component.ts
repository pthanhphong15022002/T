import { CodxEpService } from './../../../codx-ep.service';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Component, Injector, OnInit, Optional } from '@angular/core';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: './popup-add-drivers.component.html',
  styleUrls: ['./popup-add-drivers.component.scss']
})
export class PopupAddDriversComponent extends UIComponent {
  headerText = 'Thêm lái xe';
  subHeaderText = 'Thêm mới lái xe';
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

  valueChange(event) { }

  onSaveForm() { }

}
