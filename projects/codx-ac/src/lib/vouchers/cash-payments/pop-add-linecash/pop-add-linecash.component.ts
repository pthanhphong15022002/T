import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  DialogRef,
  FormModel,
  NotificationsService,
  DialogData,
  CodxInputComponent,
  CodxComboboxComponent,
} from 'codx-core';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { CashPayment } from '../../../models/CashPayment.model';
import { JournalService } from '../../../journals/journals.service';
@Component({
  selector: 'lib-pop-add-linecash',
  templateUrl: './pop-add-linecash.component.html',
  styleUrls: ['./pop-add-linecash.component.css'],
})
export class PopAddLinecashComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cbxAccountID') cbxAccountID: CodxInputComponent;
  @ViewChild('cbxOffsetAcctID') cbxOffsetAcctID: CodxInputComponent;
  @ViewChild('cardbody') cardbody: ElementRef;
  dialog!: any;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  cashpaymentline: CashPaymentLine;
  cashpayment: CashPayment;
  lockFields: any;
  journal : any;
  baseCurr:any;
  objectcashpaymentline: Array<CashPaymentLine> = [];
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() private dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.cashpaymentline = dialogData.data?.data;
    this.objectcashpaymentline = dialogData.data?.dataline;
    this.cashpayment = dialogData.data?.datacash;
    this.type = dialogData.data?.type;
    this.lockFields = dialogData.data?.lockFields;
    this.journal = this.dialogData.data.journal;
    this.cache
      .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.loadCompanySetting();
  }
  ngAfterViewInit() {
    this.loadInit();
  }
  //#endregion

  //#region Event
  lineChanged(e: any) {
    this.cashpaymentline[e.field] = e.data;
    const field = [
      'accountid',
      'offsetacctid',
      'objecttype',
      'objectid',
      'dr',
      'cr',
      'dr2',
      'cr2',
      'reasonid',
      'referenceno',
    ];
    if (field.includes(e.field.toLowerCase())) {
      this.api
        .exec('AC', 'CashPaymentsLinesBusiness', 'ValueChangedAsync', [
          this.cashpayment,
          this.cashpaymentline,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line)
            this.cashpaymentline = res.line;
        });
    }

    if (e.field.toLowerCase() == 'sublgtype' && e.value) {
      if (e.value === '3') {
        //Set lock field
      } else {
        this.api
          .exec<any>(
            'AC',
            'AC',
            'CashPaymentsLinesBusiness',
            'SetLockFieldAsync'
          )
          .subscribe((res) => {
            if (res) {
              //Set lock field
            }
          });
      }
    }
  }
  //#endregion

  //#region Function
  loadInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.cashpaymentline);
    this.dialog.dialog.properties.height = 'auto';
    if (this.journal?.drAcctControl === '1') {
      (
        this.cbxAccountID.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['AccountID=@0'],
        [this.journal?.drAcctID]
      );
    }
    if (this.journal?.drAcctControl === '2') {
      (
        this.cbxAccountID.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['@0.Contains(AccountID)'],
        [`[${this.journal?.drAcctID}]`]
      );
    }
    if (this.journal?.crAcctControl === '1') {
      (
        this.cbxOffsetAcctID.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['AccountID=@0'],
        [this.journal?.crAcctID]
      );
    }
    if (this.journal?.crAcctControl === '2') {
      (
        this.cbxOffsetAcctID.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['@0.Contains(AccountID)'],
        [`[${this.journal?.crAcctID}]`]
      );
    }
    this.dt.detectChanges();

  }
  close() {
    this.dialog.close();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashpaymentline);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashpaymentline[keymodel[i]] == null ||
              String(this.cashpaymentline[keymodel[i]]).match(/^ *$/) !== null
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
  clearCashpayment() {
    let idx = this.objectcashpaymentline.length;
    let data = new CashPaymentLine();
    this.api
      .exec<any>('AC', 'CashPaymentsLinesBusiness', 'SetDefaultAsync', [
        this.cashpayment,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          res.rowNo = idx + 1;
          this.cashpaymentline = res;
          this.form.formGroup.patchValue(res);
        }
      });
  }
  loadControl(value) {
    let index = this.lockFields.findIndex((x) => x == value);
    if (index == -1) {
      return true;
    } else {
      return false;
    }
  }
  loadCompanySetting(){
    this.api
    .exec<any>('AC', 'CommonBusiness', 'GetCompanySettings')
    .subscribe((res) => {
      this.baseCurr = res.baseCurr;
    });
  }
  //#endregion

  //#region Method
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.api
        .execAction<any>(
          'AC_CashPaymentsLines',
          [this.cashpaymentline],
          'SaveAsync'
        )
        .subscribe((res) => {
          if (res) {
            this.objectcashpaymentline.push({ ...this.cashpaymentline });
            this.clearCashpayment();
          }
        });
    }
  }
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.type) {
        case 'add':
          this.api
            .execAction<any>(
              'AC_CashPaymentsLines',
              [this.cashpaymentline],
              'SaveAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.cashpaymentline});
              }
            });
          break;
        case 'edit':
          this.api
            .execAction<any>(
              'AC_CashPaymentsLines',
              [this.cashpaymentline],
              'UpdateAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.cashpaymentline});
              }
            });
          break;
      }
    }
  }
  //#endregion
}
