import {
  Component,
  inject,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { OM_Statistical } from '../../model/okr.model';

@Component({
  selector: 'popup-view-plan-version',
  templateUrl: './popup-view-plan-version.component.html',
  styleUrls: ['./popup-view-plan-version.component.scss'],
})
export class PopupViewPlanVersionComponent extends UIComponent {
  headerText='Xem phiên bản';

  dialogRef: DialogRef;
  formModel: FormModel;
  
  okrFM: any;
  isAfterRender: boolean;
  okrGrv: any;
  planID: any;
  dataOKRPlans: any;
  planNull: boolean;
  dataOKR: any;
  value=new OM_Statistical();
  loadedData = false;
  curUser: any;
  funcID: any;
  isCollapsed = false;
  totalOB=0;
  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.planID = dialogData?.data[0];
    this.funcID = dialogData?.data[1];
    this.okrGrv = dialogData?.data[2];
    this.okrFM = dialogData?.data[3];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.curUser = authStore.get();
  }

  onInit(): void {
    this.getData();
  }
  
  getData(){
    this.codxOmService
        .getOKRPlansByID(this.planID)
        .subscribe((item: any) => {
          //Reset data View
          //this.isCollapsed = false;
          if (item) {
            this.dataOKRPlans = item;
            this.codxOmService
              .getAllOKROfPlan(item?.recID)
              .subscribe((okrs: any) => {
                if (okrs) {
                  this.dataOKR = okrs;
                  if(this.dataOKR?.length>0){
                    for (let gr of this.dataOKR){
                      this.totalOB += gr.listOKR.length;
                    }
                  }
                  
                }
                this.calculateStatistical();
                this.isAfterRender = true;
                this.loadedData = true;
                this.detectorRef.detectChanges();
              });
          } 
          else{      
            this.dataOKRPlans = null;     
            this.isAfterRender = true;
            this.loadedData = true;
            this.detectorRef.detectChanges();
          }
        });
  }


  calculateStatistical(){
    if (this.dataOKR != null) {
      var tempValue = new OM_Statistical();
      let countNotStartOB = 0;
      let countStartingOB = 0;
      let countDoneOB = 0;
      for (let gr of this.dataOKR) {
        for (let ob of gr.listOKR) {
          tempValue.totalOB += 1;
          if (ob?.progress == 0) countNotStartOB += 1;
          if (ob?.progress > 0 && ob?.progress < 100) countStartingOB += 1;
          if (ob?.progress == 100) countDoneOB += 1;
          if (ob?.category == '5') tempValue.totalHighOB += 1;
          if (ob?.progress == 100) tempValue.obDone += 1;
          if (ob?.category == '5' && ob?.progress == 100)
            tempValue.highOBDone += 1;

          if (ob?.items?.length > 0) {
            for (let kr of ob?.items) {
              if (kr?.notiCheckIn) tempValue.krLateCheckIn += 1;
              if (kr?.current > kr?.actual) tempValue.krLateProgress += 1;
              if (
                kr?.current == kr?.actual &&
                kr?.current > 0 &&
                kr?.actual > 0
              )
                tempValue.krInProgress += 1;
              if (kr?.current < kr?.actual) tempValue.krOverProgress += 1;
              //if(kr?.items?.length>0){
              // for(let skr of kr?.items){
              //   if(skr?.kr?.notiCheckIn) tempValue.krLateCheckIn+=1;
              //   if(skr?.current > skr?.actual) tempValue.krLateProgress+=1;
              //   if(skr?.current == skr?.actual) tempValue.krInProgress+=1;
              //   if(skr?.current < skr?.actual) tempValue.krOverProgress+=1;
              // }
              //}
            }
          }
        }
      }
      if(tempValue?.totalOB>0){
        tempValue.percentOBNotStart = (
          (countNotStartOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
        tempValue.percentOBStarting = (
          (countStartingOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
        tempValue.percentOBDone = (
          (countDoneOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
        
      }
      else{      
        tempValue.percentOBNotStart ='0';
        tempValue.percentOBStarting ='0';
        tempValue.percentOBDone ='0';
      }
      this.value = tempValue;
      this.detectorRef.detectChanges();
    }
  }

  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  collapeKR(collapsed: boolean) {
    this.dataOKR.forEach((group) => {
      if(group?.listOKR?.length>0){
        group?.listOKR.forEach((ob) => {          
          ob.isCollapse = collapsed;
        });
      }
    });
    this.detectorRef.detectChanges();
    this.dataOKR.forEach((group) => {
      if(group?.listOKR?.length>0){
        group?.listOKR.forEach((ob) => {          
          if (ob.items != null && ob.items.length > 0) {
            ob.items.forEach((kr) => {
              kr.isCollapse = collapsed;
            });
          }
        });
      }
    });    
    this.isCollapsed = collapsed;
    this.detectorRef.detectChanges();
  }

  closeDialog() {
    this.dialogRef && this.dialogRef.close();
  }

  onSaveForm() {}
  
}
