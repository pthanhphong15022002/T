import { Component, Injector, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel, UIComponent } from 'codx-core';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';

@Component({
  selector: 'lib-popup-setting-norms',
  templateUrl: './popup-setting-norms.component.html',
  styleUrls: ['./popup-setting-norms.component.scss'],
})
export class PopupSettingNormsComponent extends UIComponent {
  data: any = {};
  dialog: DialogRef;
  headerText = 'Thiết lập định mức VPP';
  subheaderText = 'Cho phép thiết lập định mức cho theo cấp bậc nhân viên';
  formModel: FormModel;
  dialogVPP: FormGroup;
  CbxName: any;
  isAfterRender = false;
  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
    this.formModel = this.data[0];
  }

  onInit(): void {
    this.epService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
      });

    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogVPP = item;
        this.isAfterRender = true;
      });
  }
}
