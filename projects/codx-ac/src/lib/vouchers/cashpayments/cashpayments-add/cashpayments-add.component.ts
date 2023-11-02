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
import { Subject, Subscription, firstValueFrom, map, mergeMap, switchMap, take, takeUntil } from 'rxjs';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { CodxAcService, fmCashPaymentsLines, fmCashPaymentsLinesOneAccount, fmSettledInvoices, fmVATInvoices } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { RoundService } from '../../../round.service';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { E } from '@angular/cdk/keycodes';
import { AdvancePayment } from '../cashpayments-add-advancepayment/advancepayment.component';
import { Validators } from '@angular/forms';
import { AC_VATInvoices } from '../../../models/AC_VATInvoices.model';
import { AC_CashPaymentsLines } from '../../../models/AC_CashPaymentsLines.model';
@Component({
  selector: 'lib-cashpayments-add',
  templateUrl: './cashpayments-add.component.html',
  styleUrls: ['./cashpayments-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashPayment') eleGridCashPayment: CodxGridviewV2Component; //? element codx-grv2 lưới Cashpayments
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formCashPayment') public formCashPayment: CodxFormComponent; //? element codx-form của Cashpayments
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxPayee') eleCbxPayee: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any; //? element codx-input cbx của sổ quỹ
  @ViewChild('eleCbxBankAcct') eleCbxBankAcct: any; //? element codx-input cbx của tài khoản nhận
  @ViewChild('eleCbxSubType') eleCbxSubType: CodxDropdownSelectComponent; //? element codx-dropdown của loại phiếu
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
  fmCashpaymentLine: any = fmCashPaymentsLines;
  fmCashpaymentLineOne: any = fmCashPaymentsLinesOneAccount;
  fmSettledInvoices:any = fmSettledInvoices;
  fmVATInvoices:any = fmVATInvoices;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
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
  legalName: any; //? tên company
  voucherNoAdv: any; //? số chứng từ liên kết(xử lí lấy số chứng từ cho loại chi tạm ứng & chi thanh toán)
  dRAdv: any = 0; //? số tiền liên kết(xứ lí lấy số tiền của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  subTypeAdv: any = '1'; //? loại chi liên kết (xử lí lấy loại chi của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  vatAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)?
  totalDrLine:any = 0; //? tổng số tiền của tất cả dòng line (số tiền tab ủy nhiệm chi)
  isPreventChange:any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
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
    this.legalName = this.dialogData.data?.legalName;
  }
  //#endregion

  //#region Init
  onInit(): void {
    
  }

  ngAfterViewInit() {
    if(this.formCashPayment?.data?.coppyForm) this.formCashPayment.data._isEdit = true; //? test copy để tạm
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
    this.showHideTabDetail(this.formCashPayment?.data?.subType, this.elementTabDetail);
  }

  // /**
  //  * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
  //  * @param columnsGrid : danh sách cột của lưới
  //  */
  beforeInitGridCashpayments(eleGrid:CodxGridviewV2Component) {

    //* Thiết lập format number theo đồng tiền hạch toán
    this.settingFormatGridCashPayment(eleGrid)

    //* Thiết lập datasource combobox theo sổ nhật ký
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

    if (this.journal.drAcctControl == '1' || this.journal.drAcctControl == '2') { //? nếu tài khoản nợ là mặc định hoặc trong danh sách
      preAccountID = '@0.Contains(AccountID)';
      dtvAccountID = `[${this.journal?.drAcctID}]`;
    }
    eleGrid.setPredicates('accountID',preAccountID,dtvAccountID);

    if ((this.journal.crAcctControl == '1' || this.journal.crAcctControl == '2') && this.journal.entryMode == '1') { //? nếu tài khoản có là mặc định hoặc trong danh sách
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${this.journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID',preOffsetAcctID,dtvOffsetAcctID);

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
    if (!hideFields.includes('Settlement') && this.formCashPayment?.data?.subType == '1') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      hideFields.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') {
      if (this.formCashPayment?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else { //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.formCashPayment?.data?.currencyID == this.baseCurr) {
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
  beforeInitGridSettledInvoices(eleGrid) {
    //* Thiết lập các field ẩn theo đồng tiền hạch toán
    let hideFields = [];
    if (this.formCashPayment?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      hideFields.push('BalAmt2'); //? ẩn cột tiền Số dư, HT của SettledInvoices
      hideFields.push('SettledAmt2'); //? ẩn cột tiền thanh toán,HT của SettledInvoices
      hideFields.push('SettledDisc2'); //? ẩn cột chiết khấu thanh toán, HT của SettledInvoices
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
    if (event && event.data[0] && ((this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length > 0)
    || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length > 0)
    || (this.eleGridVatInvoices && this.eleGridVatInvoices.dataSource.length > 0))) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          let obj = {
            SubType : event.data[0]
          }
          this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            'subType',
            this.formCashPayment.data,
            JSON.stringify(obj)
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            this.formCashPayment.setValue('subType',event.data[0],{});
            this.dialog.dataService.update(this.formCashPayment.data).subscribe();
            this.showHideTabDetail(
              this.formCashPayment?.data?.subType,
              this.elementTabDetail
            );
          });
        } else {
          this.isPreventChange = true;
          this.eleCbxSubType.setValue(this.formCashPayment.data.subType);
        }
      });
    } else {
      this.formCashPayment.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
      this.detectorRef.detectChanges();
      if (this.elementTabDetail) {
        this.showHideTabDetail(this.formCashPayment?.data?.subType, this.elementTabDetail);
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
    if (event && value && this.formCashPayment.hasChange(this.formCashPayment.preData,this.formCashPayment.data)) { //? nếu data có thay đổi
      this.formCashPayment.data.updateColumns = '';
      switch (field.toLowerCase()) {
        //* Sổ quỹ
        case 'cashbookid':
          let valueCashbook = {
            PreOffsetAcctID : event?.component?.dataService?.currentComponent?.previousItemData?.CashAcctID || '',
            CurOffsetAcctID : event?.component?.itemsSelected[0]?.CashAcctID || ''
          }
          this.cashBookIDChange(field,valueCashbook);
          break;

        //* Lí do chi
        case 'reasonid':
          let valueReason = {
            preReasonID:  event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID || '',
            Note: event?.component?.itemsSelected[0]?.ReasonName || '',
            AccountID : event?.component?.itemsSelected[0]?.OffsetAcctID || '',
            preAccountID: event?.component?.dataService?.currentComponent?.previousItemData?.OffsetAcctID || ''
          };
          this.reasonIDChange(field,valueReason)
          break;

        //* Đối tượng
        case 'objectid':
          this.objectIDChange();
          break;

        //* Tài khoản chi
        case 'bankacctid':
          this.bankAcctIDChange(field)
          break;

        //* Tên người nhận
        case 'payee':
          this.payeeChange();
          break;

        //* Tiền tệ
        case 'currencyid':
          this.currencyIDChange(field);
          break;

        //* Tỷ giá
        case 'exchangerate':
          this.exchangeRateChange(field);
          break;

        //* Ngày chứng từ
        case 'voucherdate':
          this.voucherDateChange(field);
          break;
      }
    }
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLine(event: any) {
    let oLine = event.data;
    let oAccount = this.acService.getCacheValue('account',oLine.accountID);
    let oOffsetAccount = this.acService.getCacheValue('account',oLine.offsetAcctID);
    switch (event.field.toLowerCase()) {
      case 'accountid':
        this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'offsetacctid':
        if (oOffsetAccount) {
          oLine.isBrigdeAcct = false;
        } else {
          oLine.isBrigdeAcct =
            (oOffsetAccount as any)?.accountType == '5' ? true : false;
        }
        this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'dr':
        this.eleGridCashPayment.startProcess();
        if (oLine.dr != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        setTimeout(() => {
          oLine = this.calcAmt2(this.formCashPayment.data, oLine, true);
          if (this.journal.entryMode == '2') {
            this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
          }
          this.detectorRef.detectChanges();   
          this.eleGridCashPayment.endProcess();
        }, 200);
        break;
      case 'cr':
        this.eleGridCashPayment.startProcess();
        if ((oLine.cr! = 0 && oLine.dR2 != 0)) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        setTimeout(() => {
          oLine = this.calcAmt2(this.formCashPayment.data, oLine, false);
          if (this.journal.entryMode == '2') {
            this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
          }
          this.detectorRef.detectChanges();
          this.eleGridCashPayment.endProcess();
        }, 200);
        break;
      case 'dr2':
        this.eleGridCashPayment.startProcess();
        if (oLine.dR2 != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        if (oLine.dr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formCashPayment.data.multi) {
              oLine.dr = this.formCashPayment.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formCashPayment.data.exchangeRate,this.formCashPayment.data.currencyID) : oLine.cR2;
            } else {
              oLine.dr = this.roundService.amount(oLine.cR2 * this.formCashPayment.data.exchangeRate,this.formCashPayment.data.currencyID);
            }
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR')) oLine.updateColumns += 'DR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR')) oLine.updateColumns += 'CR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR2')) oLine.updateColumns += 'CR2;';
            this.eleGridCashPayment.endProcess();
          }, 200);
        }
        this.eleGridCashPayment.endProcess();
        break;
      case 'cr2':
        this.eleGridCashPayment.startProcess();
        if (oLine.cR2 != 0 && oLine.dR2 != 0) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        if (oLine.cr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formCashPayment.data.multi) {
              oLine.cr = this.formCashPayment.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formCashPayment.data.exchangeRate,this.formCashPayment.data.currencyID) : oLine.cR2;
            } else {
              oLine.cr = this.roundService.amount(oLine.cR2 * this.formCashPayment.data.exchangeRate,this.formCashPayment.data.currencyID);
            }
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR')) oLine.updateColumns += 'DR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR2')) oLine.updateColumns += 'DR2;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR')) oLine.updateColumns += 'CR;';
            this.eleGridCashPayment.endProcess();
          }, 200);
        }
        break;
      case 'note':
        oLine.reasonID = event?.itemData?.ReasonID;
        if(oLine.updateColumns && !oLine.updateColumns.includes('AccountID')) oLine.updateColumns += 'AccountID;';
        setTimeout(() => {
          oLine.accountID = event?.itemData?.OffsetAcctID;
          this.detectorRef.detectChanges();
          oAccount = this.acService.getCacheValue('account',oLine.accountID);
          this.setLockAndRequireFields(oLine,oAccount,oOffsetAccount);
        }, 200);
        break;
    }
  }

  /**
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      this.formCashPayment.data.unbounds = {
        itemID: event?.itemData?.ItemID,
      };
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashPayments',
      this.formCashPayment.data,
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
  onAddLine(typeBtn) {
    this.formCashPayment.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
              this.eleGridCashPayment.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
            if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
              this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
            if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') { //? nếu lưới VatInvoices có active hoặc đang edit
              this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
          }
        }
      });
  }
  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCashPayment.deleteRow(data);
    }
    if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridSettledInvoices.deleteRow(data);
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.deleteRow(data);
    }
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0') {
      data.recID = Util.uid();
      data.index = this.eleGridCashPayment.dataSource.length;
      this.eleGridCashPayment.addRow(data, this.eleGridCashPayment.dataSource.length);
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      data.recID = Util.uid();
      data.index = this.eleGridVatInvoices.dataSource.length;
      this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
    }
  }

  /**
   * *Hàm xử lí khi click các tab master
   * @param event
   * @returns
   */
  onTabSelectedMaster(event) {
    if (event.selectedIndex == 1) { //? nếu click tab thông tin chuyển tiền trên chứng từ Ủy nhiệm chi
      if (this.isload && this.formCashPayment.data.isEdit) {
        let indexCashBook = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) =>x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
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

        this.api
          .exec('BS', 'BanksBusiness', 'GetBankInfoAsync', [
            this.bankAcctIDPay,
            this.bankAcctIDReceive,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            this.bankNamePay = res?.BankPayname || '';
            this.bankReceiveName = res?.BankReceiveName || '';
            this.isload = false;
            this.detectorRef.detectChanges();
          });
      }
      if (this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length > 0) {
        this.totalDrLine = 0;
        this.eleGridCashPayment.dataSource.forEach(item => {
          this.totalDrLine += item.dr; //? tính tổng tiền của tất cả dữ liệu chi tiết
        });
        this.detectorRef.detectChanges();
      }
    }
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    if (event.selectedIndex == 0 && this.formCashPayment.data.subType == '9') {
      this.eleGridCashPayment.refresh();
    }
  }

  //#endregion Event

  //#region Method

  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {
    this.formCashPayment.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res || res.save || res.update) {
        if (res || !res.save.error || !res.update.error) {
          if ((this.eleGridCashPayment || this.eleGridCashPayment?.isEdit) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
            this.eleGridCashPayment.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
          if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
            this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
          if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '2') { //? nếu lưới VatInvoices có active hoặc đang edit
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
      .exec('AC', 'CashPaymentsBusiness', 'UpdateVoucherAsync', [
        this.formCashPayment.data,
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
            .exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
              null,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formCashPayment.refreshData({...res.data});
                setTimeout(() => {
                  this.refreshGrid();
                }, 100);
                this.detectorRef.detectChanges();
              }
            });
          }
          if (this.formCashPayment.data.isAdd || this.formCashPayment.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
          
        }
        if(this.eleGridCashPayment && this.eleGridCashPayment?.isSaveOnClick) this.eleGridCashPayment.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
        if(this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
      });
  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    if (this.formCashPayment && this.formCashPayment.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formCashPayment.data], false, null, '', '', null, null, false)
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
  cashBookIDChange(field:any,obj:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.formCashPayment.data,
      JSON.stringify(obj)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        if ((obj.PreOffsetAcctID && obj.PreOffsetAcctID != obj.CurOffsetAcctID) || this.formCashPayment?.data?.exchangeRate != res?.ExchangeRate
        || this.formCashPayment?.data?.currencyID != res?.CurrencyID) {
          if (this.formCashPayment?.data?.currencyID != res?.CurrencyID) {
            this.isPreventChange = true;
            this.formCashPayment.setValue('currencyID',res?.CurrencyID,{});
            this.formCashPayment.setValue('multi',res?.ExchangeRate,{});
            this.showHideColumn();
          }

          if (this.formCashPayment?.data?.exchangeRate != res?.ExchangeRate) {
            this.formCashPayment.setValue('exchangeRate',res?.ExchangeRate,{});
          }
          setTimeout(() => {
            this.refreshGrid();
          }, 50);
          this.isPreventChange = false;
        }
        // if (this.formCashPayment.data.journalType == 'BP') {
        //   let indexCashBook = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) =>x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
        //   if (indexCashBook > -1) {
        //     this.bankAcctIDPay = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexCashBook].BankAcctID; //? lấy tài khoản chi
        //   }
        //   this.bankNamePay = res?.BankName || '';
        //   this.detectorRef.detectChanges();
        // }
      }
    });
  }

  /**
   * *Hàm thay đổi tài khoản chi
   * @param field 
   */
  bankAcctIDChange(field:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.formCashPayment.data,
      ''
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        let indexBankAcct = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data.findIndex((x) => x.BankAcctID == this.eleCbxBankAcct?.ComponentCurrent?.value);
        if (indexBankAcct > -1) {
          this.bankAcctIDReceive = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data[indexBankAcct].BankAcctID; //? lấy tài khoản nhận
        }
        this.bankReceiveName = res?.BankNameReceive || '';
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Hàm thay đổi lí do chi
   * @param field 
   * @param obj 
   */
  reasonIDChange(field:any,obj:any){
    let memo = this.getMemoMaster();
    this.formCashPayment.setValue('memo',memo,{});
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.formCashPayment.data,
      JSON.stringify(obj)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res && res?.update) {
        this.refreshGrid();
        this.formCashPayment.preData = { ...this.formCashPayment.data };
        this.dialog.dataService.update(this.formCashPayment.data).subscribe();
      }
    });
  }

  /**
   * *Hàm thay đổi đối tượng
   */
  objectIDChange(){
    let memo = this.getMemoMaster();
    this.formCashPayment.setValue('memo',memo,{});
    if (this.formCashPayment.data.journalType == 'BP') {
      let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
      if (indexObject > -1) {
        this.ownerReceive = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName; //? lấy tên chủ tài khoản
      }
      this.detectorRef.detectChanges();
    }
  }

  /**
   * *Hàm thay đổi tên người nhận
   */
  payeeChange(){
    let memo = this.getMemoMaster();
    this.formCashPayment.setValue('memo',memo,{});
  }

  /**
   * *Hàm thay đổi tiền tệ
   * @param field 
   */
  currencyIDChange(field:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.formCashPayment.data,
      ''
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        if (this.formCashPayment.data.exchangeRate != res.ExchangeRate) {
          this.isPreventChange = true;
          this.formCashPayment.setValue('exchangeRate',res.ExchangeRate,{});
          this.detectorRef.detectChanges();
        }
        this.showHideColumn();
        this.refreshGrid();
        if (this.formCashPayment.hasChange(this.formCashPayment.preData,this.formCashPayment.data) && ((this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length) || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length))) {
          this.formCashPayment.preData = {...this.formCashPayment.data};
          this.dialog.dataService.update(this.formCashPayment.data).subscribe();
        }    
        this.isPreventChange = false;    
      }
    });
  }

  /**
   * *Hàm thay đổi ngày chứng từ
   * @param field 
   */
  voucherDateChange(field:any){
    this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
      field,
      this.formCashPayment.data,
      ''
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        if (this.formCashPayment.data.exchangeRate != res.exchangeRate) {
          this.isPreventChange = true;
          this.formCashPayment.setValue('exchangeRate',res.exchangeRate,{}); //? lấy tỷ giá của currency
          this.detectorRef.detectChanges();
          if (this.formCashPayment.hasChange(this.formCashPayment.preData,this.formCashPayment.data) && ((this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length) || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length))) {
            this.formCashPayment.preData = {...this.formCashPayment.data};
            this.dialog.dataService.update(this.formCashPayment.data).subscribe();
            setTimeout(() => {
              this.refreshGrid();
            }, 100);
          }    
          this.isPreventChange = false; 
        }
      }
    });
  }

  /**
   * *Hàm thay đổi tỷ giá
   * @param field 
   */
  exchangeRateChange(field:any){
    if (this.formCashPayment.hasChange(this.formCashPayment.preData,this.formCashPayment.data) && ((this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length) || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length))) {
      this.api
        .exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
          field,
          this.formCashPayment.data,
          ''
        ])
        .subscribe((res:any) => {
          if (res && res?.update) {
            this.refreshGrid();
            this.formCashPayment.preData = {...this.formCashPayment.data};
            this.dialog.dataService.update(this.formCashPayment.data).subscribe();
          }
        });
    } 
  }

  /**
   * *Hàm thêm dòng theo loại nút
   */
  addRowDetailByType(typeBtn) {
    switch (typeBtn) {
      case '1':
        this.addLine();
        break;
      case '2':
        this.openFormAdvancePayment();
        break;
      case '3':
        this.openFormSettledInvoices();
        break;
      case '4':
        this.addLineVatInvoices();
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridCashPayment.addRow(oLine,this.eleGridCashPayment.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let cAcctID = null;
    let rAcctID = null;
    let oOffsetAcct = null;
    let oAccount = null;
    let model = new AC_CashPaymentsLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formCashPayment.data.recID;
    oLine.objectID = this.formCashPayment.data.objectID;
    oLine.reasonID = this.formCashPayment.data.reasonID;

    let indexCashBook = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
    if (indexCashBook > -1) {
      cAcctID = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexCashBook].CashAcctID;
    }

    let indexReason = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
    if (indexReason > -1) {
      rAcctID = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].OffsetAcctID;
      oLine.note = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName;
    }

    if (this.journal?.entryMode == '1') {
      if (cAcctID) {
        switch (this.journal?.crAcctControl) {
          case '1':
            if (cAcctID == this.journal?.crAcctID) {
              oLine.offsetAcctID = cAcctID;
            } else {
              oLine.offsetAcctID = this.journal.crAcctID;
            }
            break;
          default:
            oLine.offsetAcctID = cAcctID;
            break;
        }
      }
    } else {
      oLine.offsetAcctID = null;
    }

    if (rAcctID) {
      switch (this.journal?.drAcctControl) {
        case '1':
          if (rAcctID == this.journal?.drAcctID) {
            oLine.accountID = rAcctID;
          } else {
            oLine.accountID = this.journal.drAcctID;
          }
          break;
        default:
          oLine.accountID = rAcctID;
          break;
      }
    }

    let dicSetting = JSON.parse(this.journal.extras);
    if (dicSetting) {
      if (
        dicSetting?.diM1Control &&
        dicSetting?.diM1Control != '2' &&
        dicSetting?.diM1Control != '9'
      ) {
        oLine.diM1 = this.journal.diM1;
      }
      if (
        dicSetting?.diM2Control &&
        dicSetting?.diM2Control != '2' &&
        dicSetting?.diM2Control != '9'
      ) {
        oLine.diM2 = this.journal.diM2;
      }
      if (
        dicSetting?.diM3Control &&
        dicSetting?.diM3Control != '2' &&
        dicSetting?.diM3Control != '9'
      ) {
        oLine.diM3 = this.journal.diM3;
      }
    }

    oAccount = this.acService.getCacheValue('account', oLine?.accountID);
    oOffsetAcct = this.acService.getCacheValue('account',oLine?.offsetAcctID);
    if (oLine?.offsetAcctID) {
      if (oOffsetAcct && oOffsetAcct?.accountType == '5') {
        oLine.isBrigdeAcct = true;
      }
    }
    if (oLine?.accountID) {
      if (oAccount) {
        oLine.singleEntry = oAccount?.accountType == '0' ? true : false;
        let bSubLGControl = oAccount?.subLGControl;
        if (!bSubLGControl && !oLine?.offsetAcctID) {
          bSubLGControl = oOffsetAcct?.subLGControl;
        }
      }
    }
    // this.oLine.createdBy = this.userID;
    let dRAmt = this.calcRemainAmt(this.formCashPayment.data?.totalAmt);
    if (dRAmt > 0) {
      oLine.dr = dRAmt;
      oLine = this.calcAmt2(this.formCashPayment.data,oLine,true);
    }
    return oLine;
  }

  /**
   * *Hàm tính số tiền khi thêm dòng
   * @param totalAmt
   * @returns
   */
  calcRemainAmt(totalAmt) {
    if (totalAmt == 0) {
      return 0;
    }
    let dRemainAmt = totalAmt;
    let dPayAmt = this.eleGridCashPayment.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
    dRemainAmt = dRemainAmt - dPayAmt;
    return dRemainAmt;
  }

  /**
   * *Hàm ràng buộc không được bỏ trống phòng ban,mục phí,ttcp của tài khoản
   * @param oLine
   * @param oAccount
   * @param oOffsetAcct
   * @returns
   */
  setLockAndRequireFields(oLine, oAccount, oOffsetAcct) {
    if ((oAccount == null && oOffsetAcct == null) || (this.journal.entryMode == '2' && oLine.dr == 0 && oLine.cr == 0)) {
      return;
    } else {
      let rDIM1 = false;
      let rDIM2 = false;
      let rDIM3 = false;

      let lDIM1 = true;
      let lDIM2 = true;
      let lDIM3 = true;

      //* Set require field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '1' || oAccount?.diM1Control == '3' || oOffsetAcct?.diM1Control == '2' || oOffsetAcct?.diM1Control == '3'))
        rDIM1 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '1' && oLine.dr > 0) || (oAccount?.diM1Control == '2' && oLine.cr > 0) || oAccount?.diM1Control == '3'))
        rDIM1 = true;
      this.eleGridCashPayment.setRequiredFields(['diM1'],rDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '1' || oAccount?.diM2Control == '3' || oOffsetAcct?.diM2Control == '2' || oOffsetAcct?.diM2Control == '3'))
        rDIM2 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '1' && oLine.dr > 0) || (oAccount?.diM2Control == '2' && oLine.cr > 0) || oAccount?.diM2Control == '3'))
        rDIM2 = true;
        this.eleGridCashPayment.setRequiredFields(['diM2'],rDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '1' || oAccount?.diM3Control == '3' || oOffsetAcct?.diM3Control == '2' || oOffsetAcct?.diM3Control == '3'))
        rDIM3 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '1' && oLine.dr > 0) || (oAccount?.diM3Control == '2' && oLine.cr > 0) || oAccount?.diM3Control == '3'))
        rDIM3 = true;
        this.eleGridCashPayment.setRequiredFields(['diM3'],rDIM3);

      //* Set lock field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '4' || oOffsetAcct?.diM1Control == '5'))
        lDIM1 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '4' && oLine.dr > 0) || (oAccount?.diM1Control == '5' && oLine.cr > 0)))
        lDIM1 = false;
      this.eleGridCashPayment.setEditableFields(['diM1'],lDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '4' || oOffsetAcct?.diM2Control == '5'))
        lDIM2 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '4' && oLine.dr > 0) || (oAccount?.diM2Control == '5' && oLine.cr > 0)))
        lDIM2 = false;
      this.eleGridCashPayment.setEditableFields(['diM2'],lDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '4' || oOffsetAcct?.diM3Control == '5'))
        lDIM3 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '4' && oLine.dr > 0) || (oAccount?.diM3Control == '5' && oLine.cr > 0)))
        lDIM3 = false;
      this.eleGridCashPayment.setEditableFields(['diM3'],lDIM3);
    }
  }

  /**
   * *Hàm mở form chọn hóa đơn (Đề xuất thanh toán,Cấn trừ tự động)
   * @param typeSettledInvoices
   */
  openFormSettledInvoices() {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.formCashPayment.data.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.formCashPayment.data,
      objectName: objectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AC_SubInvoices';
    dataModel.gridViewName = 'grvAC_SubInvoices';
    dataModel.entityName = 'AC_SubInvoices';
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
      if (res && res.event && res.event.length) {
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.formCashPayment.data).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Hàm mở form chọn đề nghị tạm ứng (chi tạm ứng,chi thanh toán)
   */
  openFormAdvancePayment() {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.formCashPayment.data.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.formCashPayment.data,
      objectName: objectName,
      subTypeAdv: this.subTypeAdv,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashPayments';
    dataModel.gridViewName = 'grvCashPayments';
    dataModel.entityName = 'AC_CashPayments';
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      AdvancePayment,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event && res.event) {
        this.formCashPayment.data.refID = res?.event?.oCashAdv?.recID;
        this.voucherNoAdv = res?.event?.oCashAdv?.voucherNo;
        this.dRAdv = res?.event?.oCashAdv?.totalDR;
        this.subTypeAdv = res?.event?.oCashAdv?.subType;
        this.showHideTabDetail(this.formCashPayment.data.subType, this.elementTabDetail);
        if (this.subTypeAdv == '1') {
          if (this.eleGridCashPayment) {
            this.eleGridCashPayment.refresh();
          }
        }else{
          if (this.eleGridSettledInvoices) {
            this.eleGridSettledInvoices.refresh();
          }
        }

      }
    });
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    let model = new AC_VATInvoices();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formCashPayment.data.recID;
    oLine.objectID = this.formCashPayment.data.objectID;
    oLine.lineID = this.eleGridCashPayment?.rowDataSelected?.recID || Util.uid();
    oLine.journalNo = this.formCashPayment.data.journalNo;
    this.eleGridVatInvoices.addRow(oLine,this.eleGridVatInvoices.dataSource.length);
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    if (eleTab) {
      switch (type) {
        case '1': //? chi theo nhà cung cấp (ẩn tab hóa đơn công nợ , hóa đơn GTGT)
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          eleTab.hideTab(2, true);
          eleTab.select(0);
          break;
        case '2': //? chi hóa đơn công nợ (ẩn tab chi tiết , hóa đơn GTGT)
          eleTab.hideTab(0, true);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, true);
          eleTab.select(1);
          break;
        case '3': //? chi tạm ứng,chi thanh toán (ẩn tab chi tiết và hóa đơn công nợ)
        case '4':
          if (this.subTypeAdv == '1') {
            eleTab.hideTab(0, false);
            eleTab.hideTab(1, true);
            eleTab.hideTab(2, true);
            eleTab.select(0);
          } else {
            eleTab.hideTab(0, true);
            eleTab.hideTab(1, false);
            eleTab.hideTab(2, true);
            eleTab.select(1);
          }
          break;
        case '9': //? chi khác (hiện tab chi tiết , hóa đơn công nợ , hóa đơn GTGT)
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, false);
          eleTab.select(0);
          break;
      }
    }
  }

  /**
   * *Hàm ẩn hiện các cột theo đồng tiền hạch toán
   */
  showHideColumn() {
    if (this.eleGridCashPayment) {
      //* Thiết lập hiện cột tiền HT cho lưới nếu chứng từ có ngoại tệ
    let hDR2 = false;
    let hCR2 = false;
    if (this.formCashPayment.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
      if (this.journal.entryMode == '1') {
        hDR2 = true; //? => mode 2 tài khoản => hiện cột số tiền,HT
      } else {
        hDR2 = true; //? mode 1 tài khoản => hiện cột nợ,HT
        hCR2 = true; //? mode 1 tài khoản => hiện cột có,HT
      }
    }
    this.eleGridCashPayment.showHideColumns(['DR2'], hDR2);
    this.eleGridCashPayment.showHideColumns(['CR2'], hCR2);
    this.settingFormatGridCashPayment(this.eleGridCashPayment);
    }

    if (this.eleGridSettledInvoices) {
      let hBalAmt2 = false;
      let hSettledAmt2 = false;
      let hSettledDisc2 = false;
      if (this.formCashPayment.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
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
   * *Hàm get ghi chú từ lí do chi + đối tượng + tên người nhận
   * @returns
   */
  getMemoMaster() {
    let newMemo = ''; //? tên ghi chú mới
    let reasonName = ''; //? tên lí do chi
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

    let indexPayee =
      this.eleCbxPayee?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ContactID == this.eleCbxPayee?.ComponentCurrent?.value
      );
    if (indexPayee > -1) {
      payName =
        this.eleCbxPayee?.ComponentCurrent?.dataService?.data[indexPayee]
          .ContactName + ' - ';
    } else {
      if (this.eleCbxPayee?.ComponentCurrent?.value) {
        payName = this.eleCbxPayee?.ComponentCurrent?.value + ' - ';
      }
    }
    newMemo = reasonName + objectName + payName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  /**
   * *Hàm tính tiền theo tỷ giá
   * @param master
   * @param line
   * @param isdr
   * @returns
   */
  calcAmt2(master, line, isdr) {
    if (isdr) {
      let dDR2 = 0;
      if (master.multi) {
        dDR2 = this.roundService.baseCurr(line.dr * master.exchangeRate);
      } else {
        dDR2 =
          master.exchangeRate != 0
            ? this.roundService.baseCurr(line.dr / master.exchangeRate)
            : line.dr;
      }
      if (line.dR2 != dDR2) {
        line.dR2 = dDR2;
        if(line.updateColumns && !line.updateColumns.includes('DR2')) line.updateColumns += 'DR2;';
      }
      if (line.cR2 != 0) {
        line.cR2 = 0;
        if(line.updateColumns && !line.updateColumns.includes('CR2')) line.updateColumns += 'CR2;';
      }
    } else {
      let dCR2 = 0;
      if (master.multi) {
        dCR2 = this.roundService.baseCurr(line.cr * master.exchangeRate);
      } else {
        dCR2 =
          master.exchangeRate != 0
            ? this.roundService.baseCurr(line.cr / master.exchangeRate)
            : line.cr;
      }
      if (line.cR2 != dCR2) {
        line.cR2 = dCR2;
        if(line.updateColumns && !line.updateColumns.includes('CR2')) line.updateColumns += 'CR2;';
      }
      if (line.dR2 != 0) {
        line.dR2 = 0;
        if(line.updateColumns && !line.updateColumns.includes('DR2')) line.updateColumns += 'DR2;';
      }
    }
    return line;
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridCashpayment(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('1');
        break;
      case 'add':
      case 'update': //? sau khi thêm dòng thành công
        
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridCashPayment && this.eleGridCashPayment.rowDataSelected) {
        this.eleGridCashPayment.rowDataSelected = null;
      }
      if(this.eleGridCashPayment.isSaveOnClick) this.eleGridCashPayment.isSaveOnClick = false;
      setTimeout(() => {
        let element = document.getElementById('btnAddCash'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
      case 'beginEdit': //? trước khi thêm dòng
        // if (event?.data.dr == 0) { //? khi số tiền < 0
        //   this.eleGridCashPayment.startProcess(); //? ko cho lưu dòng
        // }
        let oAccount = this.acService.getCacheValue('account', event?.data.accountID);
        let oOffsetAccount = this.acService.getCacheValue('account',event?.data.offsetAcctID);
        this.setLockAndRequireFields(event?.data,oAccount,oOffsetAccount);
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
        this.onAddLine('4');
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

  // /**
  //  * *Hàm tạo hạch toán trước khi lưu hóa đơn GTGT
  //  * @param data
  //  */
  // addLineBeforeSaveVatInvoices(data) {
  //   let totalVatAtm = 0;
  //   this.eleGridVatInvoices.dataSource.forEach((item) => {
  //     totalVatAtm += item.vatAmt;
  //   });
  //   if (this.journal.entryMode == '1') {
  //     let oLine = this.setDefaultLine();
  //     oLine.dr = totalVatAtm;
  //     if (this.vatAccount) {
  //       oLine.accountID = this.vatAccount;
  //     }
  //     data.lineID = oLine.recID;
  //     this.eleGridCashPayment.dataSource.push(oLine);
  //   } else {
  //     for (let index = 1; index <= 2; index++) {
  //       let oLine = this.setDefaultLine();
  //       if (index == 1) {
  //         oLine.dr = totalVatAtm;
  //         if (this.vatAccount) {
  //           oLine.accountID = this.vatAccount;
  //         }
  //         this.eleGridCashPayment.dataSource.push(oLine);
  //         data.lineID = oLine.recID;
  //       } else {
  //         oLine.accountID = this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
  //         oLine.cr = totalVatAtm;
  //         this.eleGridCashPayment.dataSource.push(oLine);
  //       }
  //     }
  //   }
  // }

  // /**
  //  * *Hàm update hạch toán trước khi lưu hóa đơn GTGT
  //  * @param data
  //  */
  // updateLineBeforeSaveVatInvoices(data) {
  //   let totalVatAtm = 0;
  //   this.eleGridVatInvoices.dataSource.forEach((item) => {
  //     totalVatAtm += item.vatAmt;
  //   });
  //   if (this.journal.entryMode == '1') {
  //     let idx = this.eleGridCashPayment.dataSource.findIndex((x) => x.recID == data.lineID);
  //     if (idx > -1) {
  //       this.eleGridCashPayment.dataSource[idx].dr = totalVatAtm;
  //       if (this.vatAccount) {
  //         this.eleGridCashPayment.dataSource[idx].accountID = this.vatAccount;
  //       }
  //     }
  //   } else {
  //     let l1 = this.eleGridCashPayment.dataSource.findIndex((x) => x.recID == data.lineID);
  //     if (l1 > -1) {
  //       this.eleGridCashPayment.dataSource[l1].dr = totalVatAtm;
  //       if (this.vatAccount) {
  //         this.eleGridCashPayment.dataSource[l1].accountID = this.vatAccount;
  //       }
  //     }
  //     let l2 = this.eleGridCashPayment.dataSource.findIndex(
  //       (x) => x.rowNo == this.eleGridCashPayment.dataSource[l1].rowNo + 1
  //     );
  //     if (l2 > -1) {
  //       this.eleGridCashPayment.dataSource[l2].cr = totalVatAtm;
  //     }
  //   }
  // }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridCashPayment && this.elementTabDetail?.selectingID == '0'){
      this.eleGridCashPayment.dataSource = [];
      this.eleGridCashPayment.refresh();
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
  settingFormatGridCashPayment(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.formCashPayment.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
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

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let rObjectID = false;
    let lstRequire :any = [];
    if (this.formCashPayment.data.subType != '1' && this.formCashPayment) {
      rObjectID = true;
    }
    lstRequire.push({field : 'ObjectID',isDisable : false,require:rObjectID});
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formCashPayment.setRequire(lstRequire);
  }

  /**
   * *Hàm check validate trước khi save line (cashpayment)
   * @param data 
   * @returns 
   */
  beforeSaveRowCashPayment(event:any){
    if (event.rowData) {
      if (event.rowData.dr == 0 && event.rowData.dR2 == 0) {
        this.eleGridCashPayment.showErrorField('dr','E0094');
        event.cancel = true;
        return;
      }
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

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null) && 
      e.target.closest('button') == null
    ) {
      if (this.eleGridCashPayment && this.eleGridCashPayment?.gridRef?.isEdit) {
        this.eleGridCashPayment.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridCashPayment.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
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
