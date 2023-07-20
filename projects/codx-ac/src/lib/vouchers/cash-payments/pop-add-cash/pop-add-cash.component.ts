import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AuthService,
  AuthStore,
  CallFuncService,
  CodxComboboxComponent,
  CodxDropdownSelectComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PopAddLinecashComponent } from '../pop-add-linecash/pop-add-linecash.component';
import { Observable, Subject, interval, map, takeUntil, timeout } from 'rxjs';
import { CashPayment } from '../../../models/CashPayment.model';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';
import { CashReceiptsLines } from '../../../models/CashReceiptsLines.model';
import { PopUpCashComponent } from '../pop-up-cash/pop-up-cash.component';
import { PopUpVatComponent } from '../pop-up-vat/pop-up-vat.component';
import {
  AnimationModel,
  ILoadedEventArgs,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  focus: any;
  //#region Contructor
  @ViewChild('gridCash')
  public gridCash: CodxGridviewV2Component;
  @ViewChild('gridSet')
  public gridSet: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('editTemplate', { static: true }) editTemplate: TemplateRef<any>;
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('annotationsave') annotationsave: ProgressBar;
  @ViewChild('annotationform') annotationform: ProgressBar;
  // @ViewChild('cbxCashBook') cbxCashBook: any;
  @ViewChild('cbxReasonID') cbxReasonID: any;
  @ViewChild('cbxObjectID') cbxObjectID: any;
  @ViewChild('cbxPayee') cbxPayee: any;
  @ViewChild('cbxCashBook') cbxCashBook: any;
  @ViewChild('tExchange')
  set tExchange(eleExchange: any) {
    setTimeout(() => {
      if (eleExchange) {
        let ele = eleExchange.elRef.nativeElement.firstElementChild
          .firstElementChild.firstElementChild as any;
        if (ele && ele.readOnly) {
          ele.setAttribute('tabindex', '-1');
        }
      }
    }, 1000);
  }
  @ViewChild('tVourcherNo')
  set tVourcherNo(eleVourcherNo: any) {
    setTimeout(() => {
      if (eleVourcherNo) {
        let ele = eleVourcherNo.elRef.nativeElement.firstElementChild
          .firstElementChild as any;
        if (ele && ele.readOnly) {
          ele.setAttribute('tabindex', '-1');
        }
      }
    }, 1000);
  }
  headerText: string;
  dialog!: DialogRef;
  cashpayment: any;
  action: any;
  gridViewSetup: any;
  journalNo: string;
  modegrid: any;
  cashpaymentline: Array<any> = [];
  settledInvoices: Array<any> = [];
  hideFields: Array<any> = [];
  hideFieldsSet: Array<any> = [];
  requireFields = [];
  lockFields = [];
  total: any = 0;
  hasSaved: any = false;
  journal: IJournal;
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmCashCashReceiptsLine: FormModel = {
    formName: 'CashReceiptsLines',
    gridViewName: 'grvCashReceiptsLines',
    entityName: 'AC_CashReceiptsLines',
  };
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  noEditSetting: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  baseCurr: any;
  formNameLine: any;
  gridViewNameLine: any;
  entityNameLine: any;
  classNameLine: any;
  className: any;
  dataLine: any;
  authStore: AuthStore;
  typeSet: any;
  loading: any = false;
  loadingform: any = true;
  isOpen: any;
  // dicCurrency: Map<string, any> = new Map<string, any>();
  oAccount: any;
  userID: any;
  public animation: AnimationModel = { enable: true, duration: 1000, delay: 0 };
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private journalService: JournalService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.journalNo) this.journalNo = res.journalNo;
    });
    this.headerText = dialogData.data?.headerText;
    this.action = dialogData.data?.formType;
    this.cashpayment = dialog.dataService.dataSelected;
    this.journal = dialogData.data?.journal;
    this.modegrid = this.journal.addNewMode;
    this.baseCurr = this.journal.unbounds.baseCurr;
    this.oAccount = this.journal.unbounds.oAccount;
    switch (this.dialog.formModel.funcID) {
      case 'ACT0429':
      case 'ACT0410':
        this.formNameLine = 'CashPaymentsLines';
        this.gridViewNameLine = 'grvCashPaymentsLines';
        this.entityNameLine = 'AC_CashPaymentsLines';
        this.className = 'CashPaymentsBusiness';
        this.classNameLine = 'CashPaymentsLinesBusiness';
        break;
      case 'ACT0428':
      case 'ACT0401':
        this.formNameLine = 'CashReceiptsLines';
        this.gridViewNameLine = 'grvCashReceiptsLines';
        this.entityNameLine = 'AC_CashReceiptsLines';
        this.className = 'CashReceiptsBusiness';
        this.classNameLine = 'CashReceiptsLinesBusiness';
        this.dataLine = new CashReceiptsLines();
        break;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.userID = this.authStore.get().userID;
    this.isOpen = true;
    this.loadInit();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.cashpayment, {
      onlySelf: true,
      emitEvent: false,
    });
    //this.onFocus();
  }
  //#endregion

  //#region Event
  close() {
    if (
      (this.gridCash && !this.gridCash.gridRef.isEdit) ||
      (this.gridSet && !this.gridSet.gridRef.isEdit)
    ) {
      this.onDestroy();
      this.dialog.close();
    }
  }

  clickMF(e: any, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        this.editRow(data);
        break;
      case 'SYS04':
        this.copyRow(data);
        break;
    }
  }
  changeDataMF(e: any) {
    let bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT042901' ||
        x.functionID == 'ACT041010' ||
        x.functionID == 'ACT041003' || // ghi sổ
        x.functionID == 'ACT041002' || // gửi duyệt
        x.functionID == 'ACT041004' || // hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || // khôi phục
        x.functionID == 'ACT042901' || // chuyển tiền điện tử
        x.functionID == 'ACT041010' || // in
        x.functionID == 'ACT041009' ||
        x.functionID == 'SYS003' ||
        x.functionID == 'SYS004' ||
        x.functionID == 'SYS005' ||
        x.functionID == 'SYS001' ||
        x.functionID == 'SYS002'
    );
    bm.forEach((element) => {
      element.disabled = true;
    });
  }

  // created(e: any, ele: TabComponent) {
  //   this.changeType(null, ele);
  // }

  // select(e) {
  //   if (e.isSwiped) {
  //     e.cancel = true;
  //   }
  // }

  changeType(e?: any, ele?: TabComponent) {
    if (e && e.data[0] && e.data[0] == this.cashpayment.subType) {
      return;
    } else {
      if (
        (this.gridCash && !this.gridCash.gridRef.isEdit) ||
        (this.gridSet && !this.gridSet.gridRef.isEdit)
      ) {
        // bùa mốt gỡ
        if (
          e &&
          e.data[0] &&
          (this.cashpaymentline.length > 0 || this.settledInvoices.length > 0)
        ) {
          this.notification.alertCode('AC0014', null).subscribe((res) => {
            if (res.event.status === 'Y') {
              this.api
                .exec<any>('AC', 'CommonBusiness', 'DeleteAllAsync', [
                  this.cashpayment,
                ])
                .subscribe((res) => {});
              this.cashpayment.subType = e.data[0];
              this.cashpaymentline = [];
              this.settledInvoices = [];
              this.form.formGroup.patchValue(
                { subType: this.cashpayment.subType },
                {
                  onlySelf: true,
                  emitEvent: false,
                }
              );
              this.loadSubType(this.cashpayment.subType, this.tabObj);
            } else {
              // this.form.formGroup.patchValue(
              //   { subType: this.cashpayment.subType },
              //   {
              //     onlySelf: true,
              //     emitEvent: false,
              //   }
              // );
              // this.cbxSub.dropdownContent.value = '1';
              // this.cbxSub.dropdownContent.loadDataVll();
            }
          });
        } else {
          this.cashpayment.subType = e.data[0];
          this.loadSubType(this.cashpayment.subType, this.tabObj);
        }
      }
    }
    // let i;
    // if (e && e.data[0] != null) {
    //   i = e.data[0];
    //   if (
    //     e.data[0] != this.oldSubType &&
    //     ((this.gridCash && this.gridCash.dataSource.length > 0) ||
    //       (this.gridSet && this.gridSet.dataSource.length > 0))
    //   ) {
    //     this.notification.alertCode('AC0014', null).subscribe((res) => {
    //       if (res.event.status === 'Y') {
    //         this.api
    //           .exec<any>('AC', 'CommonBusiness', 'DeleteAllAsync', [
    //             this.cashpayment,
    //           ])
    //           .subscribe((res) => {
    //             if (res) {
    //               this.cashpayment.subType = e.data[0];
    //               this.cashpaymentline = [];
    //               this.settledInvoices = [];
    //               this.form.formGroup.patchValue(this.cashpayment);
    //               this.loadSubType(i, this.tabObj);
    //             }
    //           });
    //       } else {
    //         this.form.formGroup.patchValue({ ...this.cashpayment });
    //       }
    //     });
    //   } else {
    //     this.cashpayment.subType = e.data[0];
    //     this.oldSubType = e.data[0];
    //     if (this.form) {
    //       this.form.formGroup.patchValue(this.cashpayment);
    //     }
    //     ele = this.tabObj;
    //     if (ele) {
    //       this.loadSubType(i, ele);
    //     }
    //   }
    //   return;
    // }
    // if (!e && this.cashpayment.subType) {
    //   i = this.cashpayment.subType;
    //   this.oldSubType = this.cashpayment.subType;
    // }
    // if (!ele) ele = this.tabObj;
    // this.loadSubType(i, ele);
  }

  valueChange(e: any) {
    if (e && e.data) {
      this.cashpayment[e.field] = e.data;
      this.cashpayment.updateColumn = e.field;
      let preValue = null;
      switch (e.field.toLowerCase()) {
        case 'objectid':
          switch (this.cashpayment.journalType) {
            case 'CP':
              this.cashpayment.memo = this.setMemo();
              this.cashpayment.objectType =
                e.component.itemsSelected[0].ObjectType;
              this.form.formGroup.patchValue(
                { memo: this.cashpayment.memo },
                {
                  onlySelf: true,
                  emitEvent: false,
                }
              );
              if (this.cashpaymentline.length > 0) {
                if (e.component.dataService.currentComponent.previousItemData) {
                  preValue =
                    e.component.dataService.currentComponent.previousItemData
                      .ObjectID;
                } else {
                  preValue = e.component.itemsSelected[0].ObjectID;
                }
              }
              break;
            case 'BP':
              // xử lí objectid ủy nhiệm chi
              break;
          }
          if (this.cashpaymentline.length > 0) {
            this.reloadDataLine(e.field, preValue);
          }
          break;
        case 'reasonid':
          this.cashpayment.memo = this.setMemo();
          this.form.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashpaymentline.length > 0) {
            if (e.component.dataService.currentComponent.previousItemData) {
              preValue =
                e.component.dataService.currentComponent.previousItemData
                  .ReasonID;
            } else {
              preValue = e.component.itemsSelected[0].ReasonID;
            }
            this.reloadDataLine(e.field, preValue);
          }
          break;
        case 'payee':
          this.cashpayment.memo = this.setMemo();
          this.form.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          break;
        case 'cashbookid':
          if (this.cashpaymentline.length > 0) {
            if (e.component.dataService.currentComponent.previousItemData) {
              preValue =
                e.component.dataService.currentComponent.previousItemData
                  .CashAcctID;
            } else {
              preValue = e.component.itemsSelected[0].CashAcctID;
            }
            this.reloadDataLine(e.field, preValue);
          }
          if (
            this.cashpayment.currencyID !=
            e.component.itemsSelected[0].CurrencyID
          ) {
            this.cashpayment.currencyID =
              e.component.itemsSelected[0].CurrencyID;
            this.setCurrency();
          }
          break;
        case 'currencyid':
          this.setCurrency();
          break;
        case 'voucherdate':
          this.api
            .exec<any>('AC', this.className, 'ValueChangedAsync', [
              'exchangeRate',
              this.cashpayment,
            ])
            .subscribe((res) => {
              if (res) {
                this.cashpayment.exchangeRate = res.exchangeRate;
                this.form.formGroup.patchValue(
                  {
                    exchangeRate: this.cashpayment.exchangeRate,
                  },
                  {
                    onlySelf: true,
                    emitEvent: false,
                  }
                );
              }
            });
          break;
      }
    }
    //#region version 1
    // let field = e.field.toLowerCase();
    // let sArray = [
    //   'currencyid',
    //   'voucherdate',
    //   'cashbookid',
    //   'journalno',
    //   'objectid',
    //   'payee',
    //   'reasonid',
    // ];
    // if (e.data) {
    //   if (sArray.includes(field)) {
    //     switch (field) {
    //       case 'currencyid':
    //         this.gridCreated();
    //         if (this.cashpaymentline.length > 0) {
    //           this.api
    //             .exec<any>(
    //               'AC',
    //               this.classNameLine,
    //               'ChangeExchangeRateAsync',
    //               [this.cashpayment, this.cashpaymentline]
    //             )
    //             .subscribe((res) => {
    //               if (res) {
    //                 this.cashpaymentline = [...res];
    //               }
    //             });
    //         }
    //         break;
    //       case 'reasonid':
    //         if (e.component.dataService.currentComponent.previousItemData) {
    //           this.oldValue =
    //             e.component.dataService.currentComponent.previousItemData.ReasonID;
    //         } else {
    //           this.oldValue = e.component.itemsSelected[0].ReasonID;
    //         }
    //         break;
    //       case 'objectid':
    //         let data = e.component.itemsSelected[0];
    //         this.cashpayment.objectType = data['ObjectType'];
    //         this.cashpayment.objectName = data['ObjectName'];
    //         if (e.component.dataService.currentComponent.previousItemData) {
    //           this.oldValue =
    //             e.component.dataService.currentComponent.previousItemData.ObjectID;
    //         } else {
    //           this.oldValue = e.component.itemsSelected[0].ObjectID;
    //         }
    //         break;
    //     }
    //     this.api
    //       .exec<any>('AC', this.className, 'ValueChangedAsync', [
    //         e.field,
    //         this.cashpayment,
    //         this.cashpaymentline,
    //         this.oldValue,
    //       ])
    //       .subscribe((res) => {
    //         if (res) {
    //           this.cashpayment = res;
    //           this.form.formGroup.patchValue(res);
    //           if (res.unbounds && res.unbounds.lsline) {
    //             this.cashpaymentline = res.unbounds.lsline;
    //             this.dialog.dataService.update(this.cashpayment).subscribe();
    //           }
    //         }
    //       });
    //   }
    // }
    //#endregion version 1
  }

  valueFocusOut(e: any) {
    this.cashpayment.updateColumn = e.ControlName;
    switch (e.ControlName.toLowerCase()) {
      case 'totalamt':
        if (e.crrValue != null) {
          this.cashpayment.totalAmt = e.crrValue;
        } else {
          this.cashpayment.totalAmt = 0;
          this.form.formGroup.patchValue(
            { totalAmt: this.cashpayment.totalAmt },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
        }
        break;
      case 'exchangerate':
        // this.cashpayment[e.ControlName] = e.crrValue;
        // if (e.crrValue && this.cashpaymentline.length > 0) {
        //   this.notification.alertCode('AC0018', null).subscribe((res) => {
        //     if (res.event.status === 'Y') {
        //       this.api
        //         .exec<any>(
        //           'AC',
        //           this.classNameLine,
        //           'ChangeExchangeRateAsync',
        //           [this.cashpayment, this.cashpaymentline]
        //         )
        //         .subscribe((res) => {
        //           if (res) {
        //             this.cashpaymentline = [...res];
        //           }
        //         });
        //     }
        //   });
        // }
        break;
      default:
        this.cashpayment[e.ControlName] = e.crrValue;
        break;
    }
  }

  gridCreated() {
    this.hideFields = [];
    if (
      this.journal.unbounds &&
      this.journal.unbounds.hideFields &&
      this.journal.unbounds.hideFields.length
    ) {
      this.hideFields = [
        ...(this.journal.unbounds.hideFields as Array<string>),
      ];
    }
    this.loadVisibleColumn();
    this.loadAccountControl();
    this.loadFormat();
    this.predicateControl(this.gridCash.visibleColumns);
    this.gridCash.hideColumns(this.hideFields);
    setTimeout(() => {
      this.loadingform = false;
    }, 1000);
  }

  gridCreatedSet() {
    this.hideFieldsSet = [];
    let arr = ['BalAmt2', 'SettledAmt2', 'SettledDisc2'];
    arr.forEach((fieldName) => {
      let i = this.gridSet.columnsGrid.findIndex(
        (x) => x.fieldName == fieldName
      );
      if (i > -1) {
        this.gridSet.columnsGrid[i].isVisible = true;
        this.gridSet.visibleColumns.push(this.gridSet.columnsGrid[i]);
      }
    });
    if (this.cashpayment.currencyID == this.baseCurr) {
      this.hideFieldsSet.push('BalAmt2');
      this.hideFieldsSet.push('SettledAmt2');
      this.hideFieldsSet.push('SettledDisc2');
    }
    this.gridSet.hideColumns(this.hideFieldsSet);
    setTimeout(() => {
      this.loadingform = false;
    }, 1000);
  }

  lineChanged(e: any) {
    if(e.hasNoChange){
      // this.gridCash.focusNextinput(this.gridCash.editIndex);
      return;
    }
    this.dataLine = e.data;
    switch (e.field.toLowerCase()) {
      case 'accountid':
        //this.consTraintGrid();
        // this.gridCash.focusNextinput(this.gridCash.editIndex);
        break;
      case 'offsetacctid':
        let oOffaccount = this.oAccount.filter(
          (x) => x.accountID == this.dataLine.offsetAcctID
        );
        if (oOffaccount.length == 0) {
          this.dataLine.isBrigdeAcct = false;
        } else {
          this.dataLine.isBrigdeAcct =
            oOffaccount[0].accountType == '5' ? true : false;
        }
        // this.gridCash.focusNextinput(this.gridCash.editIndex);
        //this.consTraintGrid();
        break;
      case 'dr':
        if (this.dataLine.dr != 0 && this.dataLine.cR2 != 0) {
          this.dataLine.cr = 0;
          this.dataLine.cR2 = 0;
        }
        this.api
          .exec('AC', this.classNameLine, 'ValueChangedAsync', [
            this.cashpayment,
            this.dataLine,
            e.field,
          ])
          .subscribe((res: any) => {
            if (res) {
              this.dataLine.dR2 = res.dR2;
              this.dataLine.cR2 = res.cR2;
              // this.gridCash.focusNextinput(this.gridCash.editIndex);
            }
          });
        //this.dataLine = this.getValueByExRate(true);
        if (this.journal.entryMode == '2') {
          //this.consTraintGrid();
        }
        break;
      case 'cr':
        if ((this.dataLine.cr! = 0 && this.dataLine.dR2 != 0)) {
          this.dataLine.dr = 0;
          this.dataLine.dR2 = 0;
        }
        this.api
          .exec('AC', this.classNameLine, 'ValueChangedAsync', [
            this.cashpayment,
            this.dataLine,
            e.field,
          ])
          .subscribe((res: any) => {
            if (res) {
              this.dataLine.dR2 = res.dR2;
              this.dataLine.cR2 = res.cR2;

              // this.gridCash.focusNextinput(this.gridCash.editIndex);
            }
          });
        //this.dataLine = this.getValueByExRate(false);
        if (this.journal.entryMode == '2') {
          //this.consTraintGrid();
        }
        break;
      case 'dr2':
        if (
          this.oAccount != null &&
          this.dataLine.dr == 0 &&
          this.oAccount.filter(
            (x) => x.accountID == this.dataLine.offsetAcctID
          )[0].multiCurrency
        ) {
          if (this.cashpayment.multi) {
            if (this.cashpayment.exchangeRate != 0) {
              this.dataLine.dr =
                this.dataLine.cR2 / this.cashpayment.exchangeRate;
            } else {
              this.dataLine.dr = this.dataLine.cR2;
            }
          } else {
            this.dataLine.dr =
              this.dataLine.cR2 * this.cashpayment.exchangeRate;
          }
        }
        if (this.dataLine.dR2 != 0 && this.dataLine.cR2 != 0) {
          this.dataLine.cr = 0;
          this.dataLine.cR2 = 0;
        }
        break;
      case 'cr2':
        if (
          this.oAccount != null &&
          this.dataLine.cr == 0 &&
          this.oAccount.filter(
            (x) => x.accountID == this.dataLine.offsetAcctID
          )[0].multiCurrency
        ) {
          if (this.cashpayment.multi) {
            if (this.cashpayment.exchangeRate != 0) {
              this.dataLine.cr =
                this.dataLine.cR2 / this.cashpayment.exchangeRate;
            } else {
              this.dataLine.cr = this.dataLine.cR2;
            }
          } else {
            this.dataLine.cr =
              this.dataLine.cR2 * this.cashpayment.exchangeRate;
          }
        }
        // this.gridCash.focusNextinput(this.gridCash.editIndex);
        break;
      case 'note':
        // xu li sau
        // this.gridCash.focusNextinput(this.gridCash.editIndex);
        break;
      default:
        // this.gridCash.focusNextinput(this.gridCash.editIndex);
      break;
    }
    // const field = [
    //   'accountid',
    //   'offsetacctid',
    //   'objecttype',
    //   'objectid',
    //   'dr',
    //   'cr',
    //   'dr2',
    //   'cr2',
    //   'reasonid',
    //   'referenceno',
    //   'note',
    // ];
    // if (field.includes(e.field.toLowerCase()) && e.value) {
    //   this.api
    //     .exec('AC', 'CashPaymentsLinesBusiness', 'ValueChangedAsync', [
    //       this.cashpayment,
    //       e.data,
    //       e.field,
    //       e.data?.isAddNew,
    //     ])
    //     .subscribe((res: any) => {
    //       if (res && res.line) {
    //         res.line.isAddNew = e.data?.isAddNew;
    //         switch (e.field.toLowerCase()) {
    //           case 'accountid':
    //           case 'offsetacctid':
    //             this.requireFields = res.requireFields;
    //             this.lockFields = res.lockField;
    //             this.requireGrid();
    //             this.lockGrid();
    //             break;
    //           case 'dr':
    //           case 'cr':
    //             if (this.journal.entryMode == '2') {
    //               this.requireFields = res.requireFields;
    //               this.lockFields = res.lockField;
    //               this.requireGrid();
    //               this.lockGrid();
    //             }
    //             break;
    //         }
    //         this.setDataGrid(res.line.updateColumns, res.line);
    //       }
    //     });
    // }

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
  //Tach thanh component settledinvoice
  settledLineChanged(e: any) {
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
              this.gridSet.rowDataSelected[e.field] = res[e.field];
              this.gridSet.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  //rename _> settlement
  settlement(type: number) {
    if (!this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.gridViewSetup['ObjectID'].headerText
      );
      return;
    }
    this.typeSet = type;
    this.addRow('2');
  }

  addRow(type: any) {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    switch (this.action) {
      case 'add':
        if (type == '1') {
          this.loadGrid();
        } else {
          this.popupSettledInvoices(this.typeSet);
        }
        if (this.hasSaved) {
          if (this.cashpayment.updateColumn) {
            this.cashpayment.updateColumn = null;
            this.dialog.dataService.update(this.cashpayment).subscribe();
            this.api
              .exec('AC', this.className, 'UpdateMasterAsync', [
                this.cashpayment,
                this.journal,
              ])
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res) {
                  // if (res.unbounds.lineDefault != null) {
                  //   this.dataLine = res.unbounds.lineDefault;
                  // }
                }
              });
          }
        } else {
          this.journalService.checkVoucherNoBeforeSave(
            this.journal,
            this.cashpayment,
            'AC',
            this.dialog.formModel.entityName,
            this.form,
            this.action === 'edit',
            () => {
              this.dialog.dataService.addDatas.set(
                this.cashpayment['_uuid'],
                this.cashpayment
              );
              this.cashpayment.updateColumn = null;
              this.hasSaved = true;
              this.dialog.dataService
                .save(
                  (opt: RequestOption) => {
                    opt.methodName = 'SaveLogicAsync';
                    opt.data = [this.cashpayment];
                  },
                  0,
                  '',
                  '',
                  false
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res && res.save.data != null) {
                    //this.cashpayment = res.save.data;
                    // if (this.cashpayment.unbounds.lineDefault != null) {
                    //   this.dataLine = this.cashpayment.unbounds.lineDefault;
                    // }

                  }
                });

            }
          );
        }
        break;
      case 'edit':
        if (this.cashpayment.updateColumn) {
          this.api
            .exec('AC', 'CashPaymentsBusiness', 'UpdateMasterAsync', [
              this.cashpayment,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                // if (res.unbounds.lineDefault != null) {
                //   this.dataLine = res.unbounds.lineDefault;
                // }
                this.dialog.dataService.update(this.cashpayment).subscribe();
              }
            });
          if (type == '1') {
            this.loadGrid();
          } else {
            this.popupSettledInvoices(this.typeSet);
          }
        } else {
          if (type == '1') {
            this.loadGrid();
          } else {
            this.popupSettledInvoices(this.typeSet);
          }
        }
        break;
    }
  }

  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        if (this.cashpayment.subType != '2') {
          switch (this.modegrid) {
            case '1':
              this.gridCash.deleteRow(data);
              if (this.gridCash.dataSource.length > 0) {
                for (let i = 0; i < this.gridCash.dataSource.length; i++) {
                  this.gridCash.dataSource[i].rowNo = i + 1;
                }
              }
              this.cashpaymentline = this.gridCash.dataSource;
              break;
            case '2':
              let index = this.cashpaymentline.findIndex(
                (x) => x.recID == data.recID
              );
              this.cashpaymentline.splice(index, 1);
              for (let i = 0; i < this.cashpaymentline.length; i++) {
                this.cashpaymentline[i].rowNo = i + 1;
              }
              this.gridCash.refresh();
              break;
          }
          this.api
            .exec('AC', this.classNameLine, 'UpdateAfterDelete', [
              data,
              this.cashpaymentline,
            ])
            .subscribe((res) => {});
        }
      }
    });
  }

  // editRow(data) {
  //   switch (this.modegrid) {
  //     case '1':
  //       if (this.cashpayment.subType == '1')
  //         this.gridCash.updateRow(data.rowNo, data);
  //       if (this.cashpayment.subType == '2')
  //         this.gridCash.updateRow(data.rowNo, data);
  //       break;
  //     case '2':
  //       let index = this.cashpaymentline.findIndex(
  //         (x) => x.recID == data.recID
  //       );
  //       let obj = {
  //         headerText: this.headerText,
  //         data: { ...data },
  //         datacash: this.cashpayment,
  //         type: 'edit',
  //         lockFields: this.lockFields,
  //         journal: this.journal,
  //       };
  //       let opt = new DialogModel();
  //       let dataModel = new FormModel();
  //       dataModel.formName = this.formNameLine;
  //       dataModel.gridViewName = this.gridViewNameLine;
  //       dataModel.entityName = this.entityNameLine;
  //       opt.FormModel = dataModel;
  //       opt.Resizeable = false;
  //       this.cache
  //         .gridViewSetup(this.formNameLine, this.gridViewNameLine)
  //         .subscribe((res) => {
  //           if (res) {
  //             let dialogs = this.callfc.openForm(
  //               PopAddLinecashComponent,
  //               '',
  //               null,
  //               null,
  //               '',
  //               obj,
  //               '',
  //               opt
  //             );
  //             dialogs.closed.subscribe((res) => {
  //               if (res.event != null && res.event.action != 'escape') {
  //                 let dataline = res.event['data'];
  //                 this.cashpaymentline[index] = dataline;
  //                 this.hasSaved = true;
  //                 //this.loadTotal();
  //                 if (
  //                   parseInt(this.total.replace(/\D/g, '')) >
  //                   this.cashpayment.paymentAmt
  //                 ) {
  //                   this.notification.notifyCode('AC0012');
  //                 }
  //                 this.gridCash.refresh();
  //                 this.dialog.dataService.updateDatas.set(
  //                   this.cashpayment['_uuid'],
  //                   this.cashpayment
  //                 );
  //                 this.dialog.dataService
  //                   .save(null, 0, '', '', false)
  //                   .subscribe((res) => {});
  //               }
  //             });
  //           }
  //         });
  //       break;
  //   }
  // }
  editRow(data) {
    this.gridCash.gridRef.selectRow(Number.parseFloat(data.index));
    this.gridCash.gridRef.startEdit();
  }
  copyRow(data) {
    let idx = this.gridCash.dataSource.length;
    data.rowNo = idx + 1;
    data.recID = Util.uid();
    // this.requireFields = data.unbounds.requireFields as Array<string>;
    // this.lockFields = data.unbounds.lockFields as Array<string>;
    // this.requireGrid();
    // this.lockGrid();
    this.gridCash.addRow(data, idx);
  }

  onAddNew(e: any) {
    this.loadTotal();
    if (this.cashpayment.totalAmt != 0) {
      if (this.total > this.cashpayment.totalAmt) {
        this.notification.notifyCode('AC0012');
      }
    }
    this.hasSaved = true;
    this.dialog.dataService.update(this.cashpayment).subscribe();
    this.api
      .exec('AC', this.classNameLine, 'SaveAsync', [this.cashpayment, e])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  onEdit(e: any) {
    this.loadTotal();
    this.hasSaved = true;
    if (this.cashpayment.totalAmt != 0) {
      if (this.total > this.cashpayment.totalAmt) {
        this.notification.notifyCode('AC0012');
      }
    }
    this.dialog.dataService.update(this.cashpayment).subscribe();
    this.api
      .exec('AC', this.classNameLine, 'UpdateAsync', [this.cashpayment, e])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  autoAddRow(e: any) {
    switch (e.type) {
      case 'autoAdd':
        this.addRow('1');
        break;
      case 'add':
        if (this.gridCash.autoAddRow) {
          this.addRow('1');
        }
        break;
    }
    //this.addRow();
  }

  autoAddRowSet(e: any) {
    switch (e.type) {
      case 'autoAdd':
        if (this.action == 'add') {
          this.settlement(0);
        } else {
          this.settlement(1);
        }

        break;
    }
    //this.addRow();
  }

  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.journal,
    ]);
  }

  popupLine(data) {
    let obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.cashpaymentline,
      datacash: this.cashpayment,
      type: 'add',
      lockFields: this.hideFields,
      journal: this.journal,
      grid: this.gridCash,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = this.formNameLine;
    dataModel.gridViewName = this.gridViewNameLine;
    dataModel.entityName = this.entityNameLine;
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup(this.formNameLine, this.gridViewNameLine)
      .subscribe((res) => {
        if (res) {
          let dialogs = this.callfc.openForm(
            PopAddLinecashComponent,
            '',
            null,
            null,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((res) => {
            if (res.event != null && res.event.action != 'escape') {
              let dataline = res.event['data'];
              this.cashpaymentline.push(dataline);
              this.hasSaved = true;
              this.gridCash.refresh();
              this.loadTotal();
              this.api
                .exec('AC', this.classNameLine, 'SaveAsync', [
                  this.cashpayment,
                  dataline,
                  this.journal,
                ])
                .subscribe((res: any) => {
                  if (res) {
                    if (this.cashpayment.totalAmt != 0) {
                      if (this.total > this.cashpayment.totalAmt) {
                        this.notification.notifyCode('AC0012');
                      }
                    }
                  }
                });
              // this.loadTotal();
              // this.hasSaved = true;
              // if (
              //   parseInt(this.total.replace(/\D/g, '')) >
              //   this.cashpayment.paymentAmt
              // ) {
              //   this.notification.notifyCode('AC0012');
              // }
              // this.gridCash.refresh();
              // this.dialog.dataService.updateDatas.set(
              //   this.cashpayment['_uuid'],
              //   this.cashpayment
              // );
              // this.dialog.dataService
              //   .save(null, 0, '', '', false)
              //   .subscribe((res) => {});
            }
          });
        }
      });
  }

  popupCash() {
    if (!this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.gridViewSetup['ObjectID'].headerText
      );
      return;
    }
    let obj = {
      cashpayment: this.cashpayment,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashPayments';
    dataModel.gridViewName = 'grvCashPayments';
    dataModel.entityName = 'AC_CashPayments';
    opt.FormModel = dataModel;
    let cashdialog = this.callfc.openForm(
      PopUpCashComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
  }

  popupVat() {
    let obj = {
      cashpayment: this.cashpayment,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'VATInvoices';
    dataModel.gridViewName = 'grvVATInvoices';
    dataModel.entityName = 'AC_VATInvoices';
    opt.FormModel = dataModel;
    let cashdialog = this.callfc.openForm(
      PopUpVatComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
  }
  //#endregion

  //#region Method
  onSave() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.gridCash && !this.gridCash.gridRef.isEdit) ||
      (this.gridSet && !this.gridSet.gridRef.isEdit)
    ) {
      this.loading = true;
      switch (this.action) {
        case 'add':
        case 'copy':
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.cashpayment['_uuid'],
              this.cashpayment
            );
            this.dialog.dataService
              .save((opt: RequestOption) => {
                opt.data = [this.cashpayment];
              })
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.loading = false;
                  this.dialog.close();
                  this.dt.detectChanges();
                } else {
                  this.loading = false;
                }
              });
          }
          break;
        case 'edit':
          this.journalService.checkVoucherNoBeforeSave(
            this.journal,
            this.cashpayment,
            'AC',
            'AC_CashPayments',
            this.form,
            this.action === 'edit',
            () => {
              this.dialog.dataService.updateDatas.set(
                this.cashpayment['_uuid'],
                this.cashpayment
              );
              this.dialog.dataService
                .save((opt: RequestOption) => {
                  opt.data = [this.cashpayment];
                })
                .subscribe((res) => {
                  if (res && res.update.data != null) {
                    this.dialog.close();
                    this.dt.detectChanges();
                  } else {
                    this.loading = false;
                  }
                });
            }
          );
          break;
      }
    }
  }

  onSaveAdd() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.gridCash && !this.gridCash.gridRef.isEdit) ||
      (this.gridSet && !this.gridSet.gridRef.isEdit)
    ) {
      this.loading = true;
      if (this.hasSaved) {
        this.dialog.dataService.updateDatas.set(
          this.cashpayment['_uuid'],
          this.cashpayment
        );
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.data = [this.cashpayment];
          })
          .subscribe((res) => {
            if (res && res.update.data != null) {
              this.hasSaved = false;
              this.loading = false;
              this.clearCashpayment();
              this.dialog.dataService.clear();
              this.dialog.dataService
                .addNew((o) => this.setDefault(o))
                .subscribe((res) => {
                  this.cashpayment = res;
                  this.form.formGroup.patchValue(this.cashpayment);
                });
              this.dt.detectChanges();
            } else {
              this.loading = false;
            }
          });
      }
    }
  }

  onDiscard() {
    if (
      (this.gridCash && !this.gridCash.gridRef.isEdit) ||
      (this.gridSet && !this.gridSet.gridRef.isEdit)
    ) {
      if (this.hasSaved) {
        this.notification.alertCode('AC0010', null).subscribe((res) => {
          if (res.event.status === 'Y') {
            this.loading = true;
            this.dialog.dataService
              .delete(
                [this.cashpayment],
                false,
                null,
                '',
                '',
                null,
                null,
                false
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe((res) => {
                if (res.data != null) {
                  this.loading = false;
                  this.notification.notifyCode('E0860');
                  this.dialog.close();
                  this.onDestroy();
                }
              });
          }
        });
      }
    }
  }

  onDestroy() {
    this.isOpen = false;
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      let arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridCash.rowDataSelected[field] = data[field];
            this.gridCash.rowDataSelected = {
              ...data,
            };
            this.gridCash.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
  }

  clearCashpayment() {
    this.cashpaymentline = [];
    this.settledInvoices = [];
  }

  loadBookmark(e) {
    let bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' ||
        x.functionID == 'ACT041002' ||
        x.functionID == 'ACT041004'
    );
    for (let i = 0; i < bm.length; i++) {
      bm[i].disabled = true;
    }
  }

  loadGrid() {
    let idx;
    switch (this.modegrid) {
      case '1':
        this.setLineDefault();

        // idx = this.gridCash.dataSource.length;
        // this.dataLine.rowNo = idx + 1;
        // this.requireFields = this.dataLine.unbounds
        //   .requireFields as Array<string>;
        // this.lockFields = this.dataLine.unbounds.lockFields as Array<string>;
        // this.requireGrid();
        // this.lockGrid();
        // this.gridCash.addRow(this.dataLine, idx);

        break;
      case '2':
        idx = this.cashpaymentline.length;
        this.dataLine.rowNo = idx + 1;
        this.popupLine(this.dataLine);
        break;
    }
  }
  //Viet tăt ten ctrl 3 ky tu vd: gridview -> grv;label ->lbl,
  popupSettledInvoices(type: number) {
    let obj = {
      cashpayment: this.cashpayment,
      type,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'SubLedgerOpen';
    dataModel.gridViewName = 'grvSubLedgerOpen';
    dataModel.entityName = 'AC_SubLedgerOpen';
    opt.FormModel = dataModel;
    let voucherDialog = this.callfc.openForm(
      VoucherComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    voucherDialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        // this.setVoucherRef(res.event);
        this.settledInvoices = res.event;
        this.loadTotal();
        this.gridSet.refresh();
      }
    });
  }

  loadInit() {
    switch (this.action) {
      case 'add':
        this.cashpayment.recID = Util.uid();
        break;
      case 'edit':
        this.hasSaved = true;
        if (this.cashpayment?.subType != '2') {
          //#region  load cashpaymentline
          this.acService
            .loadData(
              'ERM.Business.AC',
              this.classNameLine,
              'LoadDataAsync',
              this.cashpayment.recID
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res.length > 0) {
                this.cashpaymentline = res;
                //this.loadTotal();
              }
            });
        }
        if (this.cashpayment?.subType == '2') {
          this.acService
            .loadData(
              'ERM.Business.AC',
              'SettledInvoicesBusiness',
              'LoadDataAsync',
              this.cashpayment.recID
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              this.settledInvoices = res;
            });

          //#endregion
        }
        break;
    }
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  requireGrid() {
    const field = ['DIM1', 'DIM2', 'DIM3', 'ProjectID'];
    field.forEach((element) => {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == element
      );
      this.gridCash.columnsGrid[i].isRequire = false;
    });
    if (this.requireFields.length > 0) {
      this.requireFields.forEach((fields) => {
        let i = this.gridCash.columnsGrid.findIndex(
          (x) => x.fieldName == fields
        );
        this.gridCash.columnsGrid[i].isRequire = true;
      });
    }
  }

  lockGrid() {
    const field = ['DIM1', 'DIM2', 'DIM3', 'ProjectID'];
    field.forEach((element) => {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == element
      );
      this.gridCash.columnsGrid[i].allowEdit = true;
    });
    this.gridCash.disableField(this.lockFields);
  }

  loadTotal() {
    this.total = 0;
    if (this.cashpayment.subType != 2) {
      if (this.cashpaymentline.length > 0) {
        this.cashpaymentline.forEach((element) => {
          this.total = this.total + element.dr;
        });
        this.cashpayment.totalDR = this.total;
      }
    } else {
      if (this.settledInvoices.length > 0) {
        this.settledInvoices.forEach((element) => {
          this.total = this.total + element.settledAmt;
        });
        this.cashpayment.totalDR = this.total;
      }
    }
  }

  expand() {
    let eCollape = document.querySelectorAll(
      '.codx-detail-footer.dialog-footer.collape'
    );
    let eExpand = document.querySelectorAll(
      '.codx-detail-footer.dialog-footer.expand'
    );
    if (eCollape.length > 0) {
      (eCollape[0] as HTMLElement).classList.remove('collape');
      (eCollape[0] as HTMLElement).classList.add('expand');
    }
    if (eExpand.length > 0) {
      (eExpand[0] as HTMLElement).classList.remove('expand');
      (eExpand[0] as HTMLElement).classList.add('collape');
    }
  }

  predicateControl(visibleColumns) {
    let arr = [
      'AccountID',
      'OffsetAcctID',
      'DIM1',
      'DIM3',
      'DIM2',
      'ProjectID',
    ];
    arr.forEach((fieldName) => {
      let idx = this.gridCash.visibleColumns.findIndex(
        (x) => x.fieldName == fieldName
      );
      if (idx > -1) {
        visibleColumns[idx].predicate = '';
        visibleColumns[idx].dataValue = '';
        switch (fieldName) {
          case 'AccountID':
            if (
              this.journal.drAcctControl == '1' ||
              this.journal.drAcctControl == '2'
            ) {
              visibleColumns[idx].predicate = '@0.Contains(AccountID)';
              visibleColumns[idx].dataValue = `[${this.journal?.drAcctID}]`;
            }
            break;
          case 'OffsetAcctID':
            if (
              this.journal.crAcctControl == '1' ||
              this.journal.crAcctControl == '2'
            ) {
              visibleColumns[idx].predicate = '@0.Contains(AccountID)';
              visibleColumns[idx].dataValue = `[${this.journal?.crAcctID}]`;
            }
            break;
          case 'DIM1':
            if (
              this.journal.diM1Control == '1' ||
              this.journal.diM1Control == '2'
            ) {
              visibleColumns[idx].predicate = '@0.Contains(DepartmentID)';
              visibleColumns[idx].dataValue = `[${this.journal?.diM1}]`;
            }
            break;
          case 'DIM3':
            if (
              this.journal.diM3Control == '1' ||
              this.journal.diM3Control == '2'
            ) {
              visibleColumns[idx].predicate = '@0.Contains(CostItemID)';
              visibleColumns[idx].dataValue = `[${this.journal?.diM3}]`;
            }
            break;
          case 'DIM2':
            if (
              this.journal.diM2Control == '1' ||
              this.journal.diM2Control == '2'
            ) {
              visibleColumns[idx].predicate = '@0.Contains(CostCenterID)';
              visibleColumns[idx].dataValue = `[${this.journal?.diM2}]`;
            }
            break;
        }
      }
    });
  }

  loadSubType(i, ele) {
    switch (i) {
      case '3':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.loadFormSubType('3');
        break;
      case '4':
        ele.hideTab(0, false);
        ele.hideTab(1, false);
        this.loadFormSubType('3');
        break;
      case '9':
        ele.hideTab(0, false);
        ele.hideTab(1, false);
        this.loadFormSubType('1');
        break;
      case '1':
      case '11':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.loadFormSubType('1');
        break;
      case '2':
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        this.loadFormSubType('1');
        break;
    }
  }

  loadAccountControl() {
    if (this.journal.entryMode == '1') {
      this.hideFields.push('CR2');
      this.hideFields.push('CR');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        this.hideFields.push('TaxAmt2');
      }
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'AccountID'
      );
      if (i > -1) {
        this.gridCash.columnsGrid[i].headerText = 'TK nợ';
      }
      let idx = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'OffsetAcctID'
      );
      if (idx > -1) {
        this.gridCash.columnsGrid[idx].isRequire = true;
      }
    } else {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'AccountID'
      );
      if (i > -1) {
        this.gridCash.columnsGrid[i].headerText = 'TK';
      }
      let idx = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'OffsetAcctID'
      );
      if (idx > -1) {
        this.gridCash.columnsGrid[idx].isRequire = false;
      }
      this.hideFields.push('OffsetAcctID');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        this.hideFields.push('TaxAmt2');
        this.hideFields.push('CR2');
      }
    }
  }

  loadFormat() {
    if (this.cashpayment.currencyID == this.baseCurr) {
      let arr = ['DR', 'CR'];
      arr.forEach((field) => {
        let i = this.gridCash.columnsGrid.findIndex(
          (x) => x.fieldName == field
        );
        if (i > -1) {
          this.gridCash.columnsGrid[i].dataFormat = 'B';
        }
      });
    } else {
      let arr = ['DR2', 'CR2', 'TaxAmt2'];
      arr.forEach((field) => {
        let i = this.gridCash.columnsGrid.findIndex(
          (x) => x.fieldName == field
        );
        if (i > -1) {
          this.gridCash.columnsGrid[i].dataFormat = 'S';
        }
      });
    }
  }

  loadVisibleColumn() {
    let arr = [
      'TaxAmt2',
      'DR2',
      'CR',
      'CR2',
      'SubControl',
      'DIM1',
      'DIM2',
      'DIM3',
      'ProjectID',
      'LoanContractID',
      'AssetGroupID',
      'ObjectID',
      'SettlementRule',
      'OffsetAcctID',
    ];
    arr.forEach((fieldName) => {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == fieldName
      );
      if (i > -1) {
        this.gridCash.columnsGrid[i].isVisible = true;
        this.gridCash.visibleColumns.push(this.gridCash.columnsGrid[i]);
      }
    });
  }

  loadFormSubType(subtype) {
    let arr = ['1', '3'];
    arr.forEach((eName) => {
      if (eName == subtype) {
        let element = document.querySelectorAll('.ac-type-' + eName);
        if (element) {
          for (let index = 0; index < element.length; index++) {
            (element[index] as HTMLElement).style.display = 'inline';
          }
        }
      } else {
        let element = document.querySelectorAll('.ac-type-' + eName);
        if (element) {
          for (let index = 0; index < element.length; index++) {
            (element[index] as HTMLElement).style.display = 'none';
          }
        }
      }
    });
  }

  loadProgressbar(args: ILoadedEventArgs) {
    if (args.progressBar.element.id === 'load-save-container') {
      args.progressBar.annotations[0].content =
        '<img src="../assets/themes/ac/default/img/save.svg"></img>';
    }
    if (args.progressBar.element.id === 'load-form-container') {
      args.progressBar.annotations[0].content =
        '<img style="width: 50px;height:50px" src="../assets/themes/ac/default/img/file.gif" alt="">';
    }
  }

  setLineDefault() {
    let cAcctID = null;
    let rAcctID = null;
    let oOffAcct = null;
    let oAcct = null;
    this.dataLine = new CashPaymentLine();
    this.dataLine.rowNo = this.gridCash.dataSource.length + 1;
    this.dataLine.transID = this.cashpayment.recID;
    this.dataLine.objectID = this.cashpayment.objectID;
    this.dataLine.reasonID = this.cashpayment.reasonID;

    if (this.cbxCashBook.ComponentCurrent.itemsSelected.length > 0) {
      cAcctID = this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
    }

    if (this.cbxReasonID.ComponentCurrent.itemsSelected.length > 0) {
      this.dataLine.note =
        this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName;
      rAcctID = this.cbxReasonID.ComponentCurrent.itemsSelected[0].OffsetAcctID;
    }

    if (this.journal.entryMode == '1') {
      if (this.dataLine.offsetAcctID == null && !this.dataLine.isBrigdeAcct) {
        if (cAcctID) {
          switch (this.journal.crAcctControl) {
            case '1':
              if (cAcctID == this.journal.crAcctID) {
                this.dataLine.offsetAcctID = cAcctID;
              } else {
                this.dataLine.offsetAcctID = this.journal.crAcctID;
              }
              break;
            default:
              this.dataLine.offsetAcctID = cAcctID;
              break;
          }
        }
      }
    } else {
      this.dataLine.offsetAcctID = null;
    }

    if (this.dataLine.accountID == null && !this.dataLine.isBrigdeAcct) {
      if (rAcctID) {
        switch (this.journal.drAcctControl) {
          case '1':
            if (rAcctID == this.journal.drAcctID) {
              this.dataLine.accountID = rAcctID;
            } else {
              this.dataLine.accountID = this.journal.drAcctID;
            }
            break;
          default:
            this.dataLine.accountID = rAcctID;
            break;
        }
      }
    }

    oOffAcct = this.oAccount.filter(
      (x) => x.accountID == this.dataLine.offsetAcctID
    );
    oAcct = this.oAccount.filter((x) => x.accountID == this.dataLine.accountID);

    let dicSetting = JSON.parse(this.journal.extras);
    if (dicSetting) {
      if (
        dicSetting.diM1Control &&
        dicSetting.diM1Control != '2' &&
        dicSetting.diM1Control != '9'
      ) {
        this.dataLine.diM1 = this.journal.diM1;
      }
      if (
        dicSetting.diM2Control &&
        dicSetting.diM2Control != '2' &&
        dicSetting.diM2Control != '9'
      ) {
        this.dataLine.diM2 = this.journal.diM2;
      }
      if (
        dicSetting.diM3Control &&
        dicSetting.diM3Control != '2' &&
        dicSetting.diM3Control != '9'
      ) {
        this.dataLine.diM3 = this.journal.diM3;
      }
    }

    if (this.dataLine.offsetAcctID) {
      if (oOffAcct && oOffAcct.accountType == '5') {
        this.dataLine.isBrigdeAcct = true;
      }
    }

    if (this.dataLine.accountID) {
      if (oAcct) {
        this.dataLine.singleEntry = oAcct.accountType == '0' ? true : false;
        let bSubLGControl = oAcct.subLGControl;
        if (!bSubLGControl && !this.dataLine.offsetAcctID) {
          bSubLGControl = oOffAcct.subLGControl;
        }
      }
    }
    this.dataLine.createdBy = this.userID;
    this.consTraintGrid();
    let dRemainAmt = this.calcRemainAmt(this.cashpayment.totalAmt);
    if (dRemainAmt > 0) {
      this.dataLine.dr = dRemainAmt;
      // this.dataLine = this.getValueByExRate(true);
      this.api
        .exec('AC', this.classNameLine, 'SetDefaultAsync', [
          this.cashpayment,
          this.dataLine,
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.dataLine.dR2 = res.dR2;
            this.dataLine.cR2 = res.cR2;
          }
        });
    }
    this.gridCash.endEdit();
    this.gridCash.addRow(this.dataLine, this.gridCash.dataSource.length);
  }

  // getValueByExRate(isDr) {
  //   if (isDr) {
  //     let dDR2 = 0;
  //     if (this.cashpayment.multi) {
  //       dDR2 = this.dataLine.dr * this.cashpayment.exchangeRate;
  //     } else {
  //       dDR2 =
  //         this.cashpayment.exchangeRate != 0
  //           ? this.dataLine.dr / this.cashpayment.exchangeRate
  //           : this.dataLine.dr;
  //     }
  //     if (this.dataLine.dR2 != dDR2) {
  //       this.dataLine.dR2 = dDR2;
  //     }
  //     if (this.dataLine.cR2 != 0) {
  //       this.dataLine.cR2 = 0;
  //     }
  //   } else {
  //     let dCR2 = 0;
  //     if (this.cashpayment.multi) {
  //       dCR2 = this.dataLine.cr * this.cashpayment.exchangeRate;
  //     } else {
  //       dCR2 =
  //         this.cashpayment.exchangeRate != 0
  //           ? this.dataLine.cr / this.cashpayment.exchangeRate
  //           : this.dataLine.cr;
  //     }
  //     if (this.dataLine.cR2 != dCR2) {
  //       this.dataLine.cR2 = dDR2;
  //     }
  //     if (this.dataLine.dR2 != 0) {
  //       this.dataLine.dR2 = 0;
  //     }
  //   }
  //   return this.dataLine;
  // }

  calcRemainAmt(totalAmt) {
    if (totalAmt == 0) {
      return 0;
    }
    let dRemainAmt = totalAmt;
    let dPayAmt = 0;
    this.cashpaymentline.forEach((line) => {
      dPayAmt = dPayAmt + line.dr;
    });
    dRemainAmt = dRemainAmt - dPayAmt;
    return dRemainAmt;
  }

  setRequireFields() {
    this.requireFields = [];
    if (this.oAccount == null) {
      return this.requireFields;
    } else {
      let aDiM1Control = false;
      let aDiM2Control = false;
      let aDiM3Control = false;
      let aProjectControl = false;

      let oDiM1Control = false;
      let oDiM2Control = false;
      let oDiM3Control = false;
      let oProjectControl = false;
      let lsAccount = this.oAccount.filter(
        (x) => x.accountID == this.dataLine.accountID
      );
      let lsOffAccount = this.oAccount.filter(
        (x) => x.accountID == this.dataLine.offsetAcctID
      );

      switch (this.journal.entryMode) {
        case '1':
          if (lsAccount.length == 0 && lsOffAccount.length == 0) {
            return this.requireFields;
          } else {
            if (lsAccount.length > 0) {
              if (
                lsAccount[0].diM1Control &&
                (lsAccount[0].diM1Control == '1' ||
                  lsAccount[0].diM1Control == '3')
              ) {
                aDiM1Control = true;
              }
              if (
                lsAccount[0].diM2Control &&
                (lsAccount[0].diM2Control == '1' ||
                  lsAccount[0].diM2Control == '3')
              ) {
                aDiM2Control = true;
              }
              if (
                lsAccount[0].diM3Control &&
                (lsAccount[0].diM3Control == '1' ||
                  lsAccount[0].diM3Control == '3')
              ) {
                aDiM3Control = true;
              }
            }
            if (lsOffAccount != null) {
              if (
                lsOffAccount[0].diM1Control &&
                (lsOffAccount[0].diM1Control == '2' ||
                  lsOffAccount[0].diM1Control == '3')
              ) {
                oDiM1Control = true;
              }
              if (
                lsOffAccount[0].diM2Control &&
                (lsOffAccount[0].diM2Control == '2' ||
                  lsOffAccount[0].diM2Control == '3')
              ) {
                oDiM2Control = true;
              }
              if (
                lsOffAccount[0].diM3Control &&
                (lsOffAccount[0].diM3Control == '2' ||
                  lsOffAccount[0].diM3Control == '3')
              ) {
                oDiM3Control = true;
              }
            }
          }
          break;
        case '2':
          if (
            lsAccount.length == 0 ||
            (this.dataLine.dr == 0 && this.dataLine.cr == 0)
          ) {
            return this.requireFields;
          }
          if (lsAccount[0].diM1Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount[0].diM1Control == '1' ||
                lsAccount[0].diM1Control == '3'
              ) {
                aDiM1Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount[0].diM1Control == '2' ||
                lsAccount[0].diM1Control == '3'
              ) {
                oDiM1Control = true;
              }
            }
          }
          if (lsAccount[0].diM2Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount[0].diM2Control == '1' ||
                lsAccount[0].diM2Control == '3'
              ) {
                aDiM2Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount[0].diM2Control == '2' ||
                lsAccount[0].diM2Control == '3'
              ) {
                oDiM2Control = true;
              }
            }
          }
          if (lsAccount[0].diM3Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount[0].diM3Control == '1' ||
                lsAccount[0].diM3Control == '3'
              ) {
                aDiM3Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount[0].diM3Control == '2' ||
                lsAccount[0].diM3Control == '3'
              ) {
                oDiM3Control = true;
              }
            }
          }
          break;
      }
      if (aDiM1Control || oDiM1Control) {
        this.requireFields.push('DIM1');
      }

      if (aDiM2Control || oDiM2Control) {
        this.requireFields.push('DIM2');
      }

      if (aDiM3Control || oDiM3Control) {
        this.requireFields.push('DIM3');
      }

      if (aProjectControl || oProjectControl) {
        this.requireFields.push('ProjectID');
      }
      return this.requireFields;
    }
  }

  setLockFields() {
    this.lockFields = [];
    if (this.oAccount == null) {
      return this.lockFields;
    } else {
      let aDiM1Control = false;
      let aDiM2Control = false;
      let aDiM3Control = false;
      let aProjectControl = false;

      let oDiM1Control = false;
      let oDiM2Control = false;
      let oDiM3Control = false;
      let oProjectControl = false;

      let lsAccount = this.oAccount.filter(
        (x) => x.accountID == this.dataLine.accountID
      );
      let lsOffAccount = this.oAccount.filter(
        (x) => x.accountID == this.dataLine.offsetAcctID
      );
      switch (this.journal.entryMode) {
        case '1':
          if (lsAccount.length == 0 && lsOffAccount.length == 0) {
            return this.lockFields;
          } else {
            if (lsAccount.length > 0) {
              if (lsAccount[0].diM1Control && lsAccount[0].diM1Control == '5') {
                aDiM1Control = true;
              }
              if (lsAccount[0].diM2Control && lsAccount[0].diM2Control == '5') {
                aDiM2Control = true;
              }
              if (lsAccount[0].diM3Control && lsAccount[0].diM3Control == '5') {
                aDiM3Control = true;
              }
            }
            if (lsOffAccount.length > 0) {
              if (
                lsOffAccount[0].diM1Control &&
                lsOffAccount[0].diM1Control == '4'
              ) {
                oDiM1Control = true;
              }
              if (
                lsOffAccount[0].diM2Control &&
                lsOffAccount[0].diM2Control == '4'
              ) {
                oDiM2Control = true;
              }
              if (
                lsOffAccount[0].diM3Control &&
                lsOffAccount[0].diM3Control == '4'
              ) {
                oDiM3Control = true;
              }
            }
          }
          break;
        case '2':
          if (
            lsAccount.length == 0 ||
            (this.dataLine.dr == 0 && this.dataLine.cr == 0)
          ) {
            return this.lockFields;
          } else {
            if (lsAccount[0].diM1Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount[0].diM1Control == '5') {
                  aDiM1Control = true;
                }
                if (lsAccount[0].diM1Control == '4') {
                  oDiM1Control = true;
                }
              }
            }
            if (lsAccount[0].diM2Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount[0].diM2Control == '5') {
                  aDiM2Control = true;
                }
                if (lsAccount[0].diM2Control == '4') {
                  oDiM2Control = true;
                }
              }
            }
            if (lsAccount[0].diM3Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount[0].diM3Control == '5') {
                  aDiM3Control = true;
                }
                if (lsAccount[0].diM3Control == '4') {
                  oDiM3Control = true;
                }
              }
            }
          }
          break;
      }
      if (aDiM1Control || oDiM1Control) {
        this.lockFields.push('DIM1');
      }

      if (aDiM2Control || oDiM2Control) {
        this.lockFields.push('DIM2');
      }

      if (aDiM3Control || oDiM3Control) {
        this.lockFields.push('DIM3');
      }

      if (aProjectControl || oProjectControl) {
        this.lockFields.push('ProjectID');
      }
      return this.lockFields;
    }
  }

  setCurrency() {
    if (this.cashpayment.currencyID == this.baseCurr) {
      this.cashpayment.exchangeRate = 1;
      this.form.formGroup.patchValue(
        {
          currencyID: this.cashpayment.currencyID,
          exchangeRate: this.cashpayment.exchangeRate,
        },
        {
          onlySelf: true,
          emitEvent: false,
        }
      );
      if (this.cashpaymentline.length > 0) {
        this.dialog.dataService.update(this.cashpayment).subscribe();
        this.changeExchangeRate(true);
      }
    } else {
      this.api
        .exec<any>('AC', this.className, 'ValueChangedAsync', [
          'exchangeRate',
          this.cashpayment,
          this.cashpaymentline,
        ])
        .subscribe((res) => {
          if (res) {
            this.cashpayment.exchangeRate = res.exchangeRate;
            // this.dicCurrency.set(
            //   this.cashpayment.currencyID,
            //   res.exchangeRate
            // );
            this.form.formGroup.patchValue(
              {
                currencyID: this.cashpayment.currencyID,
                exchangeRate: this.cashpayment.exchangeRate,
              },
              {
                onlySelf: true,
                emitEvent: false,
              }
            );
            if (res.line) {
              this.cashpaymentline = res.line;
              this.dialog.dataService.update(this.cashpayment).subscribe();
            }
          }
        });
      // let hasCurrency = this.dicCurrency.has(this.cashpayment.currencyID);
      // if (hasCurrency) {
      //   this.cashpayment.exchangeRate = this.dicCurrency.get(
      //     this.cashpayment.currencyID
      //   );
      //   this.form.formGroup.patchValue(
      //     {
      //       currencyID: this.cashpayment.currencyID,
      //       exchangeRate: this.cashpayment.exchangeRate,
      //     },
      //     {
      //       onlySelf: true,
      //       emitEvent: false,
      //     }
      //   );
      // } else {

      // }
    }
    this.gridCreated();
  }

  setMemo() {
    let newMemo = '';
    let reasonName = '';
    let objectName = '';
    let payName = '';
    if (
      this.cbxReasonID.ComponentCurrent.itemsSelected &&
      this.cbxReasonID.ComponentCurrent.itemsSelected.length > 0
    ) {
      reasonName =
        this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName + ' - ';
    }
    if (
      this.cbxObjectID.ComponentCurrent.itemsSelected &&
      this.cbxObjectID.ComponentCurrent.itemsSelected.length > 0
    ) {
      objectName =
        this.cbxObjectID.ComponentCurrent.itemsSelected[0].ObjectName + ' - ';
    }
    if (
      this.cbxPayee.ComponentCurrent.itemsSelected &&
      this.cbxPayee.ComponentCurrent.itemsSelected.length > 0
    ) {
      payName =
        this.cbxPayee.ComponentCurrent.itemsSelected[0].ContactName + ' - ';
    }
    newMemo = reasonName + objectName + payName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  reloadDataLine(field, preValue) {
    this.cashpayment.updateColumn = null;
    this.dialog.dataService.update(this.cashpayment).subscribe();
    if (preValue) {
      switch (field.toLowerCase()) {
        case 'objectid':
          this.cashpaymentline.forEach((item) => {
            if (item.objectID == preValue) {
              item.objectID = this.cashpayment.objectID;
            }
          });
          this.gridCash.refresh();
          this.api
            .exec('AC', this.classNameLine, 'UpdateAfterMasterChange', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .subscribe((res: any) => {});
          break;
        case 'reasonid':
          this.cashpaymentline.forEach((item) => {
            if (item.reasonID == preValue) {
              item.reasonID = this.cashpayment.reasonID;
              item.note =
                this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName;
            }
          });
          this.gridCash.refresh();
          this.api
            .exec('AC', this.classNameLine, 'UpdateAfterMasterChange', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .subscribe((res: any) => {});
          break;
        case 'cashbookid':
          this.cashpaymentline.forEach((item) => {
            if (item.offsetAcctID == preValue) {
              item.offsetAcctID =
                this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
            }
          });
          break;
      }
    }
  }

  changeExchangeRate(isMaster) {
    this.api
      .exec('AC', this.classNameLine, 'ChangeExchangeRateAsync', [
        this.cashpayment,
        this.cashpaymentline,
        isMaster,
      ])
      .subscribe((res: any) => {
        this.cashpaymentline = res;
      });
  }

  consTraintGrid() {
    this.requireFields = this.setRequireFields();
    this.lockFields = this.setLockFields();
    this.lockGrid();
    this.requireGrid();
  }

  onFocus() {
    let ins = setInterval(() => {
      if (this.cbxCashBook) {
        if (
          this.cbxCashBook.ComponentCurrent &&
          this.cbxCashBook.ComponentCurrent.comboBoxObject
        ) {
          if (this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement) {
            clearInterval(ins);
            this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement.focus();
            this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement.select();
          }
        }
      }
    }, 200);
    setTimeout(() => {
      if (ins) clearInterval(ins);
    }, 10000);
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.key == 'Tab') {
      let element;
      if (document.activeElement.className == 'e-tab-wrap') {
        switch (this.cashpayment.subType) {
          case '1':
          case '3':
          case '4':
            element = document.getElementById('btnadd');
            element.focus();
            break;
          case '2':
            element = document.getElementById('btnset');
            element.focus();
            break;
        }
      }
    }
  }
  @HostListener('click', ['$event'])
  onClick(e) {
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.gridCash && this.gridCash.gridRef.isEdit) {
        this.gridCash.autoAddRow = false;
        this.gridCash.endEdit();
      }
    }
  }
  //#endregion
}
