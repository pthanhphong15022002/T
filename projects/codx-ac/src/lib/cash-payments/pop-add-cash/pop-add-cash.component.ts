import { VoucherComponent } from './../../popup/voucher/voucher.component';
import { waitForAsync } from '@angular/core/testing';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  PipeTransform,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
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
import { CodxAcService } from '../../codx-ac.service';
import { CashPayment } from '../../models/CashPayment.model';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';
import { Transactiontext } from '../../models/transactiontext.model';
import { PopAddLinecashComponent } from '../pop-add-linecash/pop-add-linecash.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Template } from '@angular/compiler/src/render3/r3_ast';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
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
  modegrid: any = 0;
  columnGrids = [];
  keymodel: any;
  cashpaymentline: Array<CashPaymentLine> = [];
  voucherLineRefs: Array<any> = [];
  voucherLineRefsDelete: Array<any> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
  pageCount: any;
  tab: number = 0;
  total: any = 0;
  data: any;
  transactiontext: Array<Transactiontext> = [];
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
  pageSize = 5;
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private callfunc: CallFuncService,
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
            if (res.length > 0) {
              this.keymodel = Object.keys(res[0]);
            }
            this.cashpaymentline = res;
            this.pageCount = '(' + this.cashpaymentline.length + ')';
            this.cashpaymentline.forEach((element) => {
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
    this.form.formGroup.patchValue(this.cashpayment);
    if (this.formType == 'add') {
      this.total = this.total.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
      this.pageCount = '(' + this.cashpaymentline.length + ')';
    }
  }
  //#endregion

  //#region Event
  close() {
    this.dialog?.close();
  }
  searchName(e) {
    var filter, table, tr, td, i, txtValue, mySearch, myBtn, myPag;
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
    this.cashpaymentline.forEach((element) => {
      totals = totals + element.dr;
      this.total = totals.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
    });
    if (this.cashpaymentline.length == 0) {
      this.total = totals.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      });
    }
  }

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
    this.cashpayment.voucherType = e.data;
  }

  valueChange(e: any) {
    let field = e.field.toLowerCase();
    if (e.data) {
      let sArray = [
        'currencyid',
        'voucherdate',
        'cashbookid',
        'journalno',
        'objectid',
      ];
      if (sArray.includes(field)) {
        if (field === 'objectid') {
          let data = e.component.itemsSelected[0];
          this.cashpayment.objectType = data['ObjectType'];
          this.cashpayment.payee = data['ObjectName'];
          this.setTransaction('payee', data['ObjectName'], 1);
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

      if (field === 'exchangerate')
        this.api
          .exec<any>(
            'AC',
            'CashPaymentsLinesBusiness',
            'ChangeExchangeRateAsync',
            [this.cashpayment, this.cashpaymentline]
          )
          .subscribe((res) => {
            if (res) {
              //this.gridCashPaymentLine.dataSource = res;
              this.cashpaymentline = res;
            }
          });

      if (field === 'bankaccount')
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

  voucherLineRefsCellClick(e: any) {
    if (e.field.toLowerCase() === 'invoiceno') {
      let voucherDialog = this.callfc.openForm(
        VoucherComponent,
        '',
        1000,
        600,
        '',
        e.component.setting,
        ''
      );
    }
  }

  addRow() {
    switch (this.modegrid) {
      case 0:
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
      case 1:
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
        break;
    }
  }

  deleteRow(data) {
    switch (this.modegrid) {
      case 0:
        let index = this.cashpaymentline.findIndex(
          (x) => x.recID == data.recID
        );
        this.cashpaymentline.splice(index, 1);
        if (this.cashpaymentline.length > 0) {
          for (let i = 0; i < this.cashpaymentline.length; i++) {
            this.cashpaymentline[i].rowNo = i + 1;
          }
        }
        this.api
          .exec('AC', 'CashPaymentsLinesBusiness', 'DeleteLineAsync', [
            data.recID,
            this.cashpaymentline,
          ])
          .subscribe((res: any) => {});
        this.notification.notifyCode('SYS008', 0, '');
        this.pageCount = '(' + this.cashpaymentline.length + ')';
        this.loadTotal();
        break;
      case 1:
        if (this.cashpayment.voucherType == '1') {
          this.gridCashPaymentLine.deleteRow(data);
          this.cashpaymentlineDelete.push(data);
        }
        if (this.cashpayment.voucherType == '2') {
          this.gridVoucherLineRefs.deleteRow(data);
          this.voucherLineRefsDelete.push(data);
        }
        break;
    }
  }

  editRow(data) {
    switch (this.modegrid) {
      case 0:
        let index = this.cashpaymentline.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          type: 'edit',
          formType: this.formType,
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
                550,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed.subscribe((x) => {
                var dataline = JSON.parse(localStorage.getItem('dataline'));
                if (dataline != null) {
                  this.cashpaymentline[index] = dataline;
                  this.loadTotal();
                  this.notification.notifyCode('SYS007', 0, '');
                }
                window.localStorage.removeItem('dataline');
              });
            }
          });
        break;
      case 1:
        if (this.cashpayment.voucherType == '1')
          this.gridCashPaymentLine.updateRow(data.rowNo, data);
        if (this.cashpayment.voucherType == '2')
          this.gridVoucherLineRefs.updateRow(data.rowNo, data);
        break;
    }
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

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: data,
      type: 'add',
      formType: this.formType,
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
            550,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((x) => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.cashpaymentline.push(dataline);
              this.keymodel = Object.keys(dataline);
              this.pageCount = '(' + this.cashpaymentline.length + ')';
              this.loadTotal();
            }
            window.localStorage.removeItem('dataline');
          });
        }
      });
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.modegrid == 1) {
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
              this.voucherLineRefs,
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
            if (res != null) {
              if (this.cashpayment.voucherType === '2') {
                this.acService
                  .addData('AC', 'VoucherLineRefsBusiness', 'UpdateAsync', [
                    this.cashpaymentline,
                    this.voucherLineRefsDelete,
                  ])
                  .subscribe();
              }
              this.dialog.close();
              this.dt.detectChanges();
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

    this.cashpayment.memo = this.acService.setMemo(
      this.cashpayment,
      this.transactiontext
    );
    this.form.formGroup.patchValue(this.cashpayment);
  }

  clearCashpayment() {
    this.cashpaymentline = [];
    this.cashpaymentlineDelete = [];
    this.voucherLineRefsDelete = [];
    this.transactiontext = [];
  }
  //#endregion
}
