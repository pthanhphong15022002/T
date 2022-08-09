import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UIComponent, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-adr',
  templateUrl: './popup-adr.component.html',
  styleUrls: ['./popup-adr.component.scss'],
})
export class PopupADRComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data[0];
  }

  dialog;
  data;

  formModel: FormModel;
  dialogSignFile: FormGroup;

  recID = 'bcb4eb9f-17cd-11ed-b6b1-b8ca3a760f21';
  funcID;
  cbxName;

  onInit(): void {
    console.log(this.data);

    this.funcID = this.data.funcID;
    console.log(this.funcID);

    this.cache.functionList(this.funcID).subscribe((res) => {
      console.log('res', res);

      this.esService
        .getComboboxName(res.formName, res.gridViewName)
        .then((res) => {
          if (res) {
            this.cbxName = res;
          }
        });
    });
  }

  valueChange(e) {}
  saveDialog() {
    this.dialog.close();
  }
}
