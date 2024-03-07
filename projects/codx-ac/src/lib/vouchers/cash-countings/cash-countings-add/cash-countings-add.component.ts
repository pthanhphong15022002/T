import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';

@Component({
  selector: 'lib-cash-countings-add',
  templateUrl: './cash-countings-add.component.html',
  styleUrls: ['./cash-countings-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCountingsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('eleGridCounting') eleGridCounting: CodxGridviewV2Component;
  @ViewChild('formCounting') public formCounting: CodxFormComponent;
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
  refNo: any;
  refTotalAmt: any = 0;
  preData: any;
  isload: any = false;
  totalAmount:any = 0;
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
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        takeUntil(this.destroy$),
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res: any) => {
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit() {
    // if (this.formCashPayment?.data?.coppyForm) this.formCashPayment.data._isEdit = true; //? test copy để tạm
    // if (this.formCashPayment?.data?.isEdit && (this.formCashPayment?.data?.subType === '3' || this.formCashPayment?.data?.subType === '4')) {
    //   this.refNo = this.formCashPayment?.data?.refNo;
    //   this.refTotalAmt = this.formCashPayment?.data?.refTotalAmt;
    // }
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
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

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine() {
    
  }
  //#endregion

  //#region Method
  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {

  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {

  }
  //#endregion

}
