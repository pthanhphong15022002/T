import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { CodxDropdownSelectComponent, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, SubModel, UIComponent, Util } from 'codx-core';
import { CodxAcService, fmGeneralJournalsLines, fmGeneralJournalsLinesOne, fmSettledInvoices, fmVATInvoices } from '../../../codx-ac.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { RoundService } from '../../../round.service';
import { Subject, map, takeUntil } from 'rxjs';
import { AC_GeneralJournalsLines } from '../../../models/AC_GeneralJournalsLines.model';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

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
  @ViewChild('eleCbxSubType') eleCbxSubType: CodxDropdownSelectComponent;
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
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

  /**
   * *Hàm khởi tạo các tab detail khi mở form(ẩn hiện tab theo loại chứng từ)
   * @param event
   * @param eleTab
   */
  createTabDetail(event: any, eleTab: TabComponent) {
    this.showHideTabDetail(this.master?.data?.subType, this.elementTabDetail);
  }

  initGridGeneral(eleGrid:CodxGridviewV2Component){
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

  changeSubType(event?: any) {
    if (this.isPreventChange) {
      this.isPreventChange = false;
      return;
    }
    if (event && event.data[0] && ((this.eleGridGeneral && this.eleGridGeneral.dataSource.length > 0)
      || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length > 0)
      || (this.eleGridVatInvoices && this.eleGridVatInvoices.dataSource.length > 0))) {
      this.notification.alertCode('AC014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          let obj = {
            SubType: event.data[0]
          }
          this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            'subType',
            this.master.data,
            JSON.stringify(obj)
          ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              this.master.setValue('subType', event.data[0], {});
              this.dialog.dataService.update(this.master.data).subscribe();
              if (this.eleGridGeneral) this.eleGridGeneral.dataSource = [];
              if (this.eleGridSettledInvoices) this.eleGridSettledInvoices.dataSource = [];
              if (this.eleGridVatInvoices) this.eleGridVatInvoices.dataSource = [];
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
      this.master.setValue('subType', event.data[0], {});
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
    let preValue:any;
    switch (field.toLowerCase()) {
      //* Li do chi
      case 'reasonid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID  || '';
        break;
      //* Tien te
      case 'currencyid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID  || '';
        break;
    }
    this.api.exec('AC', 'GeneralJournalsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          // this.master.setObjValue(res?.data,{});
          this.isPreventChange = false;
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            if (this.eleGridGeneral.dataSource.length) {
              this.master.preData = { ...this.master.data };
              this.dialog.dataService.update(this.master.data).subscribe();
              setTimeout(() => {
                this.eleGridGeneral.refresh();
              }, 50);
            }
          }
        }
        this.master.setValue('updateColumns', '', {});
        this.master.setValue('updateColumn', '', {});
        this.onDestroy();
      });
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
    this.eleGridGeneral.startProcess();
    this.api.exec('AC','GeneralJournalsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      if(this.journal.settleControl == "1"){
        if(oLine.settlement != '0'){
          this.eleGridGeneral.setEditableFields(['SettledNo'],false);
        }else{
          this.eleGridGeneral.setEditableFields(['SettledNo'],true);
        } 
      }
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
      'AC_GeneralJournals',
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
        let rObjectID = false;
        let lstRequire: any = [];
        if (this.eleGridGeneral && this.eleGridGeneral.rowDataSelected == null) {
          rObjectID = true;
        }
        lstRequire.push({ field: 'ObjectID', isDisable: false, require: rObjectID });
        this.master.setRequire(lstRequire);
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
              return;
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
              return;
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
              return;
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
      .subscribe({
        next:(res:any)=>{
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
        },
        complete:()=>{
          this.ngxLoader.stop();
          if(this.eleGridGeneral && this.eleGridGeneral?.isSaveOnClick) this.eleGridGeneral.isSaveOnClick = false;
          if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
          if(this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
          this.onDestroy();
        }
      });
  }
  //#endregion Method

  //#region Function
  /**
   * *Hàm thêm mới dòng
   */
  addLine() {
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
        if (this.eleGridGeneral) {
          this.eleGridGeneral.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error'){
              this.api.exec('AC','GeneralJournalsLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
                if (res) {
                  this.eleGridGeneral.addRow(res, this.eleGridGeneral.dataSource.length);
                }
                this.onDestroy();
              })
            }
          })
          return;
        }
      });
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
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
        if (this.eleGridVatInvoices) {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error'){
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
          })
          return;
        }
      });
  }

  /**
   * *Ham them hoa don cong no
   * @param typeSettledInvoices
   */
  addSettledInvoices() {
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
        if (this.eleGridSettledInvoices) {
          this.eleGridSettledInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error'){
              let data = {
                master: this.master.data,
                line : null,
                mode:'1',
                service:'AC',
                entityNameMaster:'AC_GeneralJournals',
                entityNameLine:'AC_GeneralJournalsLines',
              };
              if((this.journal.journalType+'1') === this.master.data.subType) data['mode'] = '2';
              if (this.eleGridGeneral && this.eleGridGeneral.rowDataSelected) {
                if (this.eleGridGeneral?.rowDataSelected?.objectID == null || this.eleGridGeneral?.rowDataSelected?.objectID == '') {
                  this.notification.notifyCode(
                    'SYS009',
                    0,
                    '"' + this.master.gridviewSetup['ObjectID']?.headerText + '"'
                  );
                  return;
                }
                data['line'] = this.eleGridGeneral.rowDataSelected;
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
          })
          return;
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
        this.addLine();
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
      case 'beginEdit':
        if(this.journal.settleControl == "1"){
          let data = event.data;
          if(data.settlement == '' || data.settlement == null || data.settlement != '0') 
            this.eleGridGeneral.setEditableFields(['SettledNo'],false);
        }
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
        this.addLineVatInvoices();
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
    let newData = {...data};
    if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') {
      this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridGeneral.dataSource.length;
          delete newData?._oldData;
          this.eleGridGeneral.addRow(newData, this.eleGridGeneral.dataSource.length);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridVatInvoices.dataSource.length;
          delete newData?._oldData;
          this.eleGridVatInvoices.addRow(newData, this.eleGridVatInvoices.dataSource.length);
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
    if (this.master.data.subType == (this.journal.journalType+'1')) {
      rObjectID = true;
    }
    lstRequire.push({ field: 'ObjectID', isDisable: false, require: rObjectID });
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.master.setRequire(lstRequire);
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
    this.settingFormatGrid(this.eleGridGeneral);
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
