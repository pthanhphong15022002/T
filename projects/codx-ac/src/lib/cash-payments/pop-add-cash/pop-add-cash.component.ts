import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashPayment } from '../../models/CashPayment.model';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';

@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css'],
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridCashPaymentLine')
  public gridCashPaymentLine: CodxGridviewV2Component;
  @ViewChild('gridVoucherLineRefs')
  public gridVoucherLineRefs: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  cashpayment: CashPayment;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  parentID: string;
  cashpaymentline: Array<CashPaymentLine> = [];
  voucherLineRefs: Array<any> = [];
  voucherLineRefsDelete: Array<any> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
  tab: number = 0;
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  gridHeight: number;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cashpayment = dialog.dataService!.dataSelected;
    this.cache
      .gridViewSetup('CashPayments', 'grvCashPayments')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.formType == 'edit') {
      if (this.cashpayment?.voucherNo != null) {
        //#region  load cashpaymentline
        this.acService
          .loadData(
            'ERM.Business.AC',
            'CashPaymentsLinesBusiness',
            'LoadDataAsync',
            this.cashpayment.recID
          )
          .subscribe((res: any) => {
            this.cashpaymentline = res;
          });
        //#endregion
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.cashpayment);
  }
  //#endregion

  //#region Event
  created(e) {
    this.tabObj.hideTab(1, true);
  }

  select(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        //this.editRow(data);
        break;
      case 'SYS04':
        this.copyRow(data);
        break;
    }
  }

  changeType(e: any) {
    switch (e.data) {
      case '1':
        this.tabObj.hideTab(0, false);
        this.tabObj.hideTab(1, true);
        this.cashpaymentline = [];
        break;
      default:
        this.tabObj.hideTab(0, true);
        this.tabObj.hideTab(1, false);
        this.voucherLineRefs = [];
        break;
    }
  }

  valueChange(e: any) {
    if (e.data) {
      let sArray = [
        'currencyid',
        'voucherdate',
        'cashbookid',
        'journalno',
        'objectid',
      ];
      if (sArray.includes(e.field.toLowerCase())) {
        if (e.field.toLowerCase() === 'objectid') {
          let data = e.component.itemsSelected[0];
          this.cashpayment.objectType = data.ObjectType;
        }

        this.api
          .exec<any>('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            e.field,
            this.cashpayment,
          ])
          .subscribe((res) => {
            if (res) {
              this.form.formGroup.patchValue(res);
            }
          });
      }

      if (e.field.toLowerCase() === 'exchangerate')
        this.api
          .exec<any>(
            'AC',
            'CashPaymentsLinesBusiness',
            'ChangeExchangeRateAsync',
            [this.cashpayment, this.cashpaymentline]
          )
          .subscribe((res) => {
            if (res) {
              this.gridCashPaymentLine.dataSource = res;
              this.cashpaymentline = res;
            }
          });

      if (e.field.toLowerCase() === 'bankaccount')
        this.api
          .exec<any>(
            'BS',
            'BankAccountsBusiness',
            'GetAsync',
            this.cashpayment.bankAccount
          )
          .subscribe((res) => {
            if (res) {
              this.cashpayment.bankAcctNo = res.bankAcctNo;
              this.cashpayment.bankID = res.bankID;
              this.form.formGroup.patchValue(this.cashpayment);
            }
          });

      if (
        e.field.toLowerCase() === 'transactiontext' ||
        e.field.toLowerCase() === 'payee'
      ) {
        let idx = 0;
        let text = e?.component?.itemsSelected[0]?.TextName;
        if (e.field.toLowerCase() === 'payee') {
          idx = 1;
          text = e.data;
        }
        this.cashpayment.memo = this.acService.setMemo(
          this.cashpayment,
          text,
          idx
        );
        this.form.formGroup.patchValue(this.cashpayment);
      }
    }
  }

  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }

  cashPaymentLineChanged(e: any) {
    const field = [
      'accountid',
      'offsetacctid',
      'objecttype',
      'objectid',
      'dr',
      'cr',
      'dr2',
      'cr2',
      'transactiontext',
      'referenceno',
    ];
    if (field.includes(e.field.toLowerCase())) {
      this.api
        .exec('AC', 'CashPaymentsLinesBusiness', 'ValueChangedAsync', [
          this.cashpayment,
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line)
            this.setDataGrid(res.line.updateColumns, res.line);
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

  voucherLineRefsChanged(e: any) {
    if (e.data) {
      const field = ['balanceamt', 'currencyid', 'exchangerate', 'settledamt'];
      if (field.includes(e.field.toLowerCase())) {
        this.api
          .exec('AC', 'VoucherLineRefsBusiness', 'ValueChangedAsync', [
            e.field,
            e.data,
          ])
          .subscribe((res: any) => {
            if (res) {
              this.gridVoucherLineRefs.rowDataSelected[e.field] = res[e.field];
              this.gridVoucherLineRefs.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  addRow() {
    if (this.cashpayment.voucherType == '1') {
      let idx = this.gridCashPaymentLine.dataSource.length;
      let data = this.gridCashPaymentLine.formGroup.value;
      data.recID = Util.uid();
      data.write = true;
      data.delete = true;
      data.read = true;
      data.rowNo = idx + 1;
      data.transID = this.cashpayment.recID;
      this.api
        .exec<any>('AC', 'CashPaymentsLinesBusiness', 'SetDefaultAsync', [
          this.cashpayment,
          data,
        ])
        .subscribe((res) => {
          if (res) {
            this.gridCashPaymentLine.addRow(res, idx);
          }
        });
    } else {
      let idx = this.gridVoucherLineRefs.dataSource.length;
      let data = this.gridVoucherLineRefs.formGroup.value;
      data.recID = Util.uid();
      data.write = true;
      data.delete = true;
      data.read = true;
      data.rowNo = idx + 1;
      data.transID = this.cashpayment.recID;
      this.gridVoucherLineRefs.addRow(data, idx);
    }
  }

  deleteRow(data) {
    if (this.cashpayment.voucherType == '1') {
      this.gridCashPaymentLine.deleteRow(data);
    }
    if (this.cashpayment.voucherType == '2') {
      this.gridVoucherLineRefs.deleteRow(data);
      this.voucherLineRefsDelete.push(data);
    }
  }

  editRow(data) {
    if (this.cashpayment.voucherType == '1')
      this.gridCashPaymentLine.updateRow(data.rowNo, data);
    if (this.cashpayment.voucherType == '2')
      this.gridVoucherLineRefs.updateRow(data.rowNo, data);
  }

  copyRow(data) {
    let idx = this.gridCashPaymentLine.dataSource.length;
    data.rowNo = idx + 1;
    data.recID = Util.uid();
    this.gridCashPaymentLine.addRow(data, idx);
  }

  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashpaymentline = this.gridCashPaymentLine.dataSource;
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'CashPaymentsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.cashpayment];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData(
                  'ERM.Business.AC',
                  'CashPaymentsLinesBusiness',
                  'AddAsync',
                  [this.cashpaymentline]
                )
                .subscribe((res) => {});
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'CashPaymentsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.cashpayment];
            return true;
          })
          .subscribe((res) => {
            if (res != null) {
              this.acService
                .addData(
                  'ERM.Business.AC',
                  'CashPaymentsLinesBusiness',
                  'UpdateAsync',
                  [this.cashpaymentline, this.cashpaymentlineDelete]
                )
                .subscribe((res) => {});
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashpaymentline = this.gridCashPaymentLine.dataSource;
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'CashPaymentsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.cashpayment];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData(
                'ERM.Business.AC',
                'CashPaymentsLinesBusiness',
                'AddAsync',
                [this.cashpaymentline]
              )
              .subscribe((res) => {
                if (res) {
                  this.clearCashpayment();
                  this.dialog.dataService.clear();
                  this.dialog.dataService
                    .addNew((o) => this.setDefault(o))
                    .subscribe((res) => {
                      this.form.formGroup.patchValue(res);
                      this.cashpayment = this.dialog.dataService!.dataSelected;
                    });
                }
              });
          } else {
          }
        });
    }
  }
  //#endregion

  //#region Function
  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridCashPaymentLine.rowDataSelected[field] = data[field];
            this.gridCashPaymentLine.rowDataSelected = {
              ...data,
            };
            this.gridCashPaymentLine.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashpayment);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashpayment[keymodel[i]] == null ||
              String(this.cashpayment[keymodel[i]]).match(/^ *$/) !== null
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
    this.cashpaymentline = [];
  }
  //#endregion
}
