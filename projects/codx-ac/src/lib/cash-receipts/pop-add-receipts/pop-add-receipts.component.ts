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
import {
  CacheService,
  CallFuncService,
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
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashReceipts } from '../../models/CashReceipts.model';
import { CashReceiptsLines } from '../../models/CashReceiptsLines.model';
import { Transactiontext } from '../../models/transactiontext.model';
import { PopAddLinereceiptsComponent } from '../pop-add-linereceipts/pop-add-linereceipts.component';

@Component({
  selector: 'lib-pop-add-receipts',
  templateUrl: './pop-add-receipts.component.html',
  styleUrls: ['./pop-add-receipts.component.css'],
})
export class PopAddReceiptsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  headerText: string;
  formModel: FormModel;
  cashreceipts: CashReceipts;
  cashreceiptslines: Array<CashReceiptsLines> = [];
  cashreceiptslinesDelete: Array<CashReceiptsLines> = [];
  transactiontext: Array<Transactiontext> = [];
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
  keymodel: any;
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
  page:any = 1;
  pageSize = 5;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
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
    this.cashreceipts = dialog.dataService!.dataSelected;
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
            }
            this.cashreceiptslines = res;
            this.pageCount = '(' + this.cashreceiptslines.length + ')';
            this.cashreceiptslines.forEach((element) => {
              this.total = this.total + element.dr;
            });
            this.total = this.total.toLocaleString('it-IT', {
              style: 'currency',
              currency: 'VND',
            });
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
    this.form.formGroup.patchValue(this.cashreceipts);
    if (this.formType == 'add') {
      this.total = this.total.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
      this.pageCount = '(' + this.cashreceiptslines.length + ')';
    }
  }
  //#endregion

  //#region Event
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
    }
  }

  valueChange(e: any) {
    let field = e.field.toLowerCase();
    if (field === 'voucherdate' && e.data) this.cashreceipts[e.field] = e.data;
    else this.cashreceipts[e.field] = e.data;
    let sArray = [
      'currencyid',
      'voucherdate',
      'cashbookid',
      'journalno',
      'transactiontext',
      'objectid',
    ];

    if (e.data && sArray.includes(field)) {
      if (field === 'objectid') {
        let data = e.component.itemsSelected[0];
        this.cashreceipts.objectType = data.ObjectType;
        this.cashreceipts.payor = data['ObjectName'];
        this.setTransaction('payee', data['ObjectName'], 1);
      }

      this.api
        .exec<any>('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
          e.field,
          this.cashreceipts,
        ])
        .subscribe((res) => {
          if (res) {
            this.cashreceipts = res;
            this.form.formGroup.patchValue(this.cashreceipts);
          }
        });
    }

    if (e.data && field === 'bankaccount') {
      this.api
        .exec<any>(
          'BS',
          'BankAccountsBusiness',
          'GetAsync',
          this.cashreceipts.bankAccount
        )
        .subscribe((res) => {
          if (res) {
            this.cashreceipts.bankAcctNo = res.bankAcctNo;
            this.cashreceipts.bankID = res.bankID;
            this.form.formGroup.patchValue(this.cashreceipts);
          }
        });
    }

    if (field === 'transactiontext' || field === 'payee') {
      let idx = 0;
      let text = e?.component?.itemsSelected[0]?.TextName;

      if (field === 'payee') {
        idx = 1;
        text = e.data;
      }

      this.setTransaction(field, text, idx);
    }
  }

  cellChanged(e: any) {
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
      case 0:
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
      case 1:
        if (this.cashreceipts.voucherType == '1') {
          let idx = this.grid.dataSource.length;
          let data = this.grid.formGroup.value;
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
                this.grid.addRow(res, idx);
              }
            });
        }
        break;
    }
  }

  editRow(data) {
    switch (this.modegrid) {
      case 0:
        let index = this.cashreceiptslines.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          type: 'edit',
          formType: this.formType
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
              dialogs.closed.subscribe((x) => {
                var dataline = JSON.parse(localStorage.getItem('dataline'));
                if (dataline != null) {
                  this.cashreceiptslines[index] = dataline;
                  this.loadTotal();
                  this.notification.notifyCode('SYS007', 0, '');
                }
                window.localStorage.removeItem('dataline');
              });
            }
          });
        break;
    }
  }

  deleteRow(data) {
    switch (this.modegrid) {
      case 0:
        let index = this.cashreceiptslines.findIndex(
          (x) => x.recID == data.recID
        );
        this.cashreceiptslines.splice(index, 1);
        if (this.cashreceiptslines.length > 0) {
          for (let i = 0; i < this.cashreceiptslines.length; i++) {
            this.cashreceiptslines[i].rowNo = i + 1;
          }
        }
        this.api
          .exec('AC', 'CashReceiptsLinesBusiness', 'DeleteLineAsync', [
            data.recID,
            this.cashreceiptslines,
          ])
          .subscribe((res: any) => {});
        this.notification.notifyCode('SYS008', 0, '');
        this.pageCount = '(' + this.cashreceiptslines.length + ')';
        this.loadTotal();
        break;
    }
    this.cashreceiptslinesDelete.push(data);
    this.grid.deleteRow();
  }
  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: data,
      type: 'add',
      formType: this.formType,
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
          dialogs.closed.subscribe((x) => {
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
  checkValidate() {
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
  }
  close() {
    this.dialog.close();
  }
  searchName(e) {
    var filter, table, tr, td, i, txtValue, mySearch, myBtn;
    filter = e.toUpperCase();
    table = document.getElementById('myTable');
    tr = table.getElementsByTagName('tr');
    if (String(e).match(/^ *$/) !== null) {
      myBtn = document.getElementById('myBtn');
      myBtn.style.display = 'block';
      mySearch = document.getElementById('mySearch');
      mySearch.style.display = 'none';
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[2];
        if (td) {
          txtValue = td.textContent || td.innerText;
          tr[i].style.display = '';
        }
      }
    } else {
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[2];
        if (td) {
          txtValue = td.textContent || td.innerText;
          myBtn = document.getElementById('myBtn');
          myBtn.style.display = 'none';
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = '';
            mySearch = document.getElementById('mySearch');
            mySearch.style.display = 'none';
          } else {
            tr[i].style.display = 'none';
            mySearch = document.getElementById('mySearch');
            mySearch.style.display = 'block';
          }
        }
      }
    }
  }
  loadTotal() {
    var totals = 0;
    this.cashreceiptslines.forEach((element) => {
      totals = totals + element.dr;
      this.total = totals.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
    });
    if (this.cashreceiptslines.length == 0) {
      this.total = totals.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
    }
  }

  changeType(e: any) {}
  //#endregion

  //#region Method
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashreceiptslines = this.grid.dataSource;
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
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        if (this.modegrid == 1) this.cashreceiptslines = this.grid.dataSource;
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
            opt.className = 'CashReceiptsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.cashreceipts];
            return true;
          })
          .subscribe((res) => {
            if (res != null) {
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
    }
  }
  //#endregion

  //#region Function
  setTransaction(field, text, idx) {
    if (!this.transactiontext.some((x) => x.field == field)) {
      let transText = new Transactiontext();
      transText.field = field;
      transText.value = text;
      transText.index = idx;
      this.transactiontext.push(transText);
    } else {
      let iTrans = this.transactiontext.find((x) => x.field == field);
      if (iTrans) iTrans.value = text;
    }

    this.cashreceipts.memo = this.acService.setMemo(
      this.cashreceipts,
      this.transactiontext
    );
    this.form.formGroup.patchValue(this.cashreceipts);
  }

  clearCashpayment() {
    this.cashreceiptslines = [];
    this.cashreceiptslinesDelete = [];
    // this.voucherLineRefsDelete = [];
    this.transactiontext = [];
  }
  //#endregion
}
