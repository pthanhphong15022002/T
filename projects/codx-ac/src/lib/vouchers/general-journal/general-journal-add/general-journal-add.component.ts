import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, SubModel, UIComponent, Util } from 'codx-core';
import { CodxAcService, fmGeneralJournalsLines, fmGeneralJournalsLinesOne, fmSettledInvoices, fmVATInvoices } from '../../../codx-ac.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { RoundService } from '../../../round.service';
import { Subject, map, takeUntil } from 'rxjs';
import { AC_GeneralJournalsLines } from '../../../models/AC_GeneralJournalsLines.model';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-general-journal-add',
  templateUrl: './general-journal-add.component.html',
  styleUrls: ['./general-journal-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralJournalAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('eleGridGeneral') eleGridGeneral: CodxGridviewV2Component; //? element codx-grv2 lưới
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('master') public master: CodxFormComponent; //? element codx-form
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  bankAcctIDPay: any = null;
  bankNamePay: any;
  bankAcctIDReceive: any = null;
  bankReceiveName: any;
  ownerReceive: any;
  isload:any = true;
  fmGeneralJournalsLines: any = fmGeneralJournalsLines;
  fmGeneralJournalsLinesOne :any = fmGeneralJournalsLinesOne
  //fmCashpaymentLineOne: any = fmCashPaymentsLinesOneAccount;
  fmSettledInvoices:any = fmSettledInvoices;
  fmVATInvoices:any = fmVATInvoices;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  childModelCashPayment: SubModel = {
    gridviewName:'grvVATInvoices',
    formName:'VATInvoices',
    entityName:'AC_VATInvoices',
    service:'AC',
    predicates:'LineID=@0',
    rowNoField:'rowNo',
  }
  baseCurr: any; //? đồng tiền hạch toán
  vatAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)?
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
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
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
    if(this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){
    this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  initGridGeneral(eleGrid:CodxGridviewV2Component){
    let hideFields = [];
    let setting = this.acService.getSettingFromJournal(eleGrid,this.journal);
    eleGrid = setting[0];
    //* Thiết lập format number theo đồng tiền hạch toán
    this.settingFormatGridGeneral(eleGrid)

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (!hideFields.includes('Settlement') && this.master?.data?.subType == '1') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
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
      case 'SYS04':
        this.copyRow(data);
        break;
      case 'SYS102':
      case 'SYS02':
        this.deleteRow(data);
        break;
    }
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
      //* Li do chi
      case 'reasonid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID  || '',
        this.reasonIDChange(field, preValue)
        break;

      case 'objectid':
        this.objectIDChange(field);
        break;

      //* Tien te
      case 'currencyid':
        if(value == '' || value == null){
          this.isPreventChange = true;
          this.master.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            let key = Util.camelize(field);
            let $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
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
    this.eleGridGeneral.startProcess();
    this.api.exec('AC','GeneralJournalsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridGeneral.endProcess();
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
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      this.master.data.unbounds = {
        itemID: event?.itemData?.ItemID,
      };
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashPayments',
      this.master.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        this.vatAccount = res?.vatAccount;
        this.detectorRef.detectChanges();
        this.eleGridVatInvoices.endProcess();
      }
    })
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
        if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
          this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
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
        if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') { //? nếu lưới VatInvoices có active hoặc đang edit
          this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          })
          return;
        }
      });
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    switch(event?.selectedIndex){
      case 0:
        if (this.eleGridGeneral && this.eleGridGeneral.isEdit) {
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
      case 2:
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        if(event?.selectingIndex == 0){
          if(this.eleGridGeneral) this.eleGridGeneral.refresh();
        }
        break;
    }
    this.setValidateForm();
  }

  //#endregion Event

  //#region Method
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
        if ((this.eleGridGeneral || this.eleGridGeneral?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridGeneral.saveRow((res: any) => { //? save lưới trước
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
        if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '2') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
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
      .exec('AC', 'GeneralJournalsBusiness', 'UpdateVoucherAsync', [
        this.master.data,
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
            .exec('AC', 'GeneralJournalsBusiness', 'SetDefaultAsync', [
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
        if(this.eleGridGeneral && this.eleGridGeneral?.isSaveOnClick) this.eleGridGeneral.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
        if(this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
        this.ngxLoader.stop();
      });
  }
  //#endregion Method

  //#region Function

  /**
   * *Hàm thay đổi lí do chi
   * @param field
   * @param obj
   */
  reasonIDChange(field:any,preValue:any){
    this.api.exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
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
            this.eleGridGeneral.refresh();
          }
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm thay đổi đối tượng
   */
  objectIDChange(field: any){
    this.api.exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.objectName = res?.data?.objectName;
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
    this.api.exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
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
          if (this.eleGridGeneral.dataSource.length) {
            this.master.preData = { ...this.master.data };
            this.dialog.dataService.update(this.master.data).subscribe();
          }
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            setTimeout(() => {
              this.eleGridGeneral.refresh();
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
        .exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
          field,
          this.master.data,
          ''
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res:any) => {
          if (res) {
            this.preData = {...this.master?.data};
            if (res?.isRefreshGrid) {
              this.eleGridGeneral.refresh();
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
    this.api.exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
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
          this.eleGridGeneral.refresh();
          this.master.preData = { ...this.master.data };
          this.dialog.dataService.update(this.master.data).subscribe();
          this.detectorRef.detectChanges();
        }
      }
      this.onDestroy();
    });
  }

   /**
   * *Hàm thêm dòng theo loại
   */
  addRowDetail() {
    if (this.elementTabDetail && this.elementTabDetail?.selectingID == '0') {
      this.addLine();
    }
    if (this.elementTabDetail && this.elementTabDetail?.selectingID == '1') {
      this.addSettledInvoices();
    }
    if (this.elementTabDetail && this.elementTabDetail?.selectingID == '2') {
      this.addLineVatInvoices();
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    this.api.exec('AC','GeneralJournalsLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridGeneral.addRow(res, this.eleGridGeneral.dataSource.length);
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
      'AC_GeneralJournals',
      'AC_GeneralJournalsLines',
      this.master.data,
      this.eleGridGeneral.rowDataSelected,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridVatInvoices.addRow(res, this.eleGridVatInvoices.dataSource.length);
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
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridGeneral(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine();
        break;
      case 'add':
      case 'update': //? sau khi thêm dòng thành công

        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridGeneral && this.eleGridGeneral.rowDataSelected) {
        this.eleGridGeneral.rowDataSelected = null;
      }
      if(this.eleGridGeneral.isSaveOnClick) this.eleGridGeneral.isSaveOnClick = false;
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
   * *Hàm các sự kiện của lưới VatInvoice
   * @param event
   */
  onActionGridVatInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
        this.eleGridVatInvoices.rowDataSelected = null;
      }
      if(this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
      setTimeout(() => {
        let element = document.getElementById('btnAddVAT');
        element.focus();
      }, 100);
        break;
    }
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid
   */
  settingFormatGridGeneral(eleGrid){
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
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event,type = '') {
    if (type === 'gridgeneral') {
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
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') {
      this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridGeneral.deleteRow(data);
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
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridVatInvoices.deleteRow(data);
        }
      })
    }
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') {
      this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridGeneral.dataSource.length;
          delete data?._oldData;
          this.eleGridGeneral.addRow(data, this.eleGridGeneral.dataSource.length);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridVatInvoices.dataSource.length;
          delete data?._oldData;
          this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
        }
      })
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

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridGeneral && this.elementTabDetail?.selectingID == '0'){
      this.eleGridGeneral.dataSource = [];
      this.eleGridGeneral.refresh();
      return;
    }
    if(this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1'){
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
      return;
    }
    if(this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2'){
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
      return;
    }
  }

  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridGeneral) {
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
    this.eleGridGeneral.showHideColumns(['DR2'], hDR2);
    this.eleGridGeneral.showHideColumns(['CR2'], hCR2);
    this.settingFormatGridGeneral(this.eleGridGeneral);
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
  }

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null) &&
      e.target.closest('button') == null
    ) {
      if (this.eleGridGeneral && this.eleGridGeneral?.gridRef?.isEdit) {
        this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridGeneral.isSaveOnClick = false;
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
      if (this.eleGridVatInvoices && this.eleGridVatInvoices?.gridRef?.isEdit) {
        this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridVatInvoices.isSaveOnClick = false;
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
