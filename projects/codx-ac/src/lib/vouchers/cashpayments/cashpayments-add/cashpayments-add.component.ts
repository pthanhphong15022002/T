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
import { CashpaymentSuggestion } from '../cashpayments-add-cashpaymentsuggestion/cashpayments-add-cashpaymentsuggestion.component';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { RoundService } from '../../../round.service';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';
import { E } from '@angular/cdk/keycodes';
@Component({
  selector: 'lib-cashpayments-add',
  templateUrl: './cashpayments-add.component.html',
  styleUrls: ['./cashpayments-add.component.css', '../../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentAdd extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridCashPayment') eleGridCashPayment: CodxGridviewV2Component; //? element codx-grv2 lưới Cashpayemnts
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formCashPayment') public formCashPayment: CodxFormComponent; //? element codx-form của Cashpayment
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  // @ViewChild('annotationsave') annotationsave: ProgressBar;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng 
  @ViewChild('eleCbxPayee') eleCbxPayee: any; //? element codx-input cbx của đối tượng 
  @ViewChild('eleCbxCashBook') eleCbxCashBook: any; //? element codx-input cbx của sổ quỹ
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  cashpayment: any; //? data của cashpayment
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
  editSettingsGrid: EditSettingsModel = { //? thiết lập cho phép thêm, xóa, sửa và mode cho lưới
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  // noEditSetting: EditSettingsModel = {
  //   allowEditing: false,
  //   allowAdding: false,
  //   allowDeleting: false,
  //   mode: 'Normal',
  // };
  // tabInfo: TabModel[] = [
  //   { name: 'History', textDefault: 'Lịch sử', isActive: true },
  //   { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
  //   { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  //   { name: 'References', textDefault: 'Liên kết', isActive: false },
  // ];
  baseCurr: any; //? đồng tiền hạch toán
  typeSet: any;
  isLoading: any = false; //? bật tắt progressbar 
  userID: any; //? tên user đăng nhập
  voucherNoRef: any; //? số chứng từ liên kết(xử lí lấy số chứng từ cho loại chi tạm ứng & chi thanh toán)
  dRRef: any = 0; //? số tiền liên kết(xứ lí lấy số tiền của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  subtypeRef: any = '1'; //? loại chi liên kết (xử lí lấy loại chi của chứng từ liên kết cho loại chi tạm ứng & chi thanh toán)
  totalVatBase: any = 0; //? tổng tiền của hóa đơn GTGT (xử lí cho chi khác)
  totalVatAtm: any = 0; //? tổng tiền thuế của hóa đơn GTGT (xử lí cho chi khác)
  vatInvoicesAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)
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
    this.action = dialogData.data?.action; //? set trạng thái phiếu (addnew,edit,copy)
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
    this.formCashPayment.formGroup.patchValue(this.cashpayment, { //? gán dữ liệu của Cashpayment hiển thị lên form
      onlySelf: true,
      emitEvent: false,
    });
  }

  getDataDetailBeforeInit() {
    // switch (this.action) {
    //   case 'copy':
    //     if (this.journal.assignRule == '1') {
    //       this.acService
    //         .execApi(
    //           'ERM.Business.AC',
    //           'CommonBusiness',
    //           'GenerateAutoNumberAsync',
    //           this.journal.voucherFormat
    //         )
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe((res) => {
    //           if (res) {
    //             this.cashpayment.voucherNo = res;
    //             this.formCashPayment.formGroup.patchValue(
    //               { voucherNo: this.cashpayment.voucherNo },
    //               {
    //                 onlySelf: true,
    //                 emitEvent: false,
    //               }
    //             );
    //           }
    //         });
    //     } 
    //     break;
    //   case 'edit':
    //     this.hasSaved = true;
    //     switch (this.cashpayment.subType) {
    //       case '1':
    //       case '11':
    //         this.acService
    //           .execApi(
    //             'AC',
    //             '',
    //             'LoadDataAsync',
    //             this.cashpayment.recID
    //           )
    //           .pipe(takeUntil(this.destroy$))
    //           .subscribe((res: any) => {
    //             if (res.length > 0) {
    //               this.cashpaymentline = res;
    //               this.detectorRef.detectChanges();
    //             }
    //           });
    //         break;
    //       case '2':
    //         this.acService
    //           .execApi(
    //             'AC',
    //             'SettledInvoicesBusiness',
    //             'LoadDataAsync',
    //             this.cashpayment.recID
    //           )
    //           .pipe(takeUntil(this.destroy$))
    //           .subscribe((res: any) => {
    //             this.settledInvoices = res;
    //             this.detectorRef.detectChanges();
    //           });
    //         break;
    //       case '3':
    //       case '4':
    //         this.acService
    //           .execApi(
    //             'AC',
    //             'CashPaymentsBusiness',
    //             'LoadDataReferenceAsync',
    //             this.cashpayment
    //           )
    //           .pipe(takeUntil(this.destroy$))
    //           .subscribe((res: any) => {
    //             if (res) {
    //               this.voucherNoRef = res.voucherNoRef;
    //               this.dRRef = res.totalDrRef;
    //               this.subtypeRef = res.subtypeRef;
    //               switch (this.subtypeRef) {
    //                 case '1':
    //                   this.elementTabDetail.hideTab(0, false);
    //                   this.elementTabDetail.hideTab(1, true);
    //                   this.cashpaymentline = res.lsline;
    //                   break;
    //                 case '2':
    //                   this.elementTabDetail.hideTab(0, true);
    //                   this.elementTabDetail.hideTab(1, false);
    //                   this.settledInvoices = res.lsline;
    //                   break;
    //               }
    //             }
    //             this.detectorRef.detectChanges();
    //           });
    //         break;
    //       case '9':
    //         this.acService
    //           .execApi(
    //             'AC',
    //             'VATInvoicesBusiness',
    //             'LoadDataAsync',
    //             this.cashpayment.recID
    //           )
    //           .pipe(takeUntil(this.destroy$))
    //           .subscribe((res: any) => {
    //             if (res) {
    //               this.cashpaymentline = res.lsline;
    //               this.settledInvoices = res.lssetinvoice;
    //               //sửa tên ori..
    //               this.oriVatInvoices = res.lsvat;
    //               this.detectorRef.detectChanges();
    //             }
    //           });
    //         break;
    //     }
    //     break;
    // }
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới Cashpaymentlines (Ẩn hiện,format,predicate các cột của lưới theo sổ nhật ký)
   * @param columnsGrid : danh sách cột của lưới
   */
  beforeInitGridCashpayments(columnsGrid) {
    this.hideFieldsCashpayment = [];
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      this.hideFieldsCashpayment = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (!this.hideFieldsCashpayment.includes('Settlement') && this.cashpayment.subType == '1') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      this.hideFieldsCashpayment.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') { //? nếu loại mode 2 tài khoản trên cùng 1 dòng
      this.hideFieldsCashpayment.push('CR2'); //? => ẩn field tiền Có,HT
      this.hideFieldsCashpayment.push('CR'); //? => ẩn field tiền Có
      if (this.cashpayment.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashpayment.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    }else{ //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.cashpayment.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        this.hideFieldsCashpayment.push('DR2'); //? => ẩn field tiền Có,HT
        this.hideFieldsCashpayment.push('CR2'); //? => ẩn field tiền Nợ,HT
      }
    }

    //* Thiết lập format number theo đồng tiền hạch toán
    if (this.cashpayment.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DR')].dataFormat = 'B';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'CR')].dataFormat = 'B';
    }else{ //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DR')].dataFormat = 'S';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'CR')].dataFormat = 'S';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DR2')].dataFormat = 'B';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'CR2')].dataFormat = 'B';
    }

    //* Thiết lập datasource combobox theo sổ nhật ký
    if (this.journal.drAcctControl == '1' || this.journal.drAcctControl == '2'){ //? nếu tài khoản nợ là mặc định hoặc trong danh sách
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'AccountID')].predicate = '@0.Contains(AccountID)';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'AccountID')].dataValue = `[${this.journal?.drAcctID}]`;
    }

    if (this.journal.crAcctControl == '1' || this.journal.crAcctControl == '2') { //? nếu tài khoản có là mặc định hoặc trong danh sách
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'AccountID')].predicate = '@0.Contains(AccountID)';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'AccountID')].dataValue = `[${this.journal?.crAcctID}]`;
    }

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2')  { //? nếu phòng ban là mặc định hoặc trong danh sách
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM1')].predicate = '@0.Contains(DepartmentID)';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM1')].dataValue = `[${this.journal?.diM1}]`;
    }

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2')  {  //? nếu TTCP là mặc định hoặc trong danh sách
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM2')].predicate = '@0.Contains(CostCenterID)';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM2')].dataValue = `[${this.journal?.diM2}]`;
    }

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2')  { //? nếu mục phí là mặc định hoặc trong danh sách
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM3')].predicate = '@0.Contains(CostItemID)';
      columnsGrid[columnsGrid.findIndex((x) => x.fieldName == 'DIM3')].dataValue = `[${this.journal?.diM3}]`;
    }

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    let arrColumnOfJournal = [ //? danh sách các cột từ sổ nhật kí
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
    arrColumnOfJournal.forEach(fieldName => {
      if (columnsGrid.findIndex((x) => x.fieldName == fieldName) > -1) {
        if (this.hideFieldsCashpayment.includes(fieldName)) { //? nếu field ẩn có trong danh sách
          columnsGrid[columnsGrid.findIndex((x) => x.fieldName == fieldName)].isVisible = false; //? => ẩn cột
        }else{
          columnsGrid[columnsGrid.findIndex((x) => x.fieldName == fieldName)].isVisible = true; //? => hiện cột
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
    if (this.cashpayment.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      this.hideFieldsSettledInvoices.push('BalAmt2'); //? ẩn cột tiền Số dư, HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledAmt2'); //? ẩn cột tiền thanh toán,HT của SettledInvoices
      this.hideFieldsSettledInvoices.push('SettledDisc2'); //? ẩn cột chiết khấu thanh toán, HT của SettledInvoices
    }
    let arrColumnSettledInvoices = ['BalAmt2', 'SettledAmt2', 'SettledDisc2']; //? danh sách các cột của SettledInvoices
    arrColumnSettledInvoices.forEach(fieldName => {
      if (columnsGrid.findIndex((x) => x.fieldName == fieldName) > -1) {
        if (this.hideFieldsSettledInvoices.includes(fieldName)) { //? nếu field ẩn có trong danh sách
          columnsGrid[columnsGrid.findIndex((x) => x.fieldName == fieldName)].isVisible = false; //? => ẩn cột
        }else{
          columnsGrid[columnsGrid.findIndex((x) => x.fieldName == fieldName)].isVisible = true; //? => hiện cột
        }
      }   
    });

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
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        this.editRow(data);
        break;
      case 'SYS04':
        this.copyRow(data);
        break;
    }
  }
// đưa vào hàm chung, 
  changeDataMF(e: any) {
    // let bm = e.filter(
    //   (x: { functionID: string }) =>
    //     x.functionID == 'ACT042901' ||
    //     x.functionID == 'ACT041010' ||
    //     x.functionID == 'ACT041003' || // ghi sổ
    //     x.functionID == 'ACT041002' || // gửi duyệt
    //     x.functionID == 'ACT041004' || // hủy yêu cầu duyệt
    //     x.functionID == 'ACT041008' || // khôi phục
    //     x.functionID == 'ACT042901' || // chuyển tiền điện tử
    //     x.functionID == 'ACT041010' || // in
    //     x.functionID == 'ACT041009' ||
    //     x.functionID == 'SYS003' ||
    //     x.functionID == 'SYS004' ||
    //     x.functionID == 'SYS005' ||
    //     x.functionID == 'SYS001' ||
    //     x.functionID == 'SYS002' ||
    //     x.functionID == 'SYS02' ||
    //     x.functionID == 'SYS03'
    // );
    // bm.forEach((element) => {
    //   if (element.functionID == 'SYS02' || element.functionID == 'SYS03') {
    //     element.disabled = false;
    //   } else {
    //     element.disabled = true;
    //   }
    // });
  }

  /**
   * *Hàm xử lí đổi loại chứng từ
   * @param event
   * @param eleTab 
   */
  changeSubType(event?: any) {
    if (event && event.data[0] && (this.cashpaymentline.length > 0 || this.settledInvoices.length > 0 || this.vatInvoices.length > 0)
    ) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.isLoading = true;
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete(
              [this.cashpayment],
              false,
              null,
              '',
              '',
              null,
              null,
              false
            )
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
    if (event && event?.data && this.cashpayment[event?.field] != event.data) { //? nếu data có thay đổi 
      this.cashpayment[event?.field] = event?.data; //? gán data mới cho field thay đổi 
      this.cashpayment.updateColumn = event?.field; //? gán field thay đổi vào updateColumn
      let preValue = null;
      switch (event.field.toLowerCase()) {
        //* Đổi tượng
        case 'objectid':
          this.cashpayment.memo = this.getMemoMaster(); //? lấy tên đổi tượng cộng vào ghi chú
          this.cashpayment.objectType = event.component.itemsSelected[0].ObjectType; //? gán loại đối tượng
          this.formCashPayment.formGroup.patchValue(
            { memo: this.cashpayment.memo },
            {
              onlySelf: true,
              emitEvent: false,
            }
          );
          if (this.cashpaymentline.length > 0) { //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại đối tượng cho tất cá các line
            if (event?.component?.dataService?.currentComponent?.previousItemData) { //? nếu có giá trị đối tượng cũ
              preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ObjectID;
            }
            this.cashpaymentline.forEach(item => {
              if (preValue && preValue == item.objectID) { //? nếu có đối tượng cũ && so sánh nếu đối tượng tại dòng line = với đối tượng cũ
                item.objectID = this.cashpayment.objectID; //? => cập nhật giá trị đối tượng mới cho dòng line
              }else{ //? nếu ko có đối tượng cũ 
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
          if (this.cashpaymentline.length > 0) { //? nếu có dữ liệu chi tiết thì sẽ cập nhật lại lí do chi cho tất cá các line
            if (event.component.dataService.currentComponent.previousItemData) { //? nếu có giá trị lí do chi cũ
              preValue = event.component.dataService.currentComponent.previousItemData.ReasonID;
            }
            this.cashpaymentline.forEach(item => {
              if (preValue && preValue == item.reasonID) { //? nếu có lí do chi cũ && so sánh nếu lí do chi tại dòng line = với lí do chi cũ
                item.reasonID = this.cashpayment.reasonID; //? => cập nhật giá trị lí do chi mới cho dòng line
                item.note = event?.component?.itemsSelected[0]?.ReasonName; //? => cập nhật giá trị ghi chú mới cho dòng line
                item.offsetAcctID = event?.component?.itemsSelected[0]?.OffsetAcctID; //? => cập nhật giá trị TK Có mới cho dòng line
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
          if (this.cashpayment.currencyID != event?.component?.itemsSelected[0]?.CurrencyID) { //? nếu tiền tệ của sổ quỹ khác với tiền tệ của chứng từ
              this.cashpayment.currencyID = event?.component?.itemsSelected[0]?.CurrencyID; //? lấy tiền tệ từ sổ quỹ
              this.getExchangeRateMaster(); //? lấy tỷ giá của currency
          }
          if (this.cashpaymentline.length > 0) {
            if (event.component.dataService.currentComponent.previousItemData) {
              preValue = event.component.dataService.currentComponent.previousItemData.CashAcctID;
            }
            if (preValue && preValue != event?.component?.itemsSelected[0]?.CashAcctID) {
              this.cashpaymentline.forEach(item => {
                if (preValue && preValue == item.reasonID) { //? nếu có lí do chi cũ && so sánh nếu lí do chi tại dòng line = với lí do chi cũ
                  item.reasonID = this.cashpayment.reasonID; //? => cập nhật giá trị lí do chi mới cho dòng line
                  item.note = event?.component?.itemsSelected[0]?.ReasonName; //? => cập nhật giá trị ghi chú mới cho dòng line
                  item.offsetAcctID = event?.component?.itemsSelected[0]?.OffsetAcctID; //? => cập nhật giá trị TK Có mới cho dòng line
                }
              });
            }
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

  valueFocusOut(e: any) {
    this.cashpayment[e.ControlName] = e.crrValue;
    this.cashpayment.updateColumn = e.ControlName;
    switch (e.ControlName.toLowerCase()) {
      case 'totalamt':
        if (e.crrValue == null) {
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
          //this.changeExchangeRate();
        }
        // this.cashpayment[e.ControlName] = e.crrValue;
        // if (e.crrValue && this.cashpaymentline.length > 0) {
        //   this.notification.alertCode('AC0018', null).subscribe((res) => {
        //     if (res.event.status === 'Y') {
        //       this.api
        //         .exec<any>(
        //           'AC',
        //           this.classNameLine,
        //           'ChangeExchangeRateAsync',
        //           [this.cashpayment, this.cashpaymentline]
        //         )
        //         .subscribe((res) => {
        //           if (res) {
        //             this.cashpaymentline = [...res];
        //           }
        //         });
        //     }
        //   });
        // }
        break;
      default:
        this.cashpayment[e.ControlName] = e.crrValue;
        break;
    }
  }

  lineChanged(e: any) {
    // this.dataLine = e.data;
    // switch (e.field.toLowerCase()) {
    //   case 'accountid':
    //     this.constraintGrid();
    //     break;
    //   case 'offsetacctid':
    //     if (
    //       this.acService.getCacheValue('account', this.dataLine.offsetAcctID)
    //     ) {
    //       this.dataLine.isBrigdeAcct = false;
    //     } else {
    //       this.dataLine.isBrigdeAcct =(this.acService.getCacheValue('account',this.dataLine.offsetAcctID) as any
    //         )?.accountType == '5'
    //           ? true
    //           : false;
    //     }
    //     this.constraintGrid();
    //     break;
    //   case 'dr':
    //     if (this.dataLine.dr != 0 && this.dataLine.cR2 != 0) {
    //       this.dataLine.cr = 0;
    //       this.dataLine.cR2 = 0;
    //     }
    //     setTimeout(() => {
    //       this.dataLine = this.getValueByExRate(this.cashpayment,this.dataLine,true);
    //       this.dt.detectChanges();
    //     }, 100);  
    //     if (this.journal.entryMode == '2') {
    //       this.constraintGrid();
    //     }
    //     break;
    //   case 'cr':
    //     if ((this.dataLine.cr! = 0 && this.dataLine.dR2 != 0)) {
    //       this.dataLine.dr = 0;
    //       this.dataLine.dR2 = 0;
    //     }       
    //     setTimeout(() => {
    //       this.dataLine = this.getValueByExRate(this.cashpayment,this.dataLine,false);
    //       this.dt.detectChanges();
    //     }, 100);
    //     if (this.journal.entryMode == '2') {
    //       this.constraintGrid();
    //     }
    //     break;
    //   case 'dr2':
    //     if (this.dataLine.dR2 != 0 && this.dataLine.cR2 != 0) {
    //       this.dataLine.cr = 0;
    //       this.dataLine.cR2 = 0;
    //     }
    //     if (
    //       this.dataLine.dr == 0 &&
    //       (
    //         this.acService.getCacheValue(
    //           'account',
    //           this.dataLine.offsetAcctID
    //         ) as any
    //       )?.multiCurrency
    //     ) {
    //       setTimeout(() => {
    //         if (this.cashpayment.multi) {
    //           this.dataLine.dr = this.cashpayment.exchangeRate != 0 ? this.roundService.amount((this.dataLine.cR2 / this.cashpayment.exchangeRate),this.cashpayment.currencyID) : this.dataLine.cR2;
    //         }else{
    //           this.dataLine.dr = this.roundService.amount((this.dataLine.cR2 * this.cashpayment.exchangeRate),this.cashpayment.currencyID);
    //         }
    //       }, 100);      
    //     }
    //     break;
    //   case 'cr2':
    //     if (this.dataLine.cR2 != 0 && this.dataLine.dR2 != 0) {
    //       this.dataLine.dr = 0;
    //       this.dataLine.dR2 = 0;
    //     }
    //     if (
    //       this.dataLine.cr == 0 &&
    //       (
    //         this.acService.getCacheValue(
    //           'account',
    //           this.dataLine.offsetAcctID
    //         ) as any
    //       )?.multiCurrency
    //     ) {
    //       setTimeout(() => {
    //         if (this.cashpayment.multi) {
    //           this.dataLine.cr = this.cashpayment.exchangeRate != 0 ? this.roundService.amount((this.dataLine.cR2 / this.cashpayment.exchangeRate),this.cashpayment.currencyID) : this.dataLine.cR2;
    //         }else{
    //           this.dataLine.cr = this.roundService.amount((this.dataLine.cR2 * this.cashpayment.exchangeRate),this.cashpayment.currencyID);
    //         }
    //       }, 100);  
    //     }
    //     break;
    //   case 'note':
    //     this.dataLine.reasonID = e?.itemData?.ReasonID;
    //     setTimeout(() => {
    //       this.dataLine.accountID = e?.itemData?.OffsetAcctID;
    //       this.dt.detectChanges();
    //     }, 100);
    //     break;
    //   default:
    //     break;
    // }
  }

  lineVatchange(e: any) {
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
              this.vatInvoicesAccount = res.vatAccount;
            }
          });
        break;
    }
  }

  settledLineChanged(e: any) {
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
              this.eleGridSettledInvoices.rowDataSelected[e.field] = res[e.field];
              this.eleGridSettledInvoices.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  settlement(type: number) {
    if (!this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.grvSetupCashpayment['ObjectID'].headerText
      );
      return;
    }
    this.typeSet = type;
    this.addRow('2');
  }

  addRow(type: any) {
    if (
      !this.acService.validateFormData(this.formCashPayment.formGroup, this.grvSetupCashpayment)
    ) {
      return;
    }
    if (
      (this.cashpayment.subType == '1' || this.cashpayment.subType == '9')
    ) {
      return;
    }
    switch (type) {
      case '1':
        this.addlineCash();
        break;
      case '2':
        this.popupSet(this.typeSet);
        break;
      case '3':
        this.popupCash();
        break;
      case '4':
        this.addVatInvoice();
        break;
    }
    // luu master
    this.formAction();
  }

  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        if (this.cashpayment.subType != '2') {
          this.eleGridCashPayment.deleteRow(data);
          if (this.eleGridCashPayment.dataSource.length > 0) {
            for (let i = 0; i < this.eleGridCashPayment.dataSource.length; i++) {
              this.eleGridCashPayment.dataSource[i].rowNo = i + 1;
            }
          }
          this.cashpaymentline = this.eleGridCashPayment.dataSource;
          this.dialog.dataService.update(this.cashpayment).subscribe();
          this.api
            .exec('AC', '', 'UpdateAfterDelete', [
              this.cashpayment,
              data,
              this.cashpaymentline,
            ])
            .subscribe((res) => {});
        }
      }
    });
  }

  editRow(data) {
    this.eleGridCashPayment.gridRef.selectRow(Number.parseFloat(data.index));
    this.eleGridCashPayment.gridRef.startEdit();
  }

  copyRow(data) {
    let idx = this.eleGridCashPayment.dataSource.length;
    data.rowNo = idx + 1;
    data.recID = Util.uid();
    // this.requireFields = data.unbounds.requireFields as Array<string>;
    // this.lockFields = data.unbounds.lockFields as Array<string>;
    // this.requireGrid();
    // this.lockGrid();
    this.eleGridCashPayment.addRow(data, idx);
  }

  popupCash() {
    if (!this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.grvSetupCashpayment['ObjectID'].headerText
      );
      return;
    }
    let obj = {
      cashpayment: this.cashpayment,
      objectName:
        this.eleCbxObjectID?.ComponentCurrent?.itemsSelected[0].ObjectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashPayments';
    dataModel.gridViewName = 'grvCashPayments';
    dataModel.entityName = 'AC_CashPayments';
    opt.FormModel = dataModel;
    let cashdialog = this.callfc.openForm(
      CashpaymentSuggestion,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    cashdialog.closed.subscribe((res) => {
      if (res && res.event && res.event) {
        this.cashpayment.refID = res.event.oCashRef.recID;
        this.dialog.dataService.update(this.cashpayment).subscribe();
        this.setDataRef(res.event.oCashRef, res.event.oLineRef);
      }
    });
  }

  addVatInvoice() {
    this.setLineVATDefault();
  }

  setLineVATDefault() {
    let data = new VATInvoices();
    let idx = this.eleGridVatInvoices.dataSource.length;
    data.rowNo = idx + 1;
    data.transID = this.cashpayment.recID;
    data.lineID = this.eleGridVatInvoices?.rowDataSelected?.recID;
    this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
  }

  tabSelected(e) {
    if (e.selectedIndex == 2) {
      if (this.cashpaymentline.length > 0 && this.eleGridCashPayment?.rowDataSelected) {
        this.vatInvoices = [
          ...this.oriVatInvoices.filter(
            (x) => x.lineID == this.eleGridCashPayment?.rowDataSelected?.recID
          ),
        ];
      }
      this.detectorRef.detectChanges();
    }
  }

  updateAccounting(data) {
    switch (this.journal.entryMode) {
      case '1':
        let idx = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
        if (idx > -1) {
          this.cashpaymentline[idx].dr = this.totalVatAtm;
          if (this.vatInvoicesAccount) {
            this.cashpaymentline[idx].accountID = this.vatInvoicesAccount;
          }
        }
        break;
      case '2':
        let l1 = this.cashpaymentline.findIndex((x) => x.recID == data.lineID);
        if (l1 > -1) {
          this.cashpaymentline[l1].dr = this.totalVatAtm;
          if (this.vatInvoicesAccount) {
            this.cashpaymentline[l1].accountID = this.vatInvoicesAccount;
          }
        }
        let l2 = this.cashpaymentline.findIndex(
          (x) => x.rowNo == this.cashpaymentline[l1].rowNo + 1
        );
        if (l2 > -1) {
          this.cashpaymentline[l2].cr = this.totalVatAtm;
        }
        break;
    }
  }

  //#endregion

  //#region Method
  onSave() {
    if (
      !this.acService.validateFormData(this.formCashPayment.formGroup, this.formCashPayment)
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashPayment && !this.eleGridCashPayment.gridRef.isEdit) ||
      (this.eleGridSettledInvoices && !this.eleGridSettledInvoices.gridRef.isEdit)
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
                .execApi(
                  'AC',
                  '',
                  'ValidateVourcherAsync',
                  [this.cashpayment, this.cashpaymentline]
                )
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
                .execApi(
                  'AC',
                  '',
                  'ValidateVourcherAsync',
                  [this.cashpayment, this.cashpaymentline]
                )
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

  onSaveAdd() {
    if (
      !this.acService.validateFormData(this.formCashPayment.formGroup, this.grvSetupCashpayment)
    ) {
      return;
    }
    if (this.cashpaymentline.length == 0 && this.settledInvoices.length == 0) {
      this.notification.notifyCode('AC0013');
      return;
    }
    if (
      (this.eleGridCashPayment && !this.eleGridCashPayment.gridRef.isEdit) ||
      (this.eleGridSettledInvoices && !this.eleGridSettledInvoices.gridRef.isEdit)
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
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res: any) => {
                    if (res) {
                      this.cashpayment = res;
                      this.formCashPayment.formGroup.patchValue(this.cashpayment, {
                        onlySelf: true,
                        emitEvent: false,
                      });
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
          // this.dialog.dataService.updateDatas.set(
          //   this.cashpayment['_uuid'],
          //   this.cashpayment
          // );
          // this.dialog.dataService
          //   .save((opt: RequestOption) => {
          //     opt.data = [this.cashpayment];
          //   })
          //   .subscribe((res) => {
          //     if (res && res.update.data != null) {
          //       this.hasSaved = false;
          //       this.loading = false;
          //       this.clearCashpayment();
          //       this.dialog.dataService.clear();
          //       this.dialog.dataService
          //         .addNew((o) => this.setDefault(o))
          //         .subscribe((res) => {
          //           this.cashpayment = res;
          //           this.form.formGroup.patchValue(this.cashpayment);
          //         });
          //       this.dt.detectChanges();
          //     } else {
          //       this.loading = false;
          //     }
          //   });
        }
      }, 500);
    }
  }

  onDiscard() {
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
            .delete(
              [this.cashpayment],
              false,
              null,
              '',
              '',
              null,
              null,
              false
            )
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

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
// sua ten onsave (trả sự kiện 1 hàm)
  onAddNew(e: any) {
    if (this.cashpayment.totalAmt != 0) {
      if (this.total > this.cashpayment.totalAmt) {
        this.notification.notifyCode('AC0012');
      }
    }
    this.hasSaved = true;
    this.dialog.dataService.update(this.cashpayment).subscribe();
    this.cashpaymentline = this.eleGridCashPayment.dataSource;
    this.api
      .exec('AC', '', 'SaveAsync', [this.cashpayment, e])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }
// sua ten oneditsua ten onsave (trả sự kiện 1 hàm)
  onEdit(e: any) {
      this.hasSaved = true;
      if (this.cashpayment.totalAmt != 0) {
        if (this.total > this.cashpayment.totalAmt) {
          this.notification.notifyCode('AC0012');
        }
      }
      this.dialog.dataService.update(this.cashpayment).subscribe();
      this.api
        .exec('AC', '', 'UpdateAsync', [this.cashpayment, e])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {});
  }
// doi ten 
  onAddNewVat(data) {
    // if (this.eleGridCashPayment?.rowDataSelected) {
    //   this.updateAccounting(data);
    // } else {
    //   switch (this.journal.entryMode) {
    //     case '1':
    //       this.setLineDefault();
    //       this.dataLine.dr = this.totalVatAtm;
    //       this.gridCash.rowDataSelected = this.dataLine;
    //       if (this.vatAccount) {
    //         this.dataLine.accountID = this.vatAccount;
    //       }
    //       data.lineID = this.dataLine.recID;
    //       this.cashpaymentline.push(this.dataLine);
    //       break;
    //     case '2':
    //       for (let index = 1; index <= 2; index++) {
    //         this.setLineDefault();
    //         if (index == 1) {
    //           this.dataLine.dr = this.totalVatAtm;
    //           if (this.vatAccount) {
    //             this.dataLine.accountID = this.vatAccount;
    //           }
    //           this.gridCash.rowDataSelected = this.dataLine;
    //           this.cashpaymentline.push(this.dataLine);
    //           data.lineID = this.dataLine.recID;
    //         } else {
    //           this.dataLine.accountID =
    //             this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
    //           this.dataLine.cr = this.totalVatAtm;
    //           this.cashpaymentline.push(this.dataLine);
    //         }
    //       }
    //       break;
    //   }
    // }
    // this.oriVatInvoices.push(data);
    // this.dialog.dataService.update(this.cashpayment).subscribe();
    // this.acService
    //   .execApi('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
    //     this.cashpayment,
    //     this.cashpaymentline,
    //     data,
    //   ])
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     if (res) {
    //       this.cashpaymentline = res.data;
    //       this.gridCash.refresh();
    //       this.dt.detectChanges();
    //     }
    //   });
  }
// doi ten
  onEditVat(data) {
    // let idx = this.oriVatInvoices.findIndex(
    //   (x) => x.recID == data.recID && x.lineID == data.lineID
    // );
    // if (idx > -1) {
    //   this.oriVatInvoices[idx] = data;
    // }
    // this.updateAccounting(data);
    // this.dialog.dataService.update(this.cashpayment).subscribe();
    // this.gridCash.refresh();
    // this.dt.detectChanges();
    // this.acService
    //   .execApi('AC', 'VATInvoicesBusiness', 'AddListVATAsync', [
    //     this.cashpayment,
    //     this.cashpaymentline,
    //     data,
    //   ])
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     if (res) {
    //       this.cashpaymentline = res.data;
    //       this.gridCash.refresh();
    //       this.dt.detectChanges();
    //     }
    //   });
  }

  //#endregion

  //#region Function
  clearCashpayment() {
    this.cashpaymentline = [];
    this.settledInvoices = [];
    this.vatInvoices = [];
    this.oriVatInvoices = [];
  }
// doi ten
  addlineCash() {
    this.setLineDefault();
    this.eleGridCashPayment.endEdit();
    //this.eleGridCashPayment.addRow(this.dataLine, this.gridCash.dataSource.length);
  }
// doi ten settleinvoice..
  popupSet(type: number) {
    let obj = {
      cashpayment: this.cashpayment,
      type,
      objectName:
        this.eleCbxObjectID?.ComponentCurrent?.itemsSelected[0].ObjectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AC_SubInvoices';
    dataModel.gridViewName = 'grvAC_SubInvoices';
    dataModel.entityName = 'AC_SubInvoices';
    opt.FormModel = dataModel;
    let voucherDialog = this.callfc.openForm(
      SettledInvoicesAdd,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    voucherDialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        // this.setVoucherRef(res.event);
        this.settledInvoices = res.event;
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.cashpayment).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }



  requireGrid() {
    // const field = ['DIM1', 'DIM2', 'DIM3', 'ProjectID'];
    // field.forEach((element) => {
    //   let i = this.gridCash.columnsGrid.findIndex(
    //     (x) => x.fieldName == element
    //   );
    //   this.gridCash.columnsGrid[i].isRequire = false;
    // });
    // if (this.requireFields.length > 0) {
    //   this.requireFields.forEach((fields) => {
    //     let i = this.gridCash.columnsGrid.findIndex(
    //       (x) => x.fieldName == fields
    //     );
    //     this.gridCash.columnsGrid[i].isRequire = true;
    //   });
    // }
  }

  lockGrid() {
    // const field = ['DIM1', 'DIM2', 'DIM3', 'ProjectID'];
    // field.forEach((element) => {
    //   let i = this.gridCash.columnsGrid.findIndex(
    //     (x) => x.fieldName == element
    //   );
    //   this.gridCash.columnsGrid[i].allowEdit = true;
    // });
    // this.gridCash.disableField(this.lockFields);
  }  
// bỏ...
  expand() {
    let eCollape = document.querySelectorAll(
      '.codx-detail-footer.dialog-footer.collape'
    );
    let eExpand = document.querySelectorAll(
      '.codx-detail-footer.dialog-footer.expand'
    );
    if (eCollape.length > 0) {
      (eCollape[0] as HTMLElement).classList.remove('collape');
      (eCollape[0] as HTMLElement).classList.add('expand');
    }
    if (eExpand.length > 0) {
      (eExpand[0] as HTMLElement).classList.remove('expand');
      (eExpand[0] as HTMLElement).classList.add('collape');
    }
  }
  
// doi ten
  showHideTabDetail(type, eleTab) {
    switch (type) {
      case '3':
      case '4':
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        //this.loadFormSubType('3');
        break;
      case '9':
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, false);
        //this.loadFormSubType('1');
        break;
      case '1':
      case '11':
        eleTab.hideTab(0, false);
        eleTab.hideTab(1, true);
        eleTab.hideTab(2, true);
        //this.loadFormSubType('1');
        break;
      case '2':
      case '12':
        eleTab.hideTab(0, true);
        eleTab.hideTab(1, false);
        eleTab.hideTab(2, true);
        //this.loadFormSubType('1');
        break;
    }
  }
// set theo loại tài khoản...chia 2 bộ lưới..
  loadAccountControl(columnsGrid) {
    // if (!this.hideFields.includes('Settlement')) {
    //   if (this.cashpayment.subType == '1' || this.cashpayment.subType == '11') {
    //     this.hideFields.push('Settlement');
    //   }
    // }
    // if (this.journal.entryMode == '1') {
    //   this.hideFields.push('CR2');
    //   this.hideFields.push('CR');
    //   if (this.cashpayment.currencyID == this.baseCurr) {
    //     this.hideFields.push('DR2');
    //     //this.hideFields.push('VATAmt2');
    //   }
    //   let i = columnsGrid.findIndex((x) => x.fieldName == 'AccountID');
    //   if (i > -1) {
    //     columnsGrid[i].headerText = 'TK nợ';
    //   }
    //   let idr = columnsGrid.findIndex((x) => x.fieldName == 'DR');
    //   if (idr > -1) {
    //     columnsGrid[idr].headerText = 'Số tiền';
    //   }
    //   let idr2 = columnsGrid.findIndex((x) => x.fieldName == 'DR2');
    //   if (idr2 > -1) {
    //     columnsGrid[idr2].headerText = 'Số tiền, HT';
    //   }
    //   let idx = columnsGrid.findIndex((x) => x.fieldName == 'OffsetAcctID');
    //   if (idx > -1) {
    //     columnsGrid[idx].isRequire = true;
    //   }
    // } else {
    //   let i = columnsGrid.findIndex((x) => x.fieldName == 'AccountID');
    //   if (i > -1) {
    //     columnsGrid[i].headerText = 'Tài khoản';
    //   }
    //   let idr = columnsGrid.findIndex((x) => x.fieldName == 'DR');
    //   if (idr > -1) {
    //     columnsGrid[idr].headerText = 'Nợ';
    //   }
    //   let idr2 = columnsGrid.findIndex((x) => x.fieldName == 'DR2');
    //   if (idr2 > -1) {
    //     columnsGrid[idr2].headerText = 'Nợ, HT';
    //   }
    //   let idx = columnsGrid.findIndex((x) => x.fieldName == 'OffsetAcctID');
    //   if (idx > -1) {
    //     columnsGrid[idx].isRequire = false;
    //   }
    //   this.hideFields.push('OffsetAcctID');
    //   if (this.cashpayment.currencyID == this.baseCurr) {
    //     this.hideFields.push('DR2');
    //     //this.hideFields.push('TaxAmt2');
    //     this.hideFields.push('CR2');
    //   }
    // }
  }
// doi ten
  loadFormat(columnsGrid) {
    if (this.cashpayment.currencyID == this.baseCurr) {
      let arr = ['DR', 'CR'];
      arr.forEach((fieldName) => {
        let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
        if (i > -1) {
          columnsGrid[i].dataFormat = 'B';
        }
      });
    } else {
      let arr = ['DR', 'CR', 'DR2', 'CR2'];
      arr.forEach((fieldName) => {
        switch (fieldName) {
          case 'DR':
          case 'CR':
            let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
            if (i > -1) {
              columnsGrid[i].dataFormat = 'S';
            }
            break;
          default:
            let idx = columnsGrid.findIndex((x) => x.fieldName == fieldName);
            if (idx > -1) {
              columnsGrid[idx].dataFormat = 'B';
            }
            break;
        }
      });
    }
  }
// doi ten
  loadVisibleColumn(columnsGrid) {
    let arr = [
      'DR2',
      'CR',
      'CR2',
      'SubControl',
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
    arr.forEach((fieldName) => {
      let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
      if (i > -1) {
        columnsGrid[i].isVisible = true;
      }
    });
  }
// doi ten
  // loadFormSubType(subtype) {
  //   let arr = ['1', '3'];
  //   arr.forEach((eName) => {
  //     if (eName == subtype) {
  //       let element = document.querySelectorAll('.ac-type-' + eName);
  //       if (element) {
  //         for (let index = 0; index < element.length; index++) {
  //           (element[index] as HTMLElement).style.display = 'inline';
  //         }
  //       }
  //     } else {
  //       let element = document.querySelectorAll('.ac-type-' + eName);
  //       if (element) {
  //         for (let index = 0; index < element.length; index++) {
  //           (element[index] as HTMLElement).style.display = 'none';
  //         }
  //       }
  //     }
  //   });
  // }

  setLineDefault() {
    // let cAcctID = null;
    // let rAcctID = null;
    // let oOffAcct = null;
    // let oAcct = null;
    // this.dataLine = {};
    // this.dataLine.rowNo = this.gridCash.dataSource.length + 1;
    // this.dataLine.transID = this.cashpayment.recID;
    // this.dataLine.objectID = this.cashpayment.objectID;
    // this.dataLine.reasonID = this.cashpayment.reasonID;

    // if (
    //   this.cbxCashBook?.ComponentCurrent?.itemsSelected &&
    //   this.cbxCashBook?.ComponentCurrent?.itemsSelected.length > 0
    // ) {
    //   cAcctID = this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
    // }

    // if (
    //   this.cbxReasonID?.ComponentCurrent?.itemsSelected &&
    //   this.cbxReasonID?.ComponentCurrent?.itemsSelected.length > 0
    // ) {
    //   this.dataLine.note =
    //     this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName;
    //   rAcctID = this.cbxReasonID.ComponentCurrent.itemsSelected[0].OffsetAcctID;
    // }

    // if (this.journal?.entryMode == '1') {
    //   if ((this.dataLine?.offsetAcctID == null || this.dataLine?.accountID == null)  && !this.dataLine?.isBrigdeAcct) {
    //     if (cAcctID) {
    //       switch (this.journal?.crAcctControl) {
    //         case '1':
    //           if (cAcctID == this.journal?.crAcctID) {
    //             switch (this.dialog.formModel.funcID) {
    //               case 'ACT0429':
    //               case 'ACT0410':
    //                 this.dataLine.offsetAcctID = cAcctID;
    //                 break;
    //               case 'ACT0428':
    //               case 'ACT0401':
    //                 this.dataLine.accountID = cAcctID;
    //                 break;
    //             }
                
    //           } else {
    //             this.dataLine.offsetAcctID = this.journal.crAcctID;
    //           }
    //           break;
    //         default:
    //           switch (this.dialog.formModel.funcID) {
    //             case 'ACT0429':
    //             case 'ACT0410':
    //               this.dataLine.offsetAcctID = cAcctID;
    //               break;
    //             case 'ACT0428':
    //             case 'ACT0401':
    //               this.dataLine.accountID = cAcctID;
    //               break;
    //           }
    //           break;
    //       }
    //     }
    //   }
    // } else {
    //   this.dataLine.offsetAcctID = null;
    // }

    // if ((this.dataLine?.offsetAcctID == null || this.dataLine?.accountID == null) && !this.dataLine?.isBrigdeAcct) {
    //   if (rAcctID) {
    //     switch (this.journal?.drAcctControl) {
    //       case '1':
    //         if (rAcctID == this.journal?.drAcctID) {
    //           switch (this.dialog.formModel.funcID) {
    //             case 'ACT0429':
    //             case 'ACT0410':
    //               this.dataLine.accountID = rAcctID;
    //               break;
    //             case 'ACT0428':
    //             case 'ACT0401':
    //               this.dataLine.offsetAcctID = rAcctID;
    //               break;
    //           }
              
    //         } else {
    //           this.dataLine.accountID = this.journal.drAcctID;
    //         }
    //         break;
    //       default:
    //         switch (this.dialog.formModel.funcID) {
    //           case 'ACT0429':
    //           case 'ACT0410':
    //             this.dataLine.accountID = rAcctID;
    //             break;
    //           case 'ACT0428':
    //           case 'ACT0401':
    //             this.dataLine.offsetAcctID = rAcctID;
    //             break;
    //         }
    //         break;
    //     }
    //   }
    // }

    // oAcct = this.acService.getCacheValue('account', this.dataLine.accountID);
    // oOffAcct = this.acService.getCacheValue(
    //   'account',
    //   this.dataLine.offsetAcctID
    // );

    // let dicSetting = JSON.parse(this.journal.extras);
    // if (dicSetting) {
    //   if (
    //     dicSetting?.diM1Control &&
    //     dicSetting?.diM1Control != '2' &&
    //     dicSetting?.diM1Control != '9'
    //   ) {
    //     this.dataLine.diM1 = this.journal.diM1;
    //   }
    //   if (
    //     dicSetting?.diM2Control &&
    //     dicSetting?.diM2Control != '2' &&
    //     dicSetting?.diM2Control != '9'
    //   ) {
    //     this.dataLine.diM2 = this.journal.diM2;
    //   }
    //   if (
    //     dicSetting?.diM3Control &&
    //     dicSetting?.diM3Control != '2' &&
    //     dicSetting?.diM3Control != '9'
    //   ) {
    //     this.dataLine.diM3 = this.journal.diM3;
    //   }
    // }

    // if (this.dataLine?.offsetAcctID) {
    //   if (oOffAcct && oOffAcct?.accountType == '5') {
    //     this.dataLine.isBrigdeAcct = true;
    //   }
    // }

    // if (this.dataLine?.accountID) {
    //   if (oAcct) {
    //     this.dataLine.singleEntry = oAcct?.accountType == '0' ? true : false;
    //     let bSubLGControl = oAcct?.subLGControl;
    //     if (!bSubLGControl && !this.dataLine?.offsetAcctID) {
    //       bSubLGControl = oOffAcct?.subLGControl;
    //     }
    //   }
    // }
    // this.dataLine.createdBy = this.userID;
    // this.constraintGrid();
    // let dRemainAmt = this.calcRemainAmt(this.cashpayment?.totalAmt);
    // if (dRemainAmt > 0) {
    //   this.dataLine.dr = dRemainAmt;
    //   this.dataLine = this.getValueByExRate(this.cashpayment,this.dataLine,true);
    // }
  }
// cho dRemainAmt bien toan cuc....
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
// doi ten
  setRequireFields() {
    // this.requireFields = [];
    // if (this.dataLine.accountID == null && this.dataLine.offsetAcctID) {
    //   return this.requireFields;
    // } else {
    //   let aDiM1Control = false;
    //   let aDiM2Control = false;
    //   let aDiM3Control = false;
    //   let aProjectControl = false;
    //   let oDiM1Control = false;
    //   let oDiM2Control = false;
    //   let oDiM3Control = false;
    //   let oProjectControl = false;
    //   let lsAccount = null;
    //   let lsOffAccount = null;

    //   lsAccount = this.acService.getCacheValue(
    //     'account',
    //     this.dataLine.accountID
    //   );
    //   lsOffAccount = this.acService.getCacheValue(
    //     'account',
    //     this.dataLine.offsetAcctID
    //   );
    //   switch (this.journal.entryMode) {
    //     case '1':
    //       if (lsAccount == null && lsOffAccount == null) {
    //         return this.requireFields;
    //       } else {
    //         if (lsAccount != null) {
    //           if (
    //             lsAccount.diM1Control &&
    //             (lsAccount.diM1Control == '1' || lsAccount.diM1Control == '3')
    //           ) {
    //             aDiM1Control = true;
    //           }
    //           if (
    //             lsAccount.diM2Control &&
    //             (lsAccount.diM2Control == '1' || lsAccount.diM2Control == '3')
    //           ) {
    //             aDiM2Control = true;
    //           }
    //           if (
    //             lsAccount.diM3Control &&
    //             (lsAccount.diM3Control == '1' || lsAccount.diM3Control == '3')
    //           ) {
    //             aDiM3Control = true;
    //           }
    //         }
    //         if (lsOffAccount != null) {
    //           if (
    //             lsOffAccount.diM1Control &&
    //             (lsOffAccount.diM1Control == '2' ||
    //               lsOffAccount.diM1Control == '3')
    //           ) {
    //             oDiM1Control = true;
    //           }
    //           if (
    //             lsOffAccount.diM2Control &&
    //             (lsOffAccount.diM2Control == '2' ||
    //               lsOffAccount.diM2Control == '3')
    //           ) {
    //             oDiM2Control = true;
    //           }
    //           if (
    //             lsOffAccount.diM3Control &&
    //             (lsOffAccount.diM3Control == '2' ||
    //               lsOffAccount.diM3Control == '3')
    //           ) {
    //             oDiM3Control = true;
    //           }
    //         }
    //       }
    //       break;
    //     case '2':
    //       if (
    //         lsAccount == null ||
    //         (this.dataLine.dr == 0 && this.dataLine.cr == 0)
    //       ) {
    //         return this.requireFields;
    //       }
    //       if (lsAccount.diM1Control) {
    //         if (this.dataLine.dr > 0) {
    //           if (
    //             lsAccount.diM1Control == '1' ||
    //             lsAccount.diM1Control == '3'
    //           ) {
    //             aDiM1Control = true;
    //           }
    //         }
    //         if (this.dataLine.cr > 0) {
    //           if (
    //             lsAccount.diM1Control == '2' ||
    //             lsAccount.diM1Control == '3'
    //           ) {
    //             oDiM1Control = true;
    //           }
    //         }
    //       }
    //       if (lsAccount.diM2Control) {
    //         if (this.dataLine.dr > 0) {
    //           if (
    //             lsAccount.diM2Control == '1' ||
    //             lsAccount.diM2Control == '3'
    //           ) {
    //             aDiM2Control = true;
    //           }
    //         }
    //         if (this.dataLine.cr > 0) {
    //           if (
    //             lsAccount.diM2Control == '2' ||
    //             lsAccount.diM2Control == '3'
    //           ) {
    //             oDiM2Control = true;
    //           }
    //         }
    //       }
    //       if (lsAccount.diM3Control) {
    //         if (this.dataLine.dr > 0) {
    //           if (
    //             lsAccount.diM3Control == '1' ||
    //             lsAccount.diM3Control == '3'
    //           ) {
    //             aDiM3Control = true;
    //           }
    //         }
    //         if (this.dataLine.cr > 0) {
    //           if (
    //             lsAccount.diM3Control == '2' ||
    //             lsAccount.diM3Control == '3'
    //           ) {
    //             oDiM3Control = true;
    //           }
    //         }
    //       }
    //       break;
    //   }
    //   if (aDiM1Control || oDiM1Control) {
    //     this.requireFields.push('DIM1');
    //   }

    //   if (aDiM2Control || oDiM2Control) {
    //     this.requireFields.push('DIM2');
    //   }

    //   if (aDiM3Control || oDiM3Control) {
    //     this.requireFields.push('DIM3');
    //   }

    //   if (aProjectControl || oProjectControl) {
    //     this.requireFields.push('ProjectID');
    //   }
    //   return this.requireFields;
    // }
  }
// doi ten
  setLockFields() {
    // this.lockFields = [];
    // if (this.dataLine.accountID == null && this.dataLine.offsetAcctID) {
    //   return this.lockFields;
    // } else {
    //   let aDiM1Control = false;
    //   let aDiM2Control = false;
    //   let aDiM3Control = false;
    //   let aProjectControl = false;
    //   let oDiM1Control = false;
    //   let oDiM2Control = false;
    //   let oDiM3Control = false;
    //   let oProjectControl = false;
    //   let lsAccount = null;
    //   let lsOffAccount = null;

    //   lsAccount = this.acService.getCacheValue(
    //     'account',
    //     this.dataLine.accountID
    //   );
    //   lsOffAccount = this.acService.getCacheValue(
    //     'account',
    //     this.dataLine.offsetAcctID
    //   );

    //   switch (this.journal.entryMode) {
    //     case '1':
    //       if (lsAccount == null && lsOffAccount == null) {
    //         return this.lockFields;
    //       } else {
    //         if (lsAccount != null) {
    //           if (lsAccount.diM1Control && lsAccount.diM1Control == '5') {
    //             aDiM1Control = true;
    //           }
    //           if (lsAccount.diM2Control && lsAccount.diM2Control == '5') {
    //             aDiM2Control = true;
    //           }
    //           if (lsAccount.diM3Control && lsAccount.diM3Control == '5') {
    //             aDiM3Control = true;
    //           }
    //         }
    //         if (lsOffAccount != null) {
    //           if (lsOffAccount.diM1Control && lsOffAccount.diM1Control == '4') {
    //             oDiM1Control = true;
    //           }
    //           if (lsOffAccount.diM2Control && lsOffAccount.diM2Control == '4') {
    //             oDiM2Control = true;
    //           }
    //           if (lsOffAccount.diM3Control && lsOffAccount.diM3Control == '4') {
    //             oDiM3Control = true;
    //           }
    //         }
    //       }
    //       break;
    //     case '2':
    //       if (
    //         lsAccount == null ||
    //         (this.dataLine.dr == 0 && this.dataLine.cr == 0)
    //       ) {
    //         return this.lockFields;
    //       } else {
    //         if (lsAccount.diM1Control) {
    //           if (this.dataLine.dr > 0) {
    //             if (lsAccount.diM1Control == '5') {
    //               aDiM1Control = true;
    //             }
    //             if (lsAccount.diM1Control == '4') {
    //               oDiM1Control = true;
    //             }
    //           }
    //         }
    //         if (lsAccount.diM2Control) {
    //           if (this.dataLine.dr > 0) {
    //             if (lsAccount.diM2Control == '5') {
    //               aDiM2Control = true;
    //             }
    //             if (lsAccount.diM2Control == '4') {
    //               oDiM2Control = true;
    //             }
    //           }
    //         }
    //         if (lsAccount.diM3Control) {
    //           if (this.dataLine.dr > 0) {
    //             if (lsAccount.diM3Control == '5') {
    //               aDiM3Control = true;
    //             }
    //             if (lsAccount.diM3Control == '4') {
    //               oDiM3Control = true;
    //             }
    //           }
    //         }
    //       }
    //       break;
    //   }
    //   if (aDiM1Control || oDiM1Control) {
    //     this.lockFields.push('DIM1');
    //   }

    //   if (aDiM2Control || oDiM2Control) {
    //     this.lockFields.push('DIM2');
    //   }

    //   if (aDiM3Control || oDiM3Control) {
    //     this.lockFields.push('DIM3');
    //   }

    //   if (aProjectControl || oProjectControl) {
    //     this.lockFields.push('ProjectID');
    //   }
    //   return this.lockFields;
    // }
  }

  /**
   * *Hàm lấy tỷ giá theo currency
   */
  getExchangeRateMaster() {
    if (this.cashpayment.currencyID == this.baseCurr) { //? nếu tiền tệ chứng từ = đồng tiền hạch toán
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
      if (this.cashpaymentline.length > 0) { //? nếu detail đã có dữ liệu 
        this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
      }
    } else { //? nếu tiền tệ chứng từ != đồng tiền hạch toán
      this.api.exec('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [ 
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
            if (this.cashpaymentline.length > 0) { //? nếu detail đã có dữ liệu 
              this.updateDetailByChangeExchangeRate(); //? => update lại tiền theo tỷ giá
            }
          }
        });
    }
    
  }

  getMemoMaster() {
    let newMemo = '';
    let reasonName = '';
    let objectName = '';
    let payName = '';

    let indexReason = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.value);
    if (indexReason > -1) {  
      reasonName = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName + ' - ';
    }

    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.value)
    if (indexObject > -1) {     
      objectName = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName + ' - ';
    }

    let indexPayee = this.eleCbxPayee?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ContactID == this.eleCbxPayee?.value)
    if (indexPayee > -1) {    
      payName = this.eleCbxPayee?.ComponentCurrent?.dataService?.data[indexPayee].ContactName + ' - ';
    }else{
      if (this.eleCbxPayee.ComponentCurrent?.value) {
        payName = this.eleCbxPayee.ComponentCurrent?.value + ' - ';
      }
    }  
    newMemo = reasonName + objectName + payName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  setDataRef(oCashRef, oLineRef) {
    // this.voucherNoRef = oCashRef.voucherNo;
    // this.dRRef = oCashRef.totalDR;
    // this.subtypeRef = oCashRef.subType;
    // switch (this.subtypeRef) {
    //   case '1':
    //     this.tabObj.hideTab(0, false);
    //     this.tabObj.hideTab(1, true);
    //     this.cashpaymentline = oLineRef;
    //     this.cashpaymentline.forEach((line) => {
    //       line.recID = Util.uid();
    //       line.transID = this.cashpayment.recID;
    //     });
    //     this.acService
    //       .execApi('AC', 'CashPaymentsLinesBusiness', 'AddListAsync', [
    //         this.cashpayment,
    //         this.cashpaymentline,
    //       ])
    //       .pipe(takeUntil(this.destroy$))
    //       .subscribe();
    //     break;
    //   case '2':
    //     this.tabObj.hideTab(0, true);
    //     this.tabObj.hideTab(1, false);
    //     this.settledInvoices = oLineRef;
    //     this.acService
    //       .execApi('AC', 'SettledInvoicesBusiness', 'AddListAsync', [
    //         this.cashpayment,
    //         this.settledInvoices,
    //       ])
    //       .pipe(takeUntil(this.destroy$))
    //       .subscribe();
    //     break;
    // }
  }

  setDefault(o) {
    return this.api.exec('AC', '', 'SetDefaultAsync', [
      this.journal,
    ]);
  }
// doi ten updatelines..
  reloadDataLine(field, preValue) {
    // if (preValue) {
    //   switch (field.toLowerCase()) {
    //     case 'objectid':
    //       this.cashpaymentline.forEach((item) => {
    //         if (item.objectID == preValue) {
    //           item.objectID = this.cashpayment.objectID;
    //         }
    //       });
    //       this.gridCash.refresh();
    //       // this.acService
    //       //   .execApi('AC', this.classNameLine, 'UpdateAfterMasterChange', [
    //       //     this.cashpayment,
    //       //     this.cashpaymentline,
    //       //   ])
    //       //   .pipe(takeUntil(this.destroy$))
    //       //   .subscribe((res) => {});
    //       break;
    //     case 'reasonid':
    //       this.cashpaymentline.forEach((item) => {
    //         if (item.reasonID == preValue) {
    //           item.reasonID = this.cashpayment.reasonID;
    //           item.note =
    //             this.cbxReasonID.ComponentCurrent.itemsSelected[0].ReasonName;
    //         }
    //       });
    //       this.gridCash.refresh();
    //       // this.acService
    //       //   .execApi('AC', this.classNameLine, 'UpdateAfterMasterChange', [
    //       //     this.cashpayment,
    //       //     this.cashpaymentline,
    //       //   ])
    //       //   .pipe(takeUntil(this.destroy$))
    //       //   .subscribe((res) => {});
    //       break;
    //     case 'cashbookid':
    //       this.cashpaymentline.forEach((item) => {
    //         if (item.offsetAcctID == preValue) {
    //           item.offsetAcctID =
    //             this.cbxCashBook.ComponentCurrent.itemsSelected[0].CashAcctID;
    //         }
    //       });
    //       break;
    //   }
    // }
  }

  /**
   * *Hàm tính tiền theo tỷ giá
   * @param master 
   * @param line 
   * @param isdr 
   * @returns 
   */
  getValueByExchangeRate(master, line, isdr){
    if (isdr) {
      let dDR2 = 0;
      if (master.multi) {
        dDR2 = this.roundService.baseCurr(line.dr * master.exchangeRate);
      }else{
        dDR2 = master.exchangeRate != 0 ? this.roundService.baseCurr(line.dr / master.exchangeRate) : line.dr;
      }
      if (line.dR2 != dDR2) {
        line.dR2 = dDR2;
      }
      if (line.cR2 != 0) {
        line.cR2 = 0;
      }
    }else{
      let dCR2 = 0;
      if (master.multi) {
        dCR2 = this.roundService.baseCurr(line.cr * master.exchangeRate);
      }else{
        dCR2 = master.exchangeRate != 0 ? this.roundService.baseCurr(line.cr / master.exchangeRate) : line.cr;
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
    this.cashpaymentline.forEach(item => {
      let line = this.getValueByExchangeRate(this.cashpayment,item,item.dr != 0);
      item.cr = line.cr;
      item.cR2 = line.cR2;
      item.dr = line.dr;
      item.dR2 = line.dR2;
    });
  }

  constraintGrid() {
    // this.requireFields = this.setRequireFields();
    // this.lockFields = this.setLockFields();
    // this.lockGrid();
    // this.requireGrid();
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
// doi save trc khi them dong'
  formAction() {
    switch (this.action) {
      case 'add':
      case 'copy':
        if (this.hasSaved) {
          if (this.cashpayment.updateColumn) {
            this.cashpayment.updateColumn = null;
            this.dialog.dataService.update(this.cashpayment).subscribe();
            this.acService
              .execApi('AC', '', 'UpdateVoucherAsync', [
                this.cashpayment,
                this.cashpaymentline,
              ])
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        } else {
          // this.journalService.checkVoucherNoBeforeSave(
          //   this.journal,
          //   this.cashpayment,
          //   'AC',
          //   this.dialog.formModel.entityName,
          //   this.form,
          //   this.action === 'edit',
          //   () => {

          //   }
          // );
          this.dialog.dataService.addDatas.set(
            this.cashpayment['_uuid'],
            this.cashpayment
          );
          this.cashpayment.updateColumn = null;
          this.hasSaved = true;
          this.dialog.dataService
            .save(
              (opt: RequestOption) => {
                opt.methodName = 'SaveLogicAsync';
                opt.data = [this.cashpayment];
              },
              0,
              '',
              '',
              false
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {});
        }
        break;
      case 'edit':
        if (this.cashpayment.updateColumn) {
          this.dialog.dataService.update(this.cashpayment).subscribe();
          this.acService
            .execApi('AC', '', 'UpdateVoucherAsync', [
              this.cashpayment,
              this.cashpaymentline,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        }
        break;
    }
  }
// changetab sua ten
  created(e: any, ele: TabComponent) {
    this.showHideTabDetail(this.cashpayment.subType, ele);
  }

  
// chia function master & detail.
// doi ten onedit...
  autoAddRow(e: any) {
    // switch (e.type) {
    //   case 'autoAdd':
    //     this.addRow('1');
    //     break;
    //   case 'add':
    //     if (this.gridCash.autoAddRow) {
    //       this.addlineCash();
    //     }
    //     break;
    //   case 'endEdit':
    //     if (!this.gridCash.autoAddRow) {
    //       let element = document.getElementById('btnadd');
    //       element.focus();
    //     }
    //     break;
    //   case 'closeEdit':
    //     this.gridCash.rowDataSelected = null;
    //     setTimeout(() => {
    //       let element = document.getElementById('btnadd');
    //       element.focus();
    //     }, 100);      
    //     break;
    // }
  }
// doi ten
  autoAddRowSet(e: any) {
    switch (e.type) {
      case 'autoAdd':
        if (this.action == 'add') {
          this.settlement(0);
        } else {
          this.settlement(1);
        }
        break;
    }
  }
// doi ten
  autoAddRowVat(e: any) {
    switch (e.type) {
      case 'autoAdd':
        this.addRow('4');
        break;
      case 'add':
        this.addVatInvoice();
        break;
    }
  }

  //bùa tabindex
  // setTabindex() {
  //   let ins = setInterval(() => {
  //     let eleInput = document
  //       ?.querySelector('.ac-form-master')
  //       ?.querySelectorAll('codx-input');
  //     if (eleInput) {
  //       clearInterval(ins);
  //       let tabindex = 0;
  //       for (let index = 0; index < eleInput.length; index++) {
  //         let elechildren = (
  //           eleInput[index] as HTMLElement
  //         ).getElementsByTagName('input')[0];
  //         if (elechildren.readOnly) {
  //           elechildren.setAttribute('tabindex', '-1');
  //         } else {
  //           tabindex++;
  //           elechildren.setAttribute('tabindex', tabindex.toString());
  //         }
  //       }
  //       // input refdoc
  //       let ref = document
  //         .querySelector('.ac-refdoc')
  //         .querySelectorAll('input');
  //       (ref[0] as HTMLElement).setAttribute('tabindex', '18');
  //     }
  //   }, 200);
  //   setTimeout(() => {
  //     if (ins) clearInterval(ins);
  //   }, 10000);
  // }


  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.key == 'Enter') {
      if ((e.target as any).closest('codx-input') != null) {
        let eleInput = document
          ?.querySelector('.ac-form-master')
          ?.querySelectorAll('codx-input');
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          let nextIndex = (e.target as HTMLElement).tabIndex + 1;
          for (let index = 0; index < eleInput.length; index++) {
            let elechildren = (
              eleInput[index] as HTMLElement
            ).getElementsByTagName('input')[0];
            if (elechildren.tabIndex == nextIndex) {
              elechildren.focus();
              elechildren.select();
              break;
            }
          }
        }
      }
    }
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
  //#endregion
}
