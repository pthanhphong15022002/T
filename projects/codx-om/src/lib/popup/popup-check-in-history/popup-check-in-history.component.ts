import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { CheckIns } from './../../model/okr.model';
import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
  ViewModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';
import { OkrTargetsComponent } from '../../okr/okr-targets/okr-targets.component';
import { OKRComponent } from '../../okr/okr.component';

@Component({
  selector: 'popup-check-in-history',
  templateUrl: 'popup-check-in-history.component.html',
  styleUrls: ['popup-check-in-history.component.scss'],
})
export class PopupCheckInHistoryComponent
  extends UIComponent
  implements AfterViewInit
{
  
  views: Array<ViewModel> | any = [];
  dialog :any;
  data:any;
  okrGrv: any;
  okrFM: any;
  statusVLL: any;
  curUser :any;
  oldData: any;
  isAfterRender: boolean = false;
  emptyData: boolean =true;
  checkIns= [];
  groupModel:any;
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
    this.groupModel= dialogData.data[2];
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
}
