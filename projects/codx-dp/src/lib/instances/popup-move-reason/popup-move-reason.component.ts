import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import {
  DP_Instances,
  DP_Instances_Steps,
  DP_Instances_Steps_Reasons,
  DP_Steps,
  DP_Steps_Reasons,
} from '../../models/models';

@Component({
  selector: 'lib-popup-move-reason',
  templateUrl: './popup-move-reason.component.html',
  styleUrls: ['./popup-move-reason.component.css'],
})
export class PopupMoveReasonComponent implements OnInit {
  [x: string]: any;

  dialog: any;
  formModel: any;
  listCbxProccess: any[] = [];
  stepReason: any;
  user: any;
  userId: any;

  ownerMove = '';

  headerText: string = '';
  instancesName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  titleReasonClick: string = '';
  stepName: string = '';
  moveProccess: string = '';
  memoStep: string = '';
  processNameEmpty: string ='';

  lstParticipants = [];
  listParticipantReason = [];

  listReason: DP_Steps_Reasons[] = [];

  listReasonClick: DP_Instances_Steps_Reasons[] = [];
  reasonStep = new DP_Steps();
  reason = new DP_Instances_Steps_Reasons();
  instances = new DP_Instances();
  listStep: DP_Instances_Steps_Reasons[] = [];

  instanceStep = new DP_Instances_Steps();

  isReason: boolean = true;
  isMoveProcess: boolean = false;
  isLockStep: boolean = false;
  isCallInstance: boolean = true;

  applyFor: string = '0';
  applyForMove: string = '';
  dataCM: any;
  recID: string = '';
  nextStep: string = '';
  memo:string = '';

  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  gridViewSetup: any;
  stepNameSuccess: any;
  formModelProcess: FormModel = {
    formName: 'DPProcesses',
    gridViewName: 'grvDPProcesses',
    entityName: 'DP_Processes',
  };

  constructor(
    private cache: CacheService,
    private codxDpService: CodxDpService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.applyFor = dt?.data?.applyFor;
    this.stepName = dt?.data?.stepName;
    this.headerText = dt?.data?.headerTitle;
    this.isReason = dt?.data?.isReason;
    this.processID =  dt?.data?.processID;
    this.isMoveProcess = dt?.data?.isMoveProcess;
    this.isCallInstance = dt?.data?.isCallInstance;
    this.user = this.authStore.get();
    this.userId = this.user?.userID;
    this.reasonStep = dt?.data?.objReason;
    if (this.applyFor == '0') {
      this.listReason = this.reasonStep?.reasons;
      this.instances = JSON.parse(JSON.stringify(dt?.data?.instance));
  //    this.listCbxProccess = dt?.data?.listProccessCbx;
   //   this.listParticipantReason = dt?.data?.listParticipantReason;
      this.moveProccess =
        this?.listCbxProccess?.filter(
          (x) => x.recID === this.reasonStep?.newProcessID
        )[0]?.recID ?? this.guidEmpty;
      this.executeApiCallInstance();
      this.titleReasonClick = dt?.data?.headerTitle;
    }
    this.dataCM = dt?.data?.dataCM;
    this.recID = this.dataCM ? this.dataCM?.refID : dt?.data?.instance?.recID;
    this.applyFor != '0' && this.executeApiCalls();
    this.getValueListReason();
   if( this.isMoveProcess && this.reasonStep) {
    if (this.reasonStep?.newProcessID === this.guidEmpty || !this.reasonStep.newProcessID) {
              this.getValueListMoveProcess();
              this.moveProccess = this.reasonStep.newProcessID;
    };
    if(this.reasonStep?.newProcessID !== this.guidEmpty && this.reasonStep.newProcessID ){
      var listNewProcessID = this.reasonStep.newProcessID?.split(";");
      if(listNewProcessID?.length > 0){
        this.getListProcesByMoveProcess(listNewProcessID[0]); 
      }
    }
   }
   else {
      this.getListMoveReason();
   }
  }

  ngOnInit(): void {}

  getDataMove(){
    
  }

  onSave() {
    if(this.isLockStep) return;
    if (
      this.reasonStep.reasonControl === true &&
      this.listReasonClick.length === 0
    ) {
      this.notiService.notifyCode('DP006');
      return;
    }
    if (
      !this.ownerMove &&
      this.moveProccess &&
      this.moveProccess !== this.guidEmpty
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }
    this.isLockStep  = true;
    this.beforeSave();
  }
  beforeSave() {
    this.reasonStep.reasons = this.listReasonClick;
    let data = [
      this.recID,
      this.moveProccess,
      this.reasonStep.reasons,
      this.isReason,
      this.ownerMove,
      this.applyForMove,
      this.memo
    ];
    // let obj = {
    //           listStep: this.listStep,
    //           instance: this.instances,
    //           processMove: this.moveProcess,
    //           applyForMove: this.applyFor,
    //           ownerMove: this.ownerMove,
    //           comment: this.reasonStep.memo,
    //         };
    //         this.dialog.close(obj);
    let oldStepId = this.instances.stepID;
    let oldStatus = this.instances.status;
    this.codxDpService.moveReasonByIdInstance(data).subscribe((res) => {
      if (res) {
        this.instances = res[0];
        this.listStep = res[1];

        if(!this.isCallInstance) {
          if(this.applyFor == '1') {
            let datas = [null, oldStepId, oldStatus, this.reasonStep.memo,this.instances.recID,this.instances.status,this.instances.stepID];
            if(this.applyFor == "1" ) {
              this.codxDpService.moveDealReason(datas).subscribe((res) => {
                if (res) {
                }
              });
            }
          }
          else {
            let datas = [null,this.instances.recID,this.instances.status,this.instances.stepID];
            (this.applyFor == '2' || this.applyFor == '3') && this.codxDpService.moveCaseReason(datas).subscribe((res) => {  if (res) {} });
            // (this.applyFor == '5' ) && this.codxDpService.moveLeadReason(datas).subscribe((res) => {  if (res) {} });
             (this.applyFor == '4' ) && this.codxDpService.moveContractReason(datas).subscribe((res) => {  if (res) {} });
          }

        }
        let obj = {
          listStep: this.listStep,
          instance: this.instances,
          nextStep: this.nextStep,
          processMove: this.moveProccess != this.guidEmpty ? this.moveProccess: null,
          applyForMove: this.applyForMove,
          ownerMove: this.ownerMove,
          comment: this.reasonStep.memo,
          title:this.instances.title,
        };
        this.dialog.close(obj);
        this.isLockStep  = false;
        this.notiService.notifyCode('SYS007');
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  async executeApiCalls() {
    try {
      await this.getValueFormModel();
    } catch (error) {}
  }
  async executeApiCallInstance() {
    try {
      await this.getValueFormModel();
    } catch (error) {}
  }
  async getValueFormModel() {
    this.cache
      .gridViewSetup('DPInstances', 'grvDPInstances')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  async getListMoveReason() {
    var datas = [this.processID, this.isReason];
    this.codxDpService
      .getDataProccessMove(datas)
      .subscribe(async (res) => {
        if (res) {
          this.reasonStep = res?.step;
          this.listReason = this.reasonStep.reasons
          this.stepName = this.reasonStep?.stepName;
          this.listCbxProccess = res?.listProcess;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  async getValueListMoveProcess() {
    this.cache.valueList('DP031').subscribe((data) => {
      let obj = {
        recID: this.guidEmpty,
        processName: data.datas[0].default,
      };
      this.processNameEmpty = data.datas[0].default,
      this.listCbxProccess.unshift(obj);
      this.applyForMove = this.applyFor;
    });
  }

  checkValue($event, data) {
    if ($event && $event.currentTarget.checked) {
      var reason = this.handleReason(data);
      this.listReasonClick.push(reason);
    } else {
      let idx = this.listReasonClick.findIndex(
        (x) => x.reasonName === data.reasonName
      );
      if (idx >= 0) this.listReasonClick.splice(idx, 1);
    }
  }
  valueChange($event) {
    if ($event) {
      this.memo = $event.data;
    }
  }
    getListProcesByMoveProcess(moveProccess) {
    // this.moveProccess = this.reasonStep.newProcessID;
    let data=[this.applyFor,this.moveProccess,'1'];
    this.codxDpService.getlistCbxProccessMove(data).subscribe((res) => {
      if( res != null && res.length > 0) {
        this.getListProceseEmpty(res[0]);
        this.listParticipantReason = res[1];
        let indexOwner = this.listParticipantReason.findIndex(x=> x.userID === this.userId);
        if(indexOwner != -1) {
          this.ownerMove = this.userId;
        }
        else {
          this.ownerMove = null;
        }
      }
      // else {
      // this.getListProceseEmpty([]);
      // }
    });
  }

  handleReason(stepReason: any) {
    var reason = new DP_Instances_Steps_Reasons();
    reason.processID = this.instances.processID;
    reason.stepID = stepReason.stepID;
    reason.reasonName = stepReason.reasonName;
    reason.instanceID = this.instances.recID;
    reason.createdBy = this.userId;
    reason.reasonType = this.isReason ? '1' : '2';
    return reason;
  }

  changeTime($event) {}

  async cbxChange($event) {
    if ($event) {
      this.moveProccess = $event;
      this.getListProcesByMoveProcess(event);
    }
  }


  async getValueListReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.stepNameSuccess = item?.text;
          } else if (item.value === 'F') {
            this.stepNameFail = item?.text;
          } else if (item.value === 'R') {
            this.stepNameReason = item?.text;
          }
        }
        this.getNameReason(this.isReason);
      }
    });
  }

  getNameReason(isReason) {
    this.titleReasonClick = isReason
      ? this.joinTwoString(this.stepNameReason, this.stepNameSuccess)
      : !isReason
      ? this.joinTwoString(this.stepNameReason, this.stepNameFail)
      : '';
  }
  joinTwoString(valueFrist, valueTwo) {
    valueTwo = this.LowercaseFirstPipe(valueTwo);
    if (!valueFrist || !valueTwo) return '';
    return valueFrist + ' ' + valueTwo;
  }
  LowercaseFirstPipe(value) {
    if (!value) return '';
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
  getListProceseEmpty(listProcess) {
    this.listCbxProccess = [];
    if(listProcess != null && listProcess.length > 0) {
      this.listCbxProccess = listProcess;
      this.listCbxProccess = this.listCbxProccess.filter(
        (x) => x.recID !== this.processID
      );
      this.applyForMove = this.listCbxProccess[0].applyFor;
    }
  }
  valueChangeOwner($event) {
    if($event  ){
      this.ownerMove = $event;
    }
    else if($event === null || $event === '') {
      this.ownerMove = null;
    }
  }
}
