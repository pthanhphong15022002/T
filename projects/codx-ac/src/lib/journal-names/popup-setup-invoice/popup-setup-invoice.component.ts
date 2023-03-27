import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  UIComponent
} from 'codx-core';
import { map } from 'rxjs/operators';
import { IJournal } from '../interfaces/IJournal.interface';

@Component({
  selector: 'lib-popup-setup-invoice',
  templateUrl: './popup-setup-invoice.component.html',
  styleUrls: ['./popup-setup-invoice.component.css'],
})
export class PopupSetupInvoiceComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  data: IJournal = {} as IJournal;
  formTitle: string = '';

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .moreFunction('VATInvoices', 'grvVATInvoices')
      .pipe(map((data) => data.find((m) => m.functionID === 'ACT02')))
      .subscribe((res) => (this.formTitle = res.defaultName));
  }
  //#endregion

  //#region Event
  handleClickSave(): void {
    this.dialogRef.close(this.data);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
