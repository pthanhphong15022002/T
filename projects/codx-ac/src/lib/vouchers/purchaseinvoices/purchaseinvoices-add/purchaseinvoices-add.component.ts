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
import {
  IJournal,
  Vll067,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { Subject, map, takeUntil } from 'rxjs';
import { AC_PurchaseInvoicesLines } from '../../../models/AC_PurchaseInvoicesLines.model';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';

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
  @ViewChild('formPurchaseInvoices') public formPurchaseInvoices: CodxFormComponent;
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
      ).subscribe((res: any) => {
        if (res) {
          this.taxCurr = res?.TaxCurr;
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit(): void { 
    if (this.formPurchaseInvoices?.data?.coppyForm) this.formPurchaseInvoices.data._isEdit = true; //? test copy để tạm
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
    this.showHideTabDetail(this.formPurchaseInvoices?.data?.subType, this.elementTabDetail);
  }

  /**
   * *Hàm thiết lập lưới trước khi init
   * @param eleGrid 
   */
  beforeInitGridPurchaseInvoices(eleGrid: CodxGridviewV2Component) {
    let hideFields = [];
    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    let setting = this.acService.getSettingFromJournal(eleGrid, this.journal, this.formPurchaseInvoices?.data, this.baseCurr, hideFields);
    eleGrid = setting[0];
    hideFields = setting[1];

    if (this.formPurchaseInvoices?.data?.currencyID == this.baseCurr) { //? nếu không sử dụng ngoại tệ
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
    this.formPurchaseInvoices.setValue('subType', event.data[0], {});
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
    if (this.isPreventChange) {
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.formPurchaseInvoices.setValue('updateColumns', '', {});
    switch (field.toLowerCase()) {
      case 'objectid':
        let indexob = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
        if (value == '' || value == null || indexob == -1) {
          this.isPreventChange = true;
          let memo = this.getMemoMaster();
          this.formPurchaseInvoices.setValue(field, null, {});
          this.formPurchaseInvoices.setValue('objectName', null, {});
          this.formPurchaseInvoices.setValue('objectType', null, {});
          this.formPurchaseInvoices.setValue('address', null, {});
          this.formPurchaseInvoices.setValue('taxCode', null, {});
          this.formPurchaseInvoices.setValue('warehouseID', null, {});
          this.formPurchaseInvoices.setValue('pmtMethodID', null, {});
          this.formPurchaseInvoices.setValue('pmtTermID', null, {});
          this.formPurchaseInvoices.setValue('delModeID', null, {});
          this.formPurchaseInvoices.data.pmtMethodName = null;
          this.formPurchaseInvoices.data.pmtTermName = null;
          this.formPurchaseInvoices.setValue('memo', memo, {});
          this.detectorRef.detectChanges();
          this.isPreventChange = false;
          return;
        }
        let objectType = event?.component?.itemsSelected[0]?.ObjectType || '';
        this.formPurchaseInvoices.setValue('objectType', objectType, {});
        let memo2 = this.getMemoMaster();
        this.formPurchaseInvoices.setValue('memo', memo2, {});
        this.objectIDChange(field);
        break;

      case 'currencyid':
        let indexcr = this.eleCbxCurrencyID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CurrencyID == this.eleCbxCurrencyID?.ComponentCurrent?.value);
        if (value == '' || value == null || indexcr == -1) {
          this.isPreventChange = true;
          this.formPurchaseInvoices.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.formPurchaseInvoices as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
        }
        let valueCurrency = {
          PreCurrency: event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID || ''
        };
        this.currencyIDChange(field, valueCurrency);
        break;

      case 'exchangerate':
        if (value == null) {
          this.isPreventChange = true;
          setTimeout(() => {
            this.formPurchaseInvoices.setValue(field, this.preData?.exchangeRate, {});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          if (this.preData?.exchangeRate != null) {
            var key = Util.camelize(field);
            var $error = (this.formPurchaseInvoices as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          return;
        }
        if (this.preData?.exchangeRate == this.formPurchaseInvoices?.data?.exchangeRate) return;
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
            this.formPurchaseInvoices.setValue(field, this.preData?.taxExchrate, {});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          return;
        }
        if (this.preData?.taxExchrate == this.formPurchaseInvoices?.data?.taxExchrate) return;
        this.taxExchRateChange(field);
        break;
      case 'invoiceno':
      case 'invoicedate':
        let memo = this.getMemoMaster(event?.component?.format);
        this.formPurchaseInvoices.setValue('memo', memo, {});
        break;
      case 'pmtmethodid':
        let indexpmtmethod = event?.component?.dataService?.data.findIndex((x) => x.PmtMethodID == event.data);
        if (value == '' || value == null || indexpmtmethod == -1) {
          this.formPurchaseInvoices.data.pmtMethodName = null;
          return;
        }
        this.formPurchaseInvoices.data.pmtMethodName = event?.component?.dataService?.data[indexpmtmethod].PmtMethodName;
        break;
      case 'pmttermid':
        let indexpmtterm = event?.component?.dataService?.data.findIndex((x) => x.PmtTermID == event.data);
        if (value == '' || value == null || indexpmtterm == -1) {
          this.formPurchaseInvoices.data.pmtTermName = null;
          return;
        }
        this.formPurchaseInvoices.data.pmtTermName = event?.component?.dataService?.data[indexpmtterm].PmtTermName;
        break;
      case 'buyer':
        let indexbuyer = event?.component?.dataService?.data.findIndex((x) => x.ObjectID == event.data);
        if (value == '' || value == null || indexbuyer == -1) {
          this.formPurchaseInvoices.data.buyerName = null;
          return;
        }
        this.formPurchaseInvoices.data.buyerName = event?.component?.dataService?.data[indexbuyer].ObjectName;
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
      this.formPurchaseInvoices.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        Object.assign(oLine, res);
        oLine = this.genFixedDims(oLine);
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
      this.formPurchaseInvoices.data,
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
    this.formPurchaseInvoices.save(null, 0, '', '', false, { allowCompare: false })
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
            if (res) {
              this.addRowDetailByType(typeBtn);
            }
          })
          return;
        }
        if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
            if (res) {
              this.addRowDetailByType(typeBtn);
            }
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
    this.formPurchaseInvoices.save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if ((this.eleGridPurchaseInvoice || this.eleGridPurchaseInvoice?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
            if (res) {
              this.saveVoucher(type);
            }
          })
          return;
        }
        if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
            if (res) {
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
          } else {
            this.api
              .exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
                this.dialogData.data?.oData,
                this.journal,
              ])
              .subscribe((res: any) => {
                if (res) {
                  res.data.isAdd = true;
                  this.formPurchaseInvoices.refreshData({ ...res.data });
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
        if (this.eleGridPurchaseInvoice && this.eleGridPurchaseInvoice?.isSaveOnClick) this.eleGridPurchaseInvoice.isSaveOnClick = false;
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
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
    this.eleGridPurchaseInvoice.addRow(oLine, this.eleGridPurchaseInvoice.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let model: any = new AC_PurchaseInvoicesLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formPurchaseInvoices.data.recID;
    oLine.idiM4 = this.formPurchaseInvoices.data.warehouseID;
    oLine.note = this.formPurchaseInvoices.data.memo;
    oLine = this.genFixedDims(oLine);
    oLine = this.acService.getDataSettingFromJournal(oLine, this.journal);
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
    this.eleGridVatInvoices.addRow(oLine, this.eleGridVatInvoices.dataSource.length);
  }

  /**
   * *Hàm change đối tượng
   * @param field 
   */
  objectIDChange(field: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formPurchaseInvoices.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.formPurchaseInvoices.setValue('objectName', (res?.data?.objectName), {});
          this.formPurchaseInvoices.setValue('objectType', (res?.data?.objectType), {});
          this.formPurchaseInvoices.setValue('address', (res?.data?.address), {});
          this.formPurchaseInvoices.setValue('taxCode', (res?.data?.taxCode), {});
          this.formPurchaseInvoices.setValue('warehouseID', (res?.data?.warehouseID), {});
          this.formPurchaseInvoices.setValue('pmtMethodID', (res?.data?.pmtMethodID), {});
          this.formPurchaseInvoices.setValue('pmtTermID', (res?.data?.pmtTermID), {});
          this.formPurchaseInvoices.setValue('delModeID', (res?.data?.delModeID), {});
          this.formPurchaseInvoices.setValue('currencyID', (res?.data?.currencyID), {});
          this.formPurchaseInvoices.setValue('exchangeRate', (res?.data?.exchangeRate), {});
          this.formPurchaseInvoices.setValue('taxExchRate', (res?.data?.taxExchRate), {});
          this.formPurchaseInvoices.data.pmtMethodName = res?.data?.pmtMethodName;
          this.formPurchaseInvoices.data.pmtTermName = res?.data?.pmtTermName;
          this.formPurchaseInvoices.setValue('multi', (res?.data?.multi), {});
          if (this.eleGridPurchaseInvoice.dataSource.length) {
            this.formPurchaseInvoices.preData = { ...this.formPurchaseInvoices.data };
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
          }
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            this.eleGridPurchaseInvoice.refresh();
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
  currencyIDChange(field: any, obj: any) {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
      field,
      this.formPurchaseInvoices.data,
      JSON.stringify(obj)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.formPurchaseInvoices.setValue('exchangeRate', res?.data?.exchangeRate, {});
          this.preData = { ...this.formPurchaseInvoices?.data };
          if (this.eleGridPurchaseInvoice.dataSource.length) {
            this.formPurchaseInvoices.preData = { ...this.formPurchaseInvoices.data };
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
        this.formPurchaseInvoices.data,
        ''
      ])
      .subscribe((res: any) => {
        if (res) {
          this.preData = { ...this.formPurchaseInvoices?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.formPurchaseInvoices.preData = { ...this.formPurchaseInvoices.data };
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
        this.formPurchaseInvoices.data,
        ''
      ])
      .subscribe((res: any) => {
        if (res) {
          this.preData = { ...this.formPurchaseInvoices?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.formPurchaseInvoices.preData = { ...this.formPurchaseInvoices.data };
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
      this.formPurchaseInvoices.data,
      ''
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.formPurchaseInvoices.setValue('exchangeRate', res?.data?.exchangeRate, {});
          this.preData = { ...this.formPurchaseInvoices?.data };
          if (res?.isRefreshGrid) {
            this.eleGridPurchaseInvoice.refresh();
            this.formPurchaseInvoices.preData = { ...this.formPurchaseInvoices.data };
            this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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

      if (this.journal.useDutyTax && this.formPurchaseInvoices.data.currencyID != this.baseCurr) {
        hSalesTaxAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['SalesTaxAmt2'], hSalesTaxAmt2);

      if (this.journal.useExciseTax && this.formPurchaseInvoices.data.currencyID != this.baseCurr) {
        hExciseTaxAmt2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['ExciseTaxAmt2'], hExciseTaxAmt2);

      if (this.journal.vatControl && this.formPurchaseInvoices.data.currencyID != this.baseCurr) {
        hVATAmt2 = true;
        hVATBase2 = true;
      }
      this.eleGridPurchaseInvoice.showHideColumns(['VATAmt2'], hVATAmt2);
      this.eleGridPurchaseInvoice.showHideColumns(['VATBase2'], hVATBase2);

      if (this.formPurchaseInvoices.data.currencyID != this.baseCurr) {
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
        this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
        this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
        this.dialog.dataService.update(this.formPurchaseInvoices.data).subscribe();
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
  setValidateForm() {
    let lstRequire: any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({ field: 'VoucherNo', isDisable: false, require: false });
    }
    this.formPurchaseInvoices.setRequire(lstRequire);
  }

  /**
   * *Hàm check validate trước khi save line (cashpayment)
   * @param data 
   * @returns 
   */
  beforeSaveRowPurchase(event: any) {
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridPurchaseInvoice.showErrorField('quantity', 'E0341');
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
  beforeSaveRowVATInvoice(event: any) {
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridVatInvoices.showErrorField('quantity', 'E0341');
        event.cancel = true;
        return;
      }
      if (event.rowData.unitPrice == 0 || event.rowData.unitPrice < 0) {
        this.eleGridVatInvoices.showErrorField('unitPrice', 'E0730');
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
      } else {
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
      this.eleGridPurchaseInvoice.saveRow((res: any) => { //? save lưới trước
        if (res) {
          data.recID = Util.uid();
          data.index = this.eleGridPurchaseInvoice.dataSource.length;
          delete data?._oldData;
          this.eleGridPurchaseInvoice.addRow(data, this.eleGridPurchaseInvoice.dataSource.length);
        }
      })
    }

    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res) {
          data.recID = Util.uid();
          data.index = this.eleGridVatInvoices.dataSource.length;
          delete data?._oldData;
          this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
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
    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      objectName = 'Mua hàng của ' + this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName;
      if (this.formPurchaseInvoices?.data?.invoiceNo) invoiceno = 'theo hóa đơn ' + this.formPurchaseInvoices?.data?.invoiceNo;
      if (this.formPurchaseInvoices?.data?.invoiceDate) invoicedate = 'ngày ' + this.tranform.transform(this.formPurchaseInvoices?.data?.invoiceDate, format);
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
      this.formPurchaseInvoices.data.invoiceNo = invoiceNo.substring(0, invoiceNo.lastIndexOf(',') + 0);
    }
  }
  //#endregion Function
}
