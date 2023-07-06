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
  listCbxProccess:any[]=[];
  stepReason:any;
  user:any;
  userId:any;

  ownerMove = '';

  headerText: string = '';
  instancesName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  titleReasonClick: string = '';
  stepName: string = '';
  moveProccess: string = '';
  memoStep:string = '';

  lstParticipants = [];
  listParticipantReason = [];

  listReason: DP_Steps_Reasons[]=[];

  listReasonClick: DP_Instances_Steps_Reasons[]=[];
  reasonStep = new DP_Steps();
  reason = new DP_Instances_Steps_Reasons();
  instances = new DP_Instances();
  listStep : DP_Instances_Steps_Reasons[]=[];

  instanceStep = new DP_Instances_Steps;

  isReason: boolean = true;
  applyFor:string = '0';

  dataCM:any;
  recID:string = '';
  nextStep: string ='';

  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly guidEmpty: string ='00000000-0000-0000-0000-000000000000'; // for save BE
  gridViewSetup: any;

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
    this.applyFor = dt?.data?.applyFor;
    this.stepName = dt?.data?.stepName;
    this.isReason = dt?.data?.isReason;
    this.headerText = dt?.data?.headerTitle;

    this.user = this.authStore.get();
    this.userId = this.user?.userID
    if(this.applyFor != '0') {
      this.executeApiCalls();

    }
    else {
      this.instances =  JSON.parse(JSON.stringify(dt?.data?.instance)); ;
      this.viewClick = this.viewKanban;
      this.reasonStep = dt?.data?.objReason
      this.listReason = this.reasonStep?.reasons;
      this.listCbxProccess = dt?.data?.listProccessCbx;
      this.listParticipantReason = dt?.data?.listParticipantReason;
      this.moveProccess =  this?.listCbxProccess?.filter(x=>x.recID === this.reasonStep?.newProcessID )[0]?.recID ?? this.guidEmpty;
      this.executeApiCallInstance();
      this.titleReasonClick = dt?.data?.headerTitle;
    }
    this.dataCM = dt?.data?.dataCM;
    this.recID = this.dataCM ? this.dataCM?.refID: this.instances?.recID;
  }

  ngOnInit(): void {

  }

  onSave() {
    if(this.reasonStep.reasonControl === true && this.listReasonClick.length === 0) {
      this.notiService.notifyCode('DP006');
      return;
    }
    if(!this.ownerMove && this.moveProccess && this.moveProccess !== this.guidEmpty) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }
    this.beforeSave();

  }
  beforeSave() {
    this.reasonStep.reasons = this.listReasonClick;
    var data = [this.recID, this.moveProccess, this.reasonStep, this.isReason,this.ownerMove,this.applyFor];
    this.codxDpService.moveReasonByIdInstance(data).subscribe((res)=> {
      if(res){
        this.instances = res[0];
        this.listStep = res[1];
        if(this.applyFor != '0' ){
          var objApplyFor ={
            listStep: this.listStep,
            instance: this.instances,
            instanceMove:  res[2],
            nextStep:this.nextStep
          };
          this.dialog.close(objApplyFor);

        }
        else {
          var obj ={
            listStep: this.listStep,
            instance: this.instances,
          };
          this.dialog.close(obj);
        }

        this.notiService.notifyCode('SYS007');
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  async executeApiCalls(){
    try {
      await this.getValueListMoveProcess();
      await this.getListMoveReason(this.dataCM);
      await this.getValueFormModel();
    } catch (error) {

    }
  }
  async executeApiCallInstance(){
    try {
      await this.getValueFormModel();
    } catch (error) {

    }
  }
  async getValueFormModel() {
    this.cache
    .gridViewSetup(
      'DPInstances',
      'grvDPInstances'
    )
    .subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }


  async getListMoveReason(data){
    var datas = [data?.processID, this.isReason ,this.applyFor];
    this.codxDpService.getInstanceStepsMoveReason(datas).subscribe(async (res)=> {
      if (res && res.length > 0) {
        if(res[0]) {
          var obj = {
            recID: res[0].recID,
            processName: res[0].processName,
          };
        this.nextStep = res[4];
        this.listCbxProccess.push(obj);
        this.listParticipantReason = await this.codxDpService.getListUserByOrg( res[2]) ;
        }
        this.moveProccess =  res[1];
        this.listReason =  res[3];
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  async getValueListMoveProcess() {
    this.cache.valueList('DP031').subscribe((data) => {
        var obj = {
          recID: this.guidEmpty,
          processName: data.datas[0].default,
        };
        this.listCbxProccess.unshift(obj);
    });
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
    if ($event) {
      this.reasonStep[$event.field] = $event.data;
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

  eventUser(e) {
    if (e != null) {
      this.ownerMove = e?.id; // thêm check null cái;
    }
  }
}

