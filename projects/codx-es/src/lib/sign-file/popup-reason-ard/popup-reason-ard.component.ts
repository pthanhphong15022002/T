import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UIComponent, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-reason-ard',
  templateUrl: './popup-reason-ard.component.html',
  styleUrls: ['./popup-reason-ard.component.scss'],
})
export class PopupReasonARDComponent extends UIComponent {
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

  title = 'Duyệt';
  subTitle = 'Comment khi duyệt';

  dialog;
  data;

  formModel: FormModel;
  dialogSignFile: FormGroup;

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
