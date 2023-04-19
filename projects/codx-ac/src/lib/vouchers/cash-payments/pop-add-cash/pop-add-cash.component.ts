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
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
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
import { Observable } from 'rxjs';
import { CashPayment } from '../../../models/CashPayment.model';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';
@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css'],
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridCashPaymentLine')
  public gridCashPaymentLine: CodxGridviewV2Component;
  @ViewChild('gridSettledInvoices')
  public gridSettledInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('cashBook') cashBook: CodxInputComponent;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  cashpayment: CashPayment;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  journalNo: string;
  moreFunction: any;
  modegrid: any = 0;
  columnGrids = [];
  keymodel: any;
  cashpaymentline: Array<CashPaymentLine> = [];
  settledInvoices: Array<any> = [];
  settledInvoicesDelete: Array<any> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
  lockFields = [];
  pageCount: any;
  tab: number = 0;
  total: any = 0;
  data: any;
  journal: IJournal;
  voucherNoPlaceholderText$: Observable<string>;
  reason: Array<Reason> = [];
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
  page: any = 1;
  pageSize: any = 5;
  key: any;
  columnChange: string = '';
  vllCashbook: any;
  vettledInvoicesDelete: any[];
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.journalNo) this.journalNo = res.journalNo;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cashpayment = {...dialog.dataService!.dataSelected};
    var model = new CashPaymentLine();
    this.keymodel = Object.keys(model);
    this.cache
      .gridViewSetup('CashPayments', 'grvCashPayments')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.api
      .exec<any>('SYS', 'MoreFunctionsBusiness', 'GetAsync', 'ACT041001')
      .subscribe((res) => {
        if (res) this.moreFunction = res;
      });

    this.cache
      .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
      .subscribe((res) => {
        if (res) {
          var keygrid = Object.keys(res);
          for (let index = 0; index < keygrid.length; index++) {
            if (res[keygrid[index]].isVisible == true) {
              var column = {
                field: res[keygrid[index]].fieldName.toLowerCase(),
                headerText: res[keygrid[index]].headerText,
                columnOrder: res[keygrid[index]].columnOrder,
                allowFilter: res[keygrid[index]].allowFilter,
              };
              this.columnGrids.push(column);
            }
          }
          this.columnGrids = this.columnGrids.sort(
            (a, b) => a.columnOrder - b.columnOrder
          );
        }
      });

    if (this.formType == 'edit') {
      if (this.cashpayment?.subType == '1') {
        //#region  load cashpaymentline
        this.acService
          .loadData(
            'ERM.Business.AC',
            'CashPaymentsLinesBusiness',
            'LoadDataAsync',
            this.cashpayment.recID
          )
          .subscribe((res: any) => {
            if (res.length > 0) {
              this.keymodel = Object.keys(res[0]);
              this.cashpaymentline = res;
              this.pageCount = '(' + this.cashpaymentline.length + ')';
              this.loadTotal();
            }
          });
        this.api
          .exec<any>('AC', 'JournalsBusiness', 'GetJournalAsync', [
            this.journalNo,
          ])
          .subscribe((res) => {
            this.lockFields = res[1];
          });
      }
      if (this.cashpayment?.subType == '2') {
        this.acService
          .loadData(
            'ERM.Business.AC',
            'VoucherLineRefsBusiness',
            'LoadDataAsync',
            this.cashpayment.recID
          )
          .subscribe((res: any) => {
            this.settledInvoices = res;
          });

        //#endregion
      }
    }
    if (this.formType == 'add') {
      if (
        this.cashpayment &&
        this.cashpayment.unbounds &&
        this.cashpayment.unbounds.lockFields &&
        this.cashpayment.unbounds.lockFields.length
      ) {
        this.lockFields = this.cashpayment.unbounds.lockFields as Array<string>;
      }
    }

    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.cashpayment.journalNo;
    options.pageLoading = false;
    this.acService.loadDataAsync('AC', options).subscribe((res) => {
      this.journal = res[0]?.dataValue
        ? { ...res[0], ...JSON.parse(res[0].dataValue) }
        : res[0];
      this.modegrid = this.journal.inputMode;
    });
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.cashpayment);
    this.pageCount = '(' + this.cashpaymentline.length + ')';
    this.loadTotal();
    this.loadFuncid();
    this.loadReason();
  }
  //#endregion

  //#region Event
  close() {
    this.dialog?.close();
  }
  loadTotal() {
    var totals = 0;
    this.cashpaymentline.forEach((element) => {
      totals = totals + element.dr;
    });
    this.total = totals.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
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

  clickMF(e, data) {
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

  changeType(e?: any, ele?: TabComponent) {
    let i;
    if (e) i = e.data;
    if (!e && this.cashpayment.subType) i = this.cashpayment.subType;
    if (!ele) ele = this.tabObj;
    switch (i) {
      case '1':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadFuncid();
        break;
      case '3':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadvll('AC093');
        break;
      default:
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        this.settledInvoices = [];
        break;
    }
  }

  valueChange(e: any) {
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
              .exec<any>(
                'AC',
                'CashPaymentsLinesBusiness',
                'ChangeExchangeRateAsync',
                [this.cashpayment, this.cashpaymentline]
              )
              .subscribe((res) => {
                if (res) {
                  this.gridCashPaymentLine!.dataSource = res;
                  this.cashpaymentline = res;
                }
              });
          }
          break;
        case 'reasonid':
          let text = e?.component?.itemsSelected[0]?.ReasonName;
          this.setReason(field, text, 0);
          break;
        case 'objectid':
          let data = e.component.itemsSelected[0];
          this.cashpayment.objectType = data['ObjectType'];
          this.cashpayment.objectName = data['ObjectName'];
          this.setReason(field, data['ObjectName'], 1);
          break;
      }
      if (sArray.includes(field)) {
        this.api
          .exec<any>('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            e.field,
            this.cashpayment,
          ])
          .subscribe((res) => {
            if (res) {
              this.columnChange = res.updateColumns;
              this.form.formGroup.patchValue(res);
            }
          });
      }
    }
    console.log(this.dialog.dataService.dataSelected);
  }

  valuechangePayee(e: any) {
    let text;
    if (e.crrValue) {
      text = e.crrValue;
      this.setReason('payname', text, 2);
    } else {
      let index = this.reason.findIndex((x) => x.field == 'payname');
      if (index > -1) {
        this.reason.splice(index, 1);
      }
      this.cashpayment.memo = this.acService.setMemo(
        this.cashpayment,
        this.reason
      );
      this.form.formGroup.patchValue(this.cashpayment);
    }
  }

  gridCreated(e, grid) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
    grid.disableField(this.lockFields);
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
              this.gridSettledInvoices.rowDataSelected[e.field] = res[e.field];
              this.gridSettledInvoices.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  openVoucher() {
    if (!this.cashpayment.payee)
      this.notification.notifyCode(
        'SYS009',
        null,
        this.gridViewSetup['Payee'].headerText
      );
    let op = new DialogModel();
    op.Resizeable = true;
    let title = this.moreFunction.customName;
    let voucherDialog = this.callfc.openForm(
      VoucherComponent,
      title,
      1200,
      600,
      '',
      {
        title,
        cbxName: 'OpenInvoices',
        cashpayment: this.cashpayment,
      },
      '',
      op
    );

    voucherDialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        this.setVoucherRef(res.event);
      }
    });
  }

  addRow() {
    switch (this.modegrid) {
      case '1':
        if (this.cashpayment.subType == '1') {
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
          let idx = this.gridSettledInvoices.dataSource.length;
          let data = this.gridSettledInvoices.formGroup.value;
          data.recID = Util.uid();
          data.write = true;
          data.delete = true;
          data.read = true;
          data.rowNo = idx + 1;
          data.transID = this.cashpayment.recID;
          this.gridSettledInvoices.addRow(data, idx);
        }
        break;
      case '2':
        let idx = this.cashpaymentline.length;
        let data = new CashPaymentLine();
        this.api
          .exec<any>('AC', 'CashPaymentsLinesBusiness', 'SetDefaultAsync', [
            this.cashpayment,
            data,
          ])
          .subscribe((res) => {
            if (res) {
              res.rowNo = idx + 1;
              this.openPopupLine(res);
            }
          });
        break;
    }
  }

  deleteRow(data) {
    switch (this.modegrid) {
      case '1':
        if (this.cashpayment.subType == '1') {
          this.gridCashPaymentLine.deleteRow(data);
          if (this.gridCashPaymentLine.dataSource.length > 0) {
            for (
              let i = 0;
              i < this.gridCashPaymentLine.dataSource.length;
              i++
            ) {
              this.gridCashPaymentLine.dataSource[i].rowNo = i + 1;
            }
          }
          this.cashpaymentlineDelete.push(data);
        }
        if (this.cashpayment.subType == '2') {
          this.gridSettledInvoices.deleteRow(data);
          this.settledInvoicesDelete.push(data);
        }
        break;
      case '2':
        let index = this.cashpaymentline.findIndex(
          (x) => x.recID == data.recID
        );
        this.cashpaymentline.splice(index, 1);
        if (this.cashpaymentline.length > 0) {
          for (let i = 0; i < this.cashpaymentline.length; i++) {
            this.cashpaymentline[i].rowNo = i + 1;
          }
        }
        this.cashpaymentlineDelete.push(data);
        this.pageCount = '(' + this.cashpaymentline.length + ')';
        this.loadTotal();
        break;
    }
  }

  editRow(data) {
    switch (this.modegrid) {
      case '1':
        if (this.cashpayment.subType == '1')
          this.gridCashPaymentLine.updateRow(data.rowNo, data);
        if (this.cashpayment.subType == '2')
          this.gridSettledInvoices.updateRow(data.rowNo, data);
        break;
      case '2':
        let index = this.cashpaymentline.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          type: 'edit',
          lockFields: this.lockFields,
          journal: this.journal,
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'CashPaymentsLines';
        dataModel.gridViewName = 'grvCashPaymentsLines';
        dataModel.entityName = 'AC_CashPaymentsLines';
        opt.FormModel = dataModel;
        opt.Resizeable = false;
        this.cache
          .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLinecashComponent,
                '',
                650,
                600,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed.subscribe(() => {
                var dataline = JSON.parse(localStorage.getItem('dataline'));
                if (dataline != null) {
                  this.cashpaymentline[index] = dataline;
                  this.loadTotal();
                }
                window.localStorage.removeItem('dataline');
              });
            }
          });
        break;
    }
  }

  copyRow(data) {
    switch (this.modegrid) {
      case '1':
        let idx = this.gridCashPaymentLine.dataSource.length;
        data.rowNo = idx + 1;
        data.recID = Util.uid();
        this.gridCashPaymentLine.addRow(data, idx);
        break;
      case '2':
        let rowno = this.cashpaymentline.length;
        data.rowNo = rowno + 1;
        this.openPopupLine(data);
        break;
    }
  }

  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.cashpaymentline,
      datacash: this.cashpayment,
      type: 'add',
      lockFields: this.lockFields,
      journal: this.journal,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashPaymentsLines';
    dataModel.gridViewName = 'grvCashPaymentsLines';
    dataModel.entityName = 'AC_CashPaymentsLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLinecashComponent,
            '',
            650,
            null,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe(() => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.cashpaymentline.push(dataline);
              this.keymodel = Object.keys(dataline);
              this.pageCount = '(' + this.cashpaymentline.length + ')';
              this.loadTotal();
            }
            window.localStorage.removeItem('dataline');
            this.dt.detectChanges();
          });
        }
      });
  }
  //#endregion

  //#region Method
  onSave() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields: string[] = [];
    if (this.journal.voucherNoRule === '2') {
      ignoredFields.push('VoucherNo');
    }
    this.checkValidate(ignoredFields);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      // nếu voucherNo đã tồn tại,
      // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
      this.journalService.handleVoucherNoAndSave(
        this.journal,
        this.cashpayment,
        'AC',
        'AC_CashPayments',
        this.form,
        this.formType === 'edit',
        () => {
          if (this.modegrid == '1') {
            this.cashpaymentline = this.gridCashPaymentLine.dataSource;
          }
          if (this.formType == 'add' || this.formType == 'copy') {
            this.dialog.dataService
              .save((opt: RequestOption) => {
                opt.methodName = 'AddAsync';
                opt.className = 'CashPaymentsBusiness';
                opt.assemblyName = 'AC';
                opt.service = 'AC';
                opt.data = [
                  this.cashpayment,
                  this.cashpaymentline,
                  this.settledInvoices,
                ];
                return true;
              })
              .subscribe((res) => {
                if (res.save) {
                  this.dialog.close();
                  this.dt.detectChanges();
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
                if (res.save) {
                  if (this.cashpayment.subType === '1') {
                    this.acService
                    .addData('AC', 'CashPaymentsLinesBusiness', 'UpdateAsync', [
                      this.cashpaymentline,
                      this.cashpaymentlineDelete,
                    ])
                    .subscribe();
                  }
                  if (this.cashpayment.subType === '2') {
                    this.acService
                      .addData('AC', 'VoucherLineRefsBusiness', 'UpdateAsync', [
                        this.cashpaymentline,
                        this.settledInvoicesDelete,
                      ])
                      .subscribe();
                  }
                  this.dialog.close({
                    update: true,
                    data: this.cashpayment,
                  });
                  this.dt.detectChanges();
                }
              });
          }
        }
      );
    }
  }

  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.modegrid == 1) {
        this.cashpaymentline = this.gridCashPaymentLine.dataSource;
      }
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'CashPaymentsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [
            this.cashpayment,
            this.cashpaymentline,
            this.settledInvoices,
          ];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
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

  checkValidate(ignoredFields: string[] = []) {
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

  setReason(field, text, idx) {
    if (!this.reason.some((x) => x.field == field)) {
      let transText = new Reason();
      transText.field = field;
      transText.value = text;
      transText.index = idx;
      this.reason.push(transText);
    } else {
      let iTrans = this.reason.find((x) => x.field == field);
      if (iTrans) iTrans.value = text;
    }

    this.cashpayment.memo = this.acService.setMemo(
      this.cashpayment,
      this.reason
    );
    this.form.formGroup.patchValue(this.cashpayment);
  }

  setVoucherRef(datas: Array<any> = []) {
    const t = this;
    datas.forEach((e, i) => {
      let data = { ...this.gridSettledInvoices.formGroup.value };

      Object.keys(e).forEach((key) => {
        data[key] = e[key];
      });

      data.transID = t.cashpayment.recID;
      data.lineType = t.cashpayment.subType;
      data.settledID = Util.uid();
      data.lineID = e.recID;
      data.recID = Util.uid();
      data['rowNo'] = i;

      let exits = this.settledInvoices.findIndex((x) => x.recID == e.recID);

      if (exits > -1) this.settledInvoices[exits] = data;
      else this.settledInvoices.push(data);
    });

    this.gridSettledInvoices.gridRef.refresh();
  }

  clearCashpayment() {
    this.cashpaymentline = [];
    this.cashpaymentlineDelete = [];
    //this.vettledInvoicesDelete = [];
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

  loadFuncid() {
    switch (this.dialog.formModel.funcID) {
      case 'ACT0410':
        this.loadvll('AC091');
        break;
      case 'ACT0429':
        this.loadvll('AC092');
        break;
    }
  }

  loadvll(vll) {
    this.cache.valueList(vll).subscribe((res) => {
      if (res.datas) {
        this.vllCashbook = res.datas[0];
        this.cashpayment.category = this.vllCashbook.value;
        if (this.formType == 'add') {
          (
            this.cashBook.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cashBook.crrValue = null;
          this.cashpayment.cashBookID = null;
          this.form.formGroup.patchValue(this.cashpayment);
        }
      }
    });
  }

  loadReason() {
    this.api
      .exec<any>('AC', 'CommonBusiness', 'LoadReason', [
        '1',
        this.reason,
        this.cashpayment,
      ])
      .subscribe((res) => {
        if (res) {
          this.reason = res;
        }
      });
  }
  //#endregion
}
