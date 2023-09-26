import { ChangeDetectionStrategy, Component, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { UIComponent, CodxGridviewV2Component, CodxFormComponent, DialogRef, FormModel, NotificationsService, AuthStore, DialogData, Util, DialogModel } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { Validators } from '@angular/forms';
import { VATInvoices } from '../../../models/VATInvoices.model';

@Component({
  selector: 'lib-cashreceipts-add',
  templateUrl: './cashreceipts-add.component.html',
  styleUrls: ['./cashreceipts-add.component.css','../../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashreceiptsAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashReceipt') eleGridCashReceipt: CodxGridviewV2Component; //? element codx-grv2 lưới CashReceipt
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('formCashReceipt') public formCashReceipt: CodxFormComponent; //? element codx-form của CashReceipt
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxPayor') eleCbxPayor: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any; //? element codx-input cbx của sổ quỹ
  @ViewChild('eleCbxBankAcct') eleCbxBankAcct: any; //? element codx-input cbx của tài khoản nhận
  @ViewChild('eleCbxSubType') eleCbxSubType: any; //? element codx-dropdown của loại phiếu
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
  fmCashReceiptsLine: FormModel = {
    funcID: 'ACT0401',
    formName: 'CashReceiptsLines',
    entityName: 'AC_CashReceiptsLines',
    gridViewName: 'AC_CashReceiptsLines',
  };
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  baseCurr: any; //? đồng tiền hạch toán
  legalName: any; //? tên company
  voucherNoAdv: any; //? số chứng từ liên kết(xử lí lấy số chứng từ cho loại chi tạm ứng & chi thanh toán)
  dRAdv: any = 0; //? số tiền liên kết(xứ lí lấy số tiền của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  subTypeAdv: any = '1'; //? loại chi liên kết (xử lí lấy loại chi của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  vatAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)?
  totalDrLine:any = 0; //? tổng số tiền của tất cả dòng line (số tiền tab ủy nhiệm chi)
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
  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {}

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
    this.showHideTabDetail(this.formCashReceipt.data.subType, this.elementTabDetail);
  }

  // /**
  //  * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
  //  * @param columnsGrid : danh sách cột của lưới
  //  */
  beforeInitGridCashReceipt(eleGrid:CodxGridviewV2Component) {

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
    if (!hideFields.includes('Settlement') && this.formCashReceipt?.data?.subType == '11') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      hideFields.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') {
      if (this.formCashReceipt?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else { //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.formCashReceipt?.data?.currencyID == this.baseCurr) {
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
    if (this.formCashReceipt?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
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
      case 'ACT041011':
        this.copyRow(data);
        break;
      case 'ACT041012':
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
    if (event && event.data[0] && ((this.eleGridCashReceipt && this.eleGridCashReceipt.dataSource.length > 0)
    || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length > 0))) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          let obj = {
            SubType : event.data[0]
          }
          this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            'subType',
            this.formCashReceipt.data,
            JSON.stringify(obj)
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            this.formCashReceipt.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
            this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
            this.showHideTabDetail(
              this.formCashReceipt?.data?.subType,
              this.elementTabDetail
            );
          });
        } else {
          // this.cbxSub.dropdownContent.value = this.cashpayment.subType;
          // this.dt.detectChanges();
        }
      });
    } else {
      this.formCashReceipt.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
      if (this.elementTabDetail) {
        this.showHideTabDetail(this.formCashReceipt?.data?.subType, this.elementTabDetail);
      }
    }
    this.setValidateForm()
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    if (event && value) { //? nếu data có thay đổi
      this.formCashReceipt.setValue(field,value,{onlySelf: true,emitEvent: false,}); //? gán data mới cho field thay đổi
      switch (field.toLowerCase()) {
        //* Sổ quỹ
        case 'cashbookid':
          let valueCashbook = {
            CurrencyID : event?.component?.itemsSelected[0]?.CurrencyID || '',
            OffsetAcctID : event?.component?.itemsSelected[0]?.CashAcctID || '',
            PreOffsetAcctID : event?.component?.dataService?.currentComponent?.previousItemData?.CashAcctID || '',
            BankAcctID : event?.component?.itemsSelected[0]?.BankAcctID || ''
          }
          this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
              field,
              this.formCashReceipt.data,
              JSON.stringify(valueCashbook)
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (this.formCashReceipt.data.currencyID != event?.component?.itemsSelected[0]?.CurrencyID) {
                this.formCashReceipt.setValue('currencyID',res?.CurrencyID,{onlySelf: true,emitEvent: false,});
                this.formCashReceipt.setValue('exchangeRate',res?.ExchangeRate,{onlySelf: true,emitEvent: false,});
                this.showHideColumn();
                this.detectorRef.detectChanges();
              }
              if ((this.eleGridCashReceipt && this.eleGridCashReceipt.dataSource.length) || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length)) {
                this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
                this.refreshGrid();
              }
              if (this.formCashReceipt.data.journalType == 'BP') {
                let indexCashBook = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) =>x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
                if (indexCashBook > -1) {
                  this.bankAcctIDPay = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexCashBook].BankAcctID; //? lấy tài khoản chi
                }
                this.bankNamePay = res?.BankName || '';
                this.detectorRef.detectChanges();
              }
            });
          break;

        //* Lí do chi
        case 'reasonid':
          this.formCashReceipt.data.memo = this.getMemoMaster();
          this.formCashReceipt.setValue('memo',this.formCashReceipt.data.memo,{onlySelf: true,emitEvent: false,});
          if (this.eleGridCashReceipt && this.eleGridCashReceipt.dataSource.length) {
            let valueReason = {
              preReasonID:  event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID || '',
              Note: event?.component?.itemsSelected[0]?.ReasonName || '',
              AccountID : event?.component?.itemsSelected[0]?.OffsetAcctID || '',
              preAccountID: event?.component?.dataService?.currentComponent?.previousItemData?.OffsetAcctID || ''
            };
            this.api
              .exec('AC', 'CashReceiptsBusiness', 'UpdateLineAsync', [
                this.formCashReceipt.data,
                field,
                JSON.stringify(valueReason),
              ])
              .subscribe((res) => {
                if (res) {
                  this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
                  this.refreshGrid();
                }
              });
          }
          break;

        //* Đối tượng
        case 'objectid':
          this.formCashReceipt.data.memo = this.getMemoMaster();
          this.formCashReceipt.setValue('memo',this.formCashReceipt.data.memo,{onlySelf: true,emitEvent: false,});
          if (this.formCashReceipt.data.journalType == 'BP') {
            let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
            if (indexObject > -1) {
              this.ownerReceive = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName; //? lấy tên chủ tài khoản
            }
            this.detectorRef.detectChanges();
          }
          break;

        // //* Tài khoản chi
        // case 'bankacctid':
        //   let valueBank = {
        //     BankAcctID : event?.component?.itemsSelected[0]?.BankAcctID || ''
        //   };
        //   this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
        //     field,
        //     this.formCashReceipt.data,
        //     JSON.stringify(valueBank)
        //   ])
        //   .pipe(takeUntil(this.destroy$))
        //   .subscribe((res: any) => {
        //     let indexBankAcct = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data.findIndex((x) => x.BankAcctID == this.eleCbxBankAcct?.ComponentCurrent?.value);
        //     if (indexBankAcct > -1) {
        //     this.bankAcctIDReceive = this.eleCbxBankAcct?.ComponentCurrent?.dataService?.data[indexBankAcct].BankAcctID; //? lấy tài khoản nhận
        //     }
        //     this.bankReceiveName = res?.BankName || '';
        //     this.detectorRef.detectChanges();
        //   });
        //   break;

        //* Tên người gửi
        case 'payor':
          this.formCashReceipt.data.memo = this.getMemoMaster();
          this.formCashReceipt.setValue('memo',this.formCashReceipt.data.memo,{onlySelf: true,emitEvent: false,});
          break;

        //* Tiền tệ
        case 'currencyid':
          this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
              field,
              this.formCashReceipt.data,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                if (this.formCashReceipt.data.exchangeRate != res.exchangeRate) {
                  this.formCashReceipt.setValue('exchangeRate',res.exchangeRate,{ onlySelf: true, emitEvent: false }); //? lấy tỷ giá của currency
                  this.detectorRef.detectChanges();
                }
                this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
                this.showHideColumn();
                this.refreshGrid();
              }
            });
          break;

        //* Tỷ giá
        case 'exchangerate':
          if ((this.eleGridCashReceipt && this.eleGridCashReceipt.dataSource.length) || (this.eleGridSettledInvoices && this.eleGridSettledInvoices.dataSource.length) ) {
            this.api
              .exec('AC', 'CashReceiptsBusiness', 'UpdateLineAsync', [
                this.formCashReceipt.data,
                field
              ])
              .subscribe((res) => {
                if (res) {
                  this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
                  this.refreshGrid();
                }
              });
          }
          break;

        //* Ngày chứng từ
        case 'voucherdate':
          this.api.exec('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
            field,
            this.formCashReceipt.data,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              if (this.formCashReceipt.data.exchangeRate != res.exchangeRate) {
                this.formCashReceipt.setValue('exchangeRate',res.exchangeRate,{ onlySelf: true, emitEvent: false }); //? lấy tỷ giá của currency
                this.detectorRef.detectChanges();
                this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
                setTimeout(() => {
                  this.refreshGrid();
                }, 100);
              }
            }
          });
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
        this.lockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'offsetacctid':
        if (oOffsetAccount) {
          oLine.isBrigdeAcct = false;
        } else {
          oLine.isBrigdeAcct =
            (oOffsetAccount as any).accountType == '5' ? true : false;
        }
        this.lockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'dr':
        if (oLine.dr != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        setTimeout(() => {
          oLine = this.getValueByExchangeRate(this.formCashReceipt.data, oLine, true);
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          this.lockAndRequireFields(oLine, oAccount, oOffsetAccount);
        }
        break;
      case 'cr':
        if ((oLine.cr! = 0 && oLine.dR2 != 0)) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        setTimeout(() => {
          oLine = this.getValueByExchangeRate(this.formCashReceipt.data, oLine, false);
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          this.lockAndRequireFields(oLine, oAccount, oOffsetAccount);
        }
        break;
      case 'dr2':
        if (oLine.dR2 != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        if (oLine.dr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formCashReceipt.data.multi) {
              oLine.dr = this.formCashReceipt.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formCashReceipt.data.exchangeRate,this.formCashReceipt.data.currencyID) : oLine.cR2;
            } else {
              oLine.dr = this.roundService.amount(oLine.cR2 * this.formCashReceipt.data.exchangeRate,this.formCashReceipt.data.currencyID);
            }
          }, 100);
        }
        break;
      case 'cr2':
        if (oLine.cR2 != 0 && oLine.dR2 != 0) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        if (oLine.cr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formCashReceipt.data.multi) {
              oLine.cr = this.formCashReceipt.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formCashReceipt.data.exchangeRate,this.formCashReceipt.data.currencyID) : oLine.cR2;
            } else {
              oLine.cr = this.roundService.amount(oLine.cR2 * this.formCashReceipt.data.exchangeRate,this.formCashReceipt.data.currencyID);
            }
          }, 100);
        }
        break;
      case 'note':
        oLine.reasonID = event?.itemData?.ReasonID;
        setTimeout(() => {
          oLine.accountID = event?.itemData?.OffsetAcctID;
          this.detectorRef.detectChanges();
        }, 100);
        break;
    }
  }

  /**
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  valueChangeLineVATInvoices(event: any) {
    switch (event.field.toLowerCase()) {
      case 'vatid':
        this.acService
          .execApi('AC', 'VATInvoicesBusiness', 'ValueChangedAsync', [
            event.field,
            event.value,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              this.vatAccount = res.vatAccount;
            }
          });
        break;
    }
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
    this.formCashReceipt.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          if ((this.eleGridCashReceipt || this.eleGridCashReceipt?.isEdit) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
            this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.addRowDetailByType(typeBtn);
              }
            })
            return;
          }
          if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
            this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.addRowDetailByType(typeBtn);
              }
            })
            return;
          }
        }
      });
  }
  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    this.eleGridCashReceipt.deleteRow(data);
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    data.recID = Util.uid();
    data.index = this.eleGridCashReceipt.dataSource.length;
    let oAccount = this.acService.getCacheValue('account', data.accountID);
    let oOffsetAccount = this.acService.getCacheValue('account',data.offsetAcctID);
    this.lockAndRequireFields(data, oAccount, oOffsetAccount);
    this.eleGridCashReceipt.addRow(data,this.eleGridCashReceipt.dataSource.length);
  }

  /**
   * *Hàm xử lí khi click các tab master
   * @param event
   * @returns
   */
  onTabSelectedMaster(event) {
    // if (event.selectedIndex == 1) { //? nếu click tab thông tin chuyển tiền trên chứng từ Ủy nhiệm chi
    //   if (this.eleGridCashPayment && this.eleGridCashPayment.dataSource.length > 0) {
    //     this.eleGridCashPayment.dataSource.forEach(item => {
    //       this.totalDrLine += item.dr; //? tính tổng tiền của tất cả dữ liệu chi tiết
    //     });
    //     this.detectorRef.detectChanges();
    //   }
    // }
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    // if (event.selectedIndex == 2) { //? nếu click tab hóa đơn GTGT
    //   this.eleGridVatInvoices.predicates = 'TransID=@0&&LineID=@1';
    //   this.eleGridVatInvoices.dataValues = this.formCashPayment.data.recID + ';' + this.eleGridCashPayment?.rowDataSelected?.recID;
    //   this.detectorRef.detectChanges();
    //   this.eleGridVatInvoices.refresh();
    // }
  }
  //#endregion Event

  //#region Method
  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher() {
    let isFirstSave = false;
    if(!this.formCashReceipt?.data?._isEdit && this.formCashReceipt?.data?.coppyForm) isFirstSave = true;
    this.formCashReceipt.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        if ((this.eleGridCashReceipt || this.eleGridCashReceipt?.isEdit || isFirstSave) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
          if(isFirstSave){
            this.eleGridCashReceipt.refresh();
            this.eleGridCashReceipt.dataService.onAction.subscribe((res)=>{
              if (res?.type == 'read') {
                setTimeout(() => {
                  this.saveVoucher();
                }, 100);
              }
            })
            return;
          }else{
            this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher();
              }
            })
            return;
          }
        }
        if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit || isFirstSave) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
          if(isFirstSave){
            this.eleGridSettledInvoices.refresh();
            this.eleGridSettledInvoices.dataService.onAction.subscribe((res)=>{
              if (res?.type == 'read') {
                setTimeout(() => {
                  this.saveVoucher();
                }, 100);
              }
            })
            return;
          }else{
            this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher();
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
  saveVoucher(){
    this.api
    .exec('AC', 'CashReceiptsBusiness', 'UpdateVoucherAsync', [
      this.formCashReceipt.data,
      this.journal,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res?.update) {
        this.dialog.dataService.update(res.data).subscribe();
        this.onDestroy();
        if(this.formCashReceipt.data._isEdit && this.formCashReceipt.data?.status == '7')
          this.notification.notifyCode('SYS006');
        else
          this.notification.notifyCode('SYS007');
        this.dialog.close();
      }else{
        if(this.eleGridCashReceipt && this.eleGridCashReceipt?.isSaveOnClick) this.eleGridCashReceipt.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
      }
    });
  }

  /**
   * *Hàm lưu và thêm chứng từ
   * @returns
   */
  onSaveAddVoucher() {
    let isFirstSave = false;
    if(!this.formCashReceipt?.data?._isEdit && this.formCashReceipt?.data?.coppyForm) isFirstSave = true;
    this.formCashReceipt.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        if ((this.eleGridCashReceipt || this.eleGridCashReceipt?.isEdit || isFirstSave) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
          if(isFirstSave){
            this.eleGridCashReceipt.refresh();
            this.eleGridCashReceipt.dataService.onAction.subscribe((res)=>{
              if (res?.type == 'read') {
                setTimeout(() => {
                  this.saveAddVoucher();
                }, 100);
              }
            })
            return;
          }else{
            this.eleGridCashReceipt.saveRow((res:any)=>{ //? save lưới trước 
              if(res){
                this.saveAddVoucher();
              }
            })
            return;
          }
        }
        if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit || isFirstSave) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
          if(isFirstSave){
            this.eleGridSettledInvoices.refresh();
            this.eleGridSettledInvoices.dataService.onAction.subscribe((res)=>{
              if (res?.type == 'read') {
                setTimeout(() => {
                  this.saveAddVoucher();
                }, 100);
              }
            })
            return;
          }else{
            this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước 
              if(res){
                this.saveAddVoucher();
              }
            })
            return;
          }
        }
      }
    });
  }

  /**
   * lưu & thêm chứng từ
   */
  saveAddVoucher(){
    this.api
      .exec('AC', 'CashReceiptsBusiness', 'UpdateVoucherAsync', [
        this.formCashReceipt.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data).subscribe();
          this.api
            .exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
              null,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                if (this.formCashReceipt.data._isEdit && this.formCashReceipt.data?.status == '7')
                  this.notification.notifyCode('SYS006');
                else 
                  this.notification.notifyCode('SYS007');
                this.formCashReceipt.refreshData(res.data);
                this.detectorRef.detectChanges();
                this.refreshGrid();
              }
            });
        }
        if(this.eleGridCashReceipt && this.eleGridCashReceipt?.isSaveOnClick) this.eleGridCashReceipt.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
      });
  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    if (this.formCashReceipt && this.formCashReceipt.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formCashReceipt.data], false, null, '', '', null, null, false)
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
    if(this.eleGridCashReceipt) this.eleGridCashReceipt.onDestroy();
    if(this.eleGridSettledInvoices) this.eleGridSettledInvoices.onDestroy();
    this.destroy$.next();
    this.destroy$.complete();
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
        this.openFormAdvancePayment();
        break;
      case '3':
        this.openFormSettledInvoices();
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridCashReceipt.endEdit();
    this.eleGridCashReceipt.addRow(oLine,this.eleGridCashReceipt.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let cAcctID = null;
    let rAcctID = null;
    let oOffsetAcct = null;
    let oAccount = null;
    let oLine : any = {};
    oLine.recID = Util.uid();
    oLine.transID = this.formCashReceipt.data.recID;
    oLine.objectID = this.formCashReceipt.data.objectID;
    oLine.reasonID = this.formCashReceipt.data.reasonID;
    oLine.dr = 0;
    oLine.dR2 = 0;
    oLine.cr = 0;
    oLine.cR2 = 0;

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
              oLine.accountID = cAcctID;
            } else {
              oLine.offsetAcctID = this.journal.crAcctID;
            }
            break;
          default:
            oLine.accountID = cAcctID;
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
            oLine.offsetAcctID = rAcctID;
          } else {
            oLine.accountID = this.journal.drAcctID;
          }
          break;
        default:
          oLine.offsetAcctID = rAcctID;
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
    let dRAmt = this.calcRemainAmt(this.formCashReceipt.data?.totalAmt);
    if (dRAmt > 0) {
      oLine.dr = dRAmt;
      oLine = this.getValueByExchangeRate(this.formCashReceipt.data,oLine,true);
    }
    this.lockAndRequireFields(oLine, oAccount, oOffsetAcct);
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
    let dPayAmt = 0;
    this.eleGridCashReceipt.dataSource.forEach((line) => {
      dPayAmt = dPayAmt + line.dr;
    });
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
  lockAndRequireFields(oLine, oAccount, oOffsetAcct) {
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
      this.eleGridCashReceipt.setRequiredFields(['diM1'],rDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '1' || oAccount?.diM2Control == '3' || oOffsetAcct?.diM2Control == '2' || oOffsetAcct?.diM2Control == '3'))
        rDIM2 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '1' && oLine.dr > 0) || (oAccount?.diM2Control == '2' && oLine.cr > 0) || oAccount?.diM2Control == '3'))
        rDIM2 = true;
        this.eleGridCashReceipt.setRequiredFields(['diM2'],rDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '1' || oAccount?.diM3Control == '3' || oOffsetAcct?.diM3Control == '2' || oOffsetAcct?.diM3Control == '3'))
        rDIM3 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '1' && oLine.dr > 0) || (oAccount?.diM3Control == '2' && oLine.cr > 0) || oAccount?.diM3Control == '3'))
        rDIM3 = true;
        this.eleGridCashReceipt.setRequiredFields(['diM3'],rDIM3);

      //* Set lock field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '4' || oOffsetAcct?.diM1Control == '5'))
        lDIM1 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '4' && oLine.dr > 0) || (oAccount?.diM1Control == '5' && oLine.cr > 0)))
        lDIM1 = false;
      this.eleGridCashReceipt.setEditableFields(['diM1'],lDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '4' || oOffsetAcct?.diM2Control == '5'))
        lDIM2 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '4' && oLine.dr > 0) || (oAccount?.diM2Control == '5' && oLine.cr > 0)))
        lDIM2 = false;
      this.eleGridCashReceipt.setEditableFields(['diM2'],lDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '4' || oOffsetAcct?.diM3Control == '5'))
        lDIM3 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '4' && oLine.dr > 0) || (oAccount?.diM3Control == '5' && oLine.cr > 0)))
        lDIM3 = false;
      this.eleGridCashReceipt.setEditableFields(['diM3'],lDIM3);
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
        (x) => x.ObjectID == this.formCashReceipt.data.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.formCashReceipt.data,
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
        this.dialog.dataService.update(this.formCashReceipt.data).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Hàm mở form chọn đề nghị tạm ứng (chi tạm ứng,chi thanh toán)
   */
  openFormAdvancePayment() {
    // let objectName = '';
    // let indexObject =
    //   this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
    //     (x) => x.ObjectID == this.formCashPayment.data.objectID
    //   );
    // if (indexObject > -1) {
    //   objectName =
    //     this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
    //       .ObjectName;
    // }
    // let obj = {
    //   cashpayment: this.formCashPayment.data,
    //   objectName: objectName,
    //   subTypeAdv: this.subTypeAdv,
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'CashPayments';
    // dataModel.gridViewName = 'grvCashPayments';
    // dataModel.entityName = 'AC_CashPayments';
    // opt.FormModel = dataModel;
    // let dialog = this.callfc.openForm(
    //   AdvancePayment,
    //   '',
    //   null,
    //   null,
    //   '',
    //   obj,
    //   '',
    //   opt
    // );
    // dialog.closed.subscribe((res) => {
    //   if (res && res.event && res.event) {
    //     this.formCashReceipt.data.refID = res?.event?.oCashAdv?.recID;
    //     this.voucherNoAdv = res?.event?.oCashAdv?.voucherNo;
    //     this.dRAdv = res?.event?.oCashAdv?.totalDR;
    //     this.subTypeAdv = res?.event?.oCashAdv?.subType;
    //     this.showHideTabDetail(this.formCashReceipt.data.subType, this.elementTabDetail);
    //     if (this.subTypeAdv == '1') {
    //       if (this.eleGridCashReceipt) {
    //         this.eleGridCashReceipt.refresh();
    //       }
    //     }else{
    //       if (this.eleGridSettledInvoices) {
    //         this.eleGridSettledInvoices.refresh();
    //       }
    //     }

    //   }
    // });
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    switch (type) {
      case '11': //? chi theo nhà cung cấp (ẩn tab hóa đơn công nợ , hóa đơn GTGT)
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        break;
      case '12': //? chi hóa đơn công nợ (ẩn tab chi tiết , hóa đơn GTGT)
        eleTab.hideTab(0, true);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, true);
        break;
      // case '3': //? chi tạm ứng,chi thanh toán (ẩn tab chi tiết và hóa đơn công nợ)
      // case '4':
      //   if (this.subTypeAdv == '1') {
      //     eleTab.hideTab(0, false);
      //     eleTab.hideTab(1, true);
      //     eleTab.hideTab(2, true);
      //   } else {
      //     eleTab.hideTab(0, true);
      //     eleTab.hideTab(1, false);
      //     eleTab.hideTab(2, true);
      //   }
      //   break;
      // case '9': //? chi khác (hiện tab chi tiết , hóa đơn công nợ , hóa đơn GTGT)
      //   eleTab.hideTab(0, false);
      //   eleTab.hideTab(1, false);
      //   eleTab.hideTab(2, false);
      //   break;
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
    if (this.formCashReceipt.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
      if (this.journal.entryMode == '1') {
        hDR2 = true; //? => mode 2 tài khoản => hiện cột số tiền,HT
      } else {
        hDR2 = true; //? mode 1 tài khoản => hiện cột nợ,HT
        hCR2 = true; //? mode 1 tài khoản => hiện cột có,HT
      }
    }
    this.eleGridCashReceipt.showHideColumns(['DR2'], hDR2);
    this.eleGridCashReceipt.showHideColumns(['CR2'], hCR2);
    this.settingFormatGridCashPayment(this.eleGridCashReceipt);
    }

    if (this.eleGridSettledInvoices) {
      let hBalAmt2 = false;
      let hSettledAmt2 = false;
      let hSettledDisc2 = false;
      if (this.formCashReceipt.data.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
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

    let indexPayor =
      this.eleCbxPayor?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ContactID == this.eleCbxPayor?.ComponentCurrent?.value
      );
    if (indexPayor > -1) {
      payName =
        this.eleCbxPayor?.ComponentCurrent?.dataService?.data[indexPayor]
          .ContactName + ' - ';
    } else {
      if (this.eleCbxPayor?.ComponentCurrent?.value) {
        payName = this.eleCbxPayor?.ComponentCurrent?.value + ' - ';
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
  getValueByExchangeRate(master, line, isdr) {
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
      }
      if (line.cR2 != 0) {
        line.cR2 = 0;
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
      }
      if (line.dR2 != 0) {
        line.dR2 = 0;
      }
    }
    return line;
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridCashReceipt(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('1');
        break;
      case 'add':
      case 'update': //? sau khi thêm dòng thành công
        if (!this.eleGridCashReceipt.autoAddRow) {
          setTimeout(() => {
            let element = document.getElementById('btnadd');
            element.focus();
          }, 100);
        }
        break;
      case 'closeEdit': //? khi thoát dòng
        setTimeout(() => {
          let element = document.getElementById('btnadd');
          element.focus();
        }, 100);
        break;
    }
  }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridCashReceipt){
      this.eleGridCashReceipt.dataSource = [];
      this.eleGridCashReceipt.refresh();
    }
    if(this.eleGridSettledInvoices){
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  hideMF(event) {
    var bm = event.filter(
      (x) => x.functionID != 'ACT041011' && x.functionID != 'ACT041012'
    ); //? ẩn các morefunction ngoại trừ MF sao chép và MF xóa của lưới
    bm.forEach((element) => {
      element.disabled = true;
    });
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid
   */
  settingFormatGridCashPayment(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.formCashReceipt.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
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
    let lstDisable :any = [];
    if (this.formCashReceipt.data.subType != '11' && this.formCashReceipt) {
      rObjectID = true;
    }
    lstDisable.push({field : 'ObjectID',isDisable : false,require:rObjectID});
    if (this.journal.assignRule == '2') {
      lstDisable.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formCashReceipt.setRequire(lstDisable);
  }
  //#endregion Function
}
