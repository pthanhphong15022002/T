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
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { RoundService } from '../../../round.service';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { E } from '@angular/cdk/keycodes';
import { AdvancePayment } from '../cashpayments-add-advancepayment/advancepayment.component';
@Component({
  selector: 'lib-cashpayments-add',
  templateUrl: './cashpayments-add.component.html',
  styleUrls: [
    './cashpayments-add.component.css',
    '../../../codx-ac.component.css',
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentAdd extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashPayment') eleGridCashPayment: CodxGridviewV2Component; //? element codx-grv2 lưới Cashpayemnts
  @ViewChild('eleGridSettledInvoices')
  eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formCashPayment') public formCashPayment: CodxFormComponent; //? element codx-form của Cashpayment
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  // @ViewChild('annotationsave') annotationsave: ProgressBar;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxPayee') eleCbxPayee: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any; //? element codx-input cbx của sổ quỹ
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  cashpayment: any; //? data của cashpayment
  oLine: any = {}; //? data 1 dòng của cashpayment
  action: any; //? trạng thái form (addnew,edit,copy)
  grvSetupCashpayment: any; //? data gridviewsetup của Cashpayments
  cashpaymentline: Array<any> = []; //? danh sách các dòng data của Cashpaymentline
  settledInvoices: Array<any> = []; //? danh sách các dòng data của SettledInvoices
  vatInvoices: Array<any> = []; //? danh sách các dòng data của VatInvoices
  oriVatInvoices: Array<any> = [];
  hideFieldsCashpayment: Array<any> = []; //? danh sách các field được ẩn của Cashpayments từ sổ nhật ký
  hideFieldsSettledInvoices: Array<any> = []; //? danh sách các field được ẩn của SettledInvoices
  requireFieldsCashpayment = []; //? danh sách các field bắt buộc nhập của Cashpayments
  lockFieldsCashpayment = []; //? danh sách các field bị khóa của Cashpayments
  total: any = 0;
  hasSaved: any = false; //? trạng thái lưu của phiếu
  journal: any; //? data sổ nhật kí
  editSettingsGrid: EditSettingsModel = {
    //? thiết lập cho phép thêm, xóa, sửa và mode cho lưới
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
  // noEditSetting: EditSettingsModel = {
  //   allowEditing: false,
  //   allowAdding: false,
  //   allowDeleting: false,
  //   mode: 'Normal',
  // };
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
  public animation: AnimationModel = { enable: true, duration: 1000, delay: 0 }; //? animation của progressbar
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
    this.cashpayment = { ...dialogData.data?.dataCashpayment }; //? set data của Cashpayments
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
          this.grvSetupCashpayment = res; //? get data grvSetup của Cashpayments
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.getDataDetailBeforeInit();
  }

  ngAfterViewInit() {
    this.formCashPayment.formGroup.patchValue(this.cashpayment, {
      //? gán dữ liệu của Cashpayment hiển thị lên form
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
    this.showHideTabDetail(this.cashpayment.subType, eleTab);
  }

  /**
   * *Hàm get dữ liệu trước khi hiển thị trên form
   */
  getDataDetailBeforeInit() {
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
                this.cashpayment.voucherNo = res; //? => lấy tự động số chứng từ
                this.formCashPayment.formGroup.patchValue(
                  { voucherNo: this.cashpayment.voucherNo },
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
            this.cashpayment.recID,
            this.cashpayment.subType,
            this.cashpayment.refID,
          ]) //? get data detail theo loại chứng từ
          .subscribe((res: any) => {
            if (res) {
              this.cashpaymentline = res?.lsCashpaymentLine
                ? res?.lsCashpaymentLine
                : []; //? danh sách chi tiết (tab chi tiết)
              this.settledInvoices = res?.lsSettledInvoices
                ? res?.lsSettledInvoices
                : []; //? danh sách chi tiết (tab hóa đơn công nợ)
              this.vatInvoices = res?.lsVATInvoices ? res?.lsVATInvoices : []; //? danh sách chi tiết (tab hóa đơn GTGT)
              this.voucherNoAdv = res?.voucherNoRef ? res?.voucherNoRef : ''; //? số chứng từ đề nghị tạm ứng,thanh toán
              this.dRAdv = res?.totalDrRef ? res?.totalDrRef : 0; //? số tiền chứng từ đề nghị tạm ứng,thanh toán
              this.subTypeAdv = res?.subtypeRef ? res?.subtypeRef : '1'; //? loại của chứng từ đề nghị tạm ứng,thanh toán(mặc định là 1)
              this.detectorRef.detectChanges();
            }
          });
        break;
    }
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
   * @param columnsGrid : danh sách cột của lưới
   */
  beforeInitGridCashpayments(columnsGrid) {
    this.hideFieldsCashpayment = [];
    if (
      this.dialogData?.data.hideFields &&
      this.dialogData?.data.hideFields.length > 0
    ) {
      this.hideFieldsCashpayment = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (
      !this.hideFieldsCashpayment.includes('Settlement') &&
      this.cashpayment.subType == '1'
    ) {
      //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      this.hideFieldsCashpayment.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') {
      //? nếu loại mode 2 tài khoản trên cùng 1 dòng
      this.hideFieldsCashpayment.push('CR2'); //? => ẩn field tiền Có,HT
      this.hideFieldsCashpayment.push('CR'); //? => ẩn field tiền Có
      if (this.cashpayment.currencyID == this.baseCurr) {
        //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashpayment.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else {
      //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.cashpayment.currencyID == this.baseCurr) {
        //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashpayment.push('DR2'); //? => ẩn field tiền Có,HT
        this.hideFieldsCashpayment.push('CR2'); //? => ẩn field tiền Nợ,HT
      }
    }

    //* Thiết lập format number theo đồng tiền hạch toán
    if (this.cashpayment.currencyID == this.baseCurr) {
      //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DR')
      ].dataFormat = 'B';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'CR')
      ].dataFormat = 'B';
    } else {
      //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DR')
      ].dataFormat = 'S';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'CR')
      ].dataFormat = 'S';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DR2')
      ].dataFormat = 'B';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'CR2')
      ].dataFormat = 'B';
    }

    //* Thiết lập datasource combobox theo sổ nhật ký
    if (
      this.journal.drAcctControl == '1' ||
      this.journal.drAcctControl == '2'
    ) {
      //? nếu tài khoản nợ là mặc định hoặc trong danh sách
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'AccountID')
      ].predicate = '@0.Contains(AccountID)';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'AccountID')
      ].dataValue = `[${this.journal?.drAcctID}]`;
    }

    if (
      this.journal.crAcctControl == '1' ||
      this.journal.crAcctControl == '2'
    ) {
      //? nếu tài khoản có là mặc định hoặc trong danh sách
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'AccountID')
      ].predicate = '@0.Contains(AccountID)';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'AccountID')
      ].dataValue = `[${this.journal?.crAcctID}]`;
    }

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') {
      //? nếu phòng ban là mặc định hoặc trong danh sách
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM1')
      ].predicate = '@0.Contains(DepartmentID)';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM1')
      ].dataValue = `[${this.journal?.diM1}]`;
    }

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2') {
      //? nếu TTCP là mặc định hoặc trong danh sách
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM2')
      ].predicate = '@0.Contains(CostCenterID)';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM2')
      ].dataValue = `[${this.journal?.diM2}]`;
    }

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2') {
      //? nếu mục phí là mặc định hoặc trong danh sách
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM3')
      ].predicate = '@0.Contains(CostItemID)';
      columnsGrid[
        columnsGrid.findIndex((x) => x.fieldName == 'DIM3')
      ].dataValue = `[${this.journal?.diM3}]`;
    }

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    let arrColumnOfJournal = [
      //? danh sách các cột từ sổ nhật kí
      'DR2',
      'CR',
      'CR2',
      'DIM1',
      'DIM2',
      'DIM3',
      'ProjectID',
      'ContractID',
      'AssetGroupID',
      'ObjectID',
      'Settlement',
      'OffsetAcctID',
    ];
    arrColumnOfJournal.forEach((fieldName) => {
      if (columnsGrid.findIndex((x) => x.fieldName == fieldName) > -1) {
        if (this.hideFieldsCashpayment.includes(fieldName)) {
          //? nếu field ẩn có trong danh sách
          columnsGrid[
            columnsGrid.findIndex((x) => x.fieldName == fieldName)
          ].isVisible = false; //? => ẩn cột
        } else {
          columnsGrid[
            columnsGrid.findIndex((x) => x.fieldName == fieldName)
          ].isVisible = true; //? => hiện cột
        }
      }
    });
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới SettledInvoices (Ẩn hiện các cột theo đồng tiền hạch toán)
   * @param columnsGrid danh sách cột của lưới
   */
  beforeInitGridSettledInvoices(columnsGrid) {
    this.hideFieldsSettledInvoices = [];
    if (this.cashpayment.currencyID == this.baseCurr) {
      //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      this.hideFieldsSettledInvoices.push('BalAmt2'); //? ẩn cột tiền Số dư, HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledAmt2'); //? ẩn cột tiền thanh toán,HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledDisc2'); //? ẩn cột chiết khấu thanh toán, HT của SettledInvoices
    }
    let arrColumnSettledInvoices = ['BalAmt2', 'SettledAmt2', 'SettledDisc2']; //? danh sách các cột của SettledInvoices
    arrColumnSettledInvoices.forEach((fieldName) => {
      if (columnsGrid.findIndex((x) => x.fieldName == fieldName) > -1) {
        if (this.hideFieldsSettledInvoices.includes(fieldName)) {
          //? nếu field ẩn có trong danh sách
          columnsGrid[
            columnsGrid.findIndex((x) => x.fieldName == fieldName)
          ].isVisible = false; //? => ẩn cột
        } else {
          columnsGrid[
            columnsGrid.findIndex((x) => x.fieldName == fieldName)
          ].isVisible = true; //? => hiện cột
        }
      }
    });
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
    if (
      event &&
      event.data[0] &&
      (this.cashpaymentline.length > 0 ||
        this.settledInvoices.length > 0 ||
        this.vatInvoices.length > 0)
    ) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.isLoading = true;
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.cashpayment], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.isLoading = false;
                this.detectorRef.detectChanges();
                this.clearCashpayment();
                this.cashpayment.subType = event.data[0];
                this.showHideTabDetail(
                  this.cashpayment.subType,
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
      this.cashpayment.subType = event.data[0];
      if (this.elementTabDetail) {
        this.showHideTabDetail(this.cashpayment.subType, this.elementTabDetail);
      }
    }
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    if (event && event?.data && this.cashpayment[event?.field] != event.data) {
      //? nếu data có thay đổi
      this.cashpayment[event?.field] = event?.data; //? gán data mới cho field thay đổi
      this.cashpayment.updateColumn = event?.field; //? gán field thay đổi vào updateColumn
      let preValue = null;
      switch (event.field.toLowerCase()) {
        //* Đổi tượng
        case 'objectid':
          this.cashpayment.memo = this.getMemoMaster(); //? lấy tên đổi tượng cộng vào ghi chú
          this.cashpayment.objectType =
            event.component.itemsSelected[0].ObjectType; //? gán loại đối tượng
          this.formCashPayment.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashpaymentline.length > 0) {
            //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại đối tượng cho tất cá các line
            if (
              event?.component?.dataService?.currentComponent?.previousItemData
            ) {
              //? nếu có giá trị đối tượng cũ
              preValue =
                event?.component?.dataService?.currentComponent
                  ?.previousItemData?.ObjectID;
            }
            this.cashpaymentline.forEach((item) => {
              if (preValue && preValue == item.objectID) {
                //? nếu có đối tượng cũ && so sánh nếu đối tượng tại dòng line = với đối tượng cũ
                item.objectID = this.cashpayment.objectID; //? => cập nhật giá trị đối tượng mới cho dòng line
              } else {
                //? nếu ko có đối tượng cũ
                item.objectID = this.cashpayment.objectID; //? => cập nhật giá trị đối tượng mới cho dòng line
              }
            });
            this.eleGridCashPayment.refresh(); //? => refresh lại lưới
          }
          break;
        //* Lí do chi
        case 'reasonid':
          this.cashpayment.memo = this.getMemoMaster(); //? lấy tên lí do chi cộng vào ghi chú
          this.formCashPayment.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashpaymentline.length > 0) {
            //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại lí do chi,ghi chú,tài khoản nợ cho tất cá các line
            if (event.component.dataService.currentComponent.previousItemData) {
              //? nếu có giá trị lí do chi cũ
              preValue =
                event.component.dataService.currentComponent.previousItemData
                  .ReasonID;
            }
            this.cashpaymentline.forEach((item) => {
              if (preValue && preValue == item.reasonID) {
                //? nếu có lí do chi cũ && so sánh nếu lí do chi tại dòng line = với lí do chi cũ
                item.reasonID = this.cashpayment.reasonID; //? => cập nhật giá trị lí do chi mới cho dòng line
                item.note = event?.component?.itemsSelected[0]?.ReasonName; //? => cập nhật giá trị ghi chú mới cho dòng line
                item.accountID =
                  event?.component?.itemsSelected[0]?.OffsetAcctID; //? => cập nhật giá trị TK Nợ mới cho dòng line
              }
            });
            this.eleGridCashPayment.refresh(); //? => refresh lại lưới
          }
          break;
        //* Tên người nhận
        case 'payee':
          this.cashpayment.memo = this.getMemoMaster(); //? lấy tên người nhận cộng vào ghi chú
          this.formCashPayment.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          break;
        //* Sổ quỹ
        case 'cashbookid':
          if (
            this.cashpayment.currencyID !=
            event?.component?.itemsSelected[0]?.CurrencyID
          ) {
            //? nếu tiền tệ của sổ quỹ khác với tiền tệ của chứng từ
            this.cashpayment.currencyID =
              event?.component?.itemsSelected[0]?.CurrencyID; //? lấy tiền tệ từ sổ quỹ
            this.getExchangeRateMaster(); //? lấy tỷ giá của currency
          }
          if (this.cashpaymentline.length > 0) {
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
              this.cashpaymentline.forEach((item) => {
                if (preValue && preValue == item.offsetAcctID) {
                  //? nếu có TK cũ && so sánh nếu TK tại dòng line = với TK cũ
                  item.offsetAcctID =
                    event?.component?.itemsSelected[0]?.CashAcctID; //? => cập nhật giá trị TK mới cho dòng line
                }
              });
            }
            this.eleGridCashPayment.refresh(); //? => refresh lại lưới
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
    this.cashpayment[event.ControlName] = event.crrValue;
    this.cashpayment.updateColumn = event.ControlName;
    switch (event.ControlName.toLowerCase()) {
      case 'totalamt':
        if (event.crrValue == null) {
          this.cashpayment.totalAmt = 0;
          this.formCashPayment.formGroup.patchValue(
            { totalAmt: this.cashpayment.totalAmt },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
        }
        break;
      case 'exchangerate':
        if (this.cashpaymentline.length > 0) {
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
    let oAccount = this.acService.getCacheValue(
      'account',
      this.oLine.accountID
    );
    let oOffsetAccount = this.acService.getCacheValue(
      'account',
      this.oLine.offsetAcctID
    );
    switch (event.field.toLowerCase()) {
      case 'accountid':
        //this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        break;
      case 'offsetacctid':
        if (oOffsetAccount) {
          this.oLine.isBrigdeAcct = false;
        } else {
          this.oLine.isBrigdeAcct =
            (oOffsetAccount as any).accountType == '5' ? true : false;
        }
        //this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        break;
      case 'dr':
        if (this.oLine.dr != 0 && this.oLine.cR2 != 0) {
          this.oLine.cr = 0;
          this.oLine.cR2 = 0;
        }
        setTimeout(() => {
          this.oLine = this.getValueByExchangeRate(
            this.cashpayment,
            this.oLine,
            true
          );
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          // this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        }
        break;
      case 'cr':
        if ((this.oLine.cr! = 0 && this.oLine.dR2 != 0)) {
          this.oLine.dr = 0;
          this.oLine.dR2 = 0;
        }
        setTimeout(() => {
          this.oLine = this.getValueByExchangeRate(
            this.cashpayment,
            this.oLine,
            false
          );
          this.detectorRef.detectChanges();
        }, 100);
        if (this.journal.entryMode == '2') {
          // this.lockAndRequireFields(this.oLine,oAccount,oOffsetAccount);
        }
        break;
      case 'dr2':
        if (this.oLine.dR2 != 0 && this.oLine.cR2 != 0) {
          this.oLine.cr = 0;
          this.oLine.cR2 = 0;
        }
        if (this.oLine.dr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.cashpayment.multi) {
              this.oLine.dr =
                this.cashpayment.exchangeRate != 0
                  ? this.roundService.amount(
                      this.oLine.cR2 / this.cashpayment.exchangeRate,
                      this.cashpayment.currencyID
                    )
                  : this.oLine.cR2;
            } else {
              this.oLine.dr = this.roundService.amount(
                this.oLine.cR2 * this.cashpayment.exchangeRate,
                this.cashpayment.currencyID
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
            if (this.cashpayment.multi) {
              this.oLine.cr =
                this.cashpayment.exchangeRate != 0
                  ? this.roundService.amount(
                      this.oLine.cR2 / this.cashpayment.exchangeRate,
                      this.cashpayment.currencyID
                    )
                  : this.oLine.cR2;
            } else {
              this.oLine.cr = this.roundService.amount(
                this.oLine.cR2 * this.cashpayment.exchangeRate,
                this.cashpayment.currencyID
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
   * @param e
   */
  cellLineChangeVATInvoices(e: any) {
    switch (e.field.toLowerCase()) {
      case 'vatid':
        this.acService
          .execApi('AC', 'VATInvoicesBusiness', 'ValueChangedAsync', [
            e.field,
            e.value,
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
    if (
      !this.acService.validateFormData(
        this.formCashPayment.formGroup,
        this.grvSetupCashpayment
      )
    ) {
      return;
    }
    if (this.cashpayment.subType != '1' && !this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.grvSetupCashpayment['ObjectID'].headerText
      );
      return;
    }
    switch (this.action) {
      case 'add':
      case 'copy':
        if (this.hasSaved) {
          if (this.cashpayment.updateColumn) {
            this.cashpayment.updateColumn = null;
            this.dialog.dataService.updateDatas.set(
              this.cashpayment['_uuid'],
              this.cashpayment
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
        } else {
          this.dialog.dataService.addDatas.set(
            this.cashpayment['_uuid'],
            this.cashpayment
          );
          this.cashpayment.updateColumn = null;
          this.hasSaved = true;
          this.dialog.dataService
            .save(null, 0, '', '', false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res && !res.save.error) {
                this.addRowDetailByType(typeBtn);
              }
            });
        }
        break;
      case 'edit':
        if (this.cashpayment.updateColumn) {
          this.dialog.dataService.updateDatas.set(
            this.cashpayment['_uuid'],
            this.cashpayment
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
        this.eleGridCashPayment.deleteRow(data);
        this.api
          .exec('AC', 'CashPaymentsLinesBusiness', 'UpdateRowNoAfterDeleteLineAsync', [
            data,
            this.cashpaymentline,
          ])
          .subscribe((res) => {});
      }
    });
  }


  // chưa xử lí
  copyRow(data) {
    data.recID = Util.uid();
    // this.requireFields = data.unbounds.requireFields as Array<string>;
    // this.lockFields = data.unbounds.lockFields as Array<string>;
    // this.requireGrid();
    // this.lockGrid();
    this.eleGridCashPayment.addRow(data, this.eleGridCashPayment.dataSource.length);
  }

  tabSelected(e) {
    if (e.selectedIndex == 2) {
      if (
        this.cashpaymentline.length > 0 &&
        this.eleGridCashPayment?.rowDataSelected
      ) {
        this.vatInvoices = [
          ...this.oriVatInvoices.filter(
            (x) => x.lineID == this.eleGridCashPayment?.rowDataSelected?.recID
          ),
        ];
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
        this.formCashPayment.formGroup,
        this.formCashPayment
      )
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashPayment && !this.eleGridCashPayment.gridRef.isEdit) ||
      (this.eleGridSettledInvoices &&
        !this.eleGridSettledInvoices.gridRef.isEdit)
    ) {
      this.isLoading = true;
      this.detectorRef.detectChanges();
      setTimeout(() => {
        switch (this.action) {
          case 'add':
          case 'copy':
            if (this.hasSaved) {
              // this.dialog.dataService.updateDatas.set(
              //   this.cashpayment['_uuid'],
              //   this.cashpayment
              // );
              this.dialog.dataService.update(this.cashpayment).subscribe();
              this.acService
                .execApi('AC', '', 'ValidateVourcherAsync', [
                  this.cashpayment,
                  this.cashpaymentline,
                ])
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res) {
                    this.cashpayment.status = '1';
                    this.dialog.dataService
                      .update(this.cashpayment)
                      .subscribe();
                    this.onDestroy();
                    this.dialog.close();
                    this.notification.notifyCode('SYS006');
                  } else {
                    this.isLoading = false;
                    this.detectorRef.detectChanges();
                  }
                });
              // this.dialog.dataService
              //   .save((opt: RequestOption) => {
              //     opt.methodName = 'ValidateVourcherAsync'
              //     opt.data = [this.cashpayment];
              //   })
              //   .subscribe((res) => {
              //     if (res && res.update.data != null) {
              //       this.loading = false;
              //       this.dialog.close();
              //       this.dt.detectChanges();
              //     } else {
              //       this.loading = false;
              //     }
              //   });
            }
            break;
          case 'edit':
            if (
              this.cashpayment.updateColumn ||
              this.cashpayment.status == '0'
            ) {
              this.dialog.dataService.update(this.cashpayment).subscribe();
              this.acService
                .execApi('AC', '', 'ValidateVourcherAsync', [
                  this.cashpayment,
                  this.cashpaymentline,
                ])
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res) {
                    if (this.cashpayment.status == '0') {
                      this.cashpayment.status = '1';
                    }
                    this.dialog.dataService
                      .update(this.cashpayment)
                      .subscribe();
                    this.onDestroy();
                    this.isLoading = false;
                    this.detectorRef.detectChanges();
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
            // this.journalService.checkVoucherNoBeforeSave(
            //   this.journal,
            //   this.cashpayment,
            //   'AC',
            //   'AC_CashPayments',
            //   this.form,
            //   this.action === 'edit',
            //   () => {
            //     this.dialog.dataService.updateDatas.set(
            //       this.cashpayment['_uuid'],
            //       this.cashpayment
            //     );
            //     this.dialog.dataService
            //       .save((opt: RequestOption) => {
            //         opt.data = [this.cashpayment];
            //       })
            //       .subscribe((res) => {
            //         if (res && res.update.data != null) {
            //           this.dialog.close();
            //           this.dt.detectChanges();
            //         } else {
            //           this.loading = false;
            //         }
            //       });
            //   }
            // );
            break;
        }
      }, 500);
    }
  }

  /**
   * *Hàm lưu và thêm chứng từ
   * @returns
   */
  onSaveAddVoucher() {
    if (
      !this.acService.validateFormData(
        this.formCashPayment.formGroup,
        this.grvSetupCashpayment
      )
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashPayment && !this.eleGridCashPayment.gridRef.isEdit) ||
      (this.eleGridSettledInvoices &&
        !this.eleGridSettledInvoices.gridRef.isEdit)
    ) {
      this.isLoading = true;
      this.detectorRef.detectChanges();
      setTimeout(() => {
        if (this.hasSaved) {
          this.dialog.dataService.update(this.cashpayment).subscribe();
          this.acService
            .execApi('AC', '', 'ValidateVourcherAsync', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                this.cashpayment.status = '1';
                this.dialog.dataService.update(this.cashpayment).subscribe();
                this.hasSaved = false;
                this.clearCashpayment();
                this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
                    this.journal,
                  ])
                  .subscribe((res: any) => {
                    if (res) {
                      this.cashpayment = res;
                      this.formCashPayment.formGroup.patchValue(
                        this.cashpayment,
                        {
                          onlySelf: true,
                          emitEvent: false,
                        }
                      );
                      this.notification.notifyCode('SYS006');
                      this.isLoading = false;
                      this.detectorRef.detectChanges();
                    }
                  });
              } else {
                this.isLoading = false;
                this.detectorRef.detectChanges();
              }
            });
        }
      }, 500);
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
            .delete([this.cashpayment], false, null, '', '', null, null, false)
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
   * *Hàm lưu và update dòng của cashpayment
   * @param event
   * @param isAddnew
   */
  onSaveLine(event: any, isAddnew) {
    let total = 0;
    if (this.cashpaymentline.length > 0) {
      this.cashpaymentline.forEach((item) => {
        total += item.dr;
      });
      if (this.cashpayment.totalAmt > 0 && total > this.cashpayment.totalAmt) {
        this.notification.notifyCode('AC0012');
      }
    }
    if (isAddnew) {
      this.api
        .execAction<any>('AC_CashPaymentsLines', [event], 'SaveAsync')
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {});
    } else {
      this.api
        .execAction<any>('AC_CashPaymentsLines', [event], 'UpdateAsync')
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {});
    }
  }

  /**
   * *Hàm lưu khi thêm dòng hóa đơn GTGT và tạo hạch toán
   * @param data
   * @param isAddNew
   */
  onSaveLineVATInvoices(data, isAddNew) {
    if (isAddNew) {
      if (this.eleGridCashPayment?.rowDataSelected) {
        this.updateLineBeforeSaveVatInvoices(data);
      } else {
        this.addLineBeforeSaveVatInvoices(data);
      }
      this.vatInvoices.push(data);
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
          this.cashpayment,
          this.cashpaymentline,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.cashpaymentline = res.data;
            this.eleGridCashPayment.refresh();
          }
        });
    } else {
      let idx = this.oriVatInvoices.findIndex(
        (x) => x.recID == data.recID && x.lineID == data.lineID
      );
      if (idx > -1) {
        this.vatInvoices[idx] = data;
      }
      this.updateLineBeforeSaveVatInvoices(data);
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
          this.cashpayment,
          this.cashpaymentline,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.cashpaymentline = res.data;
            this.eleGridCashPayment.refresh();
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
        this.openFormSettledInvoices(this.typeSettledInvoices);
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
    this.eleGridCashPayment.endEdit();
    this.eleGridCashPayment.addRow(
      this.oLine,
      this.eleGridCashPayment.dataSource.length
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
    this.oLine = new CashPaymentLine();
    this.oLine.transID = this.cashpayment.recID;
    this.oLine.objectID = this.cashpayment.objectID;
    this.oLine.reasonID = this.cashpayment.reasonID;

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
              this.oLine.offsetAcctID = cAcctID;
            } else {
              this.oLine.offsetAcctID = this.journal.crAcctID;
            }
            break;
          default:
            this.oLine.offsetAcctID = cAcctID;
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
            this.oLine.accountID = rAcctID;
          } else {
            this.oLine.accountID = this.journal.drAcctID;
          }
          break;
        default:
          this.oLine.accountID = rAcctID;
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
    let dRAmt = this.calcRemainAmt(this.cashpayment?.totalAmt);
    if (dRAmt > 0) {
      this.oLine.dr = dRAmt;
      this.oLine = this.getValueByExchangeRate(
        this.cashpayment,
        this.oLine,
        true
      );
    }
    //this.lockAndRequireFields(this.oLine,oAccount,oOffsetAcct);
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
    this.cashpaymentline.forEach((line) => {
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
    if (
      (oAccount == null && oOffsetAcct == null) ||
      (this.journal.entryMode == '2' && oLine.dr == 0 && oLine.cr == 0)
    ) {
      return;
    } else {
      this.requireFieldsCashpayment = [];
      this.lockFieldsCashpayment = [];
      let rDIM1 = false;
      let rDIM2 = false;
      let rDIM3 = false;

      let lDIM1 = false;
      let lDIM2 = false;
      let lDIM3 = false;

      //* Set require field
      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM1Control == '1' ||
          oAccount?.diM1Control == '3' ||
          oOffsetAcct?.diM1Control == '2' ||
          oOffsetAcct?.diM1Control == '3')
      )
        rDIM1 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM1Control == '1' ||
          oAccount?.diM1Control == '2' ||
          oAccount?.diM1Control == '3')
      )
        rDIM1 = true;
      this.setRequireField('DIM1', rDIM1);

      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM2Control == '1' ||
          oAccount?.diM2Control == '3' ||
          oOffsetAcct?.diM2Control == '2' ||
          oOffsetAcct?.diM2Control == '3')
      )
        rDIM2 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM2Control == '1' ||
          oAccount?.diM2Control == '2' ||
          oAccount?.diM2Control == '3')
      )
        rDIM2 = true;
      this.setRequireField('DIM2', rDIM2);

      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM3Control == '1' ||
          oAccount?.diM3Control == '3' ||
          oOffsetAcct?.diM3Control == '2' ||
          oOffsetAcct?.diM3Control == '3')
      )
        rDIM3 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM3Control == '1' ||
          oAccount?.diM3Control == '2' ||
          oAccount?.diM3Control == '3')
      )
        rDIM3 = true;
      this.setRequireField('DIM3', rDIM3);

      //* Set lock field
      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM1Control == '5' || oOffsetAcct?.diM1Control == '4')
      )
        lDIM1 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM1Control == '4' || oAccount?.diM1Control == '5')
      )
        lDIM1 = true;
      this.setLockField('DIM1', lDIM1);

      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM2Control == '5' || oOffsetAcct?.diM2Control == '4')
      )
        lDIM2 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM2Control == '4' || oAccount?.diM2Control == '5')
      )
        lDIM2 = true;
      this.setLockField('DIM2', lDIM2);

      if (
        this.journal.entryMode == '1' &&
        (oAccount?.diM3Control == '5' || oOffsetAcct?.diM3Control == '4')
      )
        lDIM2 = true;
      if (
        this.journal.entryMode == '2' &&
        (oAccount?.diM3Control == '4' || oAccount?.diM3Control == '5')
      )
        lDIM2 = true;
      this.setLockField('DIM3', lDIM3);
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
  openFormSettledInvoices(typeSettledInvoices: number) {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.cashpayment.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.cashpayment,
      typeSettledInvoices,
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
        this.settledInvoices = res.event;
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.cashpayment).subscribe();
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
        (x) => x.ObjectID == this.cashpayment.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.cashpayment,
      objectName: objectName,
      subTypeAdv: this.subTypeAdv
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
        this.cashpayment.refID = res?.event?.oCashAdv?.recID;
        this.voucherNoAdv = res?.event?.oCashAdv?.voucherNo;
        this.dRAdv = res?.event?.oCashAdv?.totalDR;
        this.subTypeAdv = res?.event?.oCashAdv?.subType;
        this.showHideTabDetail(this.cashpayment.subType,this.elementTabDetail);
      }
    });
  }

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    let data = new VATInvoices();
    data.transID = this.cashpayment.recID;
    data.lineID = this.eleGridVatInvoices?.rowDataSelected?.recID;
    this.eleGridVatInvoices.addRow(
      data,
      this.eleGridVatInvoices.dataSource.length
    );
  }

  /**
   * *Hàm tạo hạch toán trước khi lưu hóa đơn GTGT
   * @param data
   */
  addLineBeforeSaveVatInvoices(data) {
    let totalVatAtm = 0;
    this.vatInvoices.forEach((item) => {
      totalVatAtm += item.vatAmt;
    });
    switch (this.journal.entryMode) {
      case '1':
        this.setDefaultLine();
        this.oLine.dr = totalVatAtm;
        this.eleGridCashPayment.rowDataSelected = this.oLine;
        if (this.vatAccount) {
          this.oLine.accountID = this.vatAccount;
        }
        data.lineID = this.oLine.recID;
        this.cashpaymentline.push(this.oLine);
        break;
      case '2':
        for (let index = 1; index <= 2; index++) {
          this.setDefaultLine();
          if (index == 1) {
            this.oLine.dr = totalVatAtm;
            if (this.vatAccount) {
              this.oLine.accountID = this.vatAccount;
            }
            this.eleGridCashPayment.rowDataSelected = this.oLine;
            this.cashpaymentline.push(this.oLine);
            data.lineID = this.oLine.recID;
          } else {
            this.oLine.accountID =
              this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
            this.oLine.cr = totalVatAtm;
            this.cashpaymentline.push(this.oLine);
          }
        }
        break;
    }
  }

  /**
   * *Hàm update hạch toán trước khi lưu hóa đơn GTGT
   * @param data
   */
  updateLineBeforeSaveVatInvoices(data) {
    let totalVatAtm = 0;
    this.vatInvoices.forEach((item) => {
      totalVatAtm += item.vatAmt;
    });
    if (this.journal.entryMode == '1') {
      let idx = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
      if (idx > -1) {
        this.cashpaymentline[idx].dr = totalVatAtm;
        if (this.vatAccount) {
          this.cashpaymentline[idx].accountID = this.vatAccount;
        }
      }
    } else {
      let l1 = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
      if (l1 > -1) {
        this.cashpaymentline[l1].dr = totalVatAtm;
        if (this.vatAccount) {
          this.cashpaymentline[l1].accountID = this.vatAccount;
        }
      }
      let l2 = this.cashpaymentline.findIndex(
        (x) => x.rowNo == this.cashpaymentline[l1].rowNo + 1
      );
      if (l2 > -1) {
        this.cashpaymentline[l2].cr = totalVatAtm;
      }
    }
  }

  /**
   * *Hàm set field bắt buộc nhập trên lưới
   * @param fieldName 
   * @param isRequire 
   */
  setRequireField(fieldName, isRequire) {
    let i = this.eleGridCashPayment.columnsGrid.findIndex(
      (x) => x.fieldName == fieldName
    );
    if (i > -1) {
      this.eleGridCashPayment.columnsGrid[i].isRequire = isRequire;
    }
  }

  /**
   * *Hàm set field bỏ qua không cho nhập trên lưới 
   * @param fieldName 
   * @param islock 
   */
  setLockField(fieldName, islock) {
    let i = this.eleGridCashPayment.columnsGrid.findIndex(
      (x) => x.fieldName == fieldName
    );
    if (i > -1) {
      this.eleGridCashPayment.columnsGrid[i].allowEdit = islock;
    }
  }

  /**
   * *Hàm ẩn hiện các tab detail theo loại chứng từ
   * @param type
   * @param eleTab
   */
  showHideTabDetail(type, eleTab) {
    switch (type) {
      case '3': //? chi tạm ứng,chi thanh toán (ẩn tab chi tiết và hóa đơn công nợ)
      case '4':
        if (this.subTypeAdv == '1') {
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          eleTab.hideTab(2, true);
        } else {
          eleTab.hideTab(0, true);
          eleTab.hideTab(1, false);
          eleTab.hideTab(2, true);
        }
        break;
      case '9': //? chi khác (hiện tab chi tiết , hóa đơn công nợ , hóa đơn GTGT)
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, false);
        break;
      case '1': //? chi theo nhà cung cấp (ẩn tab hóa đơn công nợ , hóa đơn GTGT)
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        break;
      case '2': //? chi theo nhà cung cấp (ẩn tab chi tiết , hóa đơn GTGT)
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
    if (this.cashpayment.currencyID == this.baseCurr) {
      //? nếu tiền tệ chứng từ = đồng tiền hạch toán
      this.cashpayment.exchangeRate = 1; //? => tỷ giá mặc định là 1
      this.formCashPayment.formGroup.patchValue(
        {
          currencyID: this.cashpayment.currencyID,
          exchangeRate: this.cashpayment.exchangeRate,
        },
        {
          onlySelf: true,
          emitEvent: false,
        }
      );
      if (this.cashpaymentline.length > 0) {
        //? nếu detail đã có dữ liệu
        this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
      }
    } else {
      //? nếu tiền tệ chứng từ != đồng tiền hạch toán
      this.api
        .exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
          'exchangeRate',
          this.cashpayment,
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.cashpayment.exchangeRate = res.exchangeRate; //? lấy tỷ giá của currency
            this.formCashPayment.formGroup.patchValue(
              {
                currencyID: this.cashpayment.currencyID,
                exchangeRate: this.cashpayment.exchangeRate,
              },
              {
                onlySelf: true,
                emitEvent: false,
              }
            );
            if (this.cashpaymentline.length > 0) {
              //? nếu detail đã có dữ liệu
              this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
            }
          }
        });
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

    let indexPayee =
      this.eleCbxPayee?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ContactID == this.eleCbxPayee?.value
      );
    if (indexPayee > -1) {
      payName =
        this.eleCbxPayee?.ComponentCurrent?.dataService?.data[indexPayee]
          .ContactName + ' - ';
    } else {
      if (this.eleCbxPayee.ComponentCurrent?.value) {
        payName = this.eleCbxPayee.ComponentCurrent?.value + ' - ';
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
    this.cashpaymentline.forEach((item) => {
      let line = this.getValueByExchangeRate(
        this.cashpayment,
        item,
        item.dr != 0
      );
      item.cr = line.cr;
      item.cR2 = line.cR2;
      item.dr = line.dr;
      item.dR2 = line.dR2;
    });
    this.eleGridCashPayment.refresh(); //? => refresh lại lưới
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
        if (this.eleGridCashPayment.autoAddRow) {
          this.saveMasterBeforeAddRow('1');
        }
        break;
      case 'endEdit':
        if (!this.eleGridCashPayment.autoAddRow) {
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
  clearCashpayment() {
    this.cashpaymentline = [];
    this.settledInvoices = [];
    this.vatInvoices = [];
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

  @HostListener('click', ['$event'])
  onClick(e) {
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.eleGridCashPayment && this.eleGridCashPayment.gridRef.isEdit) {
        this.eleGridCashPayment.autoAddRow = false;
        this.eleGridCashPayment.endEdit();
      }
    }
  }
  //#endregion Function
}
