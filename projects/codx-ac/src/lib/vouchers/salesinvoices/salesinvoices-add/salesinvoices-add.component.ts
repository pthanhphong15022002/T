import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService, fmSalesInvoicesLines, fmVATInvoices } from '../../../codx-ac.service';
import {
  IJournal,
  Vll067,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { Subject, map, takeUntil } from 'rxjs';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { AC_SalesInvoicesLines } from '../../../models/AC_SalesInvoicesLines.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';

@Component({
  selector: 'lib-salesinvoices-add',
  templateUrl: './salesinvoices-add.component.html',
  styleUrls: ['./salesinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesinvoicesAddComponent extends UIComponent{
  //#region Constructor
  @ViewChild('eleGridSalesInvoice') eleGridSalesInvoice: CodxGridviewV2Component;
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component;
  @ViewChild('formSalesInvoice') public formSalesInvoice: CodxFormComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any;
  @ViewChild('eleCbxCurrencyID') eleCbxCurrencyID: any;

  headerText: string; //? tên tiêu đề
  dialog: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  baseCurr: any; //? đồng tiền hạch toán
  taxCurr:any; //? tiền thuế
  hiddenFields: string[] = [];
  fmSalesInvoiceLines:any = fmSalesInvoicesLines
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  isPreventChange:any = false;
  postDateControl:any;
  preData:any;
  editSettings:EditSettingsModel = {
    allowAdding:false,
    allowEditing:false,
    allowDeleting:false,
    allowEditOnDblClick:false,
    allowNextRowEdit:false
  }
  fmVATInvoices:any = fmVATInvoices
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
  }
  //#endregion Constructor

  //#region Init
  
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        takeUntil(this.destroy$),
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res:any)=>{
        if (res) {
          this.taxCurr = res?.TaxCurr;
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit(): void {}

  onAfterInitForm(event) {
    this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm khởi tạo các tab detail khi mở form(ẩn hiện tab theo loại chứng từ)
   * @param event
   * @param eleTab
   */
  createTabDetail(event: any, eleTab: TabComponent) {
    //this.showHideTabDetail(this.formSalesInvoice?.data?.subType, this.elementTabDetail);
  }

  /**
   * *Hàm thiết lập lưới trước khi init
   * @param eleGrid 
   */
  beforeInitGridSalesInvoices(eleGrid:CodxGridviewV2Component){
    let preDIM1 = '';
    let dtvDIM1 = '';
    let preDIM2 = '';
    let dtvDIM2 = '';
    let preDIM3 = '';
    let dtvDIM3 = '';
    let hideFields = [];

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') { //? nếu phòng ban là mặc định hoặc trong danh sách
      preDIM1 = '@0.Contains(ProfitCenterID)';
      dtvDIM1 = `[${this.journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1',preDIM1,dtvDIM1);

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2') { //? nếu TTCP là mặc định hoặc trong danh sách
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${this.journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2',preDIM2,dtvDIM2);

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2') { //? nếu mục phí là mặc định hoặc trong danh sách
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${this.journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3',preDIM3,dtvDIM3);

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }

    if(!this.journal.useDutyTax){ //? không sử dụng thuế xuất nhập khẩu (ẩn)
      hideFields.push('SalesTaxPct');
      hideFields.push('SalesTaxAmt');
      hideFields.push('SalesTaxAmt2');
    }else{
      if(this.formSalesInvoice?.data?.currencyID == this.baseCurr) hideFields.push('SalesTaxAmt2');
    }


    if(!this.journal.useExciseTax){ //? không sử dụng thuế TTĐB (ẩn)
      hideFields.push('ExciseTaxPct');
      hideFields.push('ExciseTaxAmt');
      hideFields.push('ExciseTaxAmt2');
    }else{
      if(this.formSalesInvoice?.data?.currencyID == this.baseCurr) hideFields.push('ExciseTaxAmt2');
    }  

    if(this.journal.vatControl == '0'){ //? không sử dụng thuế GTGT (ẩn)
      hideFields.push('VATPct'); 
      hideFields.push('VATAmt'); 
      hideFields.push('VATBase'); 
      hideFields.push('VATAmt2');
      hideFields.push('VATBase2');
      hideFields.push('VATID');
    }else{
      if(this.formSalesInvoice?.data?.currencyID == this.baseCurr){
        hideFields.push('VATAmt2');
        hideFields.push('VATBase2');
      } 
    } 

    if(this.formSalesInvoice?.data?.currencyID == this.baseCurr){ //? nếu không sử dụng ngoại tệ
      hideFields.push('PurcAmt2');
      hideFields.push('DiscAmt2');
      hideFields.push('NetAmt2');
      hideFields.push('MiscAmt2');
    }

    eleGrid.showHideColumns(hideFields);
  }

  /**
   * *Hàm check validate trước khi save line (VATInvoice)
   * @param data 
   * @returns 
   */
  beforeSaveRowVATInvoice(event:any){
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridVatInvoices.showErrorField('quantity','E0341');
        event.cancel = true;
        return;
      }
      if (event.rowData.unitPrice == 0 || event.rowData.unitPrice < 0) {
        this.eleGridVatInvoices.showErrorField('unitPrice','E0730');
        event.cancel = true;
        return;
      }
    }
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

  /**
   * *Hàm click nút đóng form
   */
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }

  /**
   * *Hàm click các morefunction của CashpaymentLines
   * @param event
   * @param data
   */
  clickMF(event: any, data) {
    switch (event.functionID) {
      case 'SYS104':
        this.copyRow(data);
        break;
      case 'SYS102':
        this.deleteRow(data);
        break;
    }
  }

  /**
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.formSalesInvoice.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
    this.detectorRef.detectChanges();
    // this.formSalesInvoice.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
    // this.detectorRef.detectChanges();
    // if (this.elementTabDetail) {
    //   this.showHideTabDetail(this.formSalesInvoice?.data?.subType, this.elementTabDetail);
    // }
  }

  /**
   * *Hàm xử lí change master
   * @param event 
   */
  valueChangeMaster(event: any) {
    if (this.isPreventChange) {
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.formSalesInvoice.setValue('updateColumns','',{});
    switch (field.toLowerCase()) {
      case 'objectid':
        let indexob = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
        if(value == '' || value == null || indexob == -1){
          this.isPreventChange = true;
          let memo = this.getMemoMaster();
          this.formSalesInvoice.setValue(field,null,{});
          this.formSalesInvoice.setValue('objectName', null, {});
          this.formSalesInvoice.setValue('objectType', null, {});
          this.formSalesInvoice.setValue('address', null, {});
          this.formSalesInvoice.setValue('taxCode', null, {});
          this.formSalesInvoice.setValue('warehouseID',null, {});
          this.formSalesInvoice.setValue('pmtMethodID', null, {});
          this.formSalesInvoice.setValue('pmtTermID', null, {});
          this.formSalesInvoice.setValue('delModeID', null, {});
          this.formSalesInvoice.setValue('memo', memo, {});
          this.formSalesInvoice.data.pmtMethodName = null;
          this.formSalesInvoice.data.pmtTermName = null;
          this.detectorRef.detectChanges();
          this.isPreventChange = false;
          return;
        } 
        let objectType = event?.component?.itemsSelected[0]?.ObjectType || '';
        this.formSalesInvoice.setValue('objectType',objectType,{});
        let memo = this.getMemoMaster();
        this.formSalesInvoice.setValue('memo',memo,{});
        this.objectIDChange(field);
        break;

      case 'currencyid':
        let indexcr = this.eleCbxCurrencyID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CurrencyID == this.eleCbxCurrencyID?.ComponentCurrent?.value);
        if(value == '' || value == null || indexcr == -1){
          this.isPreventChange = true;
          this.formSalesInvoice.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.formSalesInvoice as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
        }
        let valueCurrency = {
          PreCurrency:  event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID || ''
        };
        this.currencyIDChange(field,valueCurrency);
        break;

      case 'exchangerate':
        if(value == null){
          this.isPreventChange = true;
          setTimeout(() => {
            this.formSalesInvoice.setValue(field,this.preData?.exchangeRate,{});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          if (this.preData?.exchangeRate != null) {
            var key = Util.camelize(field);
            var $error = (this.formSalesInvoice as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          return;
        }
        if(this.preData?.exchangeRate == this.formSalesInvoice?.data?.exchangeRate) return;
        this.exchangeRateChange(field);
        break;

      case 'voucherdate':
        if (value == null) return;
        this.voucherDateChange(field);
        break;
      case 'pmtmethodid':
        let indexpmtmethod = event?.component?.dataService?.data.findIndex((x) => x.PmtMethodID == event.data);
        if (indexpmtmethod > -1) {
          this.formSalesInvoice.data.pmtTermName = event?.component?.dataService?.data[indexpmtmethod].PmtMethodName;
        }
        break;
      case 'pmttermid':
        let indexpmtterm = event?.component?.dataService?.data.findIndex((x) => x.PmtTermID == event.data);
        if (indexpmtterm > -1) {
          this.formSalesInvoice.data.pmtTermName = event?.component?.dataService?.data[indexpmtterm].PmtTermName;
        }
        break;
      case 'salespersonid':
        let indexsalesperson = event?.component?.dataService?.data.findIndex((x) => x.SalespersonID == event.data);
        if (indexsalesperson > -1) {
          this.formSalesInvoice.data.salespersonName = event?.component?.dataService?.data[indexsalesperson].SalespersonName;
        }
        break;
    }
  }

  /**
   * *Hàm xử lí change lưới PurchaseInvoices
   * @param event 
   */
  valueChangeLine(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'itemid') {
      oLine.itemName = event?.itemData?.ItemName;
      this.detectorRef.detectChanges();
    }
    this.eleGridSalesInvoice.startProcess();
    this.api.exec('AC', 'SalesInvoicesLinesBusiness', 'ValueChangeAsync', [
      event.field,
      this.formSalesInvoice.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        oLine = this.genFixedDims(oLine);
        this.detectorRef.detectChanges();
        this.eleGridSalesInvoice.endProcess();
      }
    })
  }

  /**
   * *Hàm xử lí change lưới VATInvoices
   * @param event 
   */
  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      oLine.itemID = event?.itemData?.ItemID;
      this.detectorRef.detectChanges();
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_SalesInvoices',
      this.formSalesInvoice.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        this.detectorRef.detectChanges();
        this.eleGridVatInvoices.endProcess();
      }
    })
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine(typeBtn) {
    this.formSalesInvoice.save(null, 0, '', '', false,{allowCompare:false})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.eleGridSalesInvoice && this.elementTabDetail?.selectingID == '0') {
        this.eleGridSalesInvoice.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.addRowDetailByType(typeBtn);
          }
        })
        return;
      }
      if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
        this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.addRowDetailByType(typeBtn);
          }
        })
        return;
      }
    })
  }
  //#endregion Event

  //#region Method

  /**
   * *Hàm hủy chứng từ
   */
  onDiscardVoucher(){
    if (this.formSalesInvoice && this.formSalesInvoice.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formSalesInvoice.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.dialog.close();
                this.onDestroy();
              }
            });
        }
      });
    }else{
      this.dialog.close();
      this.onDestroy();
    }
  }

  /**
   * *Hàm lưu chứng từ
   * @param type 
   */
  onSaveVoucher(type){
    this.formSalesInvoice.save(null, 0, '', '', false,{allowCompare:false})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if ((this.eleGridSalesInvoice || this.eleGridSalesInvoice?.isEdit) && this.elementTabDetail?.selectingID == '0') {
        this.eleGridSalesInvoice.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.saveVoucher(type);
          }
        })
        return;
      }   
    });
  }

  /**
   * lưu chứng từ
   */
  saveVoucher(type){
    this.api
      .exec('AC', 'SalesInvoicesBusiness', 'UpdateVoucherAsync', [
        this.formSalesInvoice.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data).subscribe();
          if (type == 'save') {
            this.onDestroy();
            this.dialog.close();
          }else{
            this.api
            .exec('AC', 'SalesInvoicesBusiness', 'SetDefaultAsync', [
              this.dialogData.data?.oData,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formSalesInvoice.refreshData({...res.data});
                setTimeout(() => {
                  this.refreshGrid();
                }, 100);
                this.detectorRef.detectChanges();
              }
            });
          }
          if (this.formSalesInvoice.data.isAdd || this.formSalesInvoice.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
          
        }
        if(this.eleGridSalesInvoice && this.eleGridSalesInvoice?.isSaveOnClick) this.eleGridSalesInvoice.isSaveOnClick = false;
      });
  }

  //#endregion Method

  //#region Function

  /**
   * *Hàm thêm dòng theo loại nút
   */
  addRowDetailByType(typeBtn) {
    switch (typeBtn) {
      case '1':
        this.addLine();
        break;
      case '2':
        this.addLineVatInvoices();
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridSalesInvoice.addRow(oLine,this.eleGridSalesInvoice.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let model = new AC_SalesInvoicesLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formSalesInvoice.data.recID;
    oLine.idiM4 = this.formSalesInvoice.data.warehouseID;
    oLine.note = this.formSalesInvoice.data.memo;
    oLine = this.genFixedDims(oLine);
    oLine = this.acService.getDataSettingFromJournal(oLine,this.journal);
    return oLine;
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    let model = new AC_VATInvoices();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formSalesInvoice.data.recID;
    oLine.objectID = this.formSalesInvoice.data.objectID;
    oLine.objectName = this.formSalesInvoice.data.objectName;
    this.eleGridVatInvoices.addRow(oLine,this.eleGridVatInvoices.dataSource.length);
  }
  
  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridSalesInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('1');
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridSalesInvoice && this.eleGridSalesInvoice.rowDataSelected) {
        this.eleGridSalesInvoice.rowDataSelected = null;
      }
      if(this.eleGridSalesInvoice.isSaveOnClick) this.eleGridSalesInvoice.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddSale'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
    }
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridVatInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('2');
        break;
      case 'add':
      case 'update':
        this.setInvoiceNo();
        this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
        this.eleGridVatInvoices.rowDataSelected = null;
      }
      if(this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddVAT'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
      case 'delete':
        this.setInvoiceNo();
        this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
        break;
    }
  }

  /**
   * *Hàm change đối tượng
   * @param field 
   */
  objectIDChange(field:any){
    this.api.exec('AC', 'SalesInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formSalesInvoice.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.formSalesInvoice.setValue('objectName',(res?.data?.objectName),{});
        this.formSalesInvoice.setValue('objectType',(res?.data?.objectType),{});
        this.formSalesInvoice.setValue('address',(res?.data?.address),{});
        this.formSalesInvoice.setValue('taxCode',(res?.data?.taxCode),{});
        this.formSalesInvoice.setValue('warehouseID',(res?.data?.warehouseID),{});
        this.formSalesInvoice.setValue('pmtMethodID',(res?.data?.pmtMethodID),{});
        this.formSalesInvoice.setValue('pmtTermID',(res?.data?.pmtTermID),{});
        this.formSalesInvoice.setValue('delModeID',(res?.data?.delModeID),{});
        this.formSalesInvoice.setValue('currencyID',(res?.data?.currencyID),{});
        this.formSalesInvoice.setValue('exchangeRate',(res?.data?.exchangeRate),{});
        this.formSalesInvoice.setValue('taxExchRate',(res?.data?.taxExchRate),{});
        this.formSalesInvoice.setValue('consultantID',(res?.ConsultantID || ''),{});
        this.formSalesInvoice.setValue('salespersonID',(res?.salespersonID || ''),{});
        this.formSalesInvoice.setValue('multi',(res?.data?.multi),{});
        this.formSalesInvoice.data.pmtMethodName = res?.data?.pmtMethodName;
        this.formSalesInvoice.data.pmtTermName = res?.data?.pmtTermName;
        if (this.eleGridSalesInvoice.dataSource.length) {
          this.formSalesInvoice.preData = {...this.formSalesInvoice.data};
          this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
        }
        if (res?.isRefreshGrid) {
          this.showHideColumn();
          this.eleGridSalesInvoice.refresh();
        }
        this.isPreventChange = false;
        this.detectorRef.detectChanges();
      }
    })
  }

  /**
   * *Hàm change tiền tệ
   * @param field 
   */
  currencyIDChange(field:any,obj:any){
    this.api.exec('AC', 'SalesInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formSalesInvoice.data,
      JSON.stringify(obj)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {      
        this.isPreventChange = true;
        this.formSalesInvoice.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.formSalesInvoice?.data};
        if (this.eleGridSalesInvoice.dataSource.length) {
          this.formSalesInvoice.preData = {...this.formSalesInvoice.data};
          this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
        }
        if (res?.isRefreshGrid) {
          this.showHideColumn();
          setTimeout(() => {
            this.eleGridSalesInvoice.refresh();
          }, 100);
        }
        this.isPreventChange = false;
      }
    })
  }

  /**
   * *Hàm change tỷ giá
   * @param field 
   */
  exchangeRateChange(field:any){
    this.api
      .exec('AC', 'SalesInvoicesBusiness', 'ValueChangedAsync', [
        field,
        this.formSalesInvoice.data,
        ''
      ])
      .subscribe((res: any) => {
        if (res) {
          this.preData = { ...this.formSalesInvoice?.data };
          if (res?.isRefreshGrid) {
            this.eleGridSalesInvoice.refresh();
            this.formSalesInvoice.preData = { ...this.formSalesInvoice.data };
            this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  /**
   * *Hàm change ngày chứng từ
   * @param field 
   */
  voucherDateChange(field){
    this.api.exec('AC', 'SalesInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formSalesInvoice.data,
      ''
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.formSalesInvoice.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.formSalesInvoice?.data};
        if (res?.isRefreshGrid) {
          this.eleGridSalesInvoice.refresh();
          this.formSalesInvoice.preData = { ...this.formSalesInvoice.data };
          this.dialog.dataService.update(this.formSalesInvoice.data).subscribe();
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridSalesInvoice) {
      let hSalesTaxAmt2 = false;
      let hExciseTaxAmt2 = false;
      let hVATAmt2 = false;
      let hVATBase2 = false;
      let hPurcAmt2 = false;
      let hDiscAmt2 = false;
      let hNetAmt2 = false;
      let hMiscAmt2 = false;

      if(this.journal.useDutyTax && this.formSalesInvoice.data.currencyID != this.baseCurr){
        hSalesTaxAmt2 = true;
      } 
      this.eleGridSalesInvoice.showHideColumns(['SalesTaxAmt2'],hSalesTaxAmt2);

      if(this.journal.useExciseTax && this.formSalesInvoice.data.currencyID != this.baseCurr){
        hExciseTaxAmt2 = true;
      } 
      this.eleGridSalesInvoice.showHideColumns(['ExciseTaxAmt2'],hExciseTaxAmt2);

      if(this.journal.vatControl && this.formSalesInvoice.data.currencyID != this.baseCurr){
        hVATAmt2 = true;
        hVATBase2 = true;
      } 
      this.eleGridSalesInvoice.showHideColumns(['VATAmt2'],hVATAmt2);
      this.eleGridSalesInvoice.showHideColumns(['VATBase2'],hVATBase2);

      if(this.formSalesInvoice.data.currencyID != this.baseCurr){
        hPurcAmt2 = true;
        hDiscAmt2 = true;
        hNetAmt2 = true;
        hMiscAmt2 = true;
      }
      this.eleGridSalesInvoice.showHideColumns(['PurcAmt2'],hPurcAmt2);
      this.eleGridSalesInvoice.showHideColumns(['DiscAmt2'],hDiscAmt2);
      this.eleGridSalesInvoice.showHideColumns(['NetAmt2'],hNetAmt2);
      this.eleGridSalesInvoice.showHideColumns(['MiscAmt2'],hMiscAmt2);

      this.refreshGrid();
    }
  }

  /**
   * *Hàm refresh grid
   */
  refreshGrid(){
    if(this.eleGridSalesInvoice){
      this.eleGridSalesInvoice.dataSource = [];
      this.eleGridSalesInvoice.refresh();
    }
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let lstRequire :any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formSalesInvoice.setRequire(lstRequire);
  }

  genFixedDims(line: any) {
    let fixedDims: string[] = Array(10).fill('0');
    for (let i = 0; i < 10; i++) {
      if (line['idiM' + i]) {
        fixedDims[i] = '1';
      }
    }
    line.fixedDIMs = fixedDims.join('');
    return line;
  }
  
  /**
   * *Hàm check validate trước khi save line
   * @param data 
   * @returns 
   */
  beforeSaveRowSaleInvoice(event:any){
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridSalesInvoice.showErrorField('quantity','E0341');
        event.cancel = true;
        return;
      }
      // if (event.rowData.purcPrice == 0 || event.rowData.purcPrice < 0) {
      //   this.eleGridPurchaseInvoice.showErrorField('purcPrice','E0341');
      //   event.cancel = true;
      //   return;
      // }
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event) {
    event.forEach((element) => {
      if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
        element.disabled = false;
        element.isbookmark = false;
      }else{
        element.disabled = true;
      }
    });
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridSalesInvoice && this.elementTabDetail?.selectingID == '0') {
      this.eleGridSalesInvoice.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridSalesInvoice.dataSource.length;
          delete data?._oldData;
          this.eleGridSalesInvoice.addRow(data, this.eleGridSalesInvoice.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridSalesInvoice && this.elementTabDetail?.selectingID == '0') {
      this.eleGridSalesInvoice.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridSalesInvoice.deleteRow(data);
        }
      })
    }
  }

  /**
   * *Hàm get ghi chú từ lí do chi + đối tượng + tên người nhận
   * @returns
   */
  getMemoMaster(format:any = '') {
    let newMemo = ''; //? tên ghi chú mới
    let objectName = ''; //? tên đối tượng
    
    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      objectName = 'Bán hàng cho ' + this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName;
      newMemo = objectName;
    }
    return newMemo;
  }

  setInvoiceNo(){
    if (this.eleGridVatInvoices.dataSource.length) {
      let invoiceNo = '';
      this.eleGridVatInvoices.dataSource.reduce((pre,item) => {
        invoiceNo += item.invoiceNo+',';
      },{})
      this.formSalesInvoice.data.invoiceNo = invoiceNo.substring(0, invoiceNo.lastIndexOf(',') + 0);
    }
  }
  
  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null) && 
      e.target.closest('button') == null
    ) {
      if (this.eleGridSalesInvoice && this.eleGridSalesInvoice?.gridRef?.isEdit) {
        this.eleGridSalesInvoice.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridSalesInvoice.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
    }
  }
  //#endregion
}
