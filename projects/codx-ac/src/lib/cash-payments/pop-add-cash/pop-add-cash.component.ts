import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
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
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  cashpayment: CashPayment;
  formType: any;
  objectType: any;
  voucherDate: any;
  gridViewSetup: any;
  cashbookName: any;
  validate: any = 0;
  cashpaymentline: Array<CashPaymentLine> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
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
  data: any;
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = null;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.objectType = null;
    this.voucherDate = null;
    this.cashpayment = dialog.dataService!.dataSelected;
    this.cache
      .gridViewSetup('CashPayments', 'grvCashPayments')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.cashpayment.voucherNo != null) {
      this.objectType = this.cashpayment.objectType;
      this.voucherDate = this.cashpayment.voucherDate;
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
      this.acService
        .loadData('ERM.Business.AC', 'CashBookBusiness', 'LoadDataAsync', [])
        .subscribe((res: any) => {
          res.forEach((element) => {
            if (element.cashBookID == this.cashpayment.cashBookID) {
              this.cashbookName = element.cashBookName;
            }
          });
        });
      //#endregion
    }
  }
  //#endregion

  //#region Init

  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
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
  valueChangeObjectType(e: any) {
    this.cashpayment.objectID = '';
    this.objectType = e.data;
    this.cashpayment[e.field] = e.data;
    this.cashpaymentline = [];
  }
  valueChangeDate(e: any) {
    this.cashpayment[e.field] = e.data.fromDate;
    this.voucherDate = e.data.fromDate;
  }
  valueChangeCashBookID(e: any) {
    this.cashpayment[e.field] = e.data;
    this.getvalueNameCashBook(e.data);
  }
  cellChanged(e: any) {
    this.cashpaymentline[e.field] = e.value;
    this.data = JSON.stringify(this.cashpaymentline);
  }
  valueChange(e: any) {
    this.cashpayment[e.field] = e.data;
  }
  getvalueNameCashBook(data: any) {
    this.acService
      .loadData('ERM.Business.AC', 'CashBookBusiness', 'LoadDataAsync', [])
      .subscribe((res: any) => {
        res.forEach((element) => {
          if (element.cashBookID == data) {
            this.cashbookName = element.cashBookName;
          }
        });
      });
  }
  //#endregion

  //#region Function
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }
  addRow() {
    let idx = this.grid.dataSource.length;
    let data = this.grid.formGroup.value;
    data.recID = Util.uid();
    data.write = true;
    data.delete = true;
    data.read = true;
    data.dr = 0;
    data.rowNo = idx + 1;
    data.transID = this.cashpayment.recID;
    this.grid.addRow(data, idx);
  }
  deleteRow(data) {
    this.cashpaymentlineDelete.push(data);
    this.grid.deleteRow();
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
              this.cashpayment[keymodel[i]] == ''
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
    this.cashbookName = '';
    this.objectType = null;
    this.data = null;
    this.cashpaymentline = [];
    this.voucherDate = new Date();
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashpaymentline = this.data;
      if (this.formType == 'add') {
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
                  this.cashpaymentline
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
      this.cashpaymentline = this.data;
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
                this.cashpaymentline
              )
              .subscribe((res) => {
                if (res) {
                  this.clearCashpayment();
                  this.dialog.dataService.clear();
                  this.dialog.dataService.addNew().subscribe((res) => {
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
}
