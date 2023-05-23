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
  CodxGridviewV2Component,
} from 'codx-core';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { CashPayment } from '../../../models/CashPayment.model';
import { JournalService } from '../../../journals/journals.service';
import { CodxAcService } from '../../../codx-ac.service';
import { CashReceiptsLines } from '../../../models/CashReceiptsLines.model';
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
  @ViewChild('cbxdiM1') cbxdiM1: CodxInputComponent;
  @ViewChild('cbxdiM2') cbxdiM2: CodxInputComponent;
  @ViewChild('cbxdiM3') cbxdiM3: CodxInputComponent;
  @ViewChild('cbxproject') cbxproject: CodxInputComponent;
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
  showPlan:any = true;
  showinvoice:any = true;
  gridCashPaymentLine: CodxGridviewV2Component;
  objectcashpaymentline: Array<any> = [];
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private journalService: JournalService,
    private acService: CodxAcService,
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
    this.gridCashPaymentLine = this.dialogData.data.grid;
    this.cache
      .gridViewSetup(dialog.formModel.formName, dialog.formModel.gridViewName)
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
    let classname;
    switch(this.dialog.formModel.formName){
      case 'CashPaymentsLines':
        classname = 'CashPaymentsLinesBusiness';
        break;
      case 'CashReceiptsLines':
        classname = 'CashReceiptsLinesBusiness';
        break;
    }
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
        .exec('AC', classname, 'ValueChangedAsync', [
          this.cashpayment,
          this.cashpaymentline,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line)
            this.cashpaymentline = res.line;
            this.form.formGroup.patchValue(res.line);
        });
    }

    // if (e.field.toLowerCase() == 'sublgtype' && e.value) {
    //   if (e.value === '3') {
    //     //Set lock field
    //   } else {
    //     this.api
    //       .exec<any>(
    //         'AC',
    //         'AC',
    //         'CashPaymentsLinesBusiness',
    //         'SetLockFieldAsync'
    //       )
    //       .subscribe((res) => {
    //         if (res) {
    //           //Set lock field
    //         }
    //       });
    //   }
    // }
  }
  //#endregion

  //#region Function
  loadInit() {
    this.form.formGroup.patchValue(this.cashpaymentline);
    this.acService.setPopupSize(this.dialog,'auto','40%');
    switch(this.journal?.drAcctControl){
      case '1':
        (this.cbxAccountID.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['AccountID=@0'],
          [this.journal?.drAcctID]
        );
        break;
      case '2':
        (this.cbxAccountID.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(AccountID)'],
          [`[${this.journal?.drAcctID}]`]
        );
        break;
    }
    switch(this.journal?.crAcctControl){
      case '1':
        (this.cbxOffsetAcctID.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['AccountID=@0'],
          [this.journal?.crAcctID]
        );
        break;
      case '2':
        (this.cbxOffsetAcctID.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(AccountID)'],
          [`[${this.journal?.crAcctID}]`]
        );
        break;
    }
    switch(this.journal?.diM1Control){
      case '1':
        (this.cbxdiM1.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['DepartmentID=@0'],
          [this.journal?.diM1]
        );
        break;
      case '2':
        (this.cbxdiM1.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(DepartmentID)'],
          [`[${this.journal?.diM1}]`]
        );
        break;
    }
    switch(this.journal?.diM3Control){
      case '1':
        (this.cbxdiM3.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['CostItemID=@0'],
          [this.journal?.diM3]
        );
        break;
      case '2':
        (this.cbxdiM3.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(CostItemID)'],
          [`[${this.journal?.diM3}]`]
        );
        break;
    }
    switch(this.journal?.diM2Control){
      case '1':
        (this.cbxdiM2.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['CostCenterID=@0'],
          [this.journal?.diM2]
        );
        break;
      case '2':
        (this.cbxdiM2.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(CostCenterID)'],
          [`[${this.journal?.diM2}]`]
        );
        break;
    }
    switch(this.journal?.projectControl){
      case '1':
        (this.cbxproject.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['ProjectID=@0'],
          [this.journal?.projectID]
        );
        break;
      case '2':
        (this.cbxproject.ComponentCurrent as CodxComboboxComponent).dataService.setPredicates(
          ['@0.Contains(ProjectID)'],
          [`[${this.journal?.projectID}]`]
        );
        break;
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
    let classname,data;
    switch(this.dialog.formModel.formName){
      case 'CashPaymentsLines':
        data = new CashPaymentLine();
        classname = 'CashPaymentsLinesBusiness';
        break;
      case 'CashReceiptsLines':
        data = new CashReceiptsLines();
        classname = 'CashReceiptsLinesBusiness';
        break;
    }
    this.api
      .exec<any>('AC', classname, 'SetDefaultAsync', [
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
          this.dialog.formModel.entityName,
          [this.cashpaymentline],
          'SaveAsync'
        )
        .subscribe((res) => {
          if (res) {
            this.objectcashpaymentline.push({ ...this.cashpaymentline });
            this.gridCashPaymentLine.refresh();
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
              this.dialog.formModel.entityName,
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
              this.dialog.formModel.entityName,
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
