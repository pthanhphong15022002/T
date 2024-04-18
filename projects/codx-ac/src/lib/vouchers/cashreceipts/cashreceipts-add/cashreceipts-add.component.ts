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
  editSettings:EditSettingsModel = {
    allowAdding:false,
    allowEditing:false,
    allowDeleting:false,
    allowEditOnDblClick:false,
    allowNextRowEdit:false
  }
  isActive:any = true;
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
    this.isActive = dialogData.data?.isActive; 
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue)),takeUntil(this.destroy$)
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
  initGrid(eleGrid:CodxGridviewV2Component) {
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

    this.settingFormatGrid(eleGrid)

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
    if (this.journal.settleControl == "0") hideFields.push("Settlement");

    if (this.journal.entryMode == '1') {
      if (this.dataDefault.currencyID == this.baseCurr) hideFields.push('DR2');
    }else{
      if (this.dataDefault.currencyID == this.baseCurr){
        hideFields.push('DR2');
        hideFields.push('CR2');
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
    this.setValidateForm();
    this.showHideColumn();
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
    switch(field.toLowerCase()){
      case 'settledno':
        oLine.settledID = event?.itemData?.RecID;
        break;
    }
    this.eleGridCashReceipt.startProcess();
    this.api.exec('AC','CashReceiptsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      if(this.journal.settleControl == "1" && (this.journal.journalType+'2' === this.master.data.subType || this.journal.journalType+'9' === this.master.data.subType)){
        if(oLine.settlement != '0'){
          this.eleGridCashReceipt.setEditableFields(['SettledNo'],false);
        }else{
          this.eleGridCashReceipt.setEditableFields(['SettledNo'],true);
        } 
      }
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
    let newData = {...data};
    if (this.eleGridCashReceipt && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridCashReceipt.dataSource.length;
          delete newData?._oldData;
          this.eleGridCashReceipt.addRow(newData, this.eleGridCashReceipt.dataSource.length);
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
              return;
            }
          })
        }
        if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') {
          this.eleGridSettledInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }else{
              this.ngxLoader.stop();
              return;
            }
          })
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
      .subscribe({
        next:(res:any)=>{
          if (res?.update) {
            this.dialog.dataService.update(res.data,true).subscribe();
            if (type == 'save') {
              this.dialog.close(res);
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
        },
        complete:()=>{
          this.ngxLoader.stop();
          if(this.eleGridCashReceipt && this.eleGridCashReceipt?.isSaveOnClick) this.eleGridCashReceipt.isSaveOnClick = false;
          if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
          this.onDestroy();
        }
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
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
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
        this.master.data.cashBookName = res?.data?.cashBookName;
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
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
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
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
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
        .exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
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
    this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
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
    switch (this.master.data.subType) {
      case `${this.journal.journalType+'1'}`:
        this.addSettledInvoices();
        break;

      case `${this.journal.journalType+'2'}`:
      case `${this.journal.journalType+'3'}`:
        this.addLine();
        break;

      case `${this.journal.journalType+'5'}`:
        this.addRequest();
        break;

      case `${this.journal.journalType+'9'}`:
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
    let data = {};
    data['master'] = this.master.data;
    if(this.master.data.subType == (this.journal.journalType + '9')){
      if (this.eleGridCashReceipt && this.eleGridCashReceipt.rowDataSelected && this.eleGridCashReceipt.rowDataSelected.objectID) {
        data['line'] = this.eleGridCashReceipt.rowDataSelected;
      }else{
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.master.gridviewSetup['ObjectID']?.headerText + '"'
        );
      }
    }
    let opt = new DialogModel();
    let dataModel = new FormModel();
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      SettledInvoicesAdd,
      '',
      null,
      null,
      '',
      data,
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
  addRequest() {
    let data = {
      master:this.master.data
    }
    let opt = new DialogModel();
    let dataModel = new FormModel();
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      SuggestionAdd,
      '',
      null,
      null,
      '',
      data,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event) {
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
    if (eleTab) {
      switch (type) {
        case `${this.journal.journalType+'1'}`:
          eleTab.hideTab(0, true);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, true);
          eleTab.select(1);
          break;

        case `${this.journal.journalType+'2'}`:
        case `${this.journal.journalType+'3'}`:
        case `${this.journal.journalType+'5'}`:
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          eleTab.hideTab(2, true);
          eleTab.select(0);
          break;

        case `${this.journal.journalType+'9'}`:
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, false);
          eleTab.select(0);
          break;

        default:
          eleTab.hideTab(0, true);
          eleTab.hideTab(1, true);
          eleTab.hideTab(2, true);
          break;
      }
    }
  }

  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridCashReceipt) {
    // set an hien can tru cong no
    let hSettlement = false;
    if(this.journal.settleControl == "1" && (this.master.data.subType == this.journal.journalType + '2' || this.master.data.subType == this.journal.journalType + '9')){
      hSettlement = true;
    }
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
    this.settingFormatGrid(this.eleGridCashReceipt);
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
      case 'beginEdit':
        if(this.journal.settleControl == "1" && (this.journal.journalType+'2' === this.master.data.subType || this.journal.journalType+'9' === this.master.data.subType)){
          let data = event.data;
          if(data.settlement == '' || data.settlement == null || data.settlement != '0') 
            this.eleGridCashReceipt.setEditableFields(['SettledNo'],false);
        }
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
  settingFormatGrid(eleGrid){
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
    if (this.master.data.subType == (this.journal.journalType+'1') || this.master.data.subType == (this.journal.journalType+'5')) {
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
            if (this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
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
            if (this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
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
