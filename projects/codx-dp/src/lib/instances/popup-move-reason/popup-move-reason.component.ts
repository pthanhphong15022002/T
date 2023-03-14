import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances, DP_Instances_Steps, DP_Instances_Steps_Reasons, DP_Steps, DP_Steps_Reasons } from '../../models/models';

@Component({
  selector: 'lib-popup-move-reason',
  templateUrl: './popup-move-reason.component.html',
  styleUrls: ['./popup-move-reason.component.css']
})
export class PopupMoveReasonComponent implements OnInit {

  dialog: any;
  formModel:any;
  listCbxProccess:any;
  stepReason:any;
  user:any;
  userId:any;

  headerText: string = '';
  instancesName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  titleReasonClick: string = '';
  applyFor: string = '';
  stepName: string = '';
  moveProccess: string = '';
  memoStep:string = '';

  listReason: DP_Steps_Reasons[]=[];

  listReasonClick: DP_Instances_Steps_Reasons[]=[];
  reasonStep = new DP_Steps();
  reason = new DP_Instances_Steps_Reasons();
  instances = new DP_Instances();
  listStep : DP_Instances_Steps_Reasons[]=[];

  instanceStep = new DP_Instances_Steps;

  isReason: boolean = true;

  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly guidEmpty: string ='00000000-0000-0000-0000-000000000000'; // for save BE

  constructor(
    private cache: CacheService,
    private codxDpService: CodxDpService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,


  ) {

    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.instances = dt?.data.instance;
    this.headerText = dt?.data.headerTitle;
    this.titleReasonClick = dt?.data.isReason? 'Chọn lý do thành công': 'Chọn lý do thất bại';
    this.applyFor = dt?.data?.applyFor;
    this.viewClick = this.viewKanban;
    this.stepName = dt?.data?.stepName;
    this.reasonStep = dt?.data?.objReason
    this.listReason = this.reasonStep.reasons;
    this.user = this.authStore.get();
    this.userId = this.user?.userID
    this.isReason = dt?.data?.isReason;

    this.listCbxProccess = dt?.data?.listProccessCbx;
    this.moveProccess =  this.listCbxProccess.filter(x=>x.recID === this.reasonStep.newProcessID )[0].recID;

  }

  ngOnInit(): void {
    
  }

  onSave() {
    if(this.reasonStep.reasonControl === true && this.listReasonClick.length === 0) {
      this.notiService.notifyCode('DP006');
      return;
    }
    // else {
    
      this.beforeSave();
    // }

  }
  beforeSave() {
    this.reasonStep.reasons = this.listReasonClick;
    var data = [this.instances.recID, this.moveProccess, this.reasonStep, this.isReason];
    this.codxDpService.moveReasonByIdInstance(data).subscribe((res)=> {
      if(res){
        this.instances = res[0];
        this.listStep = res[1];
        var obj ={
          listStep: this.listStep,
          instance: this.instances,
        };
        this.dialog.close(obj);
        this.notiService.notifyCode('SYS007');
    

        this.changeDetectorRef.detectChanges();
      }
    })
  }
  checkValue($event,data){
    if($event && $event.currentTarget.checked){
       var reason = this.handleReason(data);
      this.listReasonClick.push(reason);
    }
    else {
      let idx = this.listReasonClick.findIndex(x=> x.reasonName  === data.reasonName);
      if(idx>=0) this.listReasonClick.splice(idx, 1);
    }
  }
  valueChange($event){
    if($event){
      this.reasonStep.memo = $event.data;
    }
  }

  handleReason(
    stepReason:any
  ) {
    var reason = new DP_Instances_Steps_Reasons();
     reason.processID = this.instances.processID;
     reason.stepID = this.reasonStep.recID;
     reason.reasonName = stepReason.reasonName;
     reason.instanceID = this.instances.recID;
     reason.createdBy = this.userId;
     reason.reasonType = this.reasonStep.isSuccessStep ? '1' : '2';
    return reason;
  }


  changeTime($event){

  }

  cbxChange($event) {
    if($event){
      this.moveProccess = $event;
    }

  }
}

