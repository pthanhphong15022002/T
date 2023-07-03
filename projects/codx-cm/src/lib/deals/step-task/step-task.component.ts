import { filter } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogRef, FormModel, NotificationsService,} from 'codx-core';
import { CodxStepTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-step-task/codx-step-task.component';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstancesStepsReasons } from '../../models/tmpModel';

@Component({
  selector: 'step-task',
  templateUrl: './step-task.component.html',
  styleUrls: ['./step-task.component.scss']
})
export class StepTaskComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('task') task : CodxStepTaskComponent;
  @Input() typeTask = 1;
  @Input() customerID = 1;
  @Input() applyFor;
  @Input() isDataLoading: any;
  @Input() dataSelected: any;
  @Input() listInstanceStep: any[];
  @Output() continueStep = new EventEmitter<any>();
  @Output() saveAssignTask = new EventEmitter<any>();
  @ViewChild('viewReason', { static: true }) viewReason;
  dialogPopupReason: DialogRef;
  status = [];
  type = '';
  crrViewGant = 'W';
  vllViewGannt = 'DP042';
  typeTime;
  listInstanceStepShow = [];
  isShowElement = true;
  indexAddTask: number;
  taskType;
  titleReason: string;
  stepNameSuccess: any;
  stepNameFail: any;
  stepNameReason: any;
  listReasonsClick: any[];
  listStepReason: any[];
  isClosed:boolean = true;
  iconReasonSuccess: any;
  iconReasonFail: any;
  listStepSuccess:tmpInstancesStepsReasons[] = [];
  listStepFail:tmpInstancesStepsReasons[] = [];
  stepIdReason: string ='';

  formModel: FormModel = {
    entityName: 'DP_Instances_Steps_Reasons',
    formName: 'DPInstancesStepsReasons',
    gridViewName: 'grvDPInstancesStepsReasons',
  };
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private codxCmService: CodxCmService,
  ) {

    this.promiseAll()
  }

  ngOnInit(): void {
    this.cache.valueList('DP032').subscribe(res => {
      if(res?.datas){
        this.status = res?.datas?.filter(data => data.value!= '4' && data.value!= '5');
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.listInstanceStep){
      this.listInstanceStepShow = this.listInstanceStep;
      if( !['0','1','2'].includes(this.dataSelected.status)) {
        this.stepIdReason = this.listInstanceStep[this.listInstanceStep.length - 1].stepID
        this.listStepReason =this.listInstanceStep[this.listInstanceStep.length - 1].reasons;
      }
    }
    if (changes.dataSelected) {
      this.dataSelected = changes.dataSelected?.currentValue;
      this.type = this.dataSelected.viewModeDetail;
    }
  }

  ngAfterViewInit(): void {

  }
  changeValue(e){
    this.type = e.data;
  }
  changeValueDropdownSelect(e){
    if(e.field == 'status'){
      if(e?.data?.length == 0){
        this.listInstanceStepShow = this.listInstanceStep;

      }else{
        this.listInstanceStepShow = this.listInstanceStep.filter(step => e?.data?.includes(step.stepStatus))
      }
    }
    if(e.field == 'show' && e.data?.length > 0){
      this.isShowElement = e.data[0] == '1' ? true : false;
    }else{
      this.isShowElement = true;
    }
  }


  handelContinueStep(event, step){
    this.continueStep.emit({isTaskEnd: event, step: step})
  }

  handelSaveAssignTask(event){
    this.saveAssignTask.emit(event);
  }

  changeViewTimeGant(e) {
    this.typeTime = e;
  }

  addTask(){
    this.indexAddTask = this.listInstanceStep.findIndex(step => step.stepStatus == '1');
    setTimeout(() => {
      this.indexAddTask = -1;
    },1000);
  }

  async promiseAll(){
    try {
      await this.getValueListReason();
    }
    catch (e) {

    }
  }

  async getValueListReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.iconReasonSuccess = item;
          } else if (item.value === 'F') {
            this.iconReasonFail = item;
          }
           else if (item.value === 'R') {
          this.stepNameReason = item?.text;
         }
      }
        this.stepNameSuccess = this.iconReasonSuccess?.text;
        this.stepNameFail = this.iconReasonFail?.text;
      }
    });
  }
  async getListReason(processId,applyFor){
    var datas = [processId,applyFor];
    this.codxCmService.getListReasonByProcessId(datas).subscribe((res) =>{
      if(res) {
        this.listStepSuccess = this.convertStepsReason(res[0]);
        this.listStepFail = this.convertStepsReason(res[1]);
       this.listStepReason = this.getReasonByStepId(this.dataSelected.status);
      }
    })

  }

  convertStepsReason(reasons: any) {
    var listReasonInstance = [];
    for (let item of reasons) {
      var reasonInstance = new tmpInstancesStepsReasons();
      reasonInstance.processID = this.dataSelected.processID;
      reasonInstance.stepID = item.stepID;
      reasonInstance.instanceID = this.dataSelected.refID
      reasonInstance.reasonName = item.reasonName;
      reasonInstance.reasonType = item.reasonType;
      reasonInstance.createdBy = item.createdBy;
      listReasonInstance.push(reasonInstance);
    }
    return listReasonInstance;
  }

  getNameReason(isReason){
    this.titleReason = isReason ? this.joinTwoString(this.stepNameReason, this.stepNameSuccess): !isReason
    ? this.joinTwoString(this.stepNameReason, this.stepNameFail)
    : '';
    return this.titleReason;
  }

  getReasonValue(isReason){
    return isReason? this.iconReasonSuccess: this.iconReasonFail;
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
  async openPopupReason() {
   this.listReasonsClick = [];
   await this.getListReason(this.dataSelected.processID,this.applyFor);
    this.dialogPopupReason = this.callfc.openForm(
      this.viewReason,
      '',
      500,
      500
    );
  }
  getReasonByStepId(status: string) {
    if (status == '3' || status == '4') return this.listStepSuccess;
    if (status == '5' || status == '6') return this.listStepFail;
    return null;
  }

  checkValue($event, data) {
    if ($event && $event.currentTarget.checked) {
      this.listReasonsClick.push(data);
    } else {
      let idx = this.listReasonsClick.findIndex((x) => x.recID === data.recID);
      if (idx >= 0) this.listReasonsClick.splice(idx, 1);
    }
  }

  onSaveReason() {
    if(this.listReasonsClick.length > 0 && this.listReasonsClick)
    {
      var data = [
        this.dataSelected.refID,
        this.stepIdReason,
        this.listReasonsClick,
      ];
      this.codxCmService.updateListReason(data).subscribe((res) => {
        if (res) {
          this.listStepReason = this.listReasonsClick;
          this.dialogPopupReason.close();
          this.notiService.notifyCode('SYS007');
          return;
        }
      });
    }
  }
  changeReasonMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
          case 'SYS102':
            if (this.dataSelected.closed) {
              res.disabled = true;
            }
            break;
          default:
            res.disabled = true;
            break;
        }
      });
    }
  }
  clickMFReason($event, data) {
    switch ($event.functionID) {
      case 'SYS02':
        this.deleteReason(data);
        break;
      default:
        break;
    }
  }
  deleteReason(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x?.event && x.event?.status == 'Y') {
        this.onDeleteReason(data);
      } else {
        return;
      }
    });
  }
  onDeleteReason(dataReason) {
    var data = [this.dataSelected.refID, this.dataSelected.stepID, dataReason.recID];
    this.codxCmService.deleteListReason(data).subscribe((res) => {
      if (res) {
        let idx = this.listStepReason.findIndex(
          (x) => x.recID === dataReason.recID
        );
        if (idx >= 0) this.listStepReason.splice(idx, 1);
        this.notiService.notifyCode('SYS008');
        return;
      }
    });
  }

  //#region Kanban

  //#endregion


}
