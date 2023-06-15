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
  dataPlan: any;
  okrFM: any;
  versions =[];
  isAfterRender: boolean;
  okrGrv: any;
  quarterVLL: any;
  monthVLL: any;
  kr: any;
  editTargets: any;
  planVLL: any[];
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dataPlan = dialogData?.data[0];
    this.okrFM = dialogData?.data[1];
    this.okrGrv = dialogData?.data[2];
    this.headerText = dialogData?.data[3];
    this.funcID = dialogData?.data[4];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;

  }

  onInit(): void {
    this.getData();
  }

  getData(){
    this.omService.getOKRPlansByID(this.dataPlan?.recID).subscribe(res=>{
      if(res){
        this.dataPlan=res; 
        this.versions = this.dataPlan?.versions?.reverse();
        this.isAfterRender=true;
      }
    })
  }
  getCache(){
    this.cache.valueList('SYS054').subscribe((vll) => {
      if (vll) {
        this.quarterVLL = vll;
      }
    });
    this.cache.valueList('SYS053').subscribe((vll) => {
      if (vll) {
        this.monthVLL = vll;
      }
    });
    this.cache.valueList('OM020').subscribe((vll) => {
      if (vll?.datas && vll?.datas.length > 0) {
      }
    });
  }
  onSaveForm() {}
  showOldVersion(recID:any){
    let dModel = new DialogModel();
    dModel.IsFull = true;
    dModel.FormModel = this.okrFM?.krFM;
    let dialogShowKR = this.callfc.openForm(
      PopupViewPlanVersionComponent,
      '',
      null,
      null,
      null,
      [recID,this.funcID,this.okrGrv,this.okrFM],
      '',
      dModel
    );
  }
  onSaveTarget() {
    let sumTargets = 0;
    for (let i = 0; i < this.editTargets.length; i++) {
      sumTargets += this.editTargets[i].target;
    }
    if (Math.round(sumTargets) != this.kr.target) {
      this.notificationsService.notify(
        'Tổng chỉ tiêu phân bổ chưa đồng nhất với chỉ tiêu',
        '2'
      );
      return;
    }
    // if (this.funcType == OMCONST.MFUNCID.Edit) {
    //   this.codxOmService
    //     .editKRTargets(this.kr?.recID, this.kr?.targets)
    //     .subscribe((res) => {});
    // }
    this.kr.targets = [];
    for (let i = 0; i < this.editTargets.length; i++) {
      this.kr.targets.push({ ...this.editTargets[i] });
    }
    this.dialogRef?.close();
  }
  valuePlanTargetChange(evt: any, index: number) {
    if (index != null && evt?.data != null) {
      this.editTargets[index].target = evt.data;
      this.editTargets[index].edited = true;
      //Tính lại target tự động
      let targetsNotChanged = [];
      let totalTargetsEdited = 0;

      for (let i = 0; i < this.editTargets.length; i++) {
        if (this.editTargets[i]?.edited != true) {
          targetsNotChanged.push(i);
        } else {
          totalTargetsEdited += this.editTargets[i]?.target;
        }
      }
      let avgTarget =
        (this.kr.target - totalTargetsEdited) / targetsNotChanged.length;
      for (let i = 0; i < this.editTargets.length; i++) {
        if (this.editTargets[i]?.edited != true) {
          this.editTargets[i].target = avgTarget;
        }
      }
    }
  }
  
  calculatorTarget(planType: any) {
    if (this.kr?.target && this.kr?.plan) {
      this.editTargets = [];
      this.planVLL = [];
      if (planType == OMCONST.VLL.Plan.Month) {
        this.planVLL = this.monthVLL?.datas;
      } else if (planType == OMCONST.VLL.Plan.Quarter) {
        this.planVLL = this.quarterVLL.datas;
      }
      
    }
  }

  refreshPlanTargets() {
    if (this.kr.target && this.editTargets && this.editTargets.length > 0) {
      let avgTarget = this.kr.target / this.editTargets.length;
      for (let i = 0; i < this.editTargets.length; i++) {
        this.editTargets[i].target = avgTarget;
      }
      this.detectorRef.detectChanges();
    }
  }
}
