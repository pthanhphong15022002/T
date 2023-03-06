import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { BankAccount } from '../../models/BankAccount.model';

@Component({
  selector: 'lib-pop-add-bank',
  templateUrl: './pop-add-bank.component.html',
  styleUrls: ['./pop-add-bank.component.css'],
})
export class PopAddBankComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  bankaccount: BankAccount = new BankAccount();
  objectBankaccount: Array<BankAccount> = [];
  gridViewSetup: any;
  type: any;
  validate: any = 0;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.objectBankaccount = dialogData.data?.dataBank;
    this.cache
      .gridViewSetup('BankAccounts', 'grvBankAccounts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (dialogData.data?.data != null) {
      this.bankaccount = dialogData.data?.data;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Function
  valueChange(e: any) {
    this.bankaccount[e.field] = e.data;
  }
  clearBankAccount() {
    this.form.formGroup.reset();
    this.bankaccount = new BankAccount();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.bankaccount);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.bankaccount[keymodel[i]] == null ||
              this.bankaccount[keymodel[i]] == ''
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.type == 'editbank') {
        this.notification.notifyCode('SYS007', 0, '');
      }else{
        this.notification.notifyCode('SYS006', 0, '');
      }
      window.localStorage.setItem(
        'databankaccount',
        JSON.stringify(this.bankaccount)
      );
      this.dialog.close();
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }else{
      this.notification.notifyCode('SYS006', 0, '');
      this.objectBankaccount.push({ ...this.bankaccount });
      this.clearBankAccount();
    } 
  }
  //#endregion
}
