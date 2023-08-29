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

@Component({
  selector: 'lib-cashreceipts-add',
  templateUrl: './cashreceipts-add.component.html',
  styleUrls: ['./cashreceipts-add.component.css','../../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashreceiptsAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashreceipts') eleGridCashreceipts: CodxGridviewV2Component; //? element codx-grv2 lưới Cashreceipts
  @ViewChild('eleGridSettledInvoices')
  eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formCashreceipts') public formCashreceipts: CodxFormComponent; //? element codx-form của Cashpayment
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  // @ViewChild('annotationsave') annotationsave: ProgressBar;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxPayor') eleCbxPayor: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any; //? element codx-input cbx của sổ quỹ
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  cashreceipts: any; //? data của cashpayment
  oLine: any = {}; //? data 1 dòng của cashpayment
  action: any; //? trạng thái form (addnew,edit,copy)
  grvSetupCashreceipts: any; //? data gridviewsetup của Cashpayments
  cashreceiptsline: Array<any> = []; //? danh sách các dòng data của Cashpaymentline
  settledInvoices: Array<any> = []; //? danh sách các dòng data của SettledInvoices
  vatInvoices: Array<any> = []; //? danh sách các dòng data của VatInvoices
  _vatInvoices: Array<any> = []; //? danh sách được filter của VatInvoices theo dòng hạch toán
  hideFieldsCashreceipts: Array<any> = []; //? danh sách các field được ẩn của Cashpayments từ sổ nhật ký
  hideFieldsSettledInvoices: Array<any> = []; //? danh sách các field được ẩn của SettledInvoices
  total: any = 0;
  hasSaved: any = false; //? trạng thái lưu của phiếu
  journal: any; //? data sổ nhật kí
  editSettingsGrid: EditSettingsModel = { //? thiết lập cho phép thêm, xóa, sửa và mode cho lưới
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  fmCashpaymentLine:FormModel = {
    funcID : 'ACT0410',
    formName : 'CashPaymentsLines',
    entityName : 'AC_CashPaymentsLines',
    gridViewName : 'grvCashPaymentsLines'
  }
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  baseCurr: any; //? đồng tiền hạch toán
  typeSettledInvoices: any; //? loại để mở form Đề xuất thanh toán,Cấn trừ tự động
  isLoading: any = false; //? bật tắt progressbar
  userID: any; //? tên user đăng nhập
  voucherNoAdv: any; //? số chứng từ liên kết(xử lí lấy số chứng từ cho loại chi tạm ứng & chi thanh toán)
  dRAdv: any = 0; //? số tiền liên kết(xứ lí lấy số tiền của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  subTypeAdv: any = '1'; //? loại chi liên kết (xử lí lấy loại chi của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  vatAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private roundService: RoundService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.userID = this.authStore.get().userID; //? get tên user đăng nhập
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.headerText = dialogData.data?.headerText; //? set tên tiêu đề
    this.action = dialogData.data?.action; //? set trạng thái phiếu (add,edit,copy)
    this.cashreceipts = { ...dialogData.data?.dataCashreceipts }; //? set data của Cashreceipts
    this.journal = { ...dialogData.data?.journal }; //? set data sổ nhật kí
    this.baseCurr = dialogData.data?.baseCurr; //? set đồng tiền hạch toán
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.grvSetupCashreceipts = res; //? get data grvSetup của Cashreceipts
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.beforeInit();
  }

  ngAfterViewInit() {
    this.formCashreceipts.formGroup.patchValue(this.cashreceipts, { //? gán dữ liệu của Cashpayment hiển thị lên form
      onlySelf: true,
      emitEvent: false,
    });
  }

  /**
   * *Hàm khởi tạo các tab detail khi mở form(ẩn hiện tab theo loại chứng từ)
   * @param event
   * @param eleTab
   */
  createTabDetail(event: any, eleTab: TabComponent) {
    this.showHideTabDetail(this.cashreceipts.subType, eleTab);
  }

  /**
   * *Hàm get dữ liệu trước khi hiển thị trên form
   */
  beforeInit() {
    switch (this.action) {
      case 'add': //? nếu trạng thái form chứng từ là thêm mới hoặc sao chép
      case 'copy':
        if (this.journal.assignRule == '1') {
          //? nếu sổ nhật ký chọn tự động đánh số chứng từ
          this.acService
            .execApi(
              'ERM.Business.AC',
              'CommonBusiness',
              'GenerateAutoNumberAsync',
              this.journal.voucherFormat
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                this.cashreceipts.voucherNo = res; //? => lấy tự động số chứng từ
                this.formCashreceipts.formGroup.patchValue(
                  { voucherNo: this.cashreceipts.voucherNo },
                  {
                    onlySelf: true,
                    emitEvent: false,
                  }
                );
              }
            });
        }
        break;
      case 'edit': //? nếu trạng thái form chứng từ là chỉnh sửa
        this.hasSaved = true;
        this.api
          .exec('AC', 'CashPaymentsLinesBusiness', 'LoadDataFromSubTypeAsync', [
            this.cashreceipts.recID,
            this.cashreceipts.subType,
            this.cashreceipts.refID,
          ]) //? get data detail theo loại chứng từ
          .subscribe((res: any) => {
            if (res) {                        
              this.voucherNoAdv = res?.voucherNoRef ? res?.voucherNoRef : ''; //? số chứng từ đề nghị tạm ứng,thanh toán
              this.dRAdv = res?.totalDrRef ? res?.totalDrRef : 0; //? số tiền chứng từ đề nghị tạm ứng,thanh toán
              this.subTypeAdv = res?.subtypeRef ? res?.subtypeRef : '1'; //? loại của chứng từ đề nghị tạm ứng,thanh toán(mặc định là 1)
              this.detectorRef.detectChanges();
              this.showHideTabDetail(this.cashreceipts.subType,this.elementTabDetail);
            }
          });
        break;
    }
  }
  /**
   * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
   * @param columnsGrid : danh sách cột của lưới
   */
  beforeInitGridCashreceipts(eleGrid:CodxGridviewV2Component) {
    //* Thiết lập format number theo đồng tiền hạch toán
    this.settingFormatGridCashPayment(eleGrid);

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
    this.hideFieldsCashreceipts = [];

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
      this.hideFieldsCashreceipts = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (!this.hideFieldsCashreceipts.includes('Settlement') && this.cashreceipts.subType == '1') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      this.hideFieldsCashreceipts.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản

    if (this.journal.entryMode == '1') {
      if (this.cashreceipts.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashreceipts.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else { //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.cashreceipts.currencyID == this.baseCurr) {
        //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashreceipts.push('DR2'); //? => ẩn field tiền Có,HT
        this.hideFieldsCashreceipts.push('CR2'); //? => ẩn field tiền Nợ,HT
      }
    }
    //debugger
    eleGrid.showHideColumns(this.hideFieldsCashreceipts);
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới SettledInvoices (Ẩn hiện các cột theo đồng tiền hạch toán)
   * @param columnsGrid danh sách cột của lưới
   */
  beforeInitGridSettledInvoices(eleGrid) {
    //* Thiết lập các field ẩn theo đồng tiền hạch toán
    this.hideFieldsSettledInvoices = [];
    if (this.cashreceipts.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      this.hideFieldsSettledInvoices.push('BalAmt2'); //? ẩn cột tiền Số dư, HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledAmt2'); //? ẩn cột tiền thanh toán,HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledDisc2'); //? ẩn cột chiết khấu thanh toán, HT của SettledInvoices
    }
    eleGrid.showHideColumns(this.hideFieldsSettledInvoices);
  }
  //#endregion

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
    if (
      event &&
      event.data[0] &&
      (this.cashreceiptsline.length > 0 ||
        this.settledInvoices.length > 0 ||
        this.vatInvoices.length > 0)
    ) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.isLoading = true;
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.cashreceipts], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.isLoading = false;
                this.detectorRef.detectChanges();
                this.refreshGrid();
                this.cashreceipts.subType = event.data[0];
                this.showHideTabDetail(
                  this.cashreceipts.subType,
                  this.elementTabDetail
                );
              }
            });
        } else {
          // this.cbxSub.dropdownContent.value = this.cashpayment.subType;
          // this.dt.detectChanges();
        }
      });
    } else {
      this.cashreceipts.subType = event.data[0];
      if (this.elementTabDetail) {
        this.showHideTabDetail(this.cashreceipts.subType, this.elementTabDetail);
      }
    }
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    if (event && event?.data && this.cashreceipts[event?.field] != event.data) {
      //? nếu data có thay đổi
      this.cashreceipts[event?.field] = event?.data; //? gán data mới cho field thay đổi
      this.cashreceipts.updateColumn = event?.field; //? gán field thay đổi vào updateColumn
      let preValue = null;
      switch (event.field.toLowerCase()) {
        //* Đổi tượng
        case 'objectid':
          this.cashreceipts.memo = this.getMemoMaster(); //? lấy tên đổi tượng cộng vào ghi chú
          this.cashreceipts.objectType =
            event.component.itemsSelected[0].ObjectType; //? gán loại đối tượng
          this.formCashreceipts.formGroup.patchValue(
            { memo: this.cashreceipts.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashreceiptsline.length > 0) {
            //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại đối tượng cho tất cá các line
            if (
              event?.component?.dataService?.currentComponent?.previousItemData
            ) {
              //? nếu có giá trị đối tượng cũ
              preValue =
                event?.component?.dataService?.currentComponent
                  ?.previousItemData?.ObjectID;
            }
            this.cashreceiptsline.forEach((item) => {
              if (preValue && preValue == item.objectID) {
                //? nếu có đối tượng cũ && so sánh nếu đối tượng tại dòng line = với đối tượng cũ
                item.objectID = this.cashreceipts.objectID; //? => cập nhật giá trị đối tượng mới cho dòng line
              } else {
                //? nếu ko có đối tượng cũ
                item.objectID = this.cashreceipts.objectID; //? => cập nhật giá trị đối tượng mới cho dòng line
              }
            });
            this.eleGridCashreceipts.refresh(); //? => refresh lại lưới
          }
          break;
        //* Lí do chi
        case 'reasonid':
          this.cashreceipts.memo = this.getMemoMaster(); //? lấy tên lí do chi cộng vào ghi chú
          this.formCashreceipts.formGroup.patchValue(
            { memo: this.cashreceipts.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashreceiptsline.length > 0) {
            //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại lí do chi,ghi chú,tài khoản nợ cho tất cá các line
            if (event.component.dataService.currentComponent.previousItemData) {
              //? nếu có giá trị lí do chi cũ
              preValue =
                event.component.dataService.currentComponent.previousItemData
                  .ReasonID;
            }
            this.cashreceiptsline.forEach((item) => {
              if (preValue && preValue == item.reasonID) {
                //? nếu có lí do chi cũ && so sánh nếu lí do chi tại dòng line = với lí do chi cũ
                item.reasonID = this.cashreceipts.reasonID; //? => cập nhật giá trị lí do chi mới cho dòng line
                item.note = event?.component?.itemsSelected[0]?.ReasonName; //? => cập nhật giá trị ghi chú mới cho dòng line
                item.accountID =
                  event?.component?.itemsSelected[0]?.OffsetAcctID; //? => cập nhật giá trị TK Nợ mới cho dòng line
              }
            });
            this.eleGridCashreceipts.refresh(); //? => refresh lại lưới
          }
          break;
        //* người nhận tiền
        case 'payor':
          this.cashreceipts.memo = this.getMemoMaster(); //? lấy tên người nhận cộng vào ghi chú
          this.formCashreceipts.formGroup.patchValue(
            { memo: this.cashreceipts.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          break;
        //* Sổ quỹ
        case 'cashbookid':
          if (
            this.cashreceipts.currencyID !=
            event?.component?.itemsSelected[0]?.CurrencyID
          ) {
            //? nếu tiền tệ của sổ quỹ khác với tiền tệ của chứng từ
            this.cashreceipts.currencyID =
              event?.component?.itemsSelected[0]?.CurrencyID; //? lấy tiền tệ từ sổ quỹ
            this.getExchangeRateMaster(); //? lấy tỷ giá của currency
          }
          if (this.cashreceiptsline.length > 0) {
            //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại tiền tệ và tài khoản nợ cho tất cá các line
            if (event.component.dataService.currentComponent.previousItemData) {
              //? nếu có giá trị TK cũ của sổ quỹ
              preValue =
                event.component.dataService.currentComponent.previousItemData
                  .CashAcctID;
            }
            if (
              preValue &&
              preValue != event?.component?.itemsSelected[0]?.CashAcctID
            ) {
              //? nếu có giá trị TK cũ của sổ quỹ && giá trị TK cũ của số quỹ != giá trị mới
              this.cashreceiptsline.forEach((item) => {
                if (preValue && preValue == item.offsetAcctID) {
                  //? nếu có TK cũ && so sánh nếu TK tại dòng line = với TK cũ
                  item.offsetAcctID =
                    event?.component?.itemsSelected[0]?.CashAcctID; //? => cập nhật giá trị TK mới cho dòng line
                }
              });
            }
            this.eleGridCashreceipts.refresh(); //? => refresh lại lưới
          }
          break;
        //* Tiền tệ & Ngày chứng từ
        case 'currencyid':
        case 'voucherdate':
          this.getExchangeRateMaster(); //? lấy tỷ giá của currency
          break;
      }
    }
  }

  /**
   * *Hàm xử lí khi change value của số tiền và tỷ giá trên master (khi out focus thì mới change)
   * @param event
   */
  valueChangeTotalamtAndExchangerate(event: any) {
    this.cashreceipts[event.ControlName] = event.crrValue;
    this.cashreceipts.updateColumn = event.ControlName;
    switch (event.ControlName.toLowerCase()) {
      case 'totalamt':
        if (event.crrValue == null) {
          this.cashreceipts.totalAmt = 0;
          this.formCashreceipts.formGroup.patchValue(
            { totalAmt: this.cashreceipts.totalAmt },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
        }
        break;
      case 'exchangerate':
        if (this.cashreceiptsline.length > 0) {
          this.updateDetailByChangeExchangeRate();
        }
        break;
    }
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  cellLineChange(event: any) {
    this.oLine = event.data;
    let oAccount = this.acService.getCacheValue('account',this.oLine.accountID);
    let oOffsetAccount = this.acService.getCacheValue('account',this.oLine.offsetAcctID);
    switch (event.field.toLowerCase()) {
      case 'accountid':
        this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        break;
      case 'offsetacctid':
        if (oOffsetAccount) {
          this.oLine.isBrigdeAcct = false;
        } else {
          this.oLine.isBrigdeAcct =
            (oOffsetAccount as any).accountType == '5' ? true : false;
        }
        this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        break;
      case 'dr':
        if (this.oLine.dr != 0 && this.oLine.cR2 != 0) {
          this.oLine.cr = 0;
          this.oLine.cR2 = 0;
        }
        setTimeout(() => {
          this.oLine = this.getValueByExchangeRate(
            this.cashreceipts,
            this.oLine,
            true
          );
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        }
        break;
      case 'cr':
        if ((this.oLine.cr! = 0 && this.oLine.dR2 != 0)) {
          this.oLine.dr = 0;
          this.oLine.dR2 = 0;
        }
        setTimeout(() => {
          this.oLine = this.getValueByExchangeRate(
            this.cashreceipts,
            this.oLine,
            false
          );
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        }
        break;
      case 'dr2':
        if (this.oLine.dR2 != 0 && this.oLine.cR2 != 0) {
          this.oLine.cr = 0;
          this.oLine.cR2 = 0;
        }
        if (this.oLine.dr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.cashreceipts.multi) {
              this.oLine.dr =
                this.cashreceipts.exchangeRate != 0
                  ? this.roundService.amount(
                      this.oLine.cR2 / this.cashreceipts.exchangeRate,
                      this.cashreceipts.currencyID
                    )
                  : this.oLine.cR2;
            } else {
              this.oLine.dr = this.roundService.amount(
                this.oLine.cR2 * this.cashreceipts.exchangeRate,
                this.cashreceipts.currencyID
              );
            }
          }, 100);
        }
        break;
      case 'cr2':
        if (this.oLine.cR2 != 0 && this.oLine.dR2 != 0) {
          this.oLine.dr = 0;
          this.oLine.dR2 = 0;
        }
        if (this.oLine.cr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.cashreceipts.multi) {
              this.oLine.cr =
                this.cashreceipts.exchangeRate != 0
                  ? this.roundService.amount(
                      this.oLine.cR2 / this.cashreceipts.exchangeRate,
                      this.cashreceipts.currencyID
                    )
                  : this.oLine.cR2;
            } else {
              this.oLine.cr = this.roundService.amount(
                this.oLine.cR2 * this.cashreceipts.exchangeRate,
                this.cashreceipts.currencyID
              );
            }
          }, 100);
        }
        break;
      case 'note':
        this.oLine.reasonID = event?.itemData?.ReasonID;
        setTimeout(() => {
          this.oLine.accountID = event?.itemData?.OffsetAcctID;
          this.detectorRef.detectChanges();
        }, 100);
        break;
    }
  }

  /**
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  cellLineChangeVATInvoices(event: any) {
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
  cellLineChangeSettledInvoices(e: any) {
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
   * *Hàm lưu master trước khi thêm dòng
   * @returns
   */
  saveMasterBeforeAddRow(typeBtn) {
    if (this.formCashreceipts.formGroup.invalid) {
      return;
    }
    switch (this.action) {
      case 'add':
      case 'copy':
        if (this.hasSaved) {
          if (this.cashreceipts.updateColumn) {  
            this.dialog.dataService.updateDatas.set(
              this.cashreceipts['_uuid'],
              this.cashreceipts
            );
            this.dialog.dataService
              .save(null, 0, '', '', false)
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res && !res.update.error) {
                  this.addRowDetailByType(typeBtn);
                  this.cashreceipts.updateColumn = null;
                }
              });
          } else {
            this.addRowDetailByType(typeBtn);
          }
        } else {
          this.dialog.dataService.addDatas.set(
            this.cashreceipts['_uuid'],
            this.cashreceipts
          );  
          this.dialog.dataService
            .save(null, 0, '', '', false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res && !res.save.error) {
                this.addRowDetailByType(typeBtn);
                this.cashreceipts.updateColumn = null;
                this.hasSaved = true;
                
              }
            });
        }
        break;
      case 'edit':
        if (this.cashreceipts.updateColumn) {
          this.dialog.dataService.updateDatas.set(
            this.cashreceipts['_uuid'],
            this.cashreceipts
          );
          this.dialog.dataService
            .save(null, 0, '', '', false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res && !res.update.error) {
                this.addRowDetailByType(typeBtn);
              }
            });
        } else {
          this.addRowDetailByType(typeBtn);
        }
        break;
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        this.eleGridCashreceipts.deleteRow(data);
        this.api
          .exec('AC', 'CashPaymentsLinesBusiness', 'UpdateRowNoAfterDeleteLineAsync', [
            data,
            this.cashreceiptsline,
          ])
          .subscribe((res) => {});
      }
    });
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data 
   */
  copyRow(data) {
    data.recID = Util.uid();
    data.index = this.eleGridCashreceipts.dataSource.length;
    let oAccount = this.acService.getCacheValue('account',this.oLine.accountID);
    let oOffsetAccount = this.acService.getCacheValue('account',this.oLine.offsetAcctID);
    this.lockAndRequireFields(data,oAccount,oOffsetAccount);
    this.eleGridCashreceipts.addRow(data, this.eleGridCashreceipts.dataSource.length);
  }

  tabSelected(e) {
    if (e.selectedIndex == 2) {
      if (this.cashreceiptsline.length > 0 && this.eleGridCashreceipts?.rowDataSelected) {
        this._vatInvoices = [...this.vatInvoices.filter((x) => x.lineID == this.eleGridCashreceipts?.rowDataSelected?.recID)];
      }
      this.detectorRef.detectChanges();
    }
  }

  //#endregion Event

  //#region Method

  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher() {
    if (
      !this.acService.validateFormData(
        this.formCashreceipts.formGroup,
        this.formCashreceipts
      )
    ) {
      return;
    }
    if (this.cashreceiptsline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashreceipts && !this.eleGridCashreceipts.gridRef.isEdit) ||
      (this.eleGridSettledInvoices &&
        !this.eleGridSettledInvoices.gridRef.isEdit)
    ) {
      this.isLoading = true;
      this.detectorRef.detectChanges();
      switch (this.action) {
        case 'add':
        case 'copy':
          if (this.hasSaved) {
            // this.dialog.dataService.updateDatas.set(
            //   this.cashpayment['_uuid'],
            //   this.cashpayment
            // );
            //this.dialog.dataService.update(this.cashpayment).subscribe();
            this.api.exec('AC', 'CashReceiptsBusiness', 'ValidateVourcherAsync', [
                this.cashreceipts,
                this.cashreceiptsline,
              ])
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (res) {
                  this.dialog.dataService.update(res).subscribe();
                  this.onDestroy();
                  this.dialog.close();
                  this.notification.notifyCode('SYS006');
                } else {
                  this.isLoading = false;
                  this.detectorRef.detectChanges();
                }
              });
          }
          break;
        case 'edit':
          if (
            this.cashreceipts.updateColumn ||
            this.cashreceipts.status == '0'
          ) {
            //this.dialog.dataService.update(this.cashpayment).subscribe();
            this.api.exec('AC', 'CashReceiptsBusiness', 'ValidateVourcherAsync', [
              this.cashreceipts,
              this.cashreceiptsline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.dialog.dataService.update(res).subscribe();
                this.onDestroy();
                this.dialog.close();
                this.notification.notifyCode('SYS007');
              } else {
                this.isLoading = false;
                this.detectorRef.detectChanges();
              }
            });
          } else {
            this.onDestroy();
            this.dialog.close();
          }
          break;
      }
    }
  }

  /**
   * *Hàm lưu và thêm chứng từ
   * @returns
   */
  onSaveAddVoucher() {
    if (
      !this.acService.validateFormData(
        this.formCashreceipts.formGroup,
        this.grvSetupCashreceipts
      )
    ) {
      return;
    }
    if (this.cashreceiptsline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashreceipts && !this.eleGridCashreceipts.gridRef.isEdit) ||
      (this.eleGridSettledInvoices &&
        !this.eleGridSettledInvoices.gridRef.isEdit)
    ) {
      this.isLoading = true;
      this.detectorRef.detectChanges();
      if (this.hasSaved) {
        //this.dialog.dataService.update(this.cashpayment).subscribe();
        this.acService
          .execApi('AC', 'CashReceiptsBusiness', 'ValidateVourcherAsync', [
            this.cashreceipts,
            this.cashreceiptsline,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res) {
              this.dialog.dataService.update(res).subscribe();
              this.api.exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
                  this.journal,
                ])
                .subscribe((res: any) => {
                  if (res) {
                    this.hasSaved = false;
                    this.cashreceipts = res.data;   
                    this.formCashreceipts.formGroup.patchValue(
                      this.cashreceipts,
                      {
                        onlySelf: true,
                        emitEvent: false,
                      }
                    );
                    this.detectorRef.detectChanges();
                    this.refreshGrid();
                    this.notification.notifyCode('SYS006');
                    this.isLoading = false;
                  }
                });
            } else {
              this.isLoading = false;
              this.detectorRef.detectChanges();
            }
          });
      }
    }
  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    // if (
    //   (this.gridCash && !this.gridCash.gridRef.isEdit) ||
    //   (this.gridSet && !this.gridSet.gridRef.isEdit)
    // ) {

    // }
    if (this.hasSaved) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.isLoading = true;
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.cashreceipts], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.isLoading = false;
                this.detectorRef.detectChanges();
                this.notification.notifyCode('E0860');
                this.dialog.close();
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

  /**
   * *Hàm lưu khi thêm dòng hóa đơn GTGT và tạo hạch toán
   * @param data
   * @param isAddNew
   */
  onSaveLineVATInvoices(data, isAddNew) {
    if (isAddNew) {
      if (this.eleGridCashreceipts?.rowDataSelected) {
        this.updateLineBeforeSaveVatInvoices(data);
      } else {
        this.addLineBeforeSaveVatInvoices(data);
      }
      this.vatInvoices.push(data);
      this.api.exec('AC', 'CashPaymentsLinesBusiness', 'SaveVATInvoicesAsync', [
          this.cashreceiptsline,
          data,
        ])
        .subscribe((res: any) => {
          this.dialog.dataService.update(this.cashreceipts).subcrible();
        });
    } else {
      let idx = this.vatInvoices.findIndex((x) => x.recID == data.recID && x.lineID == data.lineID);
      if (idx > -1) {
        this.vatInvoices[idx] = data;
      }
      this.updateLineBeforeSaveVatInvoices(data);
      this.api.exec('AC', 'CashPaymentsLinesBusiness', 'UpdateVATInvoicesAsync', [
          this.cashreceipts,
          this.cashreceiptsline,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.dialog.dataService.update(this.cashreceipts).subcrible();
          }
        });
    }
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
      case '4':
        this.addLineVatInvoices();
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    this.setDefaultLine();
    this.eleGridCashreceipts.endEdit();
    this.eleGridCashreceipts.addRow(
      this.oLine,
      this.eleGridCashreceipts.dataSource.length
    );
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let cAcctID = null;
    let rAcctID = null;
    let oOffsetAcct = null;
    let oAccount = null;
    this.oLine = {};
    this.oLine.transID = this.cashreceipts.recID;
    this.oLine.objectID = this.cashreceipts.objectID;
    this.oLine.reasonID = this.cashreceipts.reasonID;
    this.oLine.dr = 0;
    this.oLine.cr = 0;
    this.oLine.dR2 = 0;
    this.oLine.cR2 = 0;

    let indexCashBook =
      this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.CashBookID == this.eleCbxCashBook?.value
      );
    if (indexCashBook > -1) {
      cAcctID =
        this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexCashBook]
          .CashAcctID;
    }

    let indexReason =
      this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ReasonID == this.eleCbxReasonID?.value
      );
    if (indexReason > -1) {
      rAcctID =
        this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason]
          .OffsetAcctID;
      this.oLine.note =
        this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[
          indexReason
        ].ReasonName;
    }

    if (this.journal?.entryMode == '1') {
      if (cAcctID) {
        switch (this.journal?.crAcctControl) {
          case '1':
            if (cAcctID == this.journal?.crAcctID) {
              this.oLine.accountID = cAcctID;
            } else {
              this.oLine.offsetAcctID = this.journal.crAcctID;
            }
            break;
          default:
            this.oLine.accountID = cAcctID;
            break;
        }
      }
    } else {
      this.oLine.offsetAcctID = null;
    }

    if (rAcctID) {
      switch (this.journal?.drAcctControl) {
        case '1':
          if (rAcctID == this.journal?.drAcctID) {
            this.oLine.offsetAcctID = rAcctID;
          } else {
            this.oLine.accountID = this.journal.drAcctID;
          }
          break;
        default:
          this.oLine.offsetAcctID = rAcctID;
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
        this.oLine.diM1 = this.journal.diM1;
      }
      if (
        dicSetting?.diM2Control &&
        dicSetting?.diM2Control != '2' &&
        dicSetting?.diM2Control != '9'
      ) {
        this.oLine.diM2 = this.journal.diM2;
      }
      if (
        dicSetting?.diM3Control &&
        dicSetting?.diM3Control != '2' &&
        dicSetting?.diM3Control != '9'
      ) {
        this.oLine.diM3 = this.journal.diM3;
      }
    }

    oAccount = this.acService.getCacheValue('account', this.oLine?.accountID);
    oOffsetAcct = this.acService.getCacheValue(
      'account',
      this.oLine?.offsetAcctID
    );
    if (this.oLine?.offsetAcctID) {
      if (oOffsetAcct && oOffsetAcct?.accountType == '5') {
        this.oLine.isBrigdeAcct = true;
      }
    }
    if (this.oLine?.accountID) {
      if (oAccount) {
        this.oLine.singleEntry = oAccount?.accountType == '0' ? true : false;
        let bSubLGControl = oAccount?.subLGControl;
        if (!bSubLGControl && !this.oLine?.offsetAcctID) {
          bSubLGControl = oOffsetAcct?.subLGControl;
        }
      }
    }
    this.oLine.createdBy = this.userID;
    let dRAmt = this.calcRemainAmt(this.cashreceipts?.totalAmt);
    if (dRAmt > 0) {
      this.oLine.dr = dRAmt;
      this.oLine = this.getValueByExchangeRate(
        this.cashreceipts,
        this.oLine,
        true
      );
    }
    this.lockAndRequireFields(this.oLine,oAccount,oOffsetAcct);
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
    this.cashreceiptsline.forEach((line) => {
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
      this.eleGridCashreceipts.setRequiredFields(['diM1'],rDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '1' || oAccount?.diM2Control == '3' || oOffsetAcct?.diM2Control == '2' || oOffsetAcct?.diM2Control == '3'))
        rDIM2 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '1' && oLine.dr > 0) || (oAccount?.diM2Control == '2' && oLine.cr > 0) || oAccount?.diM2Control == '3'))
        rDIM2 = true;
        this.eleGridCashreceipts.setRequiredFields(['diM2'],rDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '1' || oAccount?.diM3Control == '3' || oOffsetAcct?.diM3Control == '2' || oOffsetAcct?.diM3Control == '3'))
        rDIM3 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '1' && oLine.dr > 0) || (oAccount?.diM3Control == '2' && oLine.cr > 0) || oAccount?.diM3Control == '3'))
        rDIM3 = true;
        this.eleGridCashreceipts.setRequiredFields(['diM3'],rDIM3);

      //* Set lock field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '4' || oOffsetAcct?.diM1Control == '5'))
        lDIM1 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '4' && oLine.dr > 0) || (oAccount?.diM1Control == '5' && oLine.cr > 0)))
        lDIM1 = false;
      this.eleGridCashreceipts.setEditableFields(['diM1'],lDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '4' || oOffsetAcct?.diM2Control == '5'))
        lDIM2 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '4' && oLine.dr > 0) || (oAccount?.diM2Control == '5' && oLine.cr > 0)))
        lDIM2 = false;
      this.eleGridCashreceipts.setEditableFields(['diM2'],lDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '4' || oOffsetAcct?.diM3Control == '5'))
        lDIM3 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '4' && oLine.dr > 0) || (oAccount?.diM3Control == '5' && oLine.cr > 0)))
        lDIM3 = false;
      this.eleGridCashreceipts.setEditableFields(['diM3'],lDIM3);
    }
  }

  /**
   * *Hàm set loại để mở form chọn hóa đơn (Đề xuất thanh toán = 0 ,Cấn trừ tự động = 1)
   * @param type
   */
  setTypeSettledInvoices(type: number) {
    this.typeSettledInvoices = type;
  }

  /**
   * *Hàm mở form chọn hóa đơn (Đề xuất thanh toán,Cấn trừ tự động)
   * @param typeSettledInvoices
   */
  openFormSettledInvoices() {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.cashreceipts.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.cashreceipts,
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
        //this.settledInvoices = res.event;
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.cashreceipts).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Hàm mở form chọn đề nghị tạm ứng (chi tạm ứng,chi thanh toán)
   */
  openFormAdvancePayment() {
    // chua xu li
    // let objectName = '';
    // let indexObject =
    //   this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
    //     (x) => x.ObjectID == this.cashpayment.objectID
    //   );
    // if (indexObject > -1) {
    //   objectName =
    //     this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
    //       .ObjectName;
    // }
    // let obj = {
    //   cashpayment: this.cashpayment,
    //   objectName: objectName,
    //   subTypeAdv: this.subTypeAdv
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
    //     this.cashpayment.refID = res?.event?.oCashAdv?.recID;
    //     this.voucherNoAdv = res?.event?.oCashAdv?.voucherNo;
    //     this.dRAdv = res?.event?.oCashAdv?.totalDR;
    //     this.subTypeAdv = res?.event?.oCashAdv?.subType;
    //     this.showHideTabDetail(this.cashpayment.subType,this.elementTabDetail);
    //   }
    // });
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    //chua xu li
    // let data = new VATInvoices();
    // data.transID = this.cashpayment.recID;
    // data.lineID = this.eleGridCashreceipts?.rowDataSelected?.recID;
    // this.eleGridVatInvoices.addRow(data,this.eleGridVatInvoices.dataSource.length);
  }

  /**
   * *Hàm tạo hạch toán trước khi lưu hóa đơn GTGT
   * @param data
   */
  addLineBeforeSaveVatInvoices(data) {
    let totalVatAtm = 0;
    this._vatInvoices.forEach((item) => {
      totalVatAtm += item.vatAmt;
    });
    if (this.journal.entryMode == '1') {
      this.setDefaultLine();
      this.oLine.dr = totalVatAtm;
      this.eleGridCashreceipts.rowDataSelected = this.oLine;
      if (this.vatAccount) {
          this.oLine.accountID = this.vatAccount;
      }
      data.lineID = this.oLine.recID;
      this.cashreceiptsline.push(this.oLine);
    }else{
      for (let index = 1; index <= 2; index++) {
        this.setDefaultLine();
        if (index == 1) {
          this.oLine.dr = totalVatAtm;
          if (this.vatAccount) {
            this.oLine.accountID = this.vatAccount;
          }
          this.eleGridCashreceipts.rowDataSelected = this.oLine;
          this.cashreceiptsline.push(this.oLine);
          data.lineID = this.oLine.recID;
        } else {
          this.oLine.accountID =
            this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
          this.oLine.cr = totalVatAtm;
          this.cashreceiptsline.push(this.oLine);
        }
      }
    }
    this.eleGridCashreceipts.refresh();
  }

  /**
   * *Hàm update hạch toán trước khi lưu hóa đơn GTGT
   * @param data
   */
  updateLineBeforeSaveVatInvoices(data) {
    let totalVatAtm = 0;
    this._vatInvoices.forEach((item) => {
      totalVatAtm += item.vatAmt;
    });
    if (this.journal.entryMode == '1') {
      let idx = this.cashreceiptsline.findIndex((x) => x.recID == data.lineID);
      if (idx > -1) {
        this.cashreceiptsline[idx].dr = totalVatAtm;
        if (this.vatAccount) {
          this.cashreceiptsline[idx].accountID = this.vatAccount;
        }
      }
    } else {
      let l1 = this.cashreceiptsline.findIndex((x) => x.recID == data.lineID);
      if (l1 > -1) {
        this.cashreceiptsline[l1].dr = totalVatAtm;
        if (this.vatAccount) {
          this.cashreceiptsline[l1].accountID = this.vatAccount;
        }
      }
      let l2 = this.cashreceiptsline.findIndex(
        (x) => x.rowNo == this.cashreceiptsline[l1].rowNo + 1
      );
      if (l2 > -1) {
        this.cashreceiptsline[l2].cr = totalVatAtm;
      }
    }
    this.eleGridCashreceipts.refresh();
  }

  /**
   * *Hàm set field bắt buộc nhập trên lưới
   * @param fieldName
   * @param isRequire
   */
  setRequireField(fieldName, isRequire) {
    let i = this.eleGridCashreceipts.columnsGrid.findIndex(
      (x) => x.fieldName == fieldName
    );
    if (i > -1) {
      this.eleGridCashreceipts.columnsGrid[i].isRequire = isRequire;
    }
  }

  /**
   * *Hàm set field bỏ qua không cho nhập trên lưới
   * @param fieldName
   * @param islock
   */
  setLockField(fieldName, islock) {
    let i = this.eleGridCashreceipts.columnsGrid.findIndex(
      (x) => x.fieldName == fieldName
    );
    if (i > -1) {
      this.eleGridCashreceipts.columnsGrid[i].allowEdit = islock;
    }
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    switch (type) {
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
      case '11': //? thu theo nhà cung cấp (ẩn tab hóa đơn công nợ , hóa đơn GTGT)
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        break;
      case '12': //? thu hóa đơn công nợ (ẩn tab chi tiết , hóa đơn GTGT)
        eleTab.hideTab(0, true);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, true);
        break;
    }
  }

  /**
   * *Hàm lấy tỷ giá theo currency
   */
  getExchangeRateMaster() {
    if (this.cashreceipts.currencyID == this.baseCurr) {
      //? nếu tiền tệ chứng từ = đồng tiền hạch toán
      this.cashreceipts.exchangeRate = 1; //? => tỷ giá mặc định là 1
      this.formCashreceipts.formGroup.patchValue(
        {
          currencyID: this.cashreceipts.currencyID,
          exchangeRate: this.cashreceipts.exchangeRate,
        },
        {
          onlySelf: true,
          emitEvent: false,
        }
      );
      if (this.cashreceiptsline.length > 0) {
        //? nếu detail đã có dữ liệu
        this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
      }
    } else {
      //? nếu tiền tệ chứng từ != đồng tiền hạch toán
      this.api
        .exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
          'exchangeRate',
          this.cashreceipts,
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.cashreceipts.exchangeRate = res.exchangeRate; //? lấy tỷ giá của currency
            this.formCashreceipts.formGroup.patchValue(
              {
                currencyID: this.cashreceipts.currencyID,
                exchangeRate: this.cashreceipts.exchangeRate,
              },
              {
                onlySelf: true,
                emitEvent: false,
              }
            );
            if (this.cashreceiptsline.length > 0) {
              //? nếu detail đã có dữ liệu
              this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
            }
          }
        });
    }

    //* Thiết lập hiện cột tiền HT cho lưới nếu chứng từ có ngoại tệ
    let hDR2 = false;
    let hCR2 = false;
    if (this.cashreceipts.currencyID != this.baseCurr) { //? nếu tiền tệ chứng từ là ngoại tệ
      if (this.journal.entryMode == '1') {
        hDR2 = true; //? => mode 2 tài khoản => hiện cột số tiền,HT
      }else{
        hDR2 = true; //? mode 1 tài khoản => hiện cột nợ,HT
        hCR2 = true; //? mode 1 tài khoản => hiện cột có,HT
      }
    }
    this.eleGridCashreceipts.columnsGrid[this.eleGridCashreceipts.columnsGrid.findIndex((x) => x.fieldName == 'DR2')].isVisible = hDR2; 
    this.eleGridCashreceipts.columnsGrid[this.eleGridCashreceipts.columnsGrid.findIndex((x) => x.fieldName == 'CR2')].isVisible = hCR2; 
    setTimeout(() => {
        this.eleGridCashreceipts.refresh();
    }, 100);  
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
        (x) => x.ReasonID == this.eleCbxReasonID?.value
      );
    if (indexReason > -1) {
      reasonName =
        this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason]
          .ReasonName + ' - ';
    }

    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.eleCbxObjectID?.value
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName + ' - ';
    }

    let indexPayor =
      this.eleCbxPayor?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ContactID == this.eleCbxPayor?.value
      );
    if (indexPayor > -1) {
      payName =
        this.eleCbxPayor?.ComponentCurrent?.dataService?.data[indexPayor]
          .ContactName + ' - ';
    } else {
      if (this.eleCbxPayor.ComponentCurrent?.value) {
        payName = this.eleCbxPayor.ComponentCurrent?.value + ' - ';
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
   * *Hàm cập nhật lại tiền cho tất cả các dòng line
   */
  updateDetailByChangeExchangeRate() {
    this.cashreceiptsline.forEach((item) => {
      let line = this.getValueByExchangeRate(
        this.cashreceipts,
        item,
        item.dr != 0
      );
      item.cr = line.cr;
      item.cR2 = line.cR2;
      item.dr = line.dr;
      item.dR2 = line.dR2;
    });
    this.eleGridCashreceipts.refresh(); //? => refresh lại lưới
  }

  // doi ten checkaccount/ dem len valuechange cashbookid
  checkExistAccount() {
    // let oAccount = this.acService.getCacheValue(
    //   'account',
    //   this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID
    // );
    // if (oAccount != null) {
    //   return true;
    // } else {
    //   this.notification.notifyCode(
    //     'AC0021',
    //     0,
    //     this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID
    //   );
    //   return false;
    // }
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridCashpayment(event: any) {
    switch (event.type) {
      // case 'autoAdd':
      //   this.addRow('1');
      //   break;
      case 'add':
        if (this.eleGridCashreceipts.autoAddRow) {
          this.saveMasterBeforeAddRow('1');
        }
        break;
      case 'endEdit':
        if (!this.eleGridCashreceipts.autoAddRow) {
          let element = document.getElementById('btnadd');
          element.focus();
        }
        break;
        // case 'closeEdit':
        //   this..rowDataSelected = null;
        //   setTimeout(() => {
        //     let element = document.getElementById('btnadd');
        //     element.focus();
        //   }, 100);
        break;
    }
  }

  /**
   * *Hàm các sự kiện của lưới VatInvoice
   * @param event
   */
  onActionGridVatInvoice(event: any) {
    switch (event.type) {
      case 'add':
        this.saveMasterBeforeAddRow('4');
        break;
    }
  }

  /**
   * *Hàm xóa tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridCashreceipts){
      this.eleGridCashreceipts.dataSource = [];
      this.eleGridCashreceipts.refresh();
    }
    if(this.eleGridSettledInvoices){
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
    }
    if(this.eleGridVatInvoices){
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  hideMF(event){
    var bm = event.filter(x => x.functionID != 'ACT041011' && x.functionID != 'ACT041012'); //? ẩn các morefunction ngoại trừ MF sao chép và MF xóa của lưới
    bm.forEach(element => {
      element.disabled = true;
    });
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid 
   */
  settingFormatGridCashPayment(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.cashreceipts.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('dr','n0');
      eleGrid.setFormatField('cr','n0');
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('dr','n0');
      eleGrid.setFormatField('cr','n0');
      eleGrid.setFormatField('dR2','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('cR2','n'+(setting.dSourceCurr || 0));
    }
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    // if (this.journal.assignRule == '1' || this.journal.assignRule == '2') { //? nếu số chứng từ tự động hoặc từ động tạo khi lưu
    //   this.formCashreceipts.formGroup.controls['voucherNo'].removeValidators(Validators.required); //? không cần bắt buộc nhập
    // }
    // if (this.cashpayment.subType != '1') { //? nếu chứng từ khác nhà cung cấp ko theo hóa đơn 
    //   this.formCashreceipts.formGroup.controls['objectID'].setValidators(Validators.required); //? set bắt buộc nhập đối tượng   
    // }else{
    //   this.formCashreceipts.formGroup.controls['objectID'].removeValidators(Validators.required); //? set ko bắt buộc nhập đối tượng
    // }
    // this.formCashreceipts.formGroup.controls['objectID'].updateValueAndValidity();
    // this.formCashreceipts.formGroup.controls['voucherNo'].updateValueAndValidity();

    // let ins = setInterval(() => {
    //   if (this.eleCbxObjectID && this.elelblObjectID) {
    //     clearInterval(ins);
    //     if (this.formCashreceipts.formGroup.controls['objectID'].status == 'INVALID') {
    //       this.eleCbxObjectID.require = true;
    //       this.elelblObjectID?.changeDetectorRef?._cdRefInjectingView[0]?.children[0]?.classList?.add('required'); //? set label có hình bắt buộc
    //     }else{
    //       this.eleCbxObjectID.require = false;
    //       this.elelblObjectID?.changeDetectorRef?._cdRefInjectingView[0]?.children[0]?.classList?.remove('required'); //? set label ko có hình bắt buộc
    //     }
    //   }
    // }, 200);
    // setTimeout(() => {
    //   if (ins) clearInterval(ins);
    // }, 5000);
    
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.eleGridCashreceipts && this.eleGridCashreceipts.gridRef.isEdit) {
        this.eleGridCashreceipts.autoAddRow = false;
        this.eleGridCashreceipts.endEdit();
      }
    }
  }
}
