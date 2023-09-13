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
  @ViewChild('eleGridCashReceipt') eleGridCashReceipt: CodxGridviewV2Component; //? element codx-grv2 lưới CashReceipt
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formCashPayment') public formCashReceipt: CodxFormComponent; //? element codx-form của CashReceipt
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  @ViewChild('eleCbxPayee') eleCbxPayee: any; //? element codx-input cbx của đối tượng
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
  fmCashpaymentLine: FormModel = {
    funcID: 'ACT0410',
    formName: 'CashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
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
  //#endregion Init

  //#region Event

  //#endregion Event

  //#region Method
  //#endregion Method

  //#region Function
  //#endregion Function
}
