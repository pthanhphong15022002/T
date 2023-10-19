import { ChangeDetectionStrategy, Component, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent, Util } from 'codx-core';
import { CodxAcService, fmPaymentOrder } from '../../../codx-ac.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-payment-order-add',
  templateUrl: './payment-order-add.component.html',
  styleUrls: ['./payment-order-add.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOrderAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('eleGridPaymentOrder') eleGridPaymentOrder: CodxGridviewV2Component; //? element codx-grv2 lưới Cashpayments
  @ViewChild('formPaymentOrder') public formPaymentOrder: CodxFormComponent; //? element codx-form của AdvancePayment
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của advancepayment
  fmPaymentOrder:any = fmPaymentOrder //? form model
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.headerText = dialogData.data?.headerText; //? get tên tiêu đề
    this.dataDefault = { ...dialogData.data?.dataDefault }; //? get data của Cashpayments
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '90%', '95%');
  }
  
  ngAfterViewInit() {
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
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {

  }

  clickMF(event,data){
    switch (event.functionID) {
      case 'SYS104':
        this.copyRow(data);
        break;
      case 'SYS102':
        this.deleteRow(data);
        break;
    }
  }
  //#endregion Event

  //#region Method
  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {
    // this.formAdvancePayment.save(null, 0, '', '', false)
    // .pipe(takeUntil(this.destroy$))
    // .subscribe((res: any) => {
    //   if(!res) return;
    //   if (res || res.save || res.update) {
    //     if (res || !res.save.error || !res.update.error) {
    //       if ((this.eleGridAdvancePayment || this.eleGridAdvancePayment?.isEdit)) { //? nếu lưới advancepayment có active hoặc đang edit
    //         this.eleGridAdvancePayment.saveRow((res:any)=>{ //? save lưới trước
    //           if(res){
    //             this.saveVoucher(type);
    //           }
    //         })
    //         return;
    //       }
    //     }
    //   }
    // });
  }

  /**
   * lưu chứng từ
   */
  saveVoucher(type){
    // if (this.eleGridAdvancePayment.dataSource.length == 0) {
    //   this.notification.notifyCode('AC0013',0);
    //   return;
    // }
    // this.calcTotalDr();
    // this.api
    //   .exec('AC', 'AdvancedPaymentBusiness', 'UpdateVoucherAsync', [
    //     this.formAdvancePayment.data
    //   ])
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     if (res?.update) {
    //       this.dialog.dataService.update(res.data).subscribe();
    //       if (type == 'save') {
    //         this.onDestroy();
    //         this.dialog.close();
    //       }else{
    //         this.api
    //         .exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync', [
    //           this.dialogData.data.dataDefault,
    //           ''
    //         ])
    //         .subscribe((res: any) => {
    //           if (res) {
    //             res.data.isAdd = true;
    //             this.formAdvancePayment.refreshData({...res.data});
    //             setTimeout(() => {
    //               this.refreshGrid();
    //             }, 100);
    //             this.detectorRef.detectChanges();
    //           }
    //         });
    //       }
    //       if (this.formAdvancePayment.data.isAdd || this.formAdvancePayment.data.isCopy)
    //         this.notification.notifyCode('SYS006');
    //       else 
    //         this.notification.notifyCode('SYS007');
          
    //     }
    //     if(this.eleGridAdvancePayment && this.eleGridAdvancePayment?.isSaveOnClick) this.eleGridAdvancePayment.isSaveOnClick = false;
    //   });
  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {

  }
  //#endregion Method

  //#region Function
  /**
   * *Hàm thêm dòng cho lưới
   * @returns
   */
  onAddLine() {
    this.formPaymentOrder.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.eleGridPaymentOrder) { //? nếu lưới advancedpayment có active hoặc đang edit
              this.eleGridPaymentOrder.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addLine();
                }
              })
              return;
            }
          }
        }
      });
  }

  /**
   * *Hàm thêm mới dòng advancepayments
   */
  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridPaymentOrder.addRow(oLine,this.eleGridPaymentOrder.dataSource.length);
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    data.recID = Util.uid();
    data.index = this.eleGridPaymentOrder.dataSource.length;
    this.eleGridPaymentOrder.addRow(data,this.eleGridPaymentOrder.dataSource.length);
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    this.eleGridPaymentOrder.deleteRow(data);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    // let model = new AC_AdvancedPaymentLines();
    // let oLine = Util.camelizekeyObj(model);
    // oLine.transID = this.formAdvancePayment.data.recID;
    // oLine.objectID = this.formAdvancePayment.data.objectID;
    // oLine.reasonID = this.formAdvancePayment.data.reasonID;

    // let indexReason = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
    // if (indexReason > -1) {
    //   oLine.note = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName;
    // }

    // let dRAmt = this.calcRemainAmt(this.formAdvancePayment.data?.totalAmt);
    // if (dRAmt > 0) {
    //   oLine.dr = dRAmt;
    // }
    // return oLine;
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

    dPayAmt = this.eleGridPaymentOrder.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
    dRemainAmt = dRemainAmt - dPayAmt;
    return dRemainAmt;
  }

  /**
   * *Hàm tính tổng tiền
   */
  calcTotalDr(){
    let totalDr = this.eleGridPaymentOrder.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
    this.formPaymentOrder.setValue('totalDR',totalDr,{onlySelf: true,emitEvent: false});
  }

  /**
   * *Hàm get ghi chú từ lí do + nhân viên
   * @returns
   */
  getMemoMaster() {
    let newMemo = ''; //? tên ghi chú mới
    let reasonName = ''; //? tên lí do chi
    let objectName = ''; //? tên đối tượng

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

    newMemo = reasonName + objectName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridPaymentOrder(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine();
        break;
      case 'add':
      case 'update': //? sau khi thêm dòng thành công
      this.dialog.dataService.update(this.formPaymentOrder.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridPaymentOrder && this.eleGridPaymentOrder.rowDataSelected) {
        this.eleGridPaymentOrder.rowDataSelected = null;
      }
      if(this.eleGridPaymentOrder.isSaveOnClick) this.eleGridPaymentOrder.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddCash'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event){
    event.forEach((element) => {
      if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
        element.disabled = false;
        element.isbookmark = false;
      }else{
        element.disabled = true;
      }
    });
  }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridPaymentOrder){
      this.eleGridPaymentOrder.dataSource = [];
      this.eleGridPaymentOrder.refresh();
    }
  }
  //#endregion Function

}
