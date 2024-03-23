import { ChangeDetectionStrategy, Component, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { UIComponent, CodxGridviewV2Component, CodxFormComponent, DialogRef, FormModel, NotificationsService, AuthStore, DialogData, Util, DialogModel } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmSettledInvoices } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { Validators } from '@angular/forms';
import { AC_CashReceiptsLines } from '../../../models/AC_CashReceiptsLines.model';
import { SuggestionAdd } from '../../../share/suggestion-add/suggestion-add.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-cashreceipts-add',
  templateUrl: './cashreceipts-add.component.html',
  styleUrls: ['./cashreceipts-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashreceiptsAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashReceipt') eleGridCashReceipt: CodxGridviewV2Component;
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any;
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any;
  @ViewChild('eleCbxPayor') eleCbxPayor: any;
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any;
  @ViewChild('eleCbxBankAcct') eleCbxBankAcct: any;
  @ViewChild('eleCbxSubType') eleCbxSubType: any;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  fmSettledInvoices:any = fmSettledInvoices;
  fmCashReceiptsLine: FormModel = {
    funcID: 'ACT0401',
    formName: 'CashReceiptsLines',
    entityName: 'AC_CashReceiptsLines',
    gridViewName: 'AC_CashReceiptsLines',
  };
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  baseCurr: any; 
  isPreventChange:any = false;
  postDateControl:any;
  preData:any;
  nextTabIndex:any;
  refNo:any;
  refTotalAmt:any = 0;
  editSettings:EditSettingsModel = {
    allowAdding:false,
    allowEditing:false,
    allowDeleting:false,
    allowEditOnDblClick:false,
    allowNextRowEdit:false
  }
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
    private ngxLoader: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog; 
    this.dialogData = dialogData; 
    this.headerText = dialogData.data?.headerText; 
    this.dataDefault = { ...dialogData.data?.oData }; 
    this.journal = { ...dialogData.data?.journal }; 
    this.baseCurr = dialogData.data?.baseCurr;
  }
  //#endregion Contructor

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
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit() {
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){
    this.setValidateForm();
  }

  /**
   * *Hàm khởi tạo các tab detail khi mở form(ẩn hiện tab theo loại chứng từ)
   * @param event
   * @param eleTab
   */
  createTabDetail(event: any, eleTab: TabComponent) {
    this.showHideTabDetail(this.master.data.subType, this.elementTabDetail);
  }

  // /**
  //  * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
  //  * @param columnsGrid : danh sách cột của lưới
  //  */
  initGridCashReceipt(eleGrid:CodxGridviewV2Component) {
    let hideFields = [];
    let setting = this.acService.getSettingFromJournal(eleGrid,this.journal);
    eleGrid = setting[0];
    //* Thiết lập format number theo đồng tiền hạch toán
    this.settingFormatGridCashReceipt(eleGrid)

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (!hideFields.includes('Settlement') && this.master?.data?.subType == '11') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      hideFields.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') {
      if (this.master?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else { //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.master?.data?.currencyID == this.baseCurr) {
        //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Có,HT
        hideFields.push('CR2'); //? => ẩn field tiền Nợ,HT
      }
    }
    eleGrid.showHideColumns(hideFields);
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới SettledInvoices (Ẩn hiện các cột theo đồng tiền hạch toán)
   * @param columnsGrid danh sách cột của lưới
   */
  initGridSettledInvoices(eleGrid) {
    this.settingFormatGridSettledInvoices(eleGrid);
    //* Thiết lập các field ẩn theo đồng tiền hạch toán
    let hideFields = [];
    if (this.master?.data?.currencyID == this.baseCurr) {
      hideFields.push('BalAmt2');
      hideFields.push('SettledAmt2');
      hideFields.push('CashDisc2');
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
   * *Hàm xử lí đổi loại chứng từ
   * @param event
   * @param eleTab
   */
  changeSubType(event?: any) {
    if(this.isPreventChange){
      this.isPreventChange = false;
      return;
    }
    if (event && event.data[0] && ((this.eleGridCashReceipt && this.eleGridCashReceipt.dataSource.length > 0)
    || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length > 0))) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          let obj = {
            SubType : event.data[0]
          }
          this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
            'subType',
            this.master.data,
            JSON.stringify(obj)
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            this.master.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
            this.dialog.dataService.update(this.master.data).subscribe();
            if(this.eleGridCashReceipt) this.eleGridCashReceipt.dataSource = [];
            if(this.eleGridSettledInvoices) this.eleGridSettledInvoices.dataSource = [];
            this.showHideTabDetail(
              this.master?.data?.subType,
              this.elementTabDetail
            );
            this.onDestroy();
          });
        } else {
          this.isPreventChange = true;
          this.eleCbxSubType.setValue(this.master.data.subType);
        }
      });
    } else {
      this.master.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
      this.detectorRef.detectChanges();
      if (this.elementTabDetail) {
        this.showHideTabDetail(this.master?.data?.subType, this.elementTabDetail);
      }
    }
    this.setValidateForm()
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.master.setValue('updateColumns','',{});
    let preValue:any;
    switch (field.toLowerCase()) {
      //* So quy
      case 'cashbookid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CashBookID  || '',
        this.cashBookIDChange(field, preValue);
        break;

      //* Li do thu
      case 'reasonid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID  || '',
        this.reasonIDChange(field, preValue)
        break;

      case 'totalamt':
        if(value == null){
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field,this.preData?.totalAmt,{});
            this.isPreventChange = false;
          }, 50);
          return;
        }
        this.preData = {...this.master?.data};
        break;

      //* Doi tuong
      case 'objectid':
        this.objectIDChange(field);
        break;

      //* Ten nguoi gui
      case 'payor':
        this.payorChange(field);
        break;

      //* Tien te
      case 'currencyid':
        if(value == '' || value == null){
          this.isPreventChange = true;
          this.master.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        }
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID  || '',
        this.currencyIDChange(field,preValue);
        break;

      //* Ty gia
      case 'exchangerate':
        if(value == null){
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field,this.preData?.exchangeRate,{});
            this.isPreventChange = false;
            this.detectorRef.detectChanges();
          }, 50);
          if (this.preData?.exchangeRate != null) {
            var key = Util.camelize(field);
            var $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          if(this.preData?.exchangeRate == this.master?.data?.exchangeRate) return;
          return;
        }
        this.exchangeRateChange(field);
        break;

      //* Ngay chung tu
      case 'voucherdate':
        if(value == null) return;
        this.voucherDateChange(field);
        break;
    }
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLine(event: any) {
    let oLine = event.data;
    let field = event.field;
    this.eleGridCashReceipt.startProcess();
    this.api.exec('AC','CashReceiptsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridCashReceipt.endProcess();
    })
  }

  /**
   * *Hàm xử lí change value của hóa đơn công nợ (tab hóa đơn công nợ)
   * @param e
   */
  valueChangeLineSettledInvoices(e: any) {
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
              this.eleGridSettledInvoices.rowDataSelected[e.field] =
                res[e.field];
              this.eleGridSettledInvoices.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine() {
    this.master.save(null, 0, '', '', false,{allowCompare:false})
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridCashReceipt && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
          this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          })
          return;
        }
        if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
          this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          })
          return;
        }
      });
  }
  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridCashReceipt && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridCashReceipt.deleteRow(data);
        }
      })
    }

    if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridSettledInvoices.deleteRow(data);
        }
      })
    }
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridCashReceipt && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridCashReceipt.dataSource.length;
          delete data?._oldData;
          this.eleGridCashReceipt.addRow(data, this.eleGridCashReceipt.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    switch(event?.selectedIndex){
      case 0:
        if (this.eleGridCashReceipt && this.eleGridCashReceipt.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        break;
      case 1:
        if (this.eleGridSettledInvoices && this.eleGridSettledInvoices.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        break;
    }
    this.setValidateForm();
  }

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }
  //#endregion Event

  //#region Method
  /**
   * *Hàm lưu chứng từ
   * @returns
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
        if (isError) {
          this.ngxLoader.stop();
          return;
        }
        if ((this.eleGridCashReceipt || this.eleGridCashReceipt?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridCashReceipt.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }else{
              this.ngxLoader.stop();
            }
          })
          return;
        }
        if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') {
          this.eleGridSettledInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }else{
              this.ngxLoader.stop();
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
      .exec('AC', 'CashReceiptsBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data).subscribe();
          if (type == 'save') {
            this.dialog.close();
          }else{
            this.api
            .exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
              null,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.master.refreshData({...res.data});
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
        if(this.eleGridCashReceipt && this.eleGridCashReceipt?.isSaveOnClick) this.eleGridCashReceipt.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
        this.ngxLoader.stop();
      });
  }

  /**
   * *Hàm hủy bỏ chứng từ
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
                this.dialog.close({type:'discard'});
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
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Method

  //#region Function

  /**
   * *Hàm thay đổi sổ quỹ
   * @param field 
   * @param obj 
   */
  cashBookIDChange(field:any,preValue:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.master.setValue('currencyID',res?.data?.currencyID,{});
        this.master.setValue('exchangeRate',(res?.data?.exchangeRate),{});
        this.isPreventChange = false;
        this.preData = {...this.master?.data};
        if(res?.isRefreshGrid){
          this.showHideColumn();
          if (this.eleGridCashReceipt.dataSource.length) {
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
          }
          setTimeout(() => {
            this.eleGridCashReceipt.refresh();
          }, 50);
        }
      }
      this.onDestroy();
    });
  }

  /**
   * *Hàm thay đổi lí do chi
   * @param field 
   * @param obj 
   */
  reasonIDChange(field:any,obj:any){
    let memo = this.getMemoMaster();
    this.master.setValue('memo',memo,{});
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      JSON.stringify(obj)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.master.data.reasonName = res?.data?.reasonName;
        this.master.setValue('memo', res?.data?.memo, {});
        this.preData = { ...this.master?.data };
        if (res?.isRefreshGrid) {
          this.master.preData = { ...this.master.data };
          this.dialog.dataService.update(this.master.data).subscribe();
          this.eleGridCashReceipt.refresh();
        }
      }
      this.onDestroy();
    });
  }

  /**
   * *Hàm thay đổi đối tượng
   */
  objectIDChange(field){
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.setValue('objectName', res?.data?.objectName, {});
          this.master.setValue('memo', res?.data?.memo, {});
          this.master.setValue('bankAcctID', null, {});
          this.preData = { ...this.master?.data };
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm thay đổi tên người nhận
   */
  payorChange(field){
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.setValue('payorID', res?.data?.payorID, {});
          this.master.setValue('memo', res?.data?.memo, {});
          this.preData = { ...this.master?.data };
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm thay đổi tiền tệ
   * @param field 
   */
  currencyIDChange(field:any,preValue:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.master.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.master?.data};
        if (this.eleGridCashReceipt.dataSource.length) {
          this.master.preData = {...this.master.data};
          this.dialog.dataService.update(this.master.data).subscribe();
        }
        if (res?.isRefreshGrid) {
          this.showHideColumn();
          setTimeout(() => {
            this.eleGridCashReceipt.refresh();
          }, 100);
        }
        this.isPreventChange = false;
      }
      this.onDestroy();
    });
  }

  /**
   * *Hàm thay đổi tỷ giá
   * @param field 
   */
  exchangeRateChange(field:any){
    this.api
        .exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
          field,
          this.master.data,
          ''
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res:any) => {
          if (res) {
            this.preData = {...this.master?.data};
            if (res?.isRefreshGrid) {
              this.eleGridCashReceipt.refresh();
              this.master.preData = { ...this.master.data };
              this.dialog.dataService.update(this.master.data).subscribe();
              this.detectorRef.detectChanges();
            }
          }
          this.onDestroy();
        });
  }

  /**
   * *Hàm thay đổi ngày chứng từ
   * @param field 
   */
  voucherDateChange(field:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      ''
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.master.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.master?.data};
        if (res?.isRefreshGrid) {
          this.eleGridCashReceipt.refresh();
          this.master.preData = { ...this.master.data };
          this.dialog.dataService.update(this.master.data).subscribe();
          this.detectorRef.detectChanges();
        }
      }
      this.onDestroy();
    });
  }

  /**
   * *Hàm thêm dòng theo loại nút
   */
  addRowDetail() {
    switch (this.master?.data?.subType) {
      case '11':
        this.addLine();
        break;
      case '12':
        this.addSettledInvoices();
        break;
      case '13':
        this.addSuggestion('2');
        break;
      // case '14':
      //   this.addSuggestion('2');
      //   break;
      case '19':
        if (this.elementTabDetail && this.elementTabDetail?.selectingID == '0') {
          this.addLine();
        }
        if (this.elementTabDetail && this.elementTabDetail?.selectingID == '1') {
          this.addSettledInvoices();
        }
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    this.api.exec('AC','CashReceiptsLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridCashReceipt.addRow(res, this.eleGridCashReceipt.dataSource.length);
      }
      this.onDestroy();
    })
  }

  /**
   * *Ham them hoa don cong no
   * @param typeSettledInvoices
   */
  addSettledInvoices() {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.master.data.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.master.data,
      objectName: objectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      SettledInvoicesAdd,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event) {
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.master.data).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Ham them de nghi tam ung || thanh toan
   */
  addSuggestion(type) {
    let objectName = '';
    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.master.data.objectID);
    if (indexObject > -1) {
      objectName = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName;}
    let obj = {
      oData: this.master.data,
      objectName: objectName,
      type,
      headerText : type === '1' ? 'Chọn đề nghị hoàn ứng' : ''
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = type === '1' ? 'AdvancedPayment' : 'PaymentOrder';
    dataModel.gridViewName = type === '1' ? 'grvAdvancedPayment' : 'grvPaymentOrder';
    dataModel.entityName = type === '1' ? 'AC_AdvancedPayment' : 'AC_PaymentOrder';
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      SuggestionAdd,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event) {
        this.refNo = res.event.refNo;
        this.refTotalAmt = res.event.refTotalAmt;
        this.dialog.dataService.dataSelected.refID = res.event.refID;
        this.dialog.dataService.dataSelected.refNo = res.event.refNo;
        this.dialog.dataService.dataSelected.refTotalAmt = res.event.refTotalAmt;
        this.dialog.dataService.dataSelected.refType = res.event.refType;
        let data = {...this.dialog.dataService.dataSelected};
        this.dialog.dataService.update(data).subscribe();
        this.eleGridCashReceipt.refresh();     
      }
    });
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    switch (type) {
      case '11':
      case '13':
      case '14':
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        break;
      case '12':
        eleTab.hideTab(0, true);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, true);
        break;
      case '19':
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, false);
          eleTab.select(0);
          break;
    }
  }

  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridCashReceipt) {
      //* Thiết lập hiện cột tiền HT cho lưới nếu chứng từ có ngoại tệ
    let hDR2 = false;
    let hCR2 = false;
    if (this.master.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
      if (this.journal.entryMode == '1') {
        hDR2 = true; //? => mode 2 tài khoản => hiện cột số tiền,HT
      } else {
        hDR2 = true; //? mode 1 tài khoản => hiện cột nợ,HT
        hCR2 = true; //? mode 1 tài khoản => hiện cột có,HT
      }
    }
    this.eleGridCashReceipt.showHideColumns(['DR2'], hDR2);
    this.eleGridCashReceipt.showHideColumns(['CR2'], hCR2);
    this.settingFormatGridCashReceipt(this.eleGridCashReceipt);
    }

    if (this.eleGridSettledInvoices) {
      let hBalAmt2 = false;
      let hSettledAmt2 = false;
      let hSettledDisc2 = false;
      if (this.master.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
        hBalAmt2 = true;
        hSettledAmt2 = true;
        hSettledDisc2 = true;
      }
      this.eleGridSettledInvoices.showHideColumns(['BalAmt2'], hBalAmt2);
      this.eleGridSettledInvoices.showHideColumns(['SettledAmt2'], hSettledAmt2);
      this.eleGridSettledInvoices.showHideColumns(['SettledDisc2'], hSettledDisc2);
    }
    this.refreshGrid();
  }

  /**
   * *Hàm get ghi chú từ lí do chi + đối tượng + tên người nhận
   * @returns
   */
  getMemoMaster() {
    let newMemo = ''; //? tên ghi chú mới
    let reasonName = ''; //? tên lí do thu
    let objectName = ''; //? tên đối tượng
    let payName = ''; //? tên người nhận

    let indexReason =
      this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value
      );
    if (indexReason > -1) {
      reasonName = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName + ' - ';
    }

    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      objectName = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName + ' - ';
    }

    if(this.master?.data?.payor) payName = this.master?.data?.payor  + ' - ';
    
    newMemo = reasonName + objectName + payName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  /**
   * *Hàm các sự kiện của lưới
   * @param event
   */
  onActionGridCashReceipt(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine();
        break;
      case 'add':
      case 'update':
      case 'delete':
        if(this.master.data.totalAmt != 0){
          let total = this?.eleGridCashReceipt.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
          if(total > this.master.data.totalAmt) this.notification.notifyCode('AC0012');
        }
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridCashReceipt && this.eleGridCashReceipt.rowDataSelected) {
        this.eleGridCashReceipt.rowDataSelected = null;
      }
      if(this.eleGridCashReceipt.isSaveOnClick) this.eleGridCashReceipt.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddCash'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
      case 'beginEdit': //? trước khi thêm dòng
        break;
    }
  }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridCashReceipt && this.elementTabDetail?.selectingID == '0'){
      this.eleGridCashReceipt.dataSource = [];
      this.eleGridCashReceipt.refresh();
      return;
    }
    if(this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1'){
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
      return;
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event,type = '') {
    if (type === 'gridcash') {
      event.forEach((element) => {
        if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
          element.disabled = false;
          element.isbookmark = false;
        }else{
          element.disabled = true;
        }
      });
    }else{
      event.forEach((element) => {
        if (element.functionID == 'SYS102') {
          element.disabled = false;
          element.isbookmark = false;
        }else{
          element.disabled = true;
        }
      });
    }
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid
   */
  settingFormatGridCashReceipt(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.master.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('dr','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('dr2','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr2','n'+(setting.dBaseCurr || 0));
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('dr','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('cr','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('dR2','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cR2','n'+(setting.dBaseCurr || 0));
    }
  }

  settingFormatGridSettledInvoices(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.master.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
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

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let rObjectID = false;
    let lstRequire :any = [];
    if (this.elementTabDetail?.selectingID == '1') {
      rObjectID = true;
    }
    lstRequire.push({field : 'ObjectID',isDisable : false,require:rObjectID});
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.master.setRequire(lstRequire);
  }

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null) && 
      e.target.closest('button') == null
    ) {
      if (this.eleGridCashReceipt && this.eleGridCashReceipt?.gridRef?.isEdit) {
        this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridCashReceipt.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridSettledInvoices && this.eleGridSettledInvoices?.gridRef?.isEdit) {
        this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridSettledInvoices.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
              }
            }, 100);
          }
        })
      }
    }
  }
  //#endregion Function
}
