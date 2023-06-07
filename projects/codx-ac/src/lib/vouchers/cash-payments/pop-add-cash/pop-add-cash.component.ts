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
import { NgxUiLoaderService } from 'ngx-ui-loader';
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
  @ViewChild('itemRef') itemRef: ElementRef;
  @ViewChild('btnRef') btnRef: ElementRef;
  @ViewChild('docRef') docRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('cbxReason') cbxReason: CodxInputComponent;
  @ViewChild('editTemplate', { static: true }) editTemplate: TemplateRef<any>;
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('cbxAccountID') cbxAccountID: CodxInputComponent;
  @ViewChild('cbxOffsetAcctID') cbxOffsetAcctID: CodxInputComponent;
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
  visibleColumns: Array<any> = [];
  visibleColumnsSet: Array<any> = [];
  lockFields = [];
  requireFields = [];
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
  editSettingsM2: EditSettingsModel = {
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
  authStore: AuthStore;
  typeSet: any;
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private journalService: JournalService,
    private ngxService: NgxUiLoaderService,
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
    this.cashpayment = { ...dialog.dataService.dataSelected };
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
    if (
      this.cashpayment.unbounds &&
      this.cashpayment.unbounds.baseCurr &&
      this.cashpayment.unbounds.baseCurr.length
    ) {
      (this.cashpayment.unbounds.baseCurr as Array<string>).forEach(
        (element) => {
          this.baseCurr = element;
        }
      );
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.ngxService.startLoader('loader');
    this.loadInit();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.cashpayment);
    this.loadjounal();
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
    if (e && e.data != null) {
      i = e.data;
      this.cashpayment.subType = e.data;
    }
    if (!e && this.cashpayment.subType) i = this.cashpayment.subType;
    if (!ele) ele = this.tabObj;
    switch (i) {
      case '3':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadSubType1(false);
        this.loadSubType2(true);
        this.loadSubType5(false);
        break;
      case '5':
        ele.hideTab(0, false);
        ele.hideTab(1, false);
        this.cashpaymentline = [];
        this.settledInvoices = [];
        this.loadSubType1(false);
        this.loadSubType2(false);
        this.loadSubType5(true);
        break;
      case '1':
      case '9':
      case '4':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadSubType1(true);
        this.loadSubType2(false);
        this.loadSubType5(false);
        break;
      default:
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        this.settledInvoices = [];
        this.loadSubType1(true);
        this.loadSubType2(false);
        this.loadSubType5(false);
        break;
    }
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
    ];
    if (e.data) {
      switch (field) {
        case 'currencyid':
          if (this.columnChange.toLowerCase() == 'cashbookid') {
            this.columnChange = '';
            return;
          }
          break;
        case 'exchangerate':
          if (this.cashpaymentline.length) {
            this.api
              .exec<any>('AC', this.classNameLine, 'ChangeExchangeRateAsync', [
                this.cashpayment,
                this.cashpaymentline,
              ])
              .subscribe((res) => {
                if (res) {
                  this.gridCash!.dataSource = res;
                  this.cashpaymentline = res;
                }
              });
          }
          break;
        case 'reasonid':
          let reason = e.component.itemsSelected[0];
          if (reason['SubType'] != this.cashpayment.subType) {
            if (
              (this.gridCash && this.gridCash.dataSource.length > 0) ||
              (this.gridSet && this.gridSet.dataSource.length > 0)
            ) {
              this.notification.alertCode('AC0014', null).subscribe((res) => {
                if (res.event.status === 'Y') {
                  this.api
                    .exec<any>('AC', 'CommonBusiness', 'DeleteAllAsync', [
                      this.cashpayment,
                    ])
                    .subscribe((res) => {
                      if (res) {
                        this.cashpaymentline = [];
                        this.settledInvoices = [];
                        this.cashpayment = res;
                        this.cashpayment.subType = reason['SubType'];
                        this.changeType(null, this.tabObj);
                        this.form.formGroup.patchValue(res);
                      }
                    });
                } else {
                }
              });
            } else {
              this.cashpayment.subType = reason['SubType'];
              this.changeType(null, this.tabObj);
              this.api
                .exec<any>('AC', this.className, 'ValueChangedAsync', [
                  e.field,
                  this.cashpayment,
                ])
                .subscribe((res) => {
                  if (res) {
                    this.cashpayment = res;
                    this.form.formGroup.patchValue(res);
                  }
                });
            }
          } else {
            this.api
              .exec<any>('AC', this.className, 'ValueChangedAsync', [
                e.field,
                this.cashpayment,
              ])
              .subscribe((res) => {
                if (res) {
                  this.cashpayment = res;
                  this.form.formGroup.patchValue(res);
                }
              });
          }
          break;
        case 'objectid':
          let data = e.component.itemsSelected[0];
          this.cashpayment.objectType = data['ObjectType'];
          this.cashpayment.objectName = data['ObjectName'];
          break;
      }
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
              if (field == 'currencyid') {
                this.gridCreated();
              }
            }
          });
      }
    }
  }

  valueFocusOut(e: any) {
    this.cashpayment[e.ControlName] = e.crrValue;
    let text;
    switch (e.ControlName) {
      case 'payor':
      case 'payee':
        this.api
          .exec<any>('AC', this.className, 'ValueChangedAsync', [
            e.ControlName,
            this.cashpayment,
          ])
          .subscribe((res) => {
            if (res) {
              this.form.formGroup.patchValue(res);
            }
          });
        break;
    }
  }

  gridCreated() {
    this.lockFields = [];
    if (
      this.cashpayment.unbounds &&
      this.cashpayment.unbounds.lockFields &&
      this.cashpayment.unbounds.lockFields.length
    ) {
      this.lockFields = this.cashpayment.unbounds.lockFields as Array<string>;
    }
    if (this.journal.subControl == '0') {
      this.lockFields.push('ObjectID');
    } else {
      let i = this.gridCash.columnsGrid.findIndex(
        (x) => x.fieldName == 'ObjectID'
      );
      if (i > -1) {
        this.gridCash.columnsGrid[i].isVisible = true;
        let idx = this.gridCash.visibleColumns.findIndex(
          (x) => x.field == this.gridCash.columnsGrid[i].field
        );
        if (idx > -1) {
          this.gridCash.visibleColumns.push(this.gridCash.columnsGrid[i]);
        }
      }
    }
    if (this.journal.postingMode == '1') {
      this.lockFields.push('CR2');
      this.lockFields.push('CR');
      if (this.cashpayment.currencyID == this.baseCurr) {
        this.lockFields.push('DR2');
        this.lockFields.push('TaxAmt2');
      } else {
        var arr = ['DR2', 'TaxAmt2'];
        arr.forEach((fieldName) => {
          let i = this.gridCash.columnsGrid.findIndex(
            (x) => x.fieldName == fieldName
          );
          if (i > -1) {
            this.gridCash.columnsGrid[i].isVisible = true;
            let idx = this.gridCash.visibleColumns.findIndex(
              (x) => x.field == this.gridCash.columnsGrid[i].field
            );
            if (idx > -1) {
              this.gridCash.visibleColumns.push(this.gridCash.columnsGrid[i]);
            }
          }
        });
      }
    }

    this.loadAccountControl(this.gridCash.visibleColumns);
    this.gridCash.hideColumns(this.lockFields);
    this.visibleColumns = this.gridCash.visibleColumns;
    this.ngxService.stopLoader('loader');
    this.ngxService.destroyLoaderData('loader');
    // setTimeout(() => {
    //   let hBody, hHeader, hTab, hItem;
    //   let body = document.getElementsByClassName('card-body scroll-y h-100');
    //   let header = document.getElementsByClassName(
    //     'e-gridheader e-lib e-draggable e-droppable'
    //   );
    //   let tab = document.getElementsByClassName('e-text-wrap');
    //   if (body) hBody = (body[0] as HTMLElement).offsetHeight;
    //   if (header) hHeader = (header[0] as HTMLElement).offsetHeight;
    //   if (tab) hTab = hTab = (tab[0] as HTMLElement).offsetHeight * 2;
    //   if (this.itemRef)
    //     hItem = this.itemRef.nativeElement.parentElement.offsetHeight;
    //   this.gridHeight = hBody - (hHeader + hTab + hItem + 100 + 30); //90 là header & footer, //30 là tfoot grid

    // }, 1000);
  }

  gridCreatSet() {
    this.visibleColumnsSet = this.gridSet.visibleColumns;
  }

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
                this.requireGrid();
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
          this.loadGrid();
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
                    this.oldReasonID = res.save.data.reasonID;
                    this.hasSaved = true;
                    this.loadGrid();
                  }
                });
            }
          );
        }
        break;
      case 'edit':
        this.loadGrid();
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
    //this.gridCash.gridRef.se;
    this.gridCash.gridRef.startEdit();
  }

  onAddNew(e: any) {
    this.api
      .execAction<any>(this.entityNameLine, [e], 'SaveAsync')
      .subscribe((res) => {
        if (res) {
          this.hasSaved = true;
          this.loadTotal();
          if (this.total > this.cashpayment.totalAmt) {
            this.notification.notifyCode('AC0012');
          }
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

  onEdit(e: any) {
    this.api
      .execAction<any>(this.entityNameLine, [e], 'UpdateAsync')
      .subscribe((res) => {
        if (res) {
          this.hasSaved = true;
          this.loadTotal();
          if (this.total > this.cashpayment.totalAmt) {
            this.notification.notifyCode('AC0012');
          }
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

  actionEvent(e: any) {}

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
      lockFields: this.lockFields,
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

  //#endregion

  //#region Method
  onSave() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    switch (this.action) {
      case 'add':
      case 'copy':
        if (this.hasSaved) {
          this.dialog.dataService.updateDatas.set(
            this.cashpayment['_uuid'],
            this.cashpayment
          );
          var data = { ...this.cashpayment };
          data.status = '1';
          this.dialog.dataService
            .save((opt: RequestOption) => {
              opt.data = [data];
            })
            .subscribe((res) => {
              if (res && res.update.data != null) {
                this.dialog.close({
                  update: true,
                  data: res.update.data,
                });
                this.dt.detectChanges();
              }
            });
        } else {
          // nếu voucherNo đã tồn tại,
          // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
          this.journalService.handleVoucherNoAndSave(
            this.journal,
            this.cashpayment,
            'AC',
            this.dialog.formModel.entityName,
            this.form,
            this.hasSaved,
            () => {
              var data = { ...this.cashpayment };
              data.status = '1';
              this.dialog.dataService
                .save((opt: RequestOption) => {
                  opt.data = [data];
                })
                .subscribe((res) => {
                  if (res && res.save.data != null) {
                    this.dialog.close({
                      update: true,
                      data: res.save.data,
                    });
                    this.dt.detectChanges();
                  }
                });
            }
          );
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
    if (this.hasSaved) {
      this.dialog.dataService.updateDatas.set(
        this.cashpayment['_uuid'],
        this.cashpayment
      );
      var data = { ...this.cashpayment };
      data.status = '1';
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.data = [data];
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
              });
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
          var data = { ...this.cashpayment };
          data.status = '1';
          this.dialog.dataService
            .save((opt: RequestOption) => {
              opt.data = [data];
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

  checkValidate() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields: string[] = [];
    if (this.journal.assignRule === '2') {
      ignoredFields.push('VoucherNo');
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashpayment);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

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

  checkValidateLine(e, args) {
    var keygrid = Object.keys(this.gridViewSetupLine);
    var keymodel = Object.keys(e);
    var keepgoing = true;
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetupLine[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keepgoing) {
            if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
              if (
                e[keymodel[i]] == null ||
                String(e[keymodel[i]]).match(/^ *$/) !== null
              ) {
                var element = (args.form as HTMLElement).querySelectorAll(
                  'codx-input'
                );
                for (let index = 0; index < element.length; index++) {
                  var input = window.ng.getComponent(
                    element[index]
                  ) as CodxComboboxComponent;
                  if (input.ControlName == keymodel[i]) {
                    var focus = element[index].getElementsByTagName('input')[0];
                    focus.select();
                    focus.focus();
                  }
                }
                this.notification.notifyCode(
                  'SYS009',
                  0,
                  '"' + this.gridViewSetupLine[keygrid[index]].headerText + '"'
                );
                this.validate++;
                keepgoing = false;
              }
            }
          }
        }
      }
    }
  }

  // setReason(field, text, idx) {
  //   if (!this.reason.some((x) => x.field == field)) {
  //     let transText = new Reason();
  //     transText.field = field;
  //     transText.value = text;
  //     transText.index = idx;
  //     this.reason.push(transText);
  //   } else {
  //     let iTrans = this.reason.find((x) => x.field == field);
  //     if (iTrans) iTrans.value = text;
  //   }

  //   this.cashpayment.memo = this.acService.setMemo(
  //     this.cashpayment,
  //     this.reason
  //   );
  //   this.form.formGroup.patchValue(this.cashpayment);
  // }

  // setVoucherRef(datas: Array<any> = []) {
  //   const t = this;
  //   datas.forEach((e, i) => {
  //     let data = { ...this.gridCash.formGroup.value };

  //     Object.keys(e).forEach((key) => {
  //       data[key] = e[key];
  //     });

  //     data.transID = t.cashpayment.recID;
  //     data.lineType = t.cashpayment.subType;
  //     data.settledID = Util.uid();
  //     data.lineID = e.recID;
  //     data.recID = Util.uid();
  //     data.createdBy = this.authStore.get().userID;
  //     data['rowNo'] = i;

  //     let exits = this.settledInvoices.findIndex((x) => x.lineID == e.recID);

  //     if (exits == -1) {
  //       this.settledInvoices.push(data);
  //       this.api
  //         .execAction<any>('AC_SettledInvoices', [data], 'SaveAsync')
  //         .subscribe((res) => {});
  //     } else {
  //     }
  //   });
  //   this.gridCash.gridRef.refresh();
  // }

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
    this.api
      .exec<any>('AC', this.classNameLine, 'SetDefaultAsync', [
        this.cashpayment,
        this.dataLine,
      ])
      .subscribe((res) => {
        if (res) {
          if (this.cashpayment.subType != '2') {
            switch (this.modegrid) {
              case '1':
                idx = this.gridCash.dataSource.length;
                res.rowNo = idx + 1;
                if (res.unbounds && res.unbounds.requireFields.length) {
                  this.requireFields = res.unbounds
                    .requireFields as Array<string>;
                  this.requireGrid();
                }
                this.gridCash.endEdit();
                this.gridCash.addRow(res, idx);
                break;
              case '2':
                idx = this.cashpaymentline.length;
                res.rowNo = idx + 1;

                //rename -> popupLine
                this.popupLine(res);
                break;
            }
          } else {
            this.popupSettledInvoices(this.typeSet);
          }
        }
      });
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
        this.cashpaymentline = [];
        break;
      case 'edit':
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
        break;
    }
    if (this.cashpayment.status == '0' && this.action == 'edit') {
      this.hasSaved = true;
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
        this.lockFields = res[1];
        this.modegrid = this.journal.inputMode;
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

  loadSubType1(enable) {
    var element = document.getElementById('ac-type-1');
    if (element) {
      if (enable) {
        element.style.display = 'inline';
      } else {
        element.style.display = 'none';
      }
    }
  }

  loadSubType2(enable) {
    var element = document.querySelectorAll('.ac-type-2');
    if (element) {
      if (enable) {
        for (let index = 0; index < element.length; index++) {
          (element[index] as HTMLElement).style.display = 'inline';
        }
      } else {
        for (let index = 0; index < element.length; index++) {
          (element[index] as HTMLElement).style.display = 'none';
        }
      }
    }
  }

  loadSubType5(enable) {
    var element = document.querySelectorAll('.ac-type-5');
    if (element) {
      if (enable) {
        for (let index = 0; index < element.length; index++) {
          (element[index] as HTMLElement).style.display = 'inline';
        }
      } else {
        for (let index = 0; index < element.length; index++) {
          (element[index] as HTMLElement).style.display = 'none';
        }
      }
    }
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

  loadAccountControl(visibleColumns) {
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
  //#endregion
}
