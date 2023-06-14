import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  Optional,
} from '@angular/core';

import {
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  ViewModel,
} from 'codx-core';
import { CodxOmService } from '../../codx-om.service';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';

@Component({
  selector: 'popup-check-in-history',
  templateUrl: 'popup-check-in-history.component.html',
  styleUrls: ['popup-check-in-history.component.scss'],
})
export class PopupCheckInHistoryComponent
  extends UIComponent
  implements AfterViewInit
{  
  @Input()groupModel:any;
  @Input()okrGrv: any;
  @Input()okrFM: any;
  @Input()oldData: any;
  @Input()isPopup=true;
  views: Array<ViewModel> | any = [];
  dialog :any;
  statusVLL: any;
  data:any;
  curUser :any;
  isAfterRender: boolean = false;
  emptyData: boolean =true;
  checkIns= [];
  dataChange: boolean=false;
  okrTarget:any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private authStore: AuthStore,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialog=dialogRef;
    this.oldData = dialogData?.data[0];
    this.okrGrv= dialogData.data[1];
    this.okrFM= dialogData.data[2];
    this.groupModel= dialogData.data[3];
    this.curUser = authStore.get();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {
    
  }

  onInit(): void {
    this.getData()
    
    this.getCacheData();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.cache.valueList('OM016').subscribe((res:any)=>{
      if(res){
        this.statusVLL = res;
        
      }
    })
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getData() {    
    this.checkIns=[];
    this.codxOmService.getOKRByID(this.oldData?.recID).subscribe((res:any)=>{
      if(res){
        this.data=res;
        if(this.data?.checkIns?.length>0){
          //this.checkIns= this.data?.checkIns.filter((x :any)=>x.okrid == this.data?.recID).reverse();
          this.checkIns=this.data?.checkIns.reverse();
          this.detectorRef.detectChanges();
        }
        this.isAfterRender =true;
      }
      else{
        this.emptyData=true;
        this.isAfterRender =true;
      }
    })
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(evt: any) {
    
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  checkinCancel() {
    
  }
  close(){
    this.dialog && this.dialog.close(this.dataChange);
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  percentCumulate(value:number){
    if(value!=null){
      return value.toFixed(1);
    }
    return 0;
  }
 
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  checkIn() {
    // if (this.dataOKRPlans.status!=OMCONST.VLL.PlanStatus.Ontracking ) {
    //   this.notificationsService.notify(
    //     'Bộ mục tiêu chưa được phát hành',
    //     '3',
    //     null
    //   );
    //   return;
    // }
    if (this.data?.assignOKR && this.data?.assignOKR.length > 0) {
      this.notificationsService.notify(
        'Không thể cập nhật tiến độ kết quả đã được phân công',
        '3',
        null
      );
      return;
    }
    if (this.data?.items && this.data?.items.length > 0) {
      this.notificationsService.notify(
        'Không thể cập nhật tiến độ kết quả đã có kết quả phụ',
        '3',
        null
      );
      return;
    }
    let dialogCheckIn = this.callfc.openForm(
      PopupCheckInComponent,
      '',
      800,
      500,
      '',
      [this.data, "Cập nhật tiến độ", { ...this.groupModel?.checkInsModel }, this.okrFM]
    );
    dialogCheckIn.closed.subscribe((res) => {
      if (res?.event && res?.event?.length != null) {
        this.getData();
        this.dataChange=true;
        this.detectorRef.detectChanges();
      //   this.updateOKRPlans.emit(this.dataOKRPlans?.recID);
      //   if (res?.event.length > 0) {
      //     this.caculatorPlanInBackground(res?.event);
      //   }
      }
    });
  }
  approve(item:any,status:string){
    if(item!=null){
      let recID='';
      if(item?.refCheckIn!=null){
        recID= item?.refCheckIn;
      }
      else{
        recID =item?.recID
      }
      this.codxOmService.approveCheckIn(recID,status).subscribe((res:any)=>{
        if(res){
          item.approveStatus=status;
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS034'); //thành công
        }
      })
    }
  }
}
