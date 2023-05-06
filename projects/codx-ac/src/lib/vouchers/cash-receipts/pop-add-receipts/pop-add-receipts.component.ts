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
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { PopAddLinereceiptsComponent } from '../pop-add-linereceipts/pop-add-linereceipts.component';
import { Observable } from 'rxjs';
import { CashReceipts } from '../../../models/CashReceipts.model';
import { CashReceiptsLines } from '../../../models/CashReceiptsLines.model';
import { Reason } from '../../../models/Reason.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';

@Component({
  selector: 'lib-pop-add-receipts',
  templateUrl: './pop-add-receipts.component.html',
  styleUrls: ['./pop-add-receipts.component.css'],
})
export class PopAddReceiptsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridCashreceiptsLines')
  public gridCashreceiptsLines: CodxGridviewV2Component;
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
  cashreceipts: CashReceipts;
  cashreceiptslines: Array<CashReceiptsLines> = [];
  cashreceiptslinesDelete: Array<CashReceiptsLines> = [];
  settledInvoices: Array<any> = [];
  settledInvoicesDelete: Array<any> = [];
  reason: Array<Reason> = [];
  moreFunction: any;
  dialog!: DialogRef;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  modegrid: any = 0;
  total: any = 0;
  gridHeight: any;
  parentID: string;
  pageCount: any;
  columnGrids = [];
  lockFields = [];
  keymodel: any;
  journal: IJournal;
  vllCashbook: any;
  journalNo: string;
  voucherNoPlaceholderText$: Observable<string>;
  fmCashReceiptsLines: FormModel = {
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
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  page: any = 1;
  pageSize = 5;
  columnChange: any;
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
    this.cashreceipts = dialog.dataService!.dataSelected;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.api
      .exec<any>('SYS', 'MoreFunctionsBusiness', 'GetAsync', 'ACT041001')
      .subscribe((res) => {
        if (res) this.moreFunction = res;
      });

    if (this.formType == 'edit') {
      if (this.cashreceipts?.voucherNo != null) {
        //#region  load CashReceiptsLines
        this.acService
          .loadData(
            'ERM.Business.AC',
            'CashReceiptsLinesBusiness',
            'LoadDataAsync',
            this.cashreceipts.recID
          )
          .subscribe((res: any) => {
            if (res.length > 0) {
              this.keymodel = Object.keys(res[0]);
              this.cashreceiptslines = res;
              this.pageCount = '(' + this.cashreceiptslines.length + ')';
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
        //#endregion
      }
    }

    if (this.formType == 'add') {
      if (
        this.cashreceipts &&
        this.cashreceipts.unbounds &&
        this.cashreceipts.unbounds.lockFields &&
        this.cashreceipts.unbounds.lockFields.length
      ) {
        this.lockFields = this.cashreceipts.unbounds
          .lockFields as Array<string>;
      }
    }

    this.cache
      .gridViewSetup('CashReceipts', 'grvCashReceipts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache
      .gridViewSetup('CashReceiptsLines', 'grvCashReceiptsLines')
      .subscribe((res) => {
        if (res) {
          var keygrid = Object.keys(res);
          for (let index = 0; index < keygrid.length; index++) {
            if (res[keygrid[index]].isVisible == true) {
              var column = {
                field: res[keygrid[index]].fieldName.toLowerCase(),
                headerText: res[keygrid[index]].headerText,
                columnOrder: res[keygrid[index]].columnOrder,
              };
              this.columnGrids.push(column);
            }
          }
          this.columnGrids = this.columnGrids.sort(
            (a, b) => a.columnOrder - b.columnOrder
          );
        }
      });

    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.cashreceipts.journalNo;
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
    this.form.formGroup.patchValue(this.cashreceipts);
    this.pageCount = '(' + this.cashreceiptslines.length + ')';
    this.loadTotal();
    this.loadFuncid();
    this.loadReason();
  }

  created(e: any, ele: TabComponent) {
    this.changeType(null, ele);
  }

  //#endregion

  //#region Event
  changeType(e?: any, ele?: TabComponent) {
    let i;
    if (e) i = e.data;
    if (!e && this.cashreceipts.subType) i = this.cashreceipts.subType;
    if (!ele) ele = this.tabObj;
    switch (i) {
      case '1':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashreceiptslines = [];
        this.loadFuncid();
        break;
      case '3':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashreceiptslines = [];
        this.loadvll('AC093');
        break;
      default:
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        this.settledInvoices = [];
        break;
    }
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
          if (this.cashreceiptslines.length) {
            this.api
              .exec<any>(
                'AC',
                'CashPaymentsLinesBusiness',
                'ChangeExchangeRateAsync',
                [this.cashreceiptslines, this.cashreceiptslines]
              )
              .subscribe((res) => {
                if (res) {
                  this.gridCashreceiptsLines!.dataSource = res;
                  this.cashreceiptslines = res;
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
          this.cashreceipts.objectType = data['ObjectType'];
          this.cashreceipts.objectName = data['ObjectName'];
          this.setReason(field, data['ObjectName'], 1);
          break;
      }
      if (sArray.includes(field)) {
        this.api
          .exec<any>('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            e.field,
            this.cashreceipts,
          ])
          .subscribe((res) => {
            if (res) {
              this.columnChange = res.updateColumns;
              this.form.formGroup.patchValue(res);
            }
          });
      }
    }
  }

  valuechangePayor(e: any) {
    let text;
    if (e.crrValue) {
      text = e.crrValue;
      this.setReason('payname', text, 2);
    } else {
      let index = this.reason.findIndex((x) => x.field == 'payname');
      if (index > -1) {
        this.reason.splice(index, 1);
      }
      this.cashreceipts.memo = this.acService.setMemo(
        this.cashreceipts,
        this.reason
      );
      this.form.formGroup.patchValue(this.cashreceipts);
    }
  }

  cashreceiptsLinesChange(e: any) {
    if ((e.field === 'dr' || e.field === 'rowNo') && !e.value) {
      e.data[e.field] = 0;
    }

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
        .exec('AC', 'CashReceiptsLinesBusiness', 'ValueChangedAsync', [
          this.cashreceipts,
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res) => {
          if (res) {
            console.log(e);
          }
        });
    }
  }

  settledInvoicesChanged(e: any) {
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
        cashpayment: this.cashreceipts,
      },
      '',
      op
    );

    voucherDialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        this.setSettledInvoices(res.event);
      }
    });
  }

  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120);
  }

  addRow() {
    switch (this.modegrid) {
      case '1':
        if (this.cashreceipts.subType == '1') {
          let idx = this.gridCashreceiptsLines.dataSource.length;
          let data = this.gridCashreceiptsLines.formGroup.value;
          data.recID = Util.uid();
          data.write = true;
          data.delete = true;
          data.read = true;
          data.rowNo = idx + 1;
          data.transID = this.cashreceipts.recID;
          this.api
            .exec<any>('AC', 'CashReceiptsLinesBusiness', 'SetDefaultAsync', [
              this.cashreceipts,
              data,
            ])
            .subscribe((res) => {
              if (res) {
                this.gridCashreceiptsLines.addRow(res, idx);
              }
            });
        }
        break;
      case '2':
        let idx = this.cashreceiptslines.length;
        let data = new CashReceiptsLines();
        this.api
          .exec<any>('AC', 'CashReceiptsLinesBusiness', 'SetDefaultAsync', [
            this.cashreceipts,
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

  editRow(data) {
    switch (this.modegrid) {
      case '1':
        if (this.cashreceipts.subType == '1')
          this.gridCashreceiptsLines.updateRow(data.rowNo, data);
        if (this.cashreceipts.subType == '2')
          this.gridSettledInvoices.updateRow(data.rowNo, data);
        break;
      case '2':
        let index = this.cashreceiptslines.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          type: 'edit',
          journal: this.journal,
          lockFields: this.lockFields,
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'CashReceiptsLines';
        dataModel.gridViewName = 'grvCashReceiptsLines';
        dataModel.entityName = 'AC_CashReceiptsLines';
        opt.FormModel = dataModel;
        this.cache
          .gridViewSetup('CashReceiptsLines', 'grvCashReceiptsLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLinereceiptsComponent,
                '',
                650,
                550,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed.subscribe(() => {
                var dataline = JSON.parse(localStorage.getItem('dataline'));
                if (dataline != null) {
                  this.cashreceiptslines[index] = dataline;
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
        let idx = this.gridCashreceiptsLines.dataSource.length;
        data.rowNo = idx + 1;
        data.recID = Util.uid();
        this.gridCashreceiptsLines.addRow(data, idx);
        break;
      case '2':
        let rowno = this.cashreceiptslines.length;
        data.rowNo = rowno + 1;
        this.openPopupLine(data);
        break;
    }
  }

  deleteRow(data) {
    switch (this.modegrid) {
      case '1':
        if (this.cashreceipts.subType == '1') {
          this.gridCashreceiptsLines.deleteRow(data);
          if (this.gridCashreceiptsLines.dataSource.length > 0) {
            for (
              let i = 0;
              i < this.gridCashreceiptsLines.dataSource.length;
              i++
            ) {
              this.gridCashreceiptsLines.dataSource[i].rowNo = i + 1;
            }
          }
          this.cashreceiptslinesDelete.push(data);
        }
        if (this.cashreceipts.subType == '2') {
          this.gridSettledInvoices.deleteRow(data);
          this.settledInvoicesDelete.push(data);
        }
        break;
      case '2':
        let index = this.cashreceiptslines.findIndex(
          (x) => x.recID == data.recID
        );
        this.cashreceiptslines.splice(index, 1);
        if (this.cashreceiptslines.length > 0) {
          for (let i = 0; i < this.cashreceiptslines.length; i++) {
            this.cashreceiptslines[i].rowNo = i + 1;
          }
        }
        this.cashreceiptslinesDelete.push(data);
        this.pageCount = '(' + this.cashreceiptslines.length + ')';
        this.loadTotal();
        break;
    }
  }

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: data,
      type: 'add',
      journal: this.journal,
      lockFields: this.lockFields,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashReceiptsLines';
    dataModel.gridViewName = 'grvCashReceiptsLines';
    dataModel.entityName = 'AC_CashReceiptsLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CashReceiptsLines', 'grvCashReceiptsLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLinereceiptsComponent,
            '',
            650,
            550,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe(() => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.cashreceiptslines.push(dataline);
              this.keymodel = Object.keys(dataline);
              this.pageCount = '(' + this.cashreceiptslines.length + ')';
              this.loadTotal();
            }
            window.localStorage.removeItem('dataline');
          });
        }
      });
  }
  //#endregion

  //#region Function
  checkValidate(ignoredFields: string[] = []) {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashreceipts);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (
          keygrid[index] === 'CashBookID' &&
          this.form.formModel.funcID === 'ACT0428'
        ) {
          continue;
        }

        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashreceipts[keymodel[i]] === null ||
              String(this.cashreceipts[keymodel[i]]).match(/^ *$/) !== null
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

  setDefault(o) {
    return this.api.exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }

  clearCashrecipts() {
    this.cashreceiptslines = [];
    this.cashreceiptslines = [];
    this.cashreceiptslinesDelete = [];
    this.settledInvoicesDelete = [];
    this.settledInvoices = [];
    this.reason = [];
  }

  close() {
    this.dialog.close();
  }

  loadTotal() {
    var totals = 0;
    this.cashreceiptslines.forEach((element) => {
      totals = totals + element.dr;
    });
    this.total = totals.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
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
      this.cashreceiptslines = this.gridCashreceiptsLines.dataSource;
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'CashReceiptsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.cashreceipts];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData(
                'ERM.Business.AC',
                'CashReceiptsLinesBusiness',
                'AddAsync',
                [this.cashreceiptslines]
              )
              .subscribe((res) => {
                if (res) {
                  this.clearCashrecipts();
                  this.dialog.dataService.clear();
                  this.dialog.dataService
                    .addNew((o) => this.setDefault(o))
                    .subscribe((res) => {
                      this.form.formGroup.patchValue(res);
                      this.cashreceipts = this.dialog.dataService!.dataSelected;
                    });
                }
              });
          } else {
          }
        });
    }
  }

  onSave() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields = [];
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
        this.cashreceipts,
        'AC',
        'AC_CashReceipts',
        this.form,
        this.formType === 'edit',
        () => {
          if (this.formType == 'add' || this.formType == 'copy') {
            if (this.modegrid == 1)
              this.cashreceiptslines = this.gridCashreceiptsLines.dataSource;
            this.dialog.dataService
              .save((opt: RequestOption) => {
                opt.methodName = 'AddAsync';
                opt.className = 'CashReceiptsBusiness';
                opt.assemblyName = 'AC';
                opt.service = 'AC';
                opt.data = [this.cashreceipts];
                return true;
              })
              .subscribe((res) => {
                if (res.save) {
                  this.acService
                    .addData(
                      'ERM.Business.AC',
                      'CashReceiptsLinesBusiness',
                      'AddAsync',
                      [this.cashreceiptslines]
                    )
                    .subscribe((res) => {
                      if (res) {
                        this.dialog.close();
                        this.dt.detectChanges();
                      }
                    });
                } else {
                }
              });
          }
          if (this.formType == 'edit') {
            this.dialog.dataService
              .save((opt: RequestOption) => {
                opt.methodName = 'UpdateAsync';
                opt.className = 'CashReceiptsBusiness';
                opt.assemblyName = 'AC';
                opt.service = 'AC';
                opt.data = [this.cashreceipts];
                return true;
              })
              .subscribe((res) => {
                if (res.save) {
                  this.acService
                    .addData('AC', 'CashReceiptsLinesBusiness', 'UpdateAsync', [
                      this.cashreceiptslines,
                      this.cashreceiptslinesDelete,
                    ])
                    .subscribe();
                  this.dialog.close({
                    update: true,
                    data: this.cashreceipts,
                  });
                  this.dt.detectChanges();
                } else {
                }
              });
          }
        }
      );
    }
  }
  //#endregion

  //#region Function

  setSettledInvoices(datas: Array<any> = []) {
    const t = this;
    datas.forEach((e, i) => {
      let data = { ...this.gridSettledInvoices.formGroup.value };

      Object.keys(e).forEach((key) => {
        data[key] = e[key];
      });

      data.transID = t.cashreceipts.recID;
      data.lineType = t.cashreceipts.subType;
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

  setReason(field, text, idx) {
    if (!this.reason.some((x) => x.field == field)) {
      let reason = new Reason();
      reason.field = field;
      reason.value = text;
      reason.index = idx;
      this.reason.push(reason);
    } else {
      let iTrans = this.reason.find((x) => x.field == field);
      if (iTrans) iTrans.value = text;
    }

    this.cashreceipts.memo = this.acService.setMemo(
      this.cashreceipts,
      this.reason
    );
    this.form.formGroup.patchValue(this.cashreceipts);
  }

  clearCashpayment() {
    this.cashreceiptslines = [];
    this.cashreceiptslinesDelete = [];
    // this.voucherLineRefsDelete = [];
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
      case 'ACT0401':
        this.loadvll('AC091');
        break;
      case 'ACT0428':
        this.loadvll('AC092');
        break;
    }
  }

  loadvll(vll) {
    this.cache.valueList(vll).subscribe((res) => {
      if (res.datas) {
        this.vllCashbook = res.datas[0];
        this.cashreceipts.category = this.vllCashbook.value;
        if (this.formType == 'add') {
          (
            this.cashBook.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cashBook.crrValue = null;
          this.cashreceipts.cashBookID = null;
          this.form.formGroup.patchValue(this.cashreceipts);
        }
      }
    });
  }

  loadReason() {
    this.api
      .exec<any>('AC', 'CommonBusiness', 'LoadReason', [
        '2',
        this.reason,
        this.cashreceipts,
      ])
      .subscribe((res) => {
        if (res) {
          this.reason = res;
        }
      });
  }
  //#endregion
}
