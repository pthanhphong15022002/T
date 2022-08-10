import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UIComponent, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-sign-for-approval',
  templateUrl: './popup-sign-for-approval.component.html',
  styleUrls: ['./popup-sign-for-approval.component.scss'],
})
export class PopupSignForApprovalComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    // this.data = dt.data[0];
  }

  dialog;
  data = {
    funcID: 'EST011',
  };

  formModel: FormModel;
  dialogSignFile: FormGroup;

  recID = '76ec6750-184a-11ed-a50e-d89ef34bb550';
  funcID;
  cbxName;

  onInit(): void {
    this.funcID = this.data.funcID;

    this.cache.functionList(this.funcID).subscribe((res) => {
      this.esService
        .getComboboxName(res.formName, res.gridViewName)
        .then((res) => {
          if (res) {
            this.cbxName = res;
          }
        });
    });
  }

  clickOpenADR(mode) {}

  valueChange(e) {}
  saveDialog() {
    this.dialog.close();
  }
}
