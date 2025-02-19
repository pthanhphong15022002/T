import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CodxFormComponent,
  CodxGridviewV2Component,
  FormModel,
  Util,
  CacheService,
  SortModel,
  UIComponent,
  DataRequest,
  NotificationsService,
} from 'codx-core';
import { AnimationModel, ProgressBar } from '@syncfusion/ej2-angular-progressbar';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmSettledInvoices } from 'projects/codx-ac/src/lib/codx-ac.service';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'lib-settledinvoices-add',
  templateUrl: './settledinvoices-add.component.html',
  styleUrls: ['./settledinvoices-add.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class SettledInvoicesAdd extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  master: any;
  line:any;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  invoiceDueDate: any;
  fmSettledInvoices:any = fmSettledInvoices;
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  subInvoices: Array<any> = [];
  predicates: string;
  dataValues: string;
  objectName:any;
  objectID:any;
  objectType:any;
  accountID:any;
  isDblCLick: boolean = false;
  dataFilter:any = {};
  selectRow:any=[];
  typePay:any;
  baseCurr:any;
  isPreventLoad:any = false;
  mode:any;
  service:any;
  entityNameMaster:any;
  entityNameLine:any;
  selectionOptions:SelectionSettingsModel = {checkboxOnly:true, type: 'Multiple' };
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.master = dialogData.data?.master;
    this.line = dialogData.data?.line;
    this.mode = dialogData.data?.mode;
    this.service = dialogData.data?.service;
    this.entityNameMaster = dialogData.data?.entityNameMaster;
    this.entityNameLine = dialogData.data?.entityNameLine;
    this.typePay = this.master.totalAmt == 0 ? 0 : 1;
    this.gridModel.page = 1;
    if (this.line) {
      this.objectName = this.line.objectName;
      this.objectID = this.line.objectID;
      this.objectType = this.line.objectType;
      this.accountID = this.line.accountID;
    }else{
      this.objectName = this.master.objectName;
      this.objectID = this.master.objectID;
      this.objectType = this.master.objectType;
    }
    let options = new DataRequest();
    options.entityName = 'AC_SubObjects';
    options.pageLoading = false;
    options.predicates = 'ObjectID=@0 and ObjectType=@1';
    options.dataValues = `${this.objectID};${this.objectType}`;
    this.api
      .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? [])).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.objectName = res[0].objectName;
        }
      })
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%'); 
    this.setDefault();
    this.loadData(this.typePay);
  }

  ngAfterViewInit() {
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr;
        }
      });
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  beforeInitGrid(eleGrid:CodxGridviewV2Component){
    this.settingFormatGridSettledInvoices(eleGrid);
    let hideFields = [];
    if (this.master.currencyID == this.baseCurr) {
      hideFields.push('BalAmt2');
      hideFields.push('SettledAmt2');
      hideFields.push('CashDisc2');
    }
    eleGrid.showHideColumns(hideFields);
  }

  /**
   * *Hàm set data default
   */
  setDefault(){
    this.mapPredicates.set('currencyID', 'CurrencyID = @0');
    this.mapDataValues.set('currencyID', this.master.currencyID);
    
    if(this.mode == '1'){
      this.mapPredicates.set('balAmt', 'BalAmt > @0');
      this.mapDataValues.set('balAmt', '0');
    }else{
      this.mapPredicates.set('balAmt', 'BalAmt != @0');
      this.mapDataValues.set('balAmt', '0');
    }
    
    this.mapPredicates.set('objectID', 'ObjectID = @0');
    this.mapDataValues.set('objectID', this.objectID);
    this.mapPredicates.set('objectType', 'ObjectType = @0');
    this.mapDataValues.set('objectType', this.objectType);
    if(this.accountID){
      this.mapPredicates.set('accountID', 'AccountID = @0');
      this.mapDataValues.set('accountID', this.accountID);
    }
    this.dataFilter.currencyID = this.master.currencyID;
    this.dataFilter.payAmt = this.master.totalAmt;
    this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
  }
  //#endregion Init

  //#region Event
  /**
   * *Hàm chọn dòng
   * @param e 
   * @returns 
   */
  onSelected(event) {
    if(this.grid.editSelectedItem) return;
    if (event) {
      let data = event;
      if (data?.settledAmt != 0) return;
      this.api.exec('AC', 'SettledInvoicesBusiness', 'AutoPayOnLineAsync', [
        [data],
        this.dataFilter?.accountID ? this.dataFilter.accountID : '',
        this.objectID,
        this.objectType,
        this.master.journalType,
        this.master.voucherDate,
        this.master.currencyID,
        this.master.exchangeRate
      ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res.length) {
          res.reduce((pre, data) => { 
            this.grid.gridRef.setCellValue(data.recID,'settledAmt',data.settledAmt);
            this.grid.gridRef.setCellValue(data.recID,'settledAmt2',data.settledAmt2);
            this.grid.gridRef.setCellValue(data.recID,'cashDisc',data.cashDisc);
            this.grid.gridRef.setCellValue(data.recID,'cashDisc2',data.cashDisc2);
          }, {});
        }
      }) 
    }
  }

  /**
   * *Hàm bỏ chọn dòng || bỏ chọn tất cả
   * @param e 
   */
  onDeselected(event:any){
    let arrdata = [];
    if(!event.target) return;
    if(event && !event?.data.length){
      let data = event?.data;
      if(data.isEdit) return;
      this.grid.gridRef.setCellValue(data?.recID, 'settledAmt', 0);
      this.grid.gridRef.setCellValue(data?.recID, 'settledAmt2', 0);
      this.grid.gridRef.setCellValue(data?.recID, 'cashDisc', 0);
      this.grid.gridRef.setCellValue(data?.recID, 'cashDisc2', 0);
      return;
    } 
    arrdata = event?.data;
    arrdata.reduce((pre, data) => { 
      if (!data.isEdit) {
        this.grid.gridRef.setCellValue(data.recID, 'settledAmt', 0);
        this.grid.gridRef.setCellValue(data.recID, 'settledAmt2', 0);
        this.grid.gridRef.setCellValue(data.recID, 'cashDisc', 0);
        this.grid.gridRef.setCellValue(data.recID, 'cashDisc2', 0);
      }
    }, this.subInvoices);
    this.grid.arrSelectedRows = [];
    this.detectorRef.detectChanges();
  }

  onCheckAll(event:any){
    if (event) {
      if(!event?.checked) return;
      if(event?.checked && event.target.closest('.e-checkselectall') != null){
        this.api.exec('AC', 'SettledInvoicesBusiness', 'AutoPayOnLineAsync', [
          this.grid.arrSelectedRows,
          this.dataFilter?.accountID ? this.dataFilter.accountID : '',
          this.objectID,
          this.objectType,
          this.master.journalType,
          this.master.voucherDate,
          this.master.currencyID,
          this.master.exchangeRate
        ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
          if (res.length) {
            res.reduce((pre, data) => { 
              let index = this.subInvoices.findIndex(x => x.recID == data.recID);
              if (index > -1) {
                if (!this.subInvoices[index].isEdit) {
                  this.grid.gridRef.setCellValue(data.recID, 'settledAmt', data.settledAmt);
                  this.grid.gridRef.setCellValue(data.recID, 'settledAmt2', data.settledAmt2);
                  this.grid.gridRef.setCellValue(data.recID, 'cashDisc', data.cashDisc);
                  this.grid.gridRef.setCellValue(data.recID, 'cashDisc2', data.cashDisc2);
                }
              }
            }, {});
          }
        }) 
      }
    }
  }

  onEdit(event:any){
    let index = this.subInvoices.findIndex(x => x.recID == event.recID);
    if(index > -1){
      if(event.settledAmt != 0) 
        event.isEdit = true;
      else
        delete event.isEdit;
      this.subInvoices[index] = event;
      this.detectorRef.detectChanges();
    }
  }

  /**
   * *Hàm valuechange
   * @param e 
   */
  valueChange(e: any) {
    let field = e.field;
    if (!e.data || typeof e.data === 'undefined') {
      this.mapPredicates.delete(field);
      this.mapDataValues.delete(field);
      if(e.field.toLowerCase() == 'payamt') this.dataFilter.payAmt = 0;
      return;
    }
    switch(e.field.toLowerCase()){
      case 'vouchertype':
        this.dataFilter.voucherType = e.data; 
        if (e.data == '1') {
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
        }else{
          this.mapPredicates.set('voucherType', 'InvoiceDueDate >=@0');
        }
        this.setDate();
        break;
      case 'date':
        if (this.mapPredicates.has('voucherType') && e.data) {
          this.dataFilter.date = e.data;
          this.setDate(e.data);
        }
        break;
      case 'accountid':
        this.dataFilter.accountid = e.data;
        this.mapPredicates.set('accountID', 'AccountID = @0');
        this.mapDataValues.set('accountID', e.data);
        this.accountID = e.data;
        this.detectorRef.detectChanges();
        break;
      case 'invoiceduedate':
        this.dataFilter.invoiceDueDate = e.data.toDate;
        this.mapPredicates.set('invoiceDueDate', 'InvoiceDueDate = @0');
        this.mapDataValues.set('invoiceDueDate',new Date(e.data.toDate).toISOString());
        break;
      case 'paytype':
        this.gridModel.sort = [];
        if(e.data == '2') this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
        if(e.data == '3') this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'desc' }];
        if(e.data == '4') this.gridModel.sort = [{ field: 'BalAmt', dir: 'asc' },{ field: 'InvoiceDueDate', dir: 'asc' }];
        if(e.data == '5') this.gridModel.sort = [{ field: 'BalAmt', dir: 'desc' },{ field: 'InvoiceDueDate', dir: 'asc'}];
        break;
      case 'payamt':
        this.dataFilter.payAmt = e.data;
        break;
    }
  }

  valueChangeLine(event:any){
    let oLine = event.data;
    this.grid.startProcess();
    switch (event.field.toLowerCase()) {
      case 'settledamt':
        this.api.exec('AC', 'SettledInvoicesBusiness', 'ValueChangedAsync', [
          event.field,
          oLine,
          this.master.voucherDate,
          this.master.currencyID,
          this.master.exchangeRate
        ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
          if (res) {
            this.grid.gridRef.setCellValue(res?.recID, 'settledAmt', res?.settledAmt);
            this.grid.gridRef.setCellValue(res?.recID, 'settledAmt2', res?.settledAmt2);
            this.grid.gridRef.setCellValue(res?.recID, 'cashDisc', res?.cashDisc);
            this.grid.gridRef.setCellValue(res?.recID, 'cashDisc2', res?.cashDisc2);
            this.grid.endProcess();
          }
        }) 
        break;
    }
  }

  /**
   * *Hàm xử lí click chọn hóa đơn
   */
  apply() {
    if (this.mode === '2') {
      let total = this.grid.arrSelectedRows.reduce((sum, data:any) => sum + data?.balAmt,0);
      if (total > 0) {
        this.notification.notify('Tổng hóa đơn chưa bằng 0','2');
        return;
      }
    }
    this.api
      .exec('AC', 'SettledInvoicesBusiness', 'SaveListAsync', [
        'AC',
        this.entityNameMaster,
        this.entityNameLine,
        this.master,
        this.line,
        this.grid.arrSelectedRows,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.dialog.close(true);
        }
      });
  }

  /**
   * *Hàm đóng form
   */
  close() {
    this.onDestroy();
    this.dialog.close();
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm set predicate
   * @param type 
   */
  getDataSubInvoice(type:number) {
    if (type == 1) {
      if (this.dataFilter.payAmt == 0) {
        this.notification.notifyCode('E0510',0);
        return;
      }
    }
    this.loadData(type);
  }

  /**
   * *Hàm set date predicate
   * @param day 
   */
  setDate(day?: any) {
    let date;
    if(this.dataFilter?.invoiceDueDate){
      date = new Date(this.dataFilter?.invoiceDueDate);
    }else{
      date = new Date();
    }
    let aDate = (date as any).addDays(day || 0);
    this.mapDataValues.set('date', aDate.toISOString());
  }

  /**
   * *Hàm load lọc dữ liệu
   * @param type 
   */
  loadData(type) {
    this.typePay = type;
    let predicates = Array.from(
      this.mapPredicates,
      ([name, value]) => value
    ).join('|');
    let dataValues = Array.from(
      this.mapDataValues,
      ([name, value]) => value
    ).join('|');

    this.gridModel.predicates = predicates;
    this.gridModel.dataValues = dataValues;
    this.gridModel.entityName = 'AC_SubInvoices';
    this.api.exec('AC', 'SettledInvoicesBusiness', 'LoadSettledAsync', [
      this.gridModel,
      this.dataFilter?.accountID ? this.dataFilter.accountID : '',
      this.objectID,
      this.objectType,
      this.master.journalType,
      this.master.voucherDate,
      this.master.currencyID,
      this.master.exchangeRate,
      this.dataFilter.payAmt,
      type,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any) =>{
      if (res && res.length) {
        if (res[0].length > 0) {
          this.subInvoices = res[0];
          this.selectRow = res[2];
          this.isPreventLoad = true;
          this.detectorRef.detectChanges();
        }else{
          this.notification.notifyCode('AC0027');
        }    
      }
    })
  }

  onAction(event: any) {
    switch (event.type) {
      case 'refresh':
        if (this.typePay == 1) {
          this.grid.gridRef?.selectRows(this.selectRow);
        }
        if(this.isPreventLoad){
          this.isPreventLoad = false;
          return;
        }
        break;
    }
  }

  settingFormatGridSettledInvoices(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.master.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('balAmt','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('balAmt2','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt2','n'+(setting.dBaseCurr || 0));
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('balAmt','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('balAmt2','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('settledAmt','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt2','n'+(setting.dBaseCurr || 0));
    }
  }
  //#endregion Function
}
