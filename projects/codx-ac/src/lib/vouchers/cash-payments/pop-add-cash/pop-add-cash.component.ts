import {
  ChangeDetectionStrategy,
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
import {
  SidebarComponent,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  AuthService,
  AuthStore,
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
import { Subject, takeUntil } from 'rxjs';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';
import { PopUpCashComponent } from '../pop-up-cash/pop-up-cash.component';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { RoundService } from '../../../round.service';
@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css', '../../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  focus: any;
  //#region Contructor
  @ViewChild('gridCash')
  public gridCash: CodxGridviewV2Component;
  @ViewChild('gridSet')
  public gridSet: CodxGridviewV2Component;
  @ViewChild('gridVat')
  public gridVat: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('editTemplate', { static: true }) editTemplate: TemplateRef<any>;
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('annotationsave') annotationsave: ProgressBar;
  @ViewChild('annotationform') annotationform: ProgressBar;
  @ViewChild('sidebar') sidebar?: SidebarComponent;
  // @ViewChild('cbxCashBook') cbxCashBook: any;
  @ViewChild('cbxReasonID') cbxReasonID: any;
  @ViewChild('cbxObjectID') cbxObjectID: any;
  @ViewChild('cbxPayee') cbxPayee: any;
  @ViewChild('cbxCashBook') cbxCashBook: any;
  @ViewChild('cbxRefdoc') cbxRefdoc: any;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  cashpayment: any;
  action: any;
  gridViewSetup: any;
  journalNo: string;
  modegrid: any;
  cashpaymentline: Array<any> = [];
  settledInvoices: Array<any> = [];
  vatInvoices: Array<any> = [];
  oriVatInvoices: Array<any> = [];
  hideFields: Array<any> = [];
  hideFieldsSet: Array<any> = [];
  requireFields = [];
  lockFields = [];
  total: any = 0;
  hasSaved: any = false;
  hasSelected: any = false;
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
  oAccount: any;
  userID: any;
  voucherNoRef: any;
  dRRef: any = 0;
  subtypeRef: any = '1';
  updateCell: any = '';
  totalVatBase: any = 0;
  totalVatAtm: any = 0;
  vatAccount: any;
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
    private round: RoundService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.userID = this.authStore.get().userID;
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.action = dialogData.data?.formType;
    this.cashpayment = { ...dialog.dataService.dataSelected };
    this.journal = { ...dialogData.data?.journal };
    this.modegrid = this.journal.addNewMode;
    this.baseCurr = dialogData.data?.baseCurr;
    this.loadInit();
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.cashpayment, {
      onlySelf: true,
      emitEvent: false,
    });
    this.setTabindex();
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
        x.functionID == 'SYS002' ||
        x.functionID == 'SYS02' ||
        x.functionID == 'SYS03'
    );
    bm.forEach((element) => {
      if (element.functionID == 'SYS02' || element.functionID == 'SYS03') {
        element.disabled = false;
      } else {
        element.disabled = true;
      }
    });
  }

  changeType(e?: any, ele?: TabComponent) {
    if (
      (this.gridCash && !this.gridCash.gridRef.isEdit) ||
      (this.gridSet && !this.gridSet.gridRef.isEdit) ||
      (this.gridVat && !this.gridVat.gridRef.isEdit)
    ) {
      if (
        e &&
        e.data[0] &&
        (this.cashpaymentline.length > 0 ||
          this.settledInvoices.length > 0 ||
          this.oriVatInvoices.length > 0)
      ) {
        this.notification.alertCode('AC0014', null).subscribe((res) => {
          if (res.event.status === 'Y') {
            this.loading = true;
            this.dt.detectChanges();
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
                  this.dt.detectChanges();
                  this.clearCashpayment();
                  this.cashpayment.subType = e.data[0];
                  this.form.formGroup.patchValue(
                    { subType: this.cashpayment.subType },
                    {
                      onlySelf: true,
                      emitEvent: false,
                    }
                  );
                  this.loadSubType(this.cashpayment.subType, this.tabObj);
                }
              });
          } else {
            //this.dt.reattach();
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
        if (this.tabObj) {
          this.loadSubType(this.cashpayment.subType, this.tabObj);
        }
      }
    }
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
          if (
            e?.component?.itemsSelected &&
            e?.component?.itemsSelected.length > 0
          ) {
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
          if (
            e?.component?.itemsSelected &&
            e?.component?.itemsSelected.length > 0
          ) {
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
              e?.component?.itemsSelected[0]?.CurrencyID
            ) {
              this.cashpayment.currencyID =
                e?.component?.itemsSelected[0]?.CurrencyID;
              this.setCurrency();
            }
          }
          break;
        case 'currencyid':
          this.setCurrency();
          break;
        case 'voucherdate':
          this.acService
            .execApi('AC', this.className, 'ValueChangedAsync', [
              'exchangeRate',
              this.cashpayment,
              this.cashpaymentline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
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
    this.cashpayment[e.ControlName] = e.crrValue;
    this.cashpayment.updateColumn = e.ControlName;
    switch (e.ControlName.toLowerCase()) {
      case 'totalamt':
        if (e.crrValue == null) {
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
        if (this.cashpaymentline.length > 0) {
          this.changeExchangeRate();
        }
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

  lineChanged(e: any) {
    this.updateCell = e.field;
    this.dataLine = e.data;
    switch (e.field.toLowerCase()) {
      case 'accountid':
        this.consTraintGrid();
        break;
      case 'offsetacctid':
        if (
          this.acService.getCacheValue('account', this.dataLine.offsetAcctID)
        ) {
          this.dataLine.isBrigdeAcct = false;
        } else {
          this.dataLine.isBrigdeAcct =
            (
              this.acService.getCacheValue(
                'account',
                this.dataLine.offsetAcctID
              ) as any
            )?.accountType == '5'
              ? true
              : false;
        }
        this.consTraintGrid();
        break;
      case 'dr':
        if (this.dataLine.dr != 0 && this.dataLine.cR2 != 0) {
          this.dataLine.cr = 0;
          this.dataLine.cR2 = 0;
        }
        this.acService
          .execApi('AC', this.classNameLine, 'ValueChangedAsync', [
            this.cashpayment,
            this.dataLine,
            e.field,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              this.dataLine.dR2 = res.dR2;
              this.dataLine.cR2 = res.cR2;
              this.dt.detectChanges();
            }
          });
        if (this.journal.entryMode == '2') {
          this.consTraintGrid();
        }
        break;
      case 'cr':
        if ((this.dataLine.cr! = 0 && this.dataLine.dR2 != 0)) {
          this.dataLine.dr = 0;
          this.dataLine.dR2 = 0;
        }
        this.acService
          .execApi('AC', this.classNameLine, 'ValueChangedAsync', [
            this.cashpayment,
            this.dataLine,
            e.field,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              this.dataLine.dR2 = res.dR2;
              this.dataLine.cR2 = res.cR2;
              this.dt.detectChanges();
            }
          });
        if (this.journal.entryMode == '2') {
          this.consTraintGrid();
        }
        break;
      case 'dr2':
        if (this.dataLine.dR2 != 0 && this.dataLine.cR2 != 0) {
          this.dataLine.cr = 0;
          this.dataLine.cR2 = 0;
        }
        if (
          this.dataLine.dr == 0 &&
          (
            this.acService.getCacheValue(
              'account',
              this.dataLine.offsetAcctID
            ) as any
          )?.multiCurrency
        ) {
          this.acService
            .execApi('AC', this.classNameLine, 'ValueChangedAsync', [
              this.cashpayment,
              this.dataLine,
              e.field,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.dataLine.dr = res.dr;
                this.dt.detectChanges();
              }
            });
        }
        break;
      case 'cr2':
        if (this.dataLine.cR2 != 0 && this.dataLine.dR2 != 0) {
          this.dataLine.dr = 0;
          this.dataLine.dR2 = 0;
        }
        if (
          this.dataLine.cr == 0 &&
          (
            this.acService.getCacheValue(
              'account',
              this.dataLine.offsetAcctID
            ) as any
          )?.multiCurrency
        ) {
          this.acService
            .execApi('AC', this.classNameLine, 'ValueChangedAsync', [
              this.cashpayment,
              this.dataLine,
              e.field,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.dataLine.cr = res.cr;
                this.dt.detectChanges();
              }
            });
        }
        break;
      case 'note':
        this.dataLine.reasonID = e?.itemData?.ReasonID;
        this.dataLine.accountID = e?.itemData?.OffsetAcctID;
        this.dt.detectChanges();
        break;
      default:
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

  lineVatchange(e: any) {
    switch (e.field.toLowerCase()) {
      case 'vatid':
        this.acService
          .execApi('AC', 'VATInvoicesBusiness', 'ValueChangedAsync', [
            e.field,
            e.value,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              this.vatAccount = res.vatAccount;
            }
          });
        break;
    }
  }

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
    if (
      (this.cashpayment.subType == '1' || this.cashpayment.subType == '9') &&
      !this.checkExistAccount()
    ) {
      return;
    }
    switch (type) {
      case '1':
        this.addlineCash();
        break;
      case '2':
        this.popupSet(this.typeSet);
        break;
      case '3':
        this.popupCash();
        break;
      case '4':
        this.addVatInvoice();
        break;
    }
    this.formAction();
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
  // popupLine(data) {
  //   let obj = {
  //     headerText: this.headerText,
  //     data: { ...data },
  //     dataline: this.cashpaymentline,
  //     datacash: this.cashpayment,
  //     type: 'add',
  //     lockFields: this.hideFields,
  //     journal: this.journal,
  //     grid: this.gridCash,
  //   };
  //   let opt = new DialogModel();
  //   let dataModel = new FormModel();
  //   dataModel.formName = this.formNameLine;
  //   dataModel.gridViewName = this.gridViewNameLine;
  //   dataModel.entityName = this.entityNameLine;
  //   opt.FormModel = dataModel;
  //   this.cache
  //     .gridViewSetup(this.formNameLine, this.gridViewNameLine)
  //     .subscribe((res) => {
  //       if (res) {
  //         let dialogs = this.callfc.openForm(
  //           PopAddLinecashComponent,
  //           '',
  //           null,
  //           null,
  //           '',
  //           obj,
  //           '',
  //           opt
  //         );
  //         dialogs.closed.subscribe((res) => {
  //           if (res.event != null && res.event.action != 'escape') {
  //             let dataline = res.event['data'];
  //             this.cashpaymentline.push(dataline);
  //             this.hasSaved = true;
  //             this.gridCash.refresh();
  //             this.loadTotal();
  //             this.api
  //               .exec('AC', this.classNameLine, 'SaveAsync', [
  //                 this.cashpayment,
  //                 dataline,
  //                 this.journal,
  //               ])
  //               .subscribe((res: any) => {
  //                 if (res) {
  //                   if (this.cashpayment.totalAmt != 0) {
  //                     if (this.total > this.cashpayment.totalAmt) {
  //                       this.notification.notifyCode('AC0012');
  //                     }
  //                   }
  //                 }
  //               });
  //           }
  //         });
  //       }
  //     });
  // }

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
      objectName:
        this.cbxObjectID?.ComponentCurrent?.itemsSelected[0].ObjectName,
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
    cashdialog.closed.subscribe((res) => {
      if (res && res.event && res.event) {
        this.cashpayment.refID = res.event.oCashRef.recID;
        this.dialog.dataService.update(this.cashpayment).subscribe();
        this.setDataRef(res.event.oCashRef, res.event.oLineRef);
      }
    });
  }

  addVatInvoice() {
    this.setLineVATDefault();
  }

  setLineVATDefault() {
    let data = new VATInvoices();
    let idx = this.gridVat.dataSource.length;
    data.rowNo = idx + 1;
    data.transID = this.cashpayment.recID;
    data.lineID = this.gridCash?.rowDataSelected?.recID;
    this.gridVat.addRow(data, this.gridVat.dataSource.length);
  }

  tabSelected(e) {
    if (e.selectedIndex == 2) {
      if (this.cashpaymentline.length > 0 && this.gridCash?.rowDataSelected) {
        this.vatInvoices = [
          ...this.oriVatInvoices.filter(
            (x) => x.lineID == this.gridCash?.rowDataSelected?.recID
          ),
        ];
      }
      this.dt.detectChanges();
    }
  }

  updateAccounting(data) {
    switch (this.journal.entryMode) {
      case '1':
        let idx = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
        if (idx > -1) {
          this.cashpaymentline[idx].dr = this.totalVatAtm;
          if (this.vatAccount) {
            this.cashpaymentline[idx].accountID = this.vatAccount;
          }
        }
        break;
      case '2':
        let l1 = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
        if (l1 > -1) {
          this.cashpaymentline[l1].dr = this.totalVatAtm;
          if (this.vatAccount) {
            this.cashpaymentline[l1].accountID = this.vatAccount;
          }
        }
        let l2 = this.cashpaymentline.findIndex(
          (x) => x.rowNo == this.cashpaymentline[l1].rowNo + 1
        );
        if (l2 > -1) {
          this.cashpaymentline[l2].cr = this.totalVatAtm;
        }
        break;
    }
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
      this.dt.detectChanges();
      setTimeout(() => {
        switch (this.action) {
          case 'add':
          case 'copy':
            if (this.hasSaved) {
              // this.dialog.dataService.updateDatas.set(
              //   this.cashpayment['_uuid'],
              //   this.cashpayment
              // );
              this.dialog.dataService.update(this.cashpayment).subscribe();
              this.acService
                .execApi(
                  'AC',
                  'CashPaymentsBusiness',
                  'ValidateVourcherAsync',
                  [this.cashpayment, this.cashpaymentline]
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res) {
                    this.cashpayment.status = '1';
                    this.dialog.dataService
                      .update(this.cashpayment)
                      .subscribe();
                    this.onDestroy();
                    this.dialog.close();
                    this.notification.notifyCode('SYS006');
                  } else {
                    this.loading = false;
                    this.dt.detectChanges();
                  }
                });
              // this.dialog.dataService
              //   .save((opt: RequestOption) => {
              //     opt.methodName = 'ValidateVourcherAsync'
              //     opt.data = [this.cashpayment];
              //   })
              //   .subscribe((res) => {
              //     if (res && res.update.data != null) {
              //       this.loading = false;
              //       this.dialog.close();
              //       this.dt.detectChanges();
              //     } else {
              //       this.loading = false;
              //     }
              //   });
            }
            break;
          case 'edit':
            if (
              this.cashpayment.updateColumn ||
              this.updateCell ||
              this.cashpayment.status == '0'
            ) {
              this.dialog.dataService.update(this.cashpayment).subscribe();
              this.acService
                .execApi(
                  'AC',
                  'CashPaymentsBusiness',
                  'ValidateVourcherAsync',
                  [this.cashpayment, this.cashpaymentline]
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res) {
                    if (this.cashpayment.status == '0') {
                      this.cashpayment.status = '1';
                    }
                    this.dialog.dataService
                      .update(this.cashpayment)
                      .subscribe();
                    this.onDestroy();
                    this.dialog.close();
                    this.notification.notifyCode('SYS007');
                  } else {
                    this.loading = false;
                    this.dt.detectChanges();
                  }
                });
            } else {
              this.onDestroy();
              this.dialog.close();
            }
            // this.journalService.checkVoucherNoBeforeSave(
            //   this.journal,
            //   this.cashpayment,
            //   'AC',
            //   'AC_CashPayments',
            //   this.form,
            //   this.action === 'edit',
            //   () => {
            //     this.dialog.dataService.updateDatas.set(
            //       this.cashpayment['_uuid'],
            //       this.cashpayment
            //     );
            //     this.dialog.dataService
            //       .save((opt: RequestOption) => {
            //         opt.data = [this.cashpayment];
            //       })
            //       .subscribe((res) => {
            //         if (res && res.update.data != null) {
            //           this.dialog.close();
            //           this.dt.detectChanges();
            //         } else {
            //           this.loading = false;
            //         }
            //       });
            //   }
            // );
            break;
        }
      }, 500);
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
      this.dt.detectChanges();
      setTimeout(() => {
        if (this.hasSaved) {
          this.dialog.dataService.update(this.cashpayment).subscribe();
          this.acService
            .execApi('AC', this.className, 'ValidateVourcherAsync', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                this.cashpayment.status = '1';
                this.dialog.dataService.update(this.cashpayment).subscribe();
                this.hasSaved = false;
                this.clearCashpayment();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res: any) => {
                    if (res) {
                      this.cashpayment = res;
                      this.form.formGroup.patchValue(this.cashpayment, {
                        onlySelf: true,
                        emitEvent: false,
                      });
                      this.notification.notifyCode('SYS006');
                      this.loading = false;
                      this.dt.detectChanges();
                    }
                  });
              } else {
                this.loading = false;
                this.dt.detectChanges();
              }
            });
          // this.dialog.dataService.updateDatas.set(
          //   this.cashpayment['_uuid'],
          //   this.cashpayment
          // );
          // this.dialog.dataService
          //   .save((opt: RequestOption) => {
          //     opt.data = [this.cashpayment];
          //   })
          //   .subscribe((res) => {
          //     if (res && res.update.data != null) {
          //       this.hasSaved = false;
          //       this.loading = false;
          //       this.clearCashpayment();
          //       this.dialog.dataService.clear();
          //       this.dialog.dataService
          //         .addNew((o) => this.setDefault(o))
          //         .subscribe((res) => {
          //           this.cashpayment = res;
          //           this.form.formGroup.patchValue(this.cashpayment);
          //         });
          //       this.dt.detectChanges();
          //     } else {
          //       this.loading = false;
          //     }
          //   });
        }
      }, 500);
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
            this.dt.detectChanges();
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
                  this.dt.detectChanges();
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
    this.destroy$.next();
    this.destroy$.complete();
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
    this.cashpaymentline = this.gridCash.dataSource;
    this.api
      .exec('AC', this.classNameLine, 'SaveAsync', [this.cashpayment, e])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  onEdit(e: any) {
    if (this.updateCell) {
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
  }

  onAddNewVat(data) {
    this.setTotalVat();
    if (this.gridCash?.rowDataSelected) {
      this.updateAccounting(data);
    } else {
      switch (this.journal.entryMode) {
        case '1':
          this.setLineDefault();
          this.dataLine.dr = this.totalVatAtm;
          this.gridCash.rowDataSelected = this.dataLine;
          if (this.vatAccount) {
            this.dataLine.accountID = this.vatAccount;
          }
          data.lineID = this.dataLine.recID;
          this.cashpaymentline.push(this.dataLine);
          break;
        case '2':
          for (let index = 1; index <= 2; index++) {
            this.setLineDefault();
            if (index == 1) {
              this.dataLine.dr = this.totalVatAtm;
              if (this.vatAccount) {
                this.dataLine.accountID = this.vatAccount;
              }
              this.gridCash.rowDataSelected = this.dataLine;
              this.cashpaymentline.push(this.dataLine);
              data.lineID = this.dataLine.recID;
            } else {
              this.dataLine.accountID =
                this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
              this.dataLine.cr = this.totalVatAtm;
              this.cashpaymentline.push(this.dataLine);
            }
          }
          break;
      }
    }
    this.oriVatInvoices.push(data);
    this.loadTotal();
    this.dialog.dataService.update(this.cashpayment).subscribe();
    this.acService
      .execApi('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
        this.cashpayment,
        this.cashpaymentline,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.cashpaymentline = res.data;
          this.gridCash.refresh();
          this.dt.detectChanges();
        }
      });
  }

  onEditVat(data) {
    this.setTotalVat();
    let idx = this.oriVatInvoices.findIndex(
      (x) => x.recID == data.recID && x.lineID == data.lineID
    );
    if (idx > -1) {
      this.oriVatInvoices[idx] = data;
    }
    this.updateAccounting(data);
    this.loadTotal();
    this.dialog.dataService.update(this.cashpayment).subscribe();
    this.gridCash.refresh();
    this.dt.detectChanges();
    this.acService
      .execApi('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
        this.cashpayment,
        this.cashpaymentline,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.cashpaymentline = res.data;
          this.gridCash.refresh();
          this.dt.detectChanges();
        }
      });
  }

  //#endregion

  //#region Function
  clearCashpayment() {
    this.cashpaymentline = [];
    this.settledInvoices = [];
    this.vatInvoices = [];
    this.oriVatInvoices = [];
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

  addlineCash() {
    this.setLineDefault();
    this.gridCash.endEdit();
    this.gridCash.addRow(this.dataLine, this.gridCash.dataSource.length);
  }

  popupSet(type: number) {
    let obj = {
      cashpayment: this.cashpayment,
      type,
      objectName:
        this.cbxObjectID?.ComponentCurrent?.itemsSelected[0].ObjectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AC_SubInvoices';
    dataModel.gridViewName = 'grvAC_SubInvoices';
    dataModel.entityName = 'AC_SubInvoices';
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
        this.dialog.dataService.update(this.cashpayment).subscribe();
      }
    });
  }

  loadInit() {
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
        break;
    }
    switch (this.action) {
      case 'edit':
        this.hasSaved = true;
        switch (this.cashpayment.subType) {
          case '1':
            this.acService
              .execApi(
                'AC',
                this.classNameLine,
                'LoadDataAsync',
                this.cashpayment.recID
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res.length > 0) {
                  this.cashpaymentline = res;
                  this.dt.detectChanges();
                }
              });
            break;
          case '2':
            this.acService
              .execApi(
                'AC',
                'SettledInvoicesBusiness',
                'LoadDataAsync',
                this.cashpayment.recID
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                this.settledInvoices = res;
                this.dt.detectChanges();
              });
            break;
          case '3':
          case '4':
            this.acService
              .execApi(
                'AC',
                'CashPaymentsBusiness',
                'LoadDataReferenceAsync',
                this.cashpayment
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res) {
                  this.voucherNoRef = res.voucherNoRef;
                  this.dRRef = res.totalDrRef;
                  this.subtypeRef = res.subtypeRef;
                  switch (this.subtypeRef) {
                    case '1':
                      this.tabObj.hideTab(0, false);
                      this.tabObj.hideTab(1, true);
                      this.cashpaymentline = res.lsline;
                      break;
                    case '2':
                      this.tabObj.hideTab(0, true);
                      this.tabObj.hideTab(1, false);
                      this.settledInvoices = res.lsline;
                      break;
                  }
                }
                this.dt.detectChanges();
              });
            break;
          case '9':
            this.acService
              .execApi(
                'AC',
                'VATInvoicesBusiness',
                'LoadDataAsync',
                this.cashpayment.recID
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res) {
                  this.cashpaymentline = res.lsline;
                  this.settledInvoices = res.lssetinvoice;
                  this.oriVatInvoices = res.lsvat;
                  this.dt.detectChanges();
                }
              });
            break;
        }
        break;
    }
    this.acService
      .getGridViewSetup(
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

  hideGrid(columnsGrid, hideFields) {
    if (hideFields.length > 0) {
      hideFields.forEach((fieldName) => {
        let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
        if (i > -1) {
          columnsGrid[i].isVisible = false;
        }
      });
    }
  }

  loadTotal() {
    this.total = 0;
    if (this.cashpayment.subType != 2) {
      if (this.gridCash.dataSource.length > 0) {
        this.gridCash.dataSource.forEach((element) => {
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

  predicateControl(columnsGrid) {
    let arr = ['AccountID', 'OffsetAcctID', 'DIM1', 'DIM3', 'DIM2'];
    arr.forEach((fieldName) => {
      let idx = columnsGrid.findIndex((x) => x.fieldName == fieldName);
      if (idx > -1) {
        columnsGrid[idx].predicate = '';
        columnsGrid[idx].dataValue = '';
        switch (fieldName) {
          case 'AccountID':
            if (
              this.journal.drAcctControl == '1' ||
              this.journal.drAcctControl == '2'
            ) {
              columnsGrid[idx].predicate = '@0.Contains(AccountID)';
              columnsGrid[idx].dataValue = `[${this.journal?.drAcctID}]`;
            }
            break;
          case 'OffsetAcctID':
            if (
              this.journal.crAcctControl == '1' ||
              this.journal.crAcctControl == '2'
            ) {
              columnsGrid[idx].predicate = '@0.Contains(AccountID)';
              columnsGrid[idx].dataValue = `[${this.journal?.crAcctID}]`;
            }
            break;
          case 'DIM1':
            if (
              this.journal.diM1Control == '1' ||
              this.journal.diM1Control == '2'
            ) {
              columnsGrid[idx].predicate = '@0.Contains(DepartmentID)';
              columnsGrid[idx].dataValue = `[${this.journal?.diM1}]`;
            }
            break;
          case 'DIM3':
            if (
              this.journal.diM3Control == '1' ||
              this.journal.diM3Control == '2'
            ) {
              columnsGrid[idx].predicate = '@0.Contains(CostItemID)';
              columnsGrid[idx].dataValue = `[${this.journal?.diM3}]`;
            }
            break;
          case 'DIM2':
            if (
              this.journal.diM2Control == '1' ||
              this.journal.diM2Control == '2'
            ) {
              columnsGrid[idx].predicate = '@0.Contains(CostCenterID)';
              columnsGrid[idx].dataValue = `[${this.journal?.diM2}]`;
            }
            break;
        }
      }
    });
  }

  loadSubType(i, ele) {
    switch (i) {
      case '3':
      case '4':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        ele.hideTab(2, true);
        this.loadFormSubType('3');
        break;
      // case '4':
      //   ele.hideTab(0, false);
      //   ele.hideTab(1, false);
      //   this.loadFormSubType('3');
      //   break;
      case '9':
        ele.hideTab(0, false);
        ele.hideTab(1, false);
        ele.hideTab(2, false);
        this.loadFormSubType('1');
        break;
      case '1':
      case '11':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        ele.hideTab(2, true);
        this.loadFormSubType('1');
        break;
      case '2':
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        ele.hideTab(2, true);
        this.loadFormSubType('1');
        break;
    }
    ele.select(0);
  }

  loadAccountControl(columnsGrid) {
    if (!this.hideFields.includes('Settlement')) {
      if (this.cashpayment.subType == '1') {
        this.hideFields.push('Settlement');
      }
    }
    if (this.journal.entryMode == '1') {
      this.hideFields.push('CR2');
      this.hideFields.push('CR');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        //this.hideFields.push('VATAmt2');
      }
      let i = columnsGrid.findIndex((x) => x.fieldName == 'AccountID');
      if (i > -1) {
        columnsGrid[i].headerText = 'TK nợ';
      }
      let idr = columnsGrid.findIndex((x) => x.fieldName == 'DR');
      if (idr > -1) {
        columnsGrid[idr].headerText = 'Số tiền';
      }
      let idr2 = columnsGrid.findIndex((x) => x.fieldName == 'DR2');
      if (idr2 > -1) {
        columnsGrid[idr2].headerText = 'Số tiền, HT';
      }
      let idx = columnsGrid.findIndex((x) => x.fieldName == 'OffsetAcctID');
      if (idx > -1) {
        columnsGrid[idx].isRequire = true;
      }
    } else {
      let i = columnsGrid.findIndex((x) => x.fieldName == 'AccountID');
      if (i > -1) {
        columnsGrid[i].headerText = 'Tài khoản';
      }
      let idr = columnsGrid.findIndex((x) => x.fieldName == 'DR');
      if (idr > -1) {
        columnsGrid[idr].headerText = 'Nợ';
      }
      let idr2 = columnsGrid.findIndex((x) => x.fieldName == 'DR2');
      if (idr2 > -1) {
        columnsGrid[idr2].headerText = 'Nợ, HT';
      }
      let idx = columnsGrid.findIndex((x) => x.fieldName == 'OffsetAcctID');
      if (idx > -1) {
        columnsGrid[idx].isRequire = false;
      }
      this.hideFields.push('OffsetAcctID');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        //this.hideFields.push('TaxAmt2');
        this.hideFields.push('CR2');
      }
    }
  }

  loadFormat(columnsGrid) {
    if (this.cashpayment.currencyID == this.baseCurr) {
      let arr = ['DR', 'CR'];
      arr.forEach((fieldName) => {
        let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
        if (i > -1) {
          columnsGrid[i].dataFormat = 'B';
        }
      });
    } else {
      let arr = ['DR', 'CR', 'DR2', 'CR2'];
      arr.forEach((fieldName) => {
        switch (fieldName) {
          case 'DR':
          case 'CR':
            let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
            if (i > -1) {
              columnsGrid[i].dataFormat = 'S';
            }
            break;
          default:
            let idx = columnsGrid.findIndex((x) => x.fieldName == fieldName);
            if (idx > -1) {
              columnsGrid[idx].dataFormat = 'B';
            }
            break;
        }
      });
    }
  }

  loadVisibleColumn(columnsGrid) {
    let arr = [
      'DR2',
      'CR',
      'CR2',
      'SubControl',
      'DIM1',
      'DIM2',
      'DIM3',
      'ProjectID',
      'ContractID',
      'AssetGroupID',
      'ObjectID',
      'Settlement',
      'OffsetAcctID',
    ];
    arr.forEach((fieldName) => {
      let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
      if (i > -1) {
        columnsGrid[i].isVisible = true;
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

    if (
      this.cbxCashBook?.ComponentCurrent?.itemsSelected &&
      this.cbxCashBook?.ComponentCurrent?.itemsSelected.length > 0
    ) {
      cAcctID = this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
    }

    if (
      this.cbxReasonID?.ComponentCurrent?.itemsSelected &&
      this.cbxReasonID?.ComponentCurrent?.itemsSelected.length > 0
    ) {
      this.dataLine.note =
        this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName;
      rAcctID = this.cbxReasonID.ComponentCurrent.itemsSelected[0].OffsetAcctID;
    }

    if (this.journal?.entryMode == '1') {
      if (this.dataLine?.offsetAcctID == null && !this.dataLine?.isBrigdeAcct) {
        if (cAcctID) {
          switch (this.journal?.crAcctControl) {
            case '1':
              if (cAcctID == this.journal?.crAcctID) {
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

    if (this.dataLine?.accountID == null && !this.dataLine?.isBrigdeAcct) {
      if (rAcctID) {
        switch (this.journal?.drAcctControl) {
          case '1':
            if (rAcctID == this.journal?.drAcctID) {
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

    oAcct = this.acService.getCacheValue('account', this.dataLine.accountID);
    oOffAcct = this.acService.getCacheValue(
      'account',
      this.dataLine.offsetAcctID
    );

    let dicSetting = JSON.parse(this.journal.extras);
    if (dicSetting) {
      if (
        dicSetting?.diM1Control &&
        dicSetting?.diM1Control != '2' &&
        dicSetting?.diM1Control != '9'
      ) {
        this.dataLine.diM1 = this.journal.diM1;
      }
      if (
        dicSetting?.diM2Control &&
        dicSetting?.diM2Control != '2' &&
        dicSetting?.diM2Control != '9'
      ) {
        this.dataLine.diM2 = this.journal.diM2;
      }
      if (
        dicSetting?.diM3Control &&
        dicSetting?.diM3Control != '2' &&
        dicSetting?.diM3Control != '9'
      ) {
        this.dataLine.diM3 = this.journal.diM3;
      }
    }

    if (this.dataLine?.offsetAcctID) {
      if (oOffAcct && oOffAcct?.accountType == '5') {
        this.dataLine.isBrigdeAcct = true;
      }
    }

    if (this.dataLine?.accountID) {
      if (oAcct) {
        this.dataLine.singleEntry = oAcct?.accountType == '0' ? true : false;
        let bSubLGControl = oAcct?.subLGControl;
        if (!bSubLGControl && !this.dataLine?.offsetAcctID) {
          bSubLGControl = oOffAcct?.subLGControl;
        }
      }
    }
    this.dataLine.createdBy = this.userID;
    this.consTraintGrid();
    let dRemainAmt = this.calcRemainAmt(this.cashpayment?.totalAmt);
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
  }

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
    if (this.dataLine.accountID == null && this.dataLine.offsetAcctID) {
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
      let lsAccount = null;
      let lsOffAccount = null;

      lsAccount = this.acService.getCacheValue(
        'account',
        this.dataLine.accountID
      );
      lsOffAccount = this.acService.getCacheValue(
        'account',
        this.dataLine.offsetAcctID
      );
      switch (this.journal.entryMode) {
        case '1':
          if (lsAccount == null && lsOffAccount == null) {
            return this.requireFields;
          } else {
            if (lsAccount != null) {
              if (
                lsAccount.diM1Control &&
                (lsAccount.diM1Control == '1' || lsAccount.diM1Control == '3')
              ) {
                aDiM1Control = true;
              }
              if (
                lsAccount.diM2Control &&
                (lsAccount.diM2Control == '1' || lsAccount.diM2Control == '3')
              ) {
                aDiM2Control = true;
              }
              if (
                lsAccount.diM3Control &&
                (lsAccount.diM3Control == '1' || lsAccount.diM3Control == '3')
              ) {
                aDiM3Control = true;
              }
            }
            if (lsOffAccount != null) {
              if (
                lsOffAccount.diM1Control &&
                (lsOffAccount.diM1Control == '2' ||
                  lsOffAccount.diM1Control == '3')
              ) {
                oDiM1Control = true;
              }
              if (
                lsOffAccount.diM2Control &&
                (lsOffAccount.diM2Control == '2' ||
                  lsOffAccount.diM2Control == '3')
              ) {
                oDiM2Control = true;
              }
              if (
                lsOffAccount.diM3Control &&
                (lsOffAccount.diM3Control == '2' ||
                  lsOffAccount.diM3Control == '3')
              ) {
                oDiM3Control = true;
              }
            }
          }
          break;
        case '2':
          if (
            lsAccount == null ||
            (this.dataLine.dr == 0 && this.dataLine.cr == 0)
          ) {
            return this.requireFields;
          }
          if (lsAccount.diM1Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount.diM1Control == '1' ||
                lsAccount.diM1Control == '3'
              ) {
                aDiM1Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount.diM1Control == '2' ||
                lsAccount.diM1Control == '3'
              ) {
                oDiM1Control = true;
              }
            }
          }
          if (lsAccount.diM2Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount.diM2Control == '1' ||
                lsAccount.diM2Control == '3'
              ) {
                aDiM2Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount.diM2Control == '2' ||
                lsAccount.diM2Control == '3'
              ) {
                oDiM2Control = true;
              }
            }
          }
          if (lsAccount.diM3Control) {
            if (this.dataLine.dr > 0) {
              if (
                lsAccount.diM3Control == '1' ||
                lsAccount.diM3Control == '3'
              ) {
                aDiM3Control = true;
              }
            }
            if (this.dataLine.cr > 0) {
              if (
                lsAccount.diM3Control == '2' ||
                lsAccount.diM3Control == '3'
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
    if (this.dataLine.accountID == null && this.dataLine.offsetAcctID) {
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
      let lsAccount = null;
      let lsOffAccount = null;

      lsAccount = this.acService.getCacheValue(
        'account',
        this.dataLine.accountID
      );
      lsOffAccount = this.acService.getCacheValue(
        'account',
        this.dataLine.offsetAcctID
      );

      switch (this.journal.entryMode) {
        case '1':
          if (lsAccount == null && lsOffAccount == null) {
            return this.lockFields;
          } else {
            if (lsAccount != null) {
              if (lsAccount.diM1Control && lsAccount.diM1Control == '5') {
                aDiM1Control = true;
              }
              if (lsAccount.diM2Control && lsAccount.diM2Control == '5') {
                aDiM2Control = true;
              }
              if (lsAccount.diM3Control && lsAccount.diM3Control == '5') {
                aDiM3Control = true;
              }
            }
            if (lsOffAccount.length > 0) {
              if (lsOffAccount.diM1Control && lsOffAccount.diM1Control == '4') {
                oDiM1Control = true;
              }
              if (lsOffAccount.diM2Control && lsOffAccount.diM2Control == '4') {
                oDiM2Control = true;
              }
              if (lsOffAccount.diM3Control && lsOffAccount.diM3Control == '4') {
                oDiM3Control = true;
              }
            }
          }
          break;
        case '2':
          if (
            lsAccount == null ||
            (this.dataLine.dr == 0 && this.dataLine.cr == 0)
          ) {
            return this.lockFields;
          } else {
            if (lsAccount.diM1Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount.diM1Control == '5') {
                  aDiM1Control = true;
                }
                if (lsAccount.diM1Control == '4') {
                  oDiM1Control = true;
                }
              }
            }
            if (lsAccount.diM2Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount.diM2Control == '5') {
                  aDiM2Control = true;
                }
                if (lsAccount.diM2Control == '4') {
                  oDiM2Control = true;
                }
              }
            }
            if (lsAccount.diM3Control) {
              if (this.dataLine.dr > 0) {
                if (lsAccount.diM3Control == '5') {
                  aDiM3Control = true;
                }
                if (lsAccount.diM3Control == '4') {
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
        this.changeExchangeRate();
      }
    } else {
      this.acService
        .execApi('AC', this.className, 'ValueChangedAsync', [
          'exchangeRate',
          this.cashpayment,
          this.cashpaymentline,
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.cashpayment.exchangeRate = res.exchangeRate;
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
              this.dt.detectChanges();
            }
          }
        });
    }
    this.gridInit(this.gridCash.columnsGrid);
    this.setTabindex();
    this.dt.detectChanges();
    this.gridCash.refresh();
  }

  setMemo() {
    let newMemo = '';
    let reasonName = '';
    let objectName = '';
    let payName = '';
    if (
      this.cbxReasonID?.ComponentCurrent?.itemsSelected &&
      this.cbxReasonID?.ComponentCurrent?.itemsSelected.length > 0
    ) {
      reasonName =
        this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName + ' - ';
    }
    if (
      this.cbxObjectID?.ComponentCurrent?.itemsSelected &&
      this.cbxObjectID?.ComponentCurrent?.itemsSelected.length > 0
    ) {
      objectName =
        this.cbxObjectID.ComponentCurrent.itemsSelected[0].ObjectName + ' - ';
    }
    if (
      this.cbxPayee?.ComponentCurrent?.itemsSelected &&
      this.cbxPayee?.ComponentCurrent?.itemsSelected.length > 0
    ) {
      payName =
        this.cbxPayee.ComponentCurrent.itemsSelected[0].ContactName + ' - ';
    } else {
      if (this.cbxPayee?.ComponentCurrent?.value) {
        payName = this.cbxPayee.ComponentCurrent.value + ' - ';
      }
    }
    newMemo = reasonName + objectName + payName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  setDataRef(oCashRef, oLineRef) {
    this.voucherNoRef = oCashRef.voucherNo;
    this.dRRef = oCashRef.totalDR;
    this.subtypeRef = oCashRef.subType;
    switch (this.subtypeRef) {
      case '1':
        this.tabObj.hideTab(0, false);
        this.tabObj.hideTab(1, true);
        this.cashpaymentline = oLineRef;
        this.cashpaymentline.forEach((line) => {
          line.recID = Util.uid();
          line.transID = this.cashpayment.recID;
        });
        this.acService
          .execApi('AC', 'CashPaymentsLinesBusiness', 'AddListAsync', [
            this.cashpayment,
            this.cashpaymentline,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe();
        break;
      case '2':
        this.tabObj.hideTab(0, true);
        this.tabObj.hideTab(1, false);
        this.settledInvoices = oLineRef;
        this.acService
          .execApi('AC', 'SettledInvoicesBusiness', 'AddListAsync', [
            this.cashpayment,
            this.settledInvoices,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe();
        break;
    }
  }

  setTotalVat() {
    this.totalVatBase = 0;
    this.totalVatAtm = 0;
    this.vatInvoices.forEach((item) => {
      this.totalVatBase += item.vatBase;
      this.totalVatAtm += item.vatAmt;
    });
  }

  setDefault(o) {
    return this.api.exec('AC', this.className, 'SetDefaultAsync', [
      this.journal,
    ]);
  }

  reloadDataLine(field, preValue) {
    if (preValue) {
      switch (field.toLowerCase()) {
        case 'objectid':
          this.cashpaymentline.forEach((item) => {
            if (item.objectID == preValue) {
              item.objectID = this.cashpayment.objectID;
            }
          });
          this.gridCash.refresh();
          // this.acService
          //   .execApi('AC', this.classNameLine, 'UpdateAfterMasterChange', [
          //     this.cashpayment,
          //     this.cashpaymentline,
          //   ])
          //   .pipe(takeUntil(this.destroy$))
          //   .subscribe((res) => {});
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
          // this.acService
          //   .execApi('AC', this.classNameLine, 'UpdateAfterMasterChange', [
          //     this.cashpayment,
          //     this.cashpaymentline,
          //   ])
          //   .pipe(takeUntil(this.destroy$))
          //   .subscribe((res) => {});
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

  changeExchangeRate() {
    this.acService
      .execApi('AC', this.classNameLine, 'ChangeExchangeRateAsync', [
        this.cashpayment,
        this.cashpaymentline,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.cashpaymentline = res;
        this.gridCash.refresh();
        this.dt.detectChanges();
      });
  }

  consTraintGrid() {
    this.requireFields = this.setRequireFields();
    this.lockFields = this.setLockFields();
    this.lockGrid();
    this.requireGrid();
  }

  checkExistAccount() {
    let oAccount = this.acService.getCacheValue(
      'account',
      this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID
    );
    if (oAccount != null) {
      return true;
    } else {
      this.notification.notifyCode(
        'AC0021',
        0,
        this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID
      );
      return false;
    }
  }

  formAction() {
    switch (this.action) {
      case 'add':
      case 'copy':
        if (this.hasSaved) {
          if (this.cashpayment.updateColumn) {
            this.cashpayment.updateColumn = null;
            this.dialog.dataService.update(this.cashpayment).subscribe();
            this.acService
              .execApi('AC', this.className, 'UpdateVoucherAsync', [
                this.cashpayment,
                this.cashpaymentline,
              ])
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        } else {
          // this.journalService.checkVoucherNoBeforeSave(
          //   this.journal,
          //   this.cashpayment,
          //   'AC',
          //   this.dialog.formModel.entityName,
          //   this.form,
          //   this.action === 'edit',
          //   () => {

          //   }
          // );
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
            .subscribe((res) => {});
        }
        break;
      case 'edit':
        if (this.cashpayment.updateColumn) {
          this.dialog.dataService.update(this.cashpayment).subscribe();
          this.acService
            .execApi('AC', this.className, 'UpdateVoucherAsync', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        }
        break;
    }
  }

  created(e: any, ele: TabComponent) {
    this.loadSubType(this.cashpayment.subType, ele);
  }

  gridInit(columnsGrid) {
    this.hideFields = [];
    if (
      this.dialogData?.data.hideFields &&
      this.dialogData?.data.hideFields.length > 0
    ) {
      this.hideFields = [...this.dialogData?.data.hideFields];
    }
    this.loadVisibleColumn(columnsGrid);
    this.loadAccountControl(columnsGrid);
    this.loadFormat(columnsGrid);
    this.predicateControl(columnsGrid);
    this.hideGrid(columnsGrid, this.hideFields);
  }

  gridInitSet(columnsGrid) {
    this.hideFieldsSet = [];
    let arr = ['BalAmt2', 'SettledAmt2', 'SettledDisc2'];
    arr.forEach((fieldName) => {
      let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
      if (i > -1) {
        columnsGrid[i].isVisible = true;
        // this.gridSet.visibleColumns.push(this.gridSet.columnsGrid[i]);
      }
    });
    if (this.cashpayment.currencyID == this.baseCurr) {
      this.hideFieldsSet.push('BalAmt2');
      this.hideFieldsSet.push('SettledAmt2');
      this.hideFieldsSet.push('SettledDisc2');
    }
    this.hideGrid(columnsGrid, this.hideFieldsSet);
  }

  autoAddRow(e: any) {
    switch (e.type) {
      case 'autoAdd':
        this.addRow('1');
        break;
      case 'add':
        if (this.gridCash.autoAddRow) {
          this.addlineCash();
        }
        break;
      case 'endEdit':
        if (!this.gridCash.autoAddRow) {
          let element = document.getElementById('btnadd');
          element.focus();
        }
        break;
      case 'closeEdit':
        this.gridCash.rowDataSelected = null;
        break;
    }
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
  }

  autoAddRowVat(e: any) {
    switch (e.type) {
      case 'autoAdd':
        this.addRow('4');
        break;
      case 'add':
        this.addVatInvoice();
        break;
    }
  }

  //bùa tabindex
  setTabindex() {
    let ins = setInterval(() => {
      let eleInput = document
        ?.querySelector('.ac-form-master')
        ?.querySelectorAll('codx-input');
      if (eleInput) {
        clearInterval(ins);
        let tabindex = 0;
        for (let index = 0; index < eleInput.length; index++) {
          let elechildren = (
            eleInput[index] as HTMLElement
          ).getElementsByTagName('input')[0];
          if (elechildren.readOnly) {
            elechildren.setAttribute('tabindex', '-1');
          } else {
            tabindex++;
            elechildren.setAttribute('tabindex', tabindex.toString());
          }
        }
        // input refdoc
        let ref = document
          .querySelector('.ac-refdoc')
          .querySelectorAll('input');
        (ref[0] as HTMLElement).setAttribute('tabindex', '15');
      }
    }, 200);
    setTimeout(() => {
      if (ins) clearInterval(ins);
    }, 10000);
  }

  // onFocus() {
  //   let ins = setInterval(() => {
  //     if (this.cbxCashBook) {
  //       if (
  //         this.cbxCashBook.ComponentCurrent &&
  //         this.cbxCashBook.ComponentCurrent.comboBoxObject
  //       ) {
  //         if (this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement) {
  //           clearInterval(ins);
  //           this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement.focus();
  //           this.cbxCashBook.ComponentCurrent.comboBoxObject.inputElement.select();
  //         }
  //       }
  //     }
  //   }, 200);
  //   setTimeout(() => {
  //     if (ins) clearInterval(ins);
  //   }, 10000);
  // }

  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.key == 'Enter') {
      if ((e.target as any).closest('codx-inplace') == null) {
        let eleInput = document
          ?.querySelector('.ac-form-master')
          ?.querySelectorAll('codx-input');
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          let nextIndex = (e.target as HTMLElement).tabIndex + 1;
          for (let index = 0; index < eleInput.length; index++) {
            let elechildren = (
              eleInput[index] as HTMLElement
            ).getElementsByTagName('input')[0];
            if (elechildren.tabIndex == nextIndex) {
              elechildren.focus();
              elechildren.select();
              break;
            }
          }
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
