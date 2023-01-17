import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { BankAccount } from '../../models/BankAccount.model';

@Component({
  selector: 'lib-pop-add-bank',
  templateUrl: './pop-add-bank.component.html',
  styleUrls: ['./pop-add-bank.component.css']
})
export class PopAddBankComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  bankaccount: BankAccount;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
  }

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.bankaccount = this.form?.formGroup.value;
  }
}
