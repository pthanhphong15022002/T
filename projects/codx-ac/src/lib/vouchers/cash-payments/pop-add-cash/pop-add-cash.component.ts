import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ContextMenuItem,
  DialogEditEventArgs,
  EditSettingsModel,
  FilterSettingsModel,
  GridComponent,
  PdfExportProperties,
  SaveEventArgs,
  ToolbarItems,
  row,
} from '@syncfusion/ej2-angular-grids';
import {
  ClickEventArgs,
  MenuEventArgs,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  AuthService,
  AuthStore,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInputComponent,
  DataRequest,
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
import { Observable, map } from 'rxjs';
import { CashPayment } from '../../../models/CashPayment.model';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';
import { SettledInvoices } from '../../../models/SettledInvoices.model';
import { Double } from '@syncfusion/ej2-angular-charts';
import { CashReceiptsLines } from '../../../models/CashReceiptsLines.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PopUpCashComponent } from '../pop-up-cash/pop-up-cash.component';
import { E } from '@angular/cdk/keycodes';
import { PopUpVatComponent } from '../pop-up-vat/pop-up-vat.component';
declare var window: any;
@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopAddCashComponent extends UIComponent implements OnInit {
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
  @ViewChild('cbxReason') cbxReason: CodxInputComponent;
  @ViewChild('cbxObject') cbxObject: CodxInputComponent;
  @ViewChild('cbxPayname') cbxPayname: CodxInputComponent;
  headerText: string;
  dialog!: DialogRef;
  cashpayment: any;
  action: any;
  gridViewSetup: any;
  gridViewSetupLine: any;
  validate: any = 0;
  journalNo: string;
  modegrid: any;
  cashpaymentline: Array<any> = [];
  settledInvoices: Array<SettledInvoices> = [];
  settledInvoicesDelete: Array<any> = [];
  hideFields: Array<any> = [];
  requireFields = [];
  lockFields = [];
  pageCount: any;
  tab: number = 0;
  total: any = 0;
  totaldr2: any = 0;
  hasSaved: any = false;
  journal: IJournal;
  reason: Array<Reason> = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  gridHeight: any;
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
  columnChange: string = '';
  baseCurr: any;
  formNameLine: any;
  gridViewNameLine: any;
  entityNameLine: any;
  classNameLine: any;
  className: any;
  dataLine: any;
  oldReasonID: any = '';
  oldObjectID: any = '';
  oldSubType: any = '';
  authStore: AuthStore;
  typeSet: any;
  loading: any = false;
  mapReasonName = new Map<string, string>();
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
    switch (this.dialog.formModel.funcID) {
      case 'ACT0429':
      case 'ACT0410':
        this.formNameLine = 'CashPaymentsLines';
        this.gridViewNameLine = 'grvCashPaymentsLines';
        this.entityNameLine = 'AC_CashPaymentsLines';
        this.className = 'CashPaymentsBusiness';
        this.classNameLine = 'CashPaymentsLinesBusiness';
        this.dataLine = new CashPaymentLine();
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
    if (this.cashpayment.unbounds && this.cashpayment.unbounds.baseCurr) {
      this.baseCurr = this.cashpayment.unbounds.baseCurr;
    }
    if (this.cashpayment.unbounds && this.cashpayment.unbounds.journal) {
      this.journal = this.cashpayment.unbounds.journal;
      this.modegrid = this.cashpayment.unbounds.journal.inputMode;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.loadInit();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.cashpayment);
    this.dt.detectChanges();
  }
  //#endregion

  //#region Event
  close() {
    if (this.hasSaved) {
      this.dialog.close({
        update: true,
        data: this.cashpayment,
      });
    } else {
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
    }
  }
  changeDataMF(e:any){
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT042901' ||
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

  created(e: any, ele: TabComponent) {
    this.changeType(null, ele);
  }

  select(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  changeType(e?: any, ele?: TabComponent) {
    let i;
    if (e && e.data[0] != null) {
      i = e.data[0];
      if (
        e.data[0] != this.oldSubType &&
        ((this.gridCash && this.gridCash.dataSource.length > 0) ||
          (this.gridSet && this.gridSet.dataSource.length > 0))
      ) {
        this.notification.alertCode('AC0014', null).subscribe((res) => {
          if (res.event.status === 'Y') {
            this.api
              .exec<any>('AC', 'CommonBusiness', 'DeleteAllAsync', [
                this.cashpayment,
              ])
              .subscribe((res) => {
                if (res) {
                  this.cashpayment.subType = e.data[0];
                  this.cashpaymentline = [];
                  this.settledInvoices = [];
                  this.form.formGroup.patchValue(this.cashpayment);
                  this.loadSubType(i, this.tabObj);
                }
              });
          } else {
            this.form.formGroup.patchValue({ ...this.cashpayment });
          }
        });
      } else {
        this.cashpayment.subType = e.data[0];
        this.oldSubType = e.data[0];
        this.form.formGroup.patchValue(this.cashpayment);
        this.loadSubType(i, this.tabObj);
      }
      return;
    }
    if (!e && this.cashpayment.subType) {
      i = this.cashpayment.subType;
      this.oldSubType = this.cashpayment.subType;
    }
    if (!ele) ele = this.tabObj;
    this.loadSubType(i, ele);
  }

  valueChange(e: any) {
    this.cashpayment[e.field] = e.data;
    let field = e.field.toLowerCase();
    let sArray = [
      'currencyid',
      'voucherdate',
      'cashbookid',
      'journalno',
      'objectid',
      'payee',
      'reasonid',
    ];
    switch (field) {
      case 'objectid':
        let data = e.component.itemsSelected[0];
        this.cashpayment.objectType = data['ObjectType'];
        this.cashpayment.objectName = data['ObjectName'];
        break;
    }
    if (e.data) {
      if (sArray.includes(field)) {
        this.api
          .exec<any>('AC', this.className, 'ValueChangedAsync', [
            e.field,
            this.cashpayment,
          ])
          .subscribe((res) => {
            if (res) {
              this.cashpayment = res;
              this.form.formGroup.patchValue(res);
              switch (field) {
                case 'currencyid':
                  this.gridCreated();
                  if (this.cashpaymentline.length > 0) {
                    this.api
                      .exec<any>(
                        'AC',
                        this.classNameLine,
                        'ChangeExchangeRateAsync',
                        [this.cashpayment, this.cashpaymentline]
                      )
                      .subscribe((res) => {
                        if (res) {
                          this.cashpaymentline = [...res];
                        }
                      });
                  }
                  break;
                case 'reasonid':
                  if (this.cashpaymentline.length > 0) {
                    if (
                      e.component.dataService.currentComponent.previousItemData
                    ) {
                      this.oldReasonID =
                        e.component.dataService.currentComponent.previousItemData.ReasonID;
                    }
                    this.updateLine(e.field, this.oldReasonID);
                  }
                  break;
                case 'objectid':
                  if (this.cashpaymentline.length > 0) {
                    if (
                      e.component.dataService.currentComponent.previousItemData
                    ) {
                      this.oldObjectID =
                        e.component.dataService.currentComponent.previousItemData.ObjectID;
                    }
                    this.updateLine(e.field, this.oldObjectID);
                  }
                  break;
              }
            }
          });
      }
    }
  }

  valueFocusOut(e: any) {
    switch (e.ControlName.toLowerCase()) {
      case 'totalamt':
        if (e.crrValue == null) {
          this.cashpayment.totalAmt = 0;
          this.form.formGroup.patchValue({ ...this.cashpayment });
        } else {
          this.cashpayment[e.ControlName] = e.crrValue;
        }
        break;
      case 'exchangerate':
        this.cashpayment[e.ControlName] = e.crrValue;
        if (e.crrValue && this.cashpaymentline.length > 0) {
          this.notification.alertCode('AC0018', null).subscribe((res) => {
            if (res.event.status === 'Y') {
              this.api
                .exec<any>(
                  'AC',
                  this.classNameLine,
                  'ChangeExchangeRateAsync',
                  [this.cashpayment, this.cashpaymentline]
                )
                .subscribe((res) => {
                  if (res) {
                    this.cashpaymentline = [...res];
                  }
                });
            }
          });
        }
        break;
      default:
        this.cashpayment[e.ControlName] = e.crrValue;
        break;
    }
  }

  gridCreated() {
    this.hideFields = [];
    if (
      this.cashpayment.unbounds &&
      this.cashpayment.unbounds.hideFields &&
      this.cashpayment.unbounds.hideFields.length
    ) {
      this.hideFields = [
        ...(this.cashpayment.unbounds.hideFields as Array<string>),
      ];
    }
    this.loadVisibleColumn();
    this.loadAccountControl();
    this.predicateControl(this.gridCash.visibleColumns);
    this.gridCash.hideColumns(this.hideFields);
    setTimeout(() => {
      this.focusInput();
    }, 500);
  }

  gridCreatedSet() {}

  lineChanged(e: any) {
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
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line) {
            res.line.isAddNew = e.data?.isAddNew;
            switch (e.field.toLowerCase()) {
              case 'accountid':
                this.requireFields = res.requireFields;
                this.lockFields = res.lockField;
                this.requireGrid();
                this.lockGrid();
                break;
            }
            this.setDataGrid(res.line.updateColumns, res.line);
          }
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
    this.addRow();
  }

  addRow() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    switch (this.action) {
      case 'add':
        if (this.hasSaved) {
          // this.dialog.dataService.updateDatas.set(
          //   this.cashpayment['_uuid'],
          //   this.cashpayment
          // );
          // this.dialog.dataService
          //   .save(
          //     (opt: RequestOption) => {
          //       opt.methodName = 'UpdateLogicAsync';
          //       opt.data = [this.cashpayment];
          //     },
          //     0,
          //     '',
          //     '',
          //     false
          //   )
          //   .subscribe((res) => {
          //     if (res && res.update.data != null) {
          //       if (res.update.data.unbounds.lineDefault != null) {
          //         this.dataLine = res.update.data.unbounds.lineDefault;
          //       }
          //       this.loadGrid();
          //     }
          //   });
          this.api
            .exec('AC', 'CashPaymentsBusiness', 'UpdateMasterAsync', [
              this.cashpayment,
              this.journal
            ])
            .subscribe((res: any) => {
              if (res) {
                if (res.unbounds.lineDefault != null) {
                  this.dataLine = res.unbounds.lineDefault;
                }
                this.loadGrid();
              }
            });
        } else {
          this.journalService.handleVoucherNoAndSave(
            this.journal,
            this.cashpayment,
            'AC',
            'AC_CashPayments',
            this.form,
            this.action === 'edit',
            () => {
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
                .subscribe((res) => {
                  if (res && res.save.data != null) {
                    this.cashpayment = res.save.data;
                    if (this.cashpayment.unbounds.lineDefault != null) {
                      this.dataLine = this.cashpayment.unbounds.lineDefault;
                    }
                    this.loadGrid();
                    this.hasSaved = true;
                  }
                });
            }
          );
        }
        break;
      case 'edit':
        this.api
          .exec('AC', 'CashPaymentsBusiness', 'UpdateMasterAsync', [
            this.cashpayment,
            this.journal
          ])
          .subscribe((res: any) => {
            if (res) {
              if (res.unbounds.lineDefault != null) {
                this.dataLine = res.unbounds.lineDefault;
              }
              this.loadGrid();
            }
          });
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
            .execAction<any>(this.entityNameLine, [data], 'DeleteAsync')
            .subscribe((res) => {
              if (res) {
                this.hasSaved = true;
                this.api
                  .exec('AC', this.classNameLine, 'UpdateAfterDelete', [
                    this.cashpaymentline,
                  ])
                  .subscribe((res) => {});
              }
            });
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
  //       var obj = {
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
  //             var dialogs = this.callfc.openForm(
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
  //                 var dataline = res.event['data'];
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

  onAddNew(e: any) {
    this.api
      .execAction<any>(this.entityNameLine, [e], 'SaveAsync')
      .subscribe((res) => {
        if (res) {
          this.hasSaved = true;
          this.loadTotal();
          if (this.cashpayment.totalAmt != 0) {
            if (this.total > this.cashpayment.totalAmt) {
              this.notification.notifyCode('AC0012');
            }
          }
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

  onEdit(e: any) {
    this.api
      .execAction<any>(this.entityNameLine, [e], 'UpdateAsync')
      .subscribe((res) => {
        if (res) {
          this.hasSaved = true;
          this.loadTotal();
          if (this.cashpayment.totalAmt != 0) {
            if (this.total > this.cashpayment.totalAmt) {
              this.notification.notifyCode('AC0012');
            }
          }
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

  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  popupLine(data) {
    var obj = {
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
          var dialogs = this.callfc.openForm(
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
              var dataline = res.event['data'];
              this.cashpaymentline.push(dataline);
              // this.loadTotal();
              this.hasSaved = true;
              if (
                parseInt(this.total.replace(/\D/g, '')) >
                this.cashpayment.paymentAmt
              ) {
                this.notification.notifyCode('AC0012');
              }
              this.gridCash.refresh();
              this.dialog.dataService.updateDatas.set(
                this.cashpayment['_uuid'],
                this.cashpayment
              );
              this.dialog.dataService
                .save(null, 0, '', '', false)
                .subscribe((res) => {});
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
    var obj = {
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
    var obj = {
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
                this.dialog.close({
                  update: true,
                  data: res.update.data,
                });
                this.dt.detectChanges();
              } else {
                this.loading = false;
              }
            });
        }
        break;
      case 'edit':
        this.journalService.handleVoucherNoAndSave(
          this.journal,
          this.cashpayment,
          'AC',
          'AC_CashPayments',
          this.form,
          this.action === 'edit',
          () => {
            if (this.cashpayment.status == '0') {
              this.cashpayment.status = '1';
            }
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
                  this.dialog.close({
                    update: true,
                    data: res.update,
                  });
                  this.dt.detectChanges();
                } else {
                  this.loading = false;
                  this.cashpayment.unbounds.isAddNew = true;
                }
              });
          }
        );
        break;
    }
  }

  onSaveAdd() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    this.cashpayment.unbounds.isAddNew = false;
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
            this.clearCashpayment();
            this.dialog.dataService.clear();
            this.dialog.dataService
              .addNew((o) => this.setDefault(o))
              .subscribe((res) => {
                this.cashpayment = res;
                this.form.formGroup.patchValue(this.cashpayment);
                this.hasSaved = false;
                this.loading = false;
              });
          } else {
            this.cashpayment.unbounds.isAddNew = true;
            this.loading = false;
          }
        });
    } else {
      // nếu voucherNo đã tồn tại,
      // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
      this.journalService.handleVoucherNoAndSave(
        this.journal,
        this.cashpayment,
        'AC',
        'AC_CashPayments',
        this.form,
        this.action === 'edit',
        () => {
          this.dialog.dataService
            .save((opt: RequestOption) => {
              opt.data = [this.cashpayment];
            })
            .subscribe((res) => {
              if (res && res.save.data != null) {
                this.clearCashpayment();
                this.dialog.dataService.clear();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res) => {
                    this.cashpayment = res;
                    this.form.formGroup.patchValue(this.cashpayment);
                  });
              } else {
                this.cashpayment.unbounds.isAddNew = true;
                this.loading = false;
              }
            });
        }
      );
    }
  }

  onDiscard() {
    this.dialog.dataService
      .delete([this.cashpayment], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
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
    this.reason = [];
  }

  loadBookmark(e) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' ||
        x.functionID == 'ACT041002' ||
        x.functionID == 'ACT041004'
    );
    for (var i = 0; i < bm.length; i++) {
      bm[i].disabled = true;
    }
  }

  loadGrid() {
    let idx;
    if (this.cashpayment.subType != '2') {
      switch (this.modegrid) {
        case '1':
          idx = this.gridCash.dataSource.length;
          this.dataLine.rowNo = idx + 1;
          this.requireFields = this.dataLine.unbounds
            .requireFields as Array<string>;
          this.lockFields = this.dataLine.unbounds.lockFields as Array<string>;
          this.requireGrid();
          this.lockGrid();
          this.gridCash.endEdit();
          this.gridCash.addRow(this.dataLine, idx);
          break;
        case '2':
          idx = this.cashpaymentline.length;
          this.dataLine.rowNo = idx + 1;

          //rename -> popupLine
          this.popupLine(this.dataLine);
          break;
      }
    } else {
      this.popupSettledInvoices(this.typeSet);
    }
  }
  //Viet tăt ten ctrl 3 ky tu vd: gridview -> grv;label ->lbl,
  popupSettledInvoices(type: number) {
    var obj = {
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
        this.gridSet.refresh();
      }
    });
  }

  loadInit() {
    switch (this.action) {
      case 'add':
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
            .subscribe((res: any) => {
              this.settledInvoices = res;
            });

          //#endregion
        }
        this.loadjounal();
        break;
    }

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  loadjounal() {
    this.api
      .exec<any>('AC', 'JournalsBusiness', 'GetJournalAsync', [this.journalNo])
      .subscribe((res) => {
        this.journal = res[0];
        this.hideFields = res[1];
        this.baseCurr = res[2];
        this.modegrid = this.journal.inputMode;
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
    if (this.cashpaymentline.length > 0) {
      this.cashpaymentline.forEach((element) => {
        this.total = this.total + element.dr;
      });
      this.cashpayment.totalDR = this.total;
    }
  }

  expand() {
    var eCollape = document.querySelectorAll(
      '.codx-detail-footer.dialog-footer.collape'
    );
    var eExpand = document.querySelectorAll(
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
    var arr = [
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
    if (this.journal.brigdeAcctControl == '1') {
      this.hideFields.push('CR2');
      this.hideFields.push('CR');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        this.hideFields.push('TaxAmt2');
      }
    } else {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'AccountID'
      );
      if (i > -1) {
        this.gridCash.columnsGrid[i].headerText = 'TK';
      }
      this.hideFields.push('OffsetAcctID');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.hideFields.push('DR2');
        this.hideFields.push('TaxAmt2');
        this.hideFields.push('CR2');
      }
    }
  }

  loadVisibleColumn() {
    var arr = [
      'TaxAmt2',
      'DR2',
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
    var arr = ['1', '3'];
    arr.forEach((eName) => {
      if (eName == subtype) {
        var element = document.querySelectorAll('.ac-type-' + eName);
        if (element) {
          for (let index = 0; index < element.length; index++) {
            (element[index] as HTMLElement).style.display = 'inline';
          }
        }
      } else {
        var element = document.querySelectorAll('.ac-type-' + eName);
        if (element) {
          for (let index = 0; index < element.length; index++) {
            (element[index] as HTMLElement).style.display = 'none';
          }
        }
      }
    });
  }

  focusInput() {
    var element = document.querySelectorAll('input');
    (element[1] as HTMLInputElement).focus();
    (element[1] as HTMLInputElement).setSelectionRange(0, 1000);
  }

  updateLine(field, oldvalue) {
    this.api
      .exec<any>('AC', this.classNameLine, 'UpdateLine', [
        field,
        oldvalue,
        this.cashpayment,
        this.cashpaymentline,
      ])
      .subscribe((res) => {
        if (res) {
          this.cashpaymentline = [...res];
        }
      });
  }
  //#endregion
}
