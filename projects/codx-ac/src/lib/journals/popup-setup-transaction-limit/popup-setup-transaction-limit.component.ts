import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { Observable } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../interfaces/IJournal.interface';

@Component({
  selector: 'lib-popup-setup-transaction-limit',
  templateUrl: './popup-setup-transaction-limit.component.html',
  styleUrls: ['./popup-setup-transaction-limit.component.css'],
})
export class PopupSetupTransactionLimitComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  journal: IJournal = {} as IJournal;
  gvs: any;
  formTitle$: Observable<string>;
  isHidden: boolean = true;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.journal = dialogData.data.journal;
    this.gvs = dialogData.data.gvs;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.formTitle$ = this.acService.getDefaultNameFromMoreFunctions(
      'Journals',
      'grvJournals',
      'ACT06'
    );
  }
  //#endregion

  //#region Event
  onClickSave(): void {
    this.dialogRef.close(this.journal);
  }

  onClickHidePopup(e): void {
    console.log(e);

    if (e) {
      this.journal.transConfirmUser = e.id;
    }
    this.isHidden = true;
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
