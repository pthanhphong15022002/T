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
  kr:any;
  viewMode=false;
  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dataKR = dialogData?.data[0];
    this.headerText = dialogData?.data[1];
    this.viewMode = dialogData?.data[2]
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;

  }

  onInit(): void {
    this.getData(); 
  }

  getData(){
    this.codxOmService.getOKRByID(this.dataKR?.recID).subscribe(res=>{
      if(res){
        this.kr=res;         
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
  onSaveTarget() {
    let sumTargets = 0;
    for (let i = 0; i < this.kr.targets.length; i++) {
      sumTargets += this.kr.targets[i].target;
    }
    if (Math.round(sumTargets) != this.kr.target) {
      this.notificationsService.notify(
        'Tổng chỉ tiêu phân bổ chưa đồng nhất với chỉ tiêu',
        '2'
      );
      return;
    }
    this.codxOmService
    .editKRTargets(this.kr?.recID, this.kr?.targets)
    .subscribe((res) => {  
      if(res){
        this.notificationsService.notifyCode('SYS007');
        this.dialogRef?.close();
      }    
    });
    
  }

  valuePlanTargetChange(evt: any, index: number) {
    if (index != null && evt?.data != null) {
      this.kr.targets[index].target = evt.data;
      this.kr.targets[index].edited = true;
      //Tính lại target tự động
      let targetsNotChanged = [];
      let totalTargetsEdited = 0;

      for (let i = 0; i < this.kr.targets.length; i++) {
        if (this.kr.targets[i]?.edited != true) {
          targetsNotChanged.push(i);
        } else {
          totalTargetsEdited += this.kr.targets[i]?.target;
        }
      }
      let avgTarget =
        (this.kr.target - totalTargetsEdited) / targetsNotChanged.length;
      for (let i = 0; i < this.kr.targets.length; i++) {
        if (this.kr.targets[i]?.edited != true) {
          this.kr.targets[i].target = avgTarget;
        }
      }
    }
  }
  refreshPlanTargets() {
    if (this.kr.target && this.kr.targets && this.kr.targets.length > 0) {
      let avgTarget = this.kr.target / this.kr.targets.length;
      for (let i = 0; i < this.kr.targets.length; i++) {
        this.kr.targets[i].target = avgTarget;
        this.kr.targets[i].edited = false;
      }
      this.detectorRef.detectChanges();
    }
  }
  
}
