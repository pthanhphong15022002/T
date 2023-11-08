import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService, fmTransfersLines } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';

@Component({
  selector: 'lib-warehouse-transfers-add',
  templateUrl: './warehouse-transfers-add.component.html',
  styleUrls: ['./warehouse-transfers-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseTransfersAddComponent extends UIComponent {
  //#region Contrucstor
  @ViewChild('eleGridWareHouse') eleGridWareHouse: CodxGridviewV2Component; 
  @ViewChild('formWareHouse') public formWareHouse: CodxFormComponent;
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  fmTransfersLines:any = fmTransfersLines
  baseCurr: any; //? đồng tiền hạch toán
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
  }
  //#endregion Contrucstor

  //#region Init
  onInit(): void {
    
  }

  ngAfterViewInit() {
    if(this.formWareHouse?.data?.coppyForm) this.formWareHouse.data._isEdit = true; //? test copy để tạm
  }
  
  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){
    //this.setValidateForm();
    this.detectorRef.detectChanges();
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
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMF(event: any, data) {
    switch (event.functionID) {
      case 'SYS104':
        //this.copyRow(data);
        break;
      case 'SYS102':
        //this.deleteRow(data);
        break;
    }
  }

  /**
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.formWareHouse.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
  }

  valueChangeMaster(event: any) {

  }

  valueChangeLine(event: any) {
    
  }
  //#endregion Event

  //#region Method
  onDiscardVoucher(){
    // if (this.formVouchers && this.formVouchers.data._isEdit) {
    //   this.notification.alertCode('AC0010', null).subscribe((res) => {
    //     if (res.event.status === 'Y') {
    //       this.detectorRef.detectChanges();
    //       this.dialog.dataService
    //         .delete([this.formVouchers.data], false, null, '', '', null, null, false)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe((res) => {
    //           if (res.data != null) {
    //             this.notification.notifyCode('E0860');
    //             this.dialog.close();
    //             this.onDestroy();
    //           }
    //         });
    //     }
    //   });
    // }else{
    //   this.dialog.close();
    //   this.onDestroy();
    // }
  }

  /**
   * *Hàm lưu chứng từ
   * @param type 
   */
  onSaveVoucher(type){
    // this.formVouchers.save(null, 0, '', '', false)
    // .pipe(takeUntil(this.destroy$))
    // .subscribe((res: any) => {
    //   if(!res) return;
    //   if (res || res.save || res.update) {
    //     if (res || !res.save.error || !res.update.error) {
    //       if ((this.eleGridVouchers || this.eleGridVouchers?.isEdit)) { //?
    //         this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
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
    // this.api
    //   .exec('IV', 'VouchersBusiness', 'UpdateVoucherAsync', [
    //     this.formVouchers.data,
    //     this.journal,
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
    //         .exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
    //           this.dialogData.data?.oData,
    //           this.journal,
    //         ])
    //         .subscribe((res: any) => {
    //           if (res) {
    //             res.data.isAdd = true;
    //             this.formVouchers.refreshData({...res.data});
    //             setTimeout(() => {
    //               this.eleGridVouchers.dataSource = [];
    //               this.eleGridVouchers.refresh();
    //             }, 100);
    //             this.detectorRef.detectChanges();
    //           }
    //         });
    //       }
    //       if (this.formVouchers.data.isAdd || this.formVouchers.data.isCopy)
    //         this.notification.notifyCode('SYS006');
    //       else 
    //         this.notification.notifyCode('SYS007');
          
    //     }
    //     if(this.eleGridVouchers && this.eleGridVouchers?.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false;
    //   });
  }
  //#endregion Method

  //#region Function

  onAddLine() {
    // this.formWareHouse.save(null, 0, '', '', false)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     if(!res) return;
    //     if (res || res.save || res.update) {
    //       if (res || !res.save.error || !res.update.error) {
    //         if (this.eleGridVouchers) {
    //           this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
    //             if(res){
    //               this.addLine();
    //             }
    //           })
    //           return;
    //         }
    //       }
    //     }
    //   })
  }

  onActionGrid(event: any){
    // switch (event.type) {
    //   case 'autoAdd':
    //     this.onAddLine();
    //     break;
    //   case 'add':
    //   case 'update':
    //     this.dialog.dataService.update(this.formVouchers.data).subscribe();
    //     break;
    //   case 'closeEdit': //? khi thoát dòng
    //   if (this.eleGridVouchers && this.eleGridVouchers.rowDataSelected) {
    //     this.eleGridVouchers.rowDataSelected = null;
    //   }
    //   if(this.eleGridVouchers.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
    //   setTimeout(() => {
    //     let element = document.getElementById('btnAddVou'); //? focus lại nút thêm dòng
    //     element.focus();
    //   }, 100);
    //     break;
    // }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event) {
    event.forEach((element) => {
      if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
        element.disabled = false;
        element.isbookmark = false;
      }else{
        element.disabled = true;
      }
    });
  }
  //#endregion Function
}
