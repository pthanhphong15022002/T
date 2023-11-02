import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
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
import { CodxAcService, fmPurchaseInvoicesLines, fmVATInvoices } from '../../../codx-ac.service';
import {
  IJournal,
  Vll067,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import {
  PurchaseInvoiceService,
} from '../purchaseinvoices.service';
import { Subject, map, takeUntil } from 'rxjs';
import { AC_PurchaseInvoicesLines } from '../../../models/AC_PurchaseInvoicesLines.model';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';

@Component({
  selector: 'lib-purchaseinvoices-add',
  templateUrl: './purchaseinvoices-add.component.html',
  styleUrls: ['./purchaseinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseinvoicesAddComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('eleGridPurchaseInvoice') eleGridPurchaseInvoice: CodxGridviewV2Component; //? element codx-grv2 lưới PurchaseInvoice
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formPurchaseInvoices') public formPurchaseInvoices: CodxFormComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn GTGT)

  headerText: string; //? tên tiêu đề
  dialog: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  baseCurr: any; //? đồng tiền hạch toán
  taxCurr:any; //? tiền thuế
  fmPurchaseInvoicesLines:any = fmPurchaseInvoicesLines
  fmVATInvoices:any = fmVATInvoices
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  isPreventChange:any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.headerText = dialogData.data?.headerText; //? get tên tiêu đề
    this.dataDefault = { ...dialogData.data?.oData }; //? get data của Cashpayments
    this.journal = { ...dialogData.data?.journal }; //? get data sổ nhật kí
    this.baseCurr = dialogData.data?.baseCurr; //? get đồng tiền hạch toán
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        takeUntil(this.destroy$),
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res:any)=>{
        if (res) {
          this.taxCurr = res?.TaxCurr;
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
    this.showHideTabDetail(this.formPurchaseInvoices?.data?.subType, this.elementTabDetail);
  }

  /**
   * *Hàm thiết lập lưới trước khi init
   * @param eleGrid 
   */
  beforeInitGridPurchaseInvoices(eleGrid:CodxGridviewV2Component){
    let preDIM1 = '';
    let dtvDIM1 = '';
    let preDIM2 = '';
    let dtvDIM2 = '';
    let preDIM3 = '';
    let dtvDIM3 = '';
    let hideFields = [];

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') { //? nếu phòng ban là mặc định hoặc trong danh sách
      preDIM1 = '@0.Contains(DepartmentID)';
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
      if(this.formPurchaseInvoices?.data?.currencyID == this.baseCurr) hideFields.push('SalesTaxAmt2');
    }


    if(!this.journal.useExciseTax){ //? không sử dụng thuế TTĐB (ẩn)
      hideFields.push('ExciseTaxPct');
      hideFields.push('ExciseTaxAmt');
      hideFields.push('ExciseTaxAmt2');
    }else{
      if(this.formPurchaseInvoices?.data?.currencyID == this.baseCurr) hideFields.push('ExciseTaxAmt2');
    }  

    if(this.journal.vatControl == '0'){ //? không sử dụng thuế GTGT (ẩn)
      hideFields.push('VATPct'); 
      hideFields.push('VATAmt'); 
      hideFields.push('VATBase'); 
      hideFields.push('VATAmt2');
      hideFields.push('VATBase2');
    }else{
      if(this.formPurchaseInvoices?.data?.currencyID == this.baseCurr){
        hideFields.push('VATAmt2');
        hideFields.push('VATBase2');
      } 
    } 

    if(this.formPurchaseInvoices?.data?.currencyID == this.baseCurr){ //? nếu không sử dụng ngoại tệ
      hideFields.push('PurcAmt2');
      hideFields.push('DiscAmt2');
      hideFields.push('NetAmt2');
      hideFields.push('MiscAmt2');
    }

    eleGrid.showHideColumns(hideFields);
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
    this.formPurchaseInvoices.setValue('subType',event.data[0],{});
    this.detectorRef.detectChanges();
    if (this.elementTabDetail) {
      this.showHideTabDetail(this.formPurchaseInvoices?.data?.subType, this.elementTabDetail);
    }
  }

  /**
   * *Hàm xử lí change master
   * @param event 
   */
  valueChangeMaster(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    if(event && value && this.formPurchaseInvoices.hasChange(this.formPurchaseInvoices.preData,this.formPurchaseInvoices.data)){
      this.formPurchaseInvoices.data.updateColumns = '';
      switch (field.toLowerCase()) {
        case 'objectid':
          let indexObject = event?.component?.dataService?.data.find((x) =>x.ObjectID == value);
          if (indexObject != null) {
            this.objectIDChange(field);
          }
          break;
        case 'currencyid':
          this.currencyIDChange(field);
          break;
        case 'exchangerate':
          this.exchangeRateChange(field);
          break;
        case 'taxexchrate':
          this.taxExchRateChange(field);
          break;
        case 'voucherdate':
          this.voucherDateChange(field);
          break;
      }
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
    this.eleGridPurchaseInvoice.startProcess();
    this.api.exec('AC', 'PurchaseInvoicesLinesBusiness', 'ValueChangeAsync', [
      event.field,
      this.formPurchaseInvoices.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        oLine = this.genFixedDims(oLine);
        this.detectorRef.detectChanges();
        this.eleGridPurchaseInvoice.endProcess();
        oLine.updateColumns = '';
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
      this.formPurchaseInvoices.data.unbounds = {
        itemID: event?.itemData?.ItemID,
      };
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_PurchaseInvoices',
      this.formPurchaseInvoices.data,
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
    this.formPurchaseInvoices.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
              this.eleGridPurchaseInvoice.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
            if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') { //? nếu lưới cashpayment có active hoặc đang edit
              this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
          }
        }
      })
  }
  //#endregion Event

  //#region Method

  /**
   * *Hàm hủy chứng từ
   */
  onDiscardVoucher(){
    if (this.formPurchaseInvoices && this.formPurchaseInvoices.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formPurchaseInvoices.data], false, null, '', '', null, null, false)
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
    this.formPurchaseInvoices.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res || res.save || res.update) {
        if (res || !res.save.error || !res.update.error) {
          if ((this.eleGridPurchaseInvoice || this.eleGridPurchaseInvoice?.isEdit) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
            this.eleGridPurchaseInvoice.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
          if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới cashpayment có active hoặc đang edit
            this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }      
        }
      }
    });
  }

  /**
   * lưu chứng từ
   */
  saveVoucher(type){
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'UpdateVoucherAsync', [
        this.formPurchaseInvoices.data,
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
            .exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
              this.dialogData.data?.oData,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formPurchaseInvoices.refreshData({...res.data});
                setTimeout(() => {
                  this.refreshGrid();
                }, 100);
                this.detectorRef.detectChanges();
              }
            });
          }
          if (this.formPurchaseInvoices.data.isAdd || this.formPurchaseInvoices.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
          
        }
        if(this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice?.isSaveOnClick) this.eleGridPurchaseInvoice.isSaveOnClick = false;
        if(this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
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
    this.eleGridPurchaseInvoice.addRow(oLine,this.eleGridPurchaseInvoice.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let model : any = new AC_PurchaseInvoicesLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formPurchaseInvoices.data.recID;
    oLine.idiM4 = this.formPurchaseInvoices.data.warehouseID;
    oLine.note = this.formPurchaseInvoices.data.note;
    oLine = this.genFixedDims(oLine);
    return oLine;
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    let model = new AC_VATInvoices();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formPurchaseInvoices.data.recID;
    oLine.objectID = this.formPurchaseInvoices.data.objectID;
    oLine.objectName = this.formPurchaseInvoices.data.objectName;
    this.eleGridVatInvoices.addRow(oLine,this.eleGridVatInvoices.dataSource.length);
  }

  /**
   * *Hàm change đối tượng
   * @param field 
   */
  objectIDChange(field:any){
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formPurchaseInvoices.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        if(this.formPurchaseInvoices.data.currencyID != res?.CurrencyID){
          this.formPurchaseInvoices.setValue('currencyID',(res?.CurrencyID || ''),{});
          this.showHideColumn();
        } 
        if (this.formPurchaseInvoices.data.exchangeRate != res?.ExchangeRate) {
          this.formPurchaseInvoices.setValue('exchangeRate',(res?.ExchangeRate || 0),{});
          this.formPurchaseInvoices.setValue('taxExchRate',(res?.TaxExchRate || 0),{});
          setTimeout(() => {
            if(this.eleGridPurchaseInvoice.dataSource.length){ //? nếu có dữ liệu chi tiết => refresh grid
              this.formPurchaseInvoices.preData = {...this.formPurchaseInvoices.data};
              this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
              this.refreshGrid();
            }
          }, 100);
          
        }
        this.formPurchaseInvoices.setValue('objectName',(res?.ObjectName || ''),{});
        this.formPurchaseInvoices.setValue('objectType',(res?.ObjectType || ''),{});
        this.formPurchaseInvoices.setValue('address',(res?.Address || ''),{});
        this.formPurchaseInvoices.setValue('taxCode',(res?.TaxCode || ''),{});
        this.formPurchaseInvoices.setValue('warehouseID',(res?.WarehouseID || ''),{});
        this.formPurchaseInvoices.setValue('pmtMethodID',(res?.PmtMethodID || ''),{});
        this.formPurchaseInvoices.setValue('pmtTermID',(res?.PmtTermID || ''),{});
        this.formPurchaseInvoices.setValue('delModeID',(res?.DelModeID || ''),{});

        this.detectorRef.detectChanges();
        this.isPreventChange = false;
      }
    })
  }

  /**
   * *Hàm change tiền tệ
   * @param field 
   */
  currencyIDChange(field:any){
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formPurchaseInvoices.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {      
        if (this.formPurchaseInvoices.data.exchangeRate != res?.ExchangeRate) {
          this.formPurchaseInvoices.setValue('exchangeRate',(res?.ExchangeRate || 0),{});
          this.formPurchaseInvoices.setValue('taxExchRate',(res?.TaxExchRate || 0),{});
        }
        this.showHideColumn();
        setTimeout(() => {
          if(this.eleGridPurchaseInvoice.dataSource.length){ //? nếu có dữ liệu chi tiết => refresh grid
            this.formPurchaseInvoices.preData = {...this.formPurchaseInvoices.data};
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
            this.refreshGrid();
          }
        }, 100);
        this.detectorRef.detectChanges();
      }
    })
  }

  /**
   * *Hàm change tỷ giá
   * @param field 
   */
  exchangeRateChange(field:any){
    this.formPurchaseInvoices.setValue('taxExchRate',this.formPurchaseInvoices.data.exchangeRate,{});
    if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice.dataSource.length) {
      this.api.exec('AC', 'PurchaseInvoicesBusiness', 'UpdateLineAsync', [
        this.formPurchaseInvoices.data,
        field,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {      
          this.formPurchaseInvoices.preData = {...this.formPurchaseInvoices.data};
          this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
          this.refreshGrid();
        }
      })
    }
    // xử lí khi có line
    
  }

  /**
   * *Hàm change tỷ giá tính thuế
   * @param field 
   */
  taxExchRateChange(field:any){
    if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice.dataSource.length) {
      this.api.exec('AC', 'PurchaseInvoicesBusiness', 'UpdateLineAsync', [
        this.formPurchaseInvoices.data,
        field,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {      
          this.formPurchaseInvoices.preData = {...this.formPurchaseInvoices.data};
          this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
          this.refreshGrid();
        }
      })
    }
    // xử lí khi có line
  }

  /**
   * *Hàm change ngày chứng từ
   * @param field 
   */
  voucherDateChange(field){
    this.formPurchaseInvoices.setValue('postedDate',this.formPurchaseInvoices.data.voucherDate,{});
    this.formPurchaseInvoices.setValue('invoiceDate',this.formPurchaseInvoices.data.voucherDate,{});
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formPurchaseInvoices.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {      
        if (this.formPurchaseInvoices.data.exchangeRate != res?.ExchangeRate) {
          this.formPurchaseInvoices.setValue('exchangeRate',(res?.ExchangeRate || 0),{});
          this.formPurchaseInvoices.setValue('taxExchRate',(res?.TaxExchRate || 0),{});
          if(this.eleGridPurchaseInvoice.dataSource.length){ //? nếu có dữ liệu chi tiết => refresh grid
            this.formPurchaseInvoices.preData = {...this.formPurchaseInvoices.data};
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
            this.refreshGrid();
          }
        }
      }
    })
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    if (eleTab) {
      switch (type) {
        case '1': //? hóa đơn mua hàng trong nước,mua hàng nhập khẩu (ẩn tab hóa đơn GTGT)
        case '3':
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          eleTab.select(0);
          break;
        case '2': //? mua hàng hóa đơn nhiều VAT(hiện tab hóa đơn GTGT)
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          eleTab.select(0);
          break;
      }
    }
  }
  
  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridPurchaseInvoice) {
      let hSalesTaxAmt2 = false;
      let hExciseTaxAmt2 = false;
      let hVATAmt2 = false;
      let hVATBase2 = false;
      let hPurcAmt2 = false;
      let hDiscAmt2 = false;
      let hNetAmt2 = false;
      let hMiscAmt2 = false;

      if(this.journal.useDutyTax && this.formPurchaseInvoices.data.currencyID != this.baseCurr){
        hSalesTaxAmt2 = true;
      } 
      this.eleGridPurchaseInvoice.showHideColumns(['SalesTaxAmt2'],hSalesTaxAmt2);

      if(this.journal.useExciseTax && this.formPurchaseInvoices.data.currencyID != this.baseCurr){
        hExciseTaxAmt2 = true;
      } 
      this.eleGridPurchaseInvoice.showHideColumns(['ExciseTaxAmt2'],hExciseTaxAmt2);

      if(this.journal.vatControl && this.formPurchaseInvoices.data.currencyID != this.baseCurr){
        hVATAmt2 = true;
        hVATBase2 = true;
      } 
      this.eleGridPurchaseInvoice.showHideColumns(['VATAmt2'],hVATAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['VATBase2'],hVATBase2);

      if(this.formPurchaseInvoices.data.currencyID != this.baseCurr){
        hPurcAmt2 = true;
        hDiscAmt2 = true;
        hNetAmt2 = true;
        hMiscAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['PurcAmt2'],hPurcAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['DiscAmt2'],hDiscAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['NetAmt2'],hNetAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['MiscAmt2'],hMiscAmt2);

      this.refreshGrid();
    }
  }

  /**
   * *Hàm refresh grid
   */
  refreshGrid(){
    if(this.eleGridPurchaseInvoice){
      this.eleGridPurchaseInvoice.dataSource = [];
      this.eleGridPurchaseInvoice.refresh();
    }

    if(this.eleGridVatInvoices){
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
    }
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridPurchaseInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('1');
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice.rowDataSelected) {
        this.eleGridPurchaseInvoice.rowDataSelected = null;
      }
      if(this.eleGridPurchaseInvoice.isSaveOnClick) this.eleGridPurchaseInvoice.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddPur'); //? focus lại nút thêm dòng
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
        this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
    }
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
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let lstRequire :any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formPurchaseInvoices.setRequire(lstRequire);
  }

  /**
   * *Hàm check validate trước khi save line (cashpayment)
   * @param data 
   * @returns 
   */
  beforeSaveRowPurchase(event:any){
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridPurchaseInvoice.showErrorField('quantity','E0341');
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
    if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') {
      data.recID = Util.uid();
      data.index = this.eleGridPurchaseInvoice.dataSource.length;
      this.eleGridPurchaseInvoice.addRow(data, this.eleGridPurchaseInvoice.dataSource.length);
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
      data.recID = Util.uid();
      data.index = this.eleGridVatInvoices.dataSource.length;
      this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') {
      this.eleGridPurchaseInvoice.deleteRow(data);
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridVatInvoices.deleteRow(data);
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
      if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice?.gridRef?.isEdit) {
        this.eleGridPurchaseInvoice.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridPurchaseInvoice.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridVatInvoices && this.eleGridVatInvoices?.gridRef?.isEdit) {
        this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridVatInvoices.isSaveOnClick = false;
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
  //#endregion Function
}
