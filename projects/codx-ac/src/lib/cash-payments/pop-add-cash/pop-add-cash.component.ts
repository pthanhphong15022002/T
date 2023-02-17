import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashPayment } from '../../models/CashPayment.model';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';


@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css']
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
  cashpayment:CashPayment;
  formType:any;
  cbxObjectID:any;
  refValue:any;
  voucherNo:any;
  objectType:any;
  voucherDate:any;
  objectID:any;
  cashBookID:any;
  currencyID:any;
  exchangeRate:any;
  gridViewSetup:any;
  cashbookName:any;
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
  data:any;
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ]
  tabItem:any = [
    { text: "Thông tin chứng từ", 'iconCss': 'icon-info' },
    { text: "Chi tiết bút toán", 'iconCss': 'icon-playlist_add_check' },
  ]
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
    this.data =null;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.voucherNo ='';
    this.objectType ='';
    this.voucherDate = null;
    this.objectID = '';
    this.cashBookID = '';
    this.currencyID = '';
    this.exchangeRate = null;
    this.cashpayment = dialog.dataService!.dataSelected;
    this.cache.gridViewSetup('CashPayments', 'grvCashPayments').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (this.cashpayment.voucherNo != null) {
      this.voucherNo = this.cashpayment.voucherNo;
      this.objectType = this.cashpayment.objectType;
      this.voucherDate = this.cashpayment.voucherDate;
      this.objectID = this.cashpayment.objectID;
      this.cashBookID = this.cashpayment.cashBookID;
      this.currencyID = this.cashpayment.currencyID;
      this.exchangeRate = this.cashpayment.exchangeRate;
//#region load combobox đối tượng
      switch(this.objectType){
        case '1':
          this.cbxObjectID = 'Customers';
        break;
        case '2':
          this.cbxObjectID = 'VendorsAC';
        break;
        case '3':
          this.cbxObjectID = 'EmployeesAC';
        break;
        case '4':
          this.cbxObjectID = 'BanksAC';
        break;
        case '5':
          this.cbxObjectID = 'BusinessUnits';
        break;
        case '6':
          this.cbxObjectID = 'Warehouses';;
        break;
      }
//#endregion
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
  //#endregion
  
  //#region Init

  onInit(): void {
    if (this.voucherDate == null) {
      this.voucherDate = new Date();
    }
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion
  
  //#region Event

  valueChangeObjectType(e: any) {
      switch(e.data){
        case '1':
          this.cbxObjectID = 'Customers';
        break;
        case '2':
          this.cbxObjectID = 'VendorsAC';
        break;
        case '3':
          this.cbxObjectID = 'EmployeesAC';
        break;
        case '4':
          this.cbxObjectID = 'BanksAC';
        break;
        case '5':
          this.cbxObjectID = 'BusinessUnits';
        break;
        case '6':
          this.cbxObjectID = 'Warehouses';;
        break;
      }
    this.objectType = e.data;
    this.cashpayment[e.field] = e.data;
  }
  valueChangeDate(e: any){
    this.cashpayment[e.field] = e.data.fromDate;
    this.voucherDate = e.data.fromDate;
  }
  valueChangeCashBookID(e: any){
    this.cashBookID = e.data;
    this.cashpayment[e.field] = e.data;
    this.getvalueNameCashBook(this.cashBookID);
  }
  valueChangeCurrency(e: any){
    this.currencyID = e.data;
    this.cashpayment[e.field] = e.data;
  }
  valueChangeExchangeRate(e: any){
    this.exchangeRate = e.data;
    this.cashpayment[e.field] = e.data;
  }
  valueChangeObjectID(e: any){
    this.objectID = e.data;
    this.cashpayment[e.field] = e.data;
  }
  valueChangeVoucherNo(e: any){
    this.voucherNo = e.data;
    this.cashpayment[e.field] = e.data;
  }
  cellChanged(e:any){
    this.cashpaymentline[e.field] = e.value;
    this.data = JSON.stringify(this.cashpaymentline);
  }
  valueChange(e:any,type:any){
    this.cashpayment[e.field] = e.data;
  }
  getvalueNameCashBook(data:any){
    
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
  deleteRow(data){
    this.cashpaymentlineDelete.push(data);
    this.grid.deleteRow();
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
    }
  }
  //#endregion

  //#region CRUD
  onSave(){
  if (this.cashBookID.trim() == '' || this.cashBookID == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['CashBookID'].headerText + '"'
    );
    return;
  }
  if (this.currencyID.trim() == '' || this.currencyID == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['CurrencyID'].headerText + '"'
    );
    return;
  }
  if (this.exchangeRate == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['ExchangeRate'].headerText + '"'
    );
    return;
  }
  if (this.voucherNo.trim() == '' || this.voucherNo == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['VoucherNo'].headerText + '"'
    );
    return;
  }
  if (this.objectType.trim() == '' || this.objectType == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['ObjectType'].headerText + '"'
    );
    return;
  }
  if (this.objectID.trim() == '' || this.objectID == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['ObjectID'].headerText + '"'
    );
    return;
  }
  if (this.voucherDate == null) {
    this.notification.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['VoucherDate'].headerText + '"'
    );
    return;
  }
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
              .addData('ERM.Business.AC', 'CashPaymentsLinesBusiness', 'AddAsync', this.cashpaymentline)
              .subscribe((res) => {
              });
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
              .addData('ERM.Business.AC', 'CashPaymentsLinesBusiness', 'UpdateAsync', [this.cashpaymentline,this.cashpaymentlineDelete])
              .subscribe((res) => {
              });
              this.dialog.close();
              this.dt.detectChanges();
        } else {
        }
      });
  }
}
//#endregion
}
