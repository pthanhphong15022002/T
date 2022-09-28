import { FormGroup } from '@angular/forms';
import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent, FormModel } from 'codx-core';

@Component({
  selector: 'popup-add-quota',
  templateUrl: './popup-add-quota.component.html',
  styleUrls: ['./popup-add-quota.component.scss'],
})
export class PopupAddQuotaComponent extends UIComponent {
  title = 'Thiết lập định mức VPP';
  subHeader = 'Cho phép thiết lập định mức cho theo cấp bậc nhân viên';
  dialog!: DialogRef;
  data;
  formModel: FormModel;

  constructor(
    injector: Injector,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt?.data;
    this.formModel = dt?.data[0];
  }

  onInit(): void {}

  valueChange() {}
}
