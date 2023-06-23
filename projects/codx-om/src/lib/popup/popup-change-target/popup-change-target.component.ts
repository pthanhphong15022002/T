import {
  Component,
  inject,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { PopupViewPlanVersionComponent } from '../popup-view-plan-version/popup-view-plan-version.component';
import { OMCONST } from '../../codx-om.constant';

@Component({
  selector: 'popup-change-target',
  templateUrl: './popup-change-target.component.html',
  styleUrls: ['./popup-change-target.component.scss'],
})
export class PopupChangeTargetComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  headerText='';

  dialogRef: DialogRef;
  formModel: FormModel;
  funcID: string;
  dataKR: any;
  okrFM: any;
  versions =[];
  isAfterRender: boolean;
  okrGrv: any;
  quarterVLL: any;
  monthVLL: any;
  totalTargets=0;
  disabledTargets=0;
  enabledTargets=0;  
  newTarget=0; 
  targetChecked=0;
  backupTar=[];
  planVLL: any[];
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dataKR = dialogData?.data[0];
    this.headerText = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;

  }

  onInit(): void {
    this.getData(); 
  }

  getData(){
    this.omService.getOKRByID(this.dataKR?.recID).subscribe(res=>{
      if(res){
        this.dataKR=res; 
        if(this.dataKR?.targets?.length>0){
          this.totalTargets= this.dataKR?.targets?.length;
          for(let tar of this.dataKR?.targets){  
            this.backupTar.push({...tar});
            if(tar?.checkIns!=null || tar?.checkIns?.length>0){
              for(let checkIn of this.dataKR?.checkIns){
                if(checkIn?.status!='3' && checkIn?.createdOn!=null && tar?.planDate!=null && new Date(checkIn?.createdOn) > new Date(tar?.planDate))
                {
                  tar.comment='disabled';
                  this.disabledTargets+=1;
                  this.targetChecked +=tar.target;
                }
              }
            }        
            
          }
          this.enabledTargets= this.totalTargets-this.disabledTargets;
        }
        this.isAfterRender=true;
      }
    })
  }
  getCache(){    
    this.cache.valueList('OM020').subscribe((vll) => {
      if (vll?.datas && vll?.datas.length > 0) {
      }
    });
  }
  onSaveForm() {}
  changeTarget(evt:any){
    if(evt?.field){
      this.newTarget= evt?.data;
      //Tính lại target tự động
      let targetsNotChanged = [];
      let totalTargetsEdited = 0;

      for (let i = 0; i < this.dataKR?.targets.length; i++) {
        if (this.dataKR?.targets[i]?.edited != true && this.dataKR?.targets[i]?.comment==null)   {
          targetsNotChanged.push(i);
        } else {
          totalTargetsEdited += this.dataKR?.targets[i]?.target;
        }
      }
      let avgTarget =
        (this.newTarget - totalTargetsEdited) / targetsNotChanged.length;
      for (let i = 0; i < this.dataKR?.targets.length; i++) {
        if (this.dataKR?.targets[i]?.edited != true  && this.dataKR?.targets[i]?.comment==null) {
          this.dataKR.targets[i].target = avgTarget;
        }
      }
      this.detectorRef.detectChanges();
    }
  }
  onSaveTarget() {
    // let sumTargets = 0;
    // for (let i = 0; i < this.dataKR?.targets.length; i++) {      
    //   sumTargets += this.dataKR?.targets[i].target;
    // }
    // if (Math.round(sumTargets) != this.kr.target) {
    //   this.notificationsService.notify(
    //     'Tổng chỉ tiêu phân bổ chưa đồng nhất với chỉ tiêu',
    //     '2'
    //   );
    //   return;
    // }
    // if (this.funcType == OMCONST.MFUNCID.Edit) {
    //   this.codxOmService
    //     .editKRTargets(this.kr?.recID, this.kr?.targets)
    //     .subscribe((res) => {});
    // }
    // this.kr.targets = [];
    // for (let i = 0; i < this.dataKR?.targets.length; i++) {
    //   this.kr.targets.push({ ...this.dataKR?.targets[i] });
    // }
    // this.dialogRef?.close();
    this.dataKR.target = this.newTarget + this.targetChecked;
    this.omService.editKR(this.dataKR).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
      }
      this.notificationsService.notifyCode('SYS007');
      this.dialogRef && this.dialogRef.close(res);        
    });      
  }
  
  valuePlanTargetChange(evt: any, index: number) {
    if (index != null && evt?.data != null) {
      this.dataKR.targets[index].target = evt.data;
      this.dataKR.targets[index].edited = true;
      //Tính lại target tự động
      let targetsNotChanged = [];
      let totalTargetsEdited = 0;

      for (let i = 0; i < this.dataKR?.targets.length; i++) {
        if (this.dataKR?.targets[i]?.edited != true && this.dataKR?.targets[i]?.comment==null)   {
          targetsNotChanged.push(i);
        } else {
          totalTargetsEdited += this.dataKR?.targets[i]?.target;
        }
      }
      let avgTarget =
        (this.newTarget - totalTargetsEdited) / targetsNotChanged.length;
      for (let i = 0; i < this.dataKR?.targets.length; i++) {
        if (this.dataKR?.targets[i]?.edited != true  && this.dataKR?.targets[i]?.comment==null) {
          this.dataKR.targets[i].target = avgTarget;
        }
      }
    }
  }

  refreshPlanTargets() {
    if (this.dataKR.target && this.dataKR?.targets && this.dataKR?.targets.length > 0) {
      for (let i = 0; i < this.dataKR?.targets.length; i++) {
        this.dataKR.targets[i].target = this.backupTar[i]?.target;
      }
      this.detectorRef.detectChanges();
    }
  }
}
