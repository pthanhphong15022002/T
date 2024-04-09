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
  DatePipe,
  DialogData,
  DialogRef,
  FormModel,
  FormatvaluePipe,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService, fmPurchaseInvoicesLines, fmVATInvoices } from '../../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';
import { AC_PurchaseInvoicesLines } from '../../../models/AC_PurchaseInvoicesLines.model';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-purchaseinvoices-add',
  providers: [DatePipe],
  templateUrl: './purchaseinvoices-add.component.html',
  styleUrls: ['./purchaseinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseinvoicesAddComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('eleGridPurchaseInvoice') eleGridPurchaseInvoice: CodxGridviewV2Component;
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any;
  @ViewChild('eleCbxCurrencyID') eleCbxCurrencyID: any;
  headerText: string;
  dialog: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  baseCurr: any;
  taxCurr: any;
  fmPurchaseInvoicesLines: any = fmPurchaseInvoicesLines
  fmVATInvoices: any = fmVATInvoices
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  isPreventChange: any = false;
  postDateControl: any;
  preData: any;
  nextTabIndex: number;
  editSettings: EditSettingsModel = {
    allowAdding: false,
    allowEditing: false,
    allowDeleting: false,
    allowEditOnDblClick: false,
    allowNextRowEdit: false
  }
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private tranform: DatePipe,
    private ngxLoader: NgxUiLoaderService,
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
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res: any) => {
        if (res) {
          this.taxCurr = res?.TaxCurr;
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit(): void { 
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
  }

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
    this.showHideTabDetail(this.master?.data?.subType, this.elementTabDetail);
  }

  /**
   * *Hàm thiết lập lưới trước khi init
   * @param eleGrid 
   */
  initGridPurchaseInvoices(eleGrid: CodxGridviewV2Component) {
    let preAccountID = '';
    let dtvAccountID = '';
    let preOffsetAcctID = '';
    let dtvOffsetAcctID = '';
    let preDIM1 = '';
    let dtvDIM1 = '';
    let preDIM2 = '';
    let dtvDIM2 = '';
    let preDIM3 = '';
    let dtvDIM3 = '';
    let hideFields = [];

    if (this.journal.drAcctControl == '1' || this.journal.drAcctControl == '2') {
      preAccountID = '@0.Contains(AccountID)';
      dtvAccountID = `[${this.journal?.drAcctID}]`;
    }
    eleGrid.setPredicates('accountID', preAccountID, dtvAccountID);

    if (
      (this.journal.crAcctControl == '1' || this.journal.crAcctControl == '2') &&
      this.journal.entryMode == '1'
    ) {
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${this.journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID', preOffsetAcctID, dtvOffsetAcctID);

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') {
      preDIM1 = '@0.Contains(ProfitCenterID)';
      dtvDIM1 = `[${this.journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1', preDIM1, dtvDIM1);

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2') {
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${this.journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2', preDIM2, dtvDIM2);

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2') {
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${this.journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3', preDIM3, dtvDIM3);

    if (this.journal.diM1Control == "0") hideFields.push("DIM1");
    if (this.journal.diM2Control == "0") hideFields.push("DIM2");
    if (this.journal.diM3Control == "0") hideFields.push("DIM3");
    if (this.journal.projectControl == "0") hideFields.push("ProjectID");
    if (this.journal.loanControl == "0") hideFields.push("ContractID");
    if (this.journal.assetControl == "0"){
      hideFields.push("AssetGroupID");
      hideFields.push("AssetType");
      hideFields.push("ServiceDate");
      hideFields.push("ServicePeriods");
      hideFields.push("EmployeeID");
      hideFields.push("SiteID");
    } 
    if (this.journal.subControl == "0") hideFields.push("ObjectID");

    let array = this.journal.idimControl.split(';');
    for (let index = 0; index < 10; index++) {
      if(array.includes(index.toString())) hideFields.push("IDIM"+index);
    }
    if (!this.journal.useDutyTax) {
      hideFields.push('SalesTaxPct');
      hideFields.push('SalesTaxAmt');
      hideFields.push('SalesTaxAmt2');
    }else{
      if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr) hideFields.push('SalesTaxAmt2');
    }
    if (!this.journal.useExciseTax) {
      hideFields.push('ExciseTaxPct');
      hideFields.push('ExciseTaxAmt');
      hideFields.push('ExciseTaxAmt2');
    }else{
      if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr) hideFields.push('ExciseTaxAmt2');
    }
    if (this.journal.vatControl == '0') {
      hideFields.push('VATPct');
      hideFields.push('VATAmt');
      hideFields.push('VATBase');
      hideFields.push('VATAmt2');
      hideFields.push('VATBase2');
      hideFields.push('VATID');
    }else{
      if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr){
        hideFields.push('VATAmt2');
        hideFields.push('VATBase2');
      }
    }

    if (this.journal.discountControl == '0') {
      hideFields.push('DiscAmt');
      hideFields.push('DiscPct');
      // hideFields.push('TotalDiscAmt');
      // hideFields.push('TotalDiscPct');
      // hideFields.push('LineDiscAmt');
      // hideFields.push('LineDiscPct');
      hideFields.push('DiscAmt2');
    }else{
      if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr){
        hideFields.push('DiscAmt2');
      }
    }

    if (this.journal.cosControl == '0') {
      hideFields.push('CostPrice');
      hideFields.push('CostAmt');
    }

    if (!this.journal.miscChargeControl) {
      hideFields.push('MiscAmt');
      hideFields.push('MiscPrice');
      hideFields.push('MiscAmt2');
    }else{
      if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr){
        hideFields.push('MiscAmt2');
      }
    }

    if (this.dataDefault && this.dataDefault?.currencyID == this.baseCurr){
      hideFields.push('PurcAmt2');
      hideFields.push('NetAmt2');
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
  clickMF(event: any) {
    switch (event.event.functionID) {
      case 'SYS104':
        this.copyRow(event.data);
        break;
      case 'SYS102':
        this.deleteRow(event.data);
        break;
    }
  }

  /**
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.master.setValue('subType', event.data[0], {});
    this.detectorRef.detectChanges();
    if (this.elementTabDetail) {
      this.showHideTabDetail(this.master?.data?.subType, this.elementTabDetail);
    }
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
    this.master.setValue('updateColumns', '', {});
    let preValue:any;
    switch (field.toLowerCase()) {
      case 'objectid':
        this.objectIDChange(field);
        break;

      case 'currencyid':
        let indexcr = this.eleCbxCurrencyID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CurrencyID == this.eleCbxCurrencyID?.ComponentCurrent?.value);
        if (value == '' || value == null || indexcr == -1) {
          this.isPreventChange = true;
          this.master.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
        }
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID  || '',
        this.currencyIDChange(field, preValue);
        break;

      case 'exchangerate':
        if (value == null) {
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field, this.preData?.exchangeRate, {});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          if (this.preData?.exchangeRate != null) {
            var key = Util.camelize(field);
            var $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          return;
        }
        if (this.preData?.exchangeRate == this.master?.data?.exchangeRate) return;
        this.exchangeRateChange(field);
        break;

      case 'voucherdate':
        if (value == null) return;
        this.voucherDateChange(field);
        break;

      case 'taxexchrate':
        if (value == null) {
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field, this.preData?.taxExchrate, {});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          return;
        }
        if (this.preData?.taxExchrate == this.master?.data?.taxExchrate) return;
        this.taxExchRateChange(field);
        break;
      case 'invoiceno':
      case 'invoicedate':
        let memo = this.getMemoMaster(event?.component?.format);
        this.master.setValue('memo', memo, {});
        break;
      case 'pmtmethodid':
        this.pmtMethodIDChange(field);
        break;
      case 'pmttermid':
        this.pmtTermIDChange(field);
        break;
      case 'buyer':
        let indexbuyer = event?.component?.dataService?.data.findIndex((x) => x.EmployeeID == event.data);
        if (value == '' || value == null || indexbuyer == -1) {
          this.master.data.buyerName = null;
          return;
        }
        this.master.data.buyerName = event?.component?.dataService?.data[indexbuyer].EmployeeName;
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
    this.eleGridPurchaseInvoice.startProcess();
    this.api.exec('AC', 'PurchaseInvoicesLinesBusiness', 'ValueChangeAsync', [
      event.field,
      this.master.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        Object.assign(oLine, res);
        //oLine = this.genFixedDims(oLine);
        oLine.updateColumns = '';
        this.detectorRef.detectChanges();
        this.eleGridPurchaseInvoice.endProcess();

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
      'AC_PurchaseInvoices',
      this.master.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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
    this.master.save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') {
          this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetailByType(typeBtn);
          })
          return;
        }
        if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetailByType(typeBtn);
          })
          return;
        }
      })
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    switch (event?.selectedIndex) {
      case 0:
        if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        break;
      case 1:
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        break;
    }
  }

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }
  //#endregion Event

  //#region Method

  /**
   * *Hàm hủy chứng từ
   */
  onDiscardVoucher() {
    if (this.master && this.master.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
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
    } else {
      this.dialog.close();
      this.onDestroy();
    }
  }

  /**
   * *Hàm lưu chứng từ
   * @param type 
   */
  onSaveVoucher(type) {
    this.ngxLoader.start();
    this.master.save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let isError = false;
        if (!res) isError = true;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) isError = true;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) isError = true;
        }
        if(isError){
          this.ngxLoader.stop();
          return;
        }
        if ((this.eleGridPurchaseInvoice || this.eleGridPurchaseInvoice?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }
          })
          return;
        }
        if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
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
  saveVoucher(type) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res: any) => {
          if (res?.update) {
            this.dialog.dataService.update(res.data).subscribe();
            if (type == 'save') {
              this.onDestroy();
              this.dialog.close();
            } else {
              this.api
                .exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
                  this.dialogData.data?.oData,
                  this.journal,
                ])
                .subscribe((res: any) => {
                  if (res) {
                    res.data.isAdd = true;
                    this.master.refreshData({ ...res.data });
                    setTimeout(() => {
                      this.refreshGrid();
                    }, 100);
                    this.detectorRef.detectChanges();
                  }
                });
            }
            if (this.master.data.isAdd || this.master.data.isCopy)
              this.notification.notifyCode('SYS006');
            else
              this.notification.notifyCode('SYS007');
  
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice?.isSaveOnClick) this.eleGridPurchaseInvoice.isSaveOnClick = false;
          if (this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
          this.onDestroy();
        }
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
   * *Hàm thêm mới dòng
   */
  addLine() {
    this.api.exec('AC','PurchaseInvoicesLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridPurchaseInvoice.addRow(res, this.eleGridPurchaseInvoice.dataSource.length);
      }
      this.onDestroy();
    })
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    this.api.exec('AC','VATInvoicesBusiness','SetDefaultAsync',[
      'AC',
      'AC_PurchaseInvoices',
      'AC_PurchaseInvoicesLines',
      this.master.data,
      null,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridVatInvoices.addRow(res, this.eleGridVatInvoices.dataSource.length);
      }
    })
  }

  /**
   * *Hàm change đối tượng
   * @param field 
   */
  objectIDChange(field: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      ''
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.master.setValue('objectName', (res?.data?.objectName), {});
          this.master.setValue('objectType', (res?.data?.objectType), {});
          this.master.setValue('address', (res?.data?.address), {});
          this.master.setValue('taxCode', (res?.data?.taxCode), {});
          this.master.setValue('warehouseID', (res?.data?.warehouseID), {});
          this.master.setValue('pmtMethodID', (res?.data?.pmtMethodID), {});
          this.master.setValue('pmtTermID', (res?.data?.pmtTermID), {});
          this.master.setValue('delModeID', (res?.data?.delModeID), {});
          this.master.setValue('currencyID', (res?.data?.currencyID), {});
          this.master.setValue('exchangeRate', (res?.data?.exchangeRate), {});
          this.master.setValue('taxExchRate', (res?.data?.taxExchRate), {});
          this.master.data.pmtMethodName = res?.data?.pmtMethodName;
          this.master.data.pmtTermName = res?.data?.pmtTermName;
          this.master.setValue('multi', (res?.data?.multi), {});
          let memo = this.getMemoMaster();
          this.master.setValue('memo', memo, {});
          if (this.eleGridPurchaseInvoice.dataSource.length) {
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
          }
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            this.eleGridPurchaseInvoice.refresh();
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      })
  }

  pmtMethodIDChange(field: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      ''
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.pmtMethodName = res?.data?.pmtMethodName;
        }
        this.onDestroy();
      })
  }

  pmtTermIDChange(field: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      ''
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.pmtTermName = res?.data?.pmtTermName;
        }
        this.onDestroy();
      })
  }

  /**
   * *Hàm change tiền tệ
   * @param field 
   */
  currencyIDChange(field: any, preValue: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.master.setValue('exchangeRate', res?.data?.exchangeRate, {});
          this.preData = { ...this.master?.data };
          if (this.eleGridPurchaseInvoice.dataSource.length) {
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
          }
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            setTimeout(() => {
              this.eleGridPurchaseInvoice.refresh();
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
  exchangeRateChange(field: any) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
        field,
        this.master.data,
        ''
      ])
      .subscribe((res: any) => {
        if (res) {
          this.preData = { ...this.master?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  /**
   * *Hàm change tỷ giá tính thuế
   * @param field 
   */
  taxExchRateChange(field: any) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
        field,
        this.master.data,
        ''
      ])
      .subscribe((res: any) => {
        if (res) {
          this.preData = { ...this.master?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  /**
   * *Hàm change ngày chứng từ
   * @param field 
   */
  voucherDateChange(field) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      ''
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.setValue('exchangeRate', res?.data?.exchangeRate, {});
          this.preData = { ...this.master?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
            this.detectorRef.detectChanges();
          }
        }
      });
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
        case `${this.journal.journalType+'1'}`:
        case `${this.journal.journalType+'3'}`:
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          eleTab.select(0);
          break;
        case `${this.journal.journalType+'2'}`:
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

      if (this.journal.useDutyTax && this.master.data.currencyID != this.baseCurr) {
        hSalesTaxAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['SalesTaxAmt2'], hSalesTaxAmt2);

      if (this.journal.useExciseTax && this.master.data.currencyID != this.baseCurr) {
        hExciseTaxAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['ExciseTaxAmt2'], hExciseTaxAmt2);

      if (this.journal.vatControl && this.master.data.currencyID != this.baseCurr) {
        hVATAmt2 = true;
        hVATBase2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['VATAmt2'], hVATAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['VATBase2'], hVATBase2);

      if (this.master.data.currencyID != this.baseCurr) {
        hPurcAmt2 = true;
        hDiscAmt2 = true;
        hNetAmt2 = true;
        hMiscAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['PurcAmt2'], hPurcAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['DiscAmt2'], hDiscAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['NetAmt2'], hNetAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['MiscAmt2'], hMiscAmt2);

      this.refreshGrid();
    }
  }

  /**
   * *Hàm refresh grid
   */
  refreshGrid() {
    if (this.eleGridPurchaseInvoice) {
      this.eleGridPurchaseInvoice.dataSource = [];
      this.eleGridPurchaseInvoice.refresh();
    }

    if (this.eleGridVatInvoices) {
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
        this.dialog.dataService.update(this.master.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
        if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice.rowDataSelected) {
          this.eleGridPurchaseInvoice.rowDataSelected = null;
        }
        if (this.eleGridPurchaseInvoice.isSaveOnClick) this.eleGridPurchaseInvoice.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
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
        this.setInvoiceNo();
        this.dialog.dataService.update(this.master.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
          this.eleGridVatInvoices.rowDataSelected = null;
        }
        if (this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
        setTimeout(() => {
          let element = document.getElementById('btnAddVAT'); //? focus lại nút thêm dòng
          element.focus();
        }, 100);
        break;
      case 'delete':
        this.setInvoiceNo();
        this.dialog.dataService.update(this.master.data).subscribe();
        break;
    }
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm() {
    let lstRequire: any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({ field: 'VoucherNo', isDisable: false, require: false });
    }
    this.master.setRequire(lstRequire);
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    let newData = {...data};
    if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') {
      this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
        if (res) {
          newData.recID = Util.uid();
          newData.index = this.eleGridPurchaseInvoice.dataSource.length;
          delete newData?._oldData;
          this.eleGridPurchaseInvoice.addRow(newData, this.eleGridPurchaseInvoice.dataSource.length);
        }
      })
    }

    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res) {
          newData.recID = Util.uid();
          newData.index = this.eleGridVatInvoices.dataSource.length;
          delete newData?._oldData;
          this.eleGridVatInvoices.addRow(newData, this.eleGridVatInvoices.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridPurchaseInvoice && this.elementTabDetail?.selectingID == '0') {
      this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
        if (res) {
          this.eleGridPurchaseInvoice.deleteRow(data);
        }
      })
    }

    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res) {
          this.eleGridVatInvoices.deleteRow(data);
        }
      })
    }
  }

  /**
   * *Hàm get ghi chú từ lí do chi + đối tượng + tên người nhận
   * @returns
   */
  getMemoMaster(format: any = '') {
    let newMemo = ''; //? tên ghi chú mới
    let objectName = ''; //? tên đối tượng
    let invoiceno = '';
    let invoicedate = '';
    if (this.master.data.objectID) {
      objectName = 'Mua hàng của ' + this.master.data.objectName;
      if (this.master?.data?.invoiceNo) invoiceno = 'theo hóa đơn ' + this.master?.data?.invoiceNo;
      if (this.master?.data?.invoiceDate) invoicedate = 'ngày ' + this.tranform.transform(this.master?.data?.invoiceDate, format);
      newMemo = objectName + ' ' + invoiceno + ' ' + invoicedate;
    }
    return newMemo;
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
        this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
          if (res) {
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
        this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
          if (res) {
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

  setInvoiceNo() {
    if (this.eleGridVatInvoices.dataSource.length) {
      let invoiceNo = '';
      this.eleGridVatInvoices.dataSource.reduce((pre, item) => {
        invoiceNo += item.invoiceNo + ',';
      }, {})
      this.master.data.invoiceNo = invoiceNo.substring(0, invoiceNo.lastIndexOf(',') + 0);
    }
  }
  //#endregion Function
}
