import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import {
  ContextMenuModel,
  SidebarComponent,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  AuthService,
  AuthStore,
  CRUDService,
  CodxDropdownSelectComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInplaceComponent,
  CodxInputComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SubModel,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, Subscription, firstValueFrom, map, mergeMap, pairwise, startWith, switchMap, take, takeUntil } from 'rxjs';
import { CodxAcService, fmCashPaymentsLines, fmCashPaymentsLinesOneAccount, fmSettledInvoices, fmVATInvoices } from '../../../codx-ac.service';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { RoundService } from '../../../round.service';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { E } from '@angular/cdk/keycodes';
import { Validators } from '@angular/forms';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { AC_CashPaymentsLines } from '../../../models/AC_CashPaymentsLines.model';
import { SuggestionAdd } from '../../../share/suggestion-add/suggestion-add.component';
import { CodxTabsComponent } from 'projects/codx-share/src/lib/components/codx-tabs/codx-tabs.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'lib-cashpayments-add',
  templateUrl: './cashpayments-add.component.html',
  styleUrls: ['./cashpayments-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('eleGridCashPayment') eleGridCashPayment: CodxGridviewV2Component;
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component;
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: CodxInputComponent;
  @ViewChild('eleCbxObjectID') eleCbxObjectID: CodxInputComponent;
  @ViewChild('eleCbxPayee') eleCbxPayee: CodxInputComponent;
  @ViewChild('eleCbxCashBook') eleCbxCashBook: CodxInputComponent;
  @ViewChild('eleCbxBankAcct') eleCbxBankAcct: CodxInputComponent;
  @ViewChild('eleCbxSubType') eleCbxSubType: CodxDropdownSelectComponent;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  bankAcctIDPay: any = null;
  bankNamePay: any;
  bankAcctIDReceive: any = null;
  bankReceiveName: any;
  ownerReceive: any;
  textTotal: any;
  fmCashpaymentLine: any = fmCashPaymentsLines;
  fmCashpaymentLineOne: any = fmCashPaymentsLinesOneAccount;
  fmSettledInvoices: any = fmSettledInvoices;
  fmVATInvoices: any = fmVATInvoices;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  editSettings: EditSettingsModel = {
    allowAdding: false,
    allowEditing: false,
    allowDeleting: false,
    allowEditOnDblClick: false,
    allowNextRowEdit: false
  }
  baseCurr: any;
  legalName: any;
  vatAccount: any;
  isPreventChange: any = false;
  postDateControl: any;
  nextTabIndex: number;
  preData: any;
  totalAmount:any = 0;
  isActive:any = true;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private ngxLoader: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
    
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
    this.legalName = this.dialogData.data?.legalName;
    this.isActive = dialogData.data?.isActive; 
  }
  //#endregion

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
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit() {
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }


  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
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

  // /**
  //  * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
  //  * @param columnsGrid : danh sách cột của lưới
  //  */
  initGrid(eleGrid: CodxGridviewV2Component) {
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
  initGridSettledInvoices(eleGrid:CodxGridviewV2Component) {
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
    if (this.isPreventChange) {
      this.isPreventChange = false;
      return;
    }
    if (this.eleGridCashPayment) this.eleGridCashPayment.refresh();
    if (this.eleGridSettledInvoices) this.eleGridSettledInvoices.refresh();
    if (this.eleGridVatInvoices) this.eleGridVatInvoices.refresh();
    if (event && event.data[0] && ((this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length > 0)
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
              this.dialog.dataService.update(this.master.data,true).subscribe();
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
    if (this.isPreventChange) {
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    let preValue:any = '';
    switch (field.toLowerCase()) {

      case 'cashbookid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CashBookID  || '';
        break;

      case 'reasonid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID  || '';
        break;

      case 'totalamt':
        if (value == null) {
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field, this.preData?.totalAmt, {});
            this.isPreventChange = false;
          }, 50);
          return;
        }
        break;

      case 'currencyid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID  || '';
        break;
    }
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
      preValue
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.master.setObjValue(res?.data,{});
          this.isPreventChange = false;
          if (res?.isRefreshGrid) {
            this.showHideColumn();
            if (this.eleGridCashPayment.dataSource.length) {
              this.master.preData = { ...this.master.data };
              this.dialog.dataService.update(this.master.data).subscribe();
              setTimeout(() => {
                this.eleGridCashPayment.refresh();
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
    this.eleGridCashPayment.startProcess();
    this.api.exec('AC','CashPaymentsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      if(this.journal.settleControl == "1" && (this.journal.journalType+'2' === this.master.data.subType || this.journal.journalType+'9' === this.master.data.subType)){
        if(oLine.settlement != '0'){
          this.eleGridCashPayment.setEditableFields(['SettledNo'],false);
        }else{
          this.eleGridCashPayment.setEditableFields(['SettledNo'],true);
        } 
      }
      this.eleGridCashPayment.endProcess();
    })
  }

  /**
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      oLine.itemID = event?.itemData?.ItemID;
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashPayments',
      this.master.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        Object.assign(oLine, res);
        this.vatAccount = res?.vatAccount;
        //oLine.entryMode = this.journal.entryMode;
        oLine.updateColumns = '';
        this.detectorRef.detectChanges();
        this.eleGridVatInvoices.endProcess();
        this.detectorRef.detectChanges();
      }
    })
  }

  /**
   * *Hàm xử lí change value của hóa đơn công nợ (tab hóa đơn công nợ)
   * @param e
   */
  valueChangeLineSettledInvoices(event: any) {
    let oLine = event.data;
    this.eleGridSettledInvoices.startProcess();
    this.api.exec('AC', 'SettledInvoicesBusiness', 'ValueChangedAsync', [
      event.field,
      oLine,
      this.master.data.voucherDate,
      this.master.data.currencyID,
      this.master.data.exchangeRate
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.detectorRef.detectChanges();
        this.eleGridSettledInvoices.endProcess();
      }
    })
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine() {
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
        if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
          this.eleGridCashPayment.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          })
          return;
        }
        if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') {
          this.eleGridSettledInvoices.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          })
          return;
        }
        if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
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
    if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashPayment.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          this.eleGridCashPayment.deleteRow(data);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          data.entryMode = this.journal.entryMode;
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
    if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashPayment.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          newData.recID = Util.uid();
          newData.index = this.eleGridCashPayment.dataSource.length;
          delete newData?._oldData;
          this.eleGridCashPayment.addRow(newData, this.eleGridCashPayment.dataSource.length);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          newData.recID = Util.uid();
          newData.entryMode = this.journal.entryMode;
          newData.index = this.eleGridVatInvoices.dataSource.length;
          delete newData?._oldData;
          this.eleGridVatInvoices.addRow(newData, this.eleGridVatInvoices.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm xử lí khi click các tab master
   * @param event
   * @returns
   */
  onTabSelectedMaster(event) {
    if (event.selectedIndex == 1) {
      this.loadInfoTranfer();
    }
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    switch (event?.selectedIndex) {
      case 0:
        if (this.eleGridCashPayment && this.eleGridCashPayment.isEdit) {
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

        if (event?.selectingIndex == 0 && this.master?.data?.subType == '9') {
          if (this.eleGridCashPayment) this.eleGridCashPayment.refresh();
        }
        break;
    }
    this.setValidateForm();
  }

  selecting(event){
    
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
        if(isError){
          this.ngxLoader.stop();
          return;
        } 
        if ((this.eleGridCashPayment || this.eleGridCashPayment?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridCashPayment.saveRow((res: any) => { //? save lưới trước
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
        if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '2') {
          this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
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
  saveVoucher(type) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res?.update) {
            this.dialog.dataService.update(res.data,true).subscribe();
            if (type == 'save') {
              this.onDestroy();
              this.dialog.close(res);
            } else {
              this.api
                .exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
                  null,
                  this.journal.journalNo,
                  ""
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
          if (this.eleGridCashPayment && this.eleGridCashPayment?.isSaveOnClick) this.eleGridCashPayment.isSaveOnClick = false;
          if (this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
          if (this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
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
          this.ngxLoader.start();
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next:(res:any)=>{
                if (res.data != null) {
                  this.notification.notifyCode('E0860');
                  this.api
                    .exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
                      null,
                      this.journal.journalNo,
                      ""
                    ])
                    .subscribe((res: any) => {
                      if (res) {
                        res.data.isAdd = true;
                        this.master.refreshData({ ...res.data });
                        setTimeout(() => {
                          this.refreshGrid();
                        }, 100);
                      }
                      this.ngxLoader.stop();
                      this.detectorRef.detectChanges();
                    });
                }
              },
              complete:()=>{
                this.ngxLoader.stop();
                this.onDestroy();
              }
            });
        }
      });
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
   * *Hàm thêm dòng theo loại
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

      case `${this.journal.journalType+'4'}`:
        this.addLineVatInvoices();
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
        if (this.elementTabDetail && this.elementTabDetail?.selectingID == '2') {
          this.addLineVatInvoices();
        }
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    this.api.exec('AC','CashPaymentsLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridCashPayment.addRow(res, this.eleGridCashPayment.dataSource.length);
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
      if (this.eleGridCashPayment && this.eleGridCashPayment.rowDataSelected && this.eleGridCashPayment.rowDataSelected.objectID) {
        data['line'] = this.eleGridCashPayment.rowDataSelected;
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
        this.eleGridCashPayment.refresh();
      }
    });
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    this.api.exec('AC','VATInvoicesBusiness','SetDefaultAsync',[
      'AC',
      'AC_CashPayments',
      'AC_CashPaymentsLines',
      this.master.data,
      this.eleGridCashPayment.rowDataSelected,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridVatInvoices.addRow(res, this.eleGridVatInvoices.dataSource.length);
      }
      this.onDestroy();
    })
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

        case `${this.journal.journalType+'4'}`:
          eleTab.hideTab(0, true);
          eleTab.hideTab(1, true);
          eleTab.hideTab(2, false);
          eleTab.select(2);
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
    if (this.eleGridCashPayment) {
      
    // set an hien can tru cong no
    let hSettlement = false;
    if(this.journal.settleControl == "1" && (this.master.data.subType == this.journal.journalType + '2' || this.master.data.subType == this.journal.journalType + '9')){
      hSettlement = true;
    }

    this.eleGridCashPayment.showHideColumns(['Settlement'],hSettlement); 
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
      this.eleGridCashPayment.showHideColumns(['DR2'], hDR2);
      this.eleGridCashPayment.showHideColumns(['CR2'], hCR2);
      this.settingFormatGrid(this.eleGridCashPayment);
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

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridCashpayment(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine();
        break;
      case 'add':
      case 'update':
      case 'delete':
        if(this.master.data.totalAmt != 0){
          let total = this?.eleGridCashPayment.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
          if(total > this.master.data.totalAmt) this.notification.notifyCode('AC0012');
        }
        if(this.master.data.journalType.toLowerCase() ==='bp') this.loadInfoTranfer();

        break;
      case 'closeEdit':
        if (this.eleGridCashPayment && this.eleGridCashPayment.rowDataSelected) {
          this.eleGridCashPayment.rowDataSelected = null;
        }
        if (this.eleGridCashPayment.isSaveOnClick) this.eleGridCashPayment.isSaveOnClick = false;
        setTimeout(() => {
          let element = document.getElementById('btnAddCash');
          element.focus();
        }, 100);
        break;
      case 'beginEdit':
        if(this.journal.settleControl == "1" && (this.journal.journalType+'2' === this.master.data.subType || this.journal.journalType+'9' === this.master.data.subType)){
          let data = event.data;
          if(data.settlement == '' || data.settlement == null || data.settlement != '0') 
            this.eleGridCashPayment.setEditableFields(['SettledNo'],false);
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
        this.onAddLine();
        break;
      case 'closeEdit': //? khi thoát dòng
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
          this.eleGridVatInvoices.rowDataSelected = null;
        }
        if (this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
        setTimeout(() => {
          let element = document.getElementById('btnAddVAT');
          element.focus();
        }, 100);
        break;
      case 'beginEdit': //? trước khi thêm dòng
        event.data.entryMode = this.journal.entryMode;
        break;
    }
  }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashPayment.dataSource = [];
      this.eleGridCashPayment.refresh();
      return;
    }
    if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
      return;
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
      return;
    }
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid
   */
  settingFormatGrid(eleGrid) {
    let setting = eleGrid.systemSetting;
    if (this.master.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('dr', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('dr2', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr2', 'n' + (setting.dBaseCurr || 0));
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('dr', 'n' + (setting.dSourceCurr || 0));
      eleGrid.setFormatField('cr', 'n' + (setting.dSourceCurr || 0));
      eleGrid.setFormatField('dR2', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('cR2', 'n' + (setting.dBaseCurr || 0));
    }
  }

  settingFormatGridSettledInvoices(eleGrid) {
    let setting = eleGrid.systemSetting;
    if (this.master.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('balAmt', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('balAmt2', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt2', 'n' + (setting.dBaseCurr || 0));
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('balAmt', 'n' + (setting.dSourceCurr || 0));
      eleGrid.setFormatField('balAmt2', 'n' + (setting.dSourceCurr || 0));
      eleGrid.setFormatField('settledAmt', 'n' + (setting.dBaseCurr || 0));
      eleGrid.setFormatField('settledAmt2', 'n' + (setting.dBaseCurr || 0));
    }
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm() {
    let rObjectID = false;
    let lstRequire: any = [];
    if (this.master.data.subType == (this.journal.journalType+'1') || this.master.data.subType == (this.journal.journalType+'5')) {
      rObjectID = true;
    }
    lstRequire.push({ field: 'ObjectID', isDisable: false, require: rObjectID });
    if (this.journal.assignRule == '2') {
      lstRequire.push({ field: 'VoucherNo', isDisable: false, require: false });
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
      if (this.eleGridCashPayment && this.eleGridCashPayment?.gridRef?.isEdit) {
        this.eleGridCashPayment.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridCashPayment.isSaveOnClick = false;
            if (this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                // e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridSettledInvoices && this.eleGridSettledInvoices?.gridRef?.isEdit) {
        this.eleGridSettledInvoices.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridSettledInvoices.isSaveOnClick = false;
            if (this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                //e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridVatInvoices && this.eleGridVatInvoices?.gridRef?.isEdit) {
        this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridVatInvoices.isSaveOnClick = false;
            if (this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                //e.target.select();
              }
            }, 100);
          }
        })
      }
    }
  }

  loadInfoTranfer() {
    let indexCashBook = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
    if (indexCashBook > -1) {
      this.bankAcctIDPay = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexCashBook].BankAcctID; //? lấy tài khoản chi
    }
    let indexBankAcct = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data.findIndex((x) => x.BankAcctID == this.eleCbxBankAcct?.ComponentCurrent?.value);
    if (indexBankAcct > -1) {
      this.bankAcctIDReceive = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data[indexBankAcct].BankAcctID; //? lấy tài khoản nhận
    }

    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      this.ownerReceive = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName; //? lấy tên chủ tài khoản
    }

    if (this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length) {
      this.totalAmount = this?.eleGridCashPayment.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
    }
    this.api
      .exec('BS', 'BanksBusiness', 'GetBankInfoAsync', [
        this.bankAcctIDPay,
        this.bankAcctIDReceive,
        this.master.data.totalDR,
        this.master.data.currencyID
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.bankNamePay = res?.BankPayname || '';
        this.bankReceiveName = res?.BankReceiveName || '';
        this.textTotal = res?.TextNum || '';
        this.detectorRef.detectChanges();
        this.onDestroy();
      });
  }
  //#endregion Function
}
