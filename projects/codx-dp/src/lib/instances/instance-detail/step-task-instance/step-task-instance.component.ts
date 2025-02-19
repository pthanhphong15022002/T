import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { tmpInstancesStepsReasons } from 'projects/codx-cm/src/lib/models/tmpModel';
import { CodxStepTaskComponent } from '../../../share-crm/codx-step/codx-step-task/codx-step-task.component';

@Component({
  selector: 'step-task-instance',
  templateUrl: './step-task-instance.component.html',
  styleUrls: ['./step-task-instance.component.scss'],
})
export class StepTaskInstanceComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('task') task: CodxStepTaskComponent;
  @ViewChild('popupGuide') popupGuide;

  @Input() test: any;
  applyProcess = false; // 2 = hợp đồng
  @Input() instance; // CM_Customers, CM_Deal, CM_Lead, CM_Case, CM_Contracts
  @Input() isAdmin = false;
  @Input() applyFor;
  @Input() owner = '';

  @Input() isPause = false;
  @Input() isDataLoading: any;
  // @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() listInstanceStep: any[];
  @Input() entityName = '';
  @Input() customerName: string;
  @Input() dealName: string;
  @Input() contractName: string;
  @Input() leadName: string;
  @Input() isHeightAuto = false;
  @Input() isChangeOwner: string;
  @Output() continueStep = new EventEmitter<any>();
  @Output() saveAssignTask = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();
  @Output() isSusscess = new EventEmitter<any>();
  @Output() addTaskHaveAssign = new EventEmitter<any>();
  @ViewChild('viewReason', { static: true }) viewReason;
  dialogPopupReason: DialogRef;
  status = [];
  type = 'S';
  crrViewGant = 'W';
  vllViewGannt = 'DP042';
  typeTime;
  listInstanceStepShow = [];
  isShowElement = false;
  indexAddTask: number;
  taskType;
  titleReason: string;
  stepNameSuccess: any;
  stepNameFail: any;
  stepNameReason: any;
  listReasonsClick: any[];
  listStepReason: any[];
  listStepReasonValue: any[];
  isClosed: boolean = true;
  iconReasonSuccess: any;
  iconReasonFail: any;
  // listStepSuccess: tmpInstancesStepsReasons[] = [];
  // listStepFail: tmpInstancesStepsReasons[] = [];
  stepIdReason: string = '';
  dialogGuideZoomIn: DialogRef;
  dialogGuideZoomOut: DialogRef;
  stepViews = [];
  isZoomIn = false;
  isZoomOut = false;
  isShow = false;
  isShowSuccess = false;
  isShowFail = false;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  elementRef: any;
  renderer: any;
  taskHeight = '555px';
  user;

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private authstore: AuthStore
  ) {
    this.promiseAll();
    this.user = this.authstore.get();
  }

  ngOnInit(): void {
    this.cache.valueList('DP032').subscribe((res) => {
      if (res?.datas) {
        this.status = res?.datas?.filter(
          (data) => data.value != '4' && data.value != '5'
        );
      }
    });
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'InstancesStepsBusiness',
        'SendMailNotificationAsync'
      )
      .subscribe((res) => {});
    this.taskHeight = this.isHeightAuto ? 'auto' : 'this.taskHeight';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.listInstanceStep) {
      this.listInstanceStepShow = this.listInstanceStep;
      if (!['0', '1', '2', '15'].includes(this.instance?.status)) {
        this.stepIdReason =
          this.listInstanceStep[this.listInstanceStep.length - 1].stepID;
        this.listStepReasonValue =
          this.listInstanceStep[this.listInstanceStep.length - 1].reasons;
        this.isShowSuccess = true;
      }
      if (this.listInstanceStep?.length > 0) {
        this.stepViews = [];
        this.listInstanceStep.forEach((x) => {
          if (!x.isFailStep && !x.isSuccessStep) {
            let obj = {
              stepName: x.stepName,
              memo: x.memo,
            };
            this.stepViews.push(obj);
          }
        });
      }
    }

    if (changes.dataCM) {
      this.type = this.instance.viewModeDetail || 'S';
      if (!this.isAdmin) {
        this.isAdmin =
          this.instance?.full || this.instance?.owner == this.user?.userID;
      }
      if (this.entityName == 'CM_Customers') {
        this.applyProcess = false;
      } else if (this.entityName == 'CM_Deals') {
        this.applyProcess = true;
      } else {
        this.applyProcess = this.instance?.applyProcess;
      }
      this.owner = this.instance?.owner;
    }
  }

  ngAfterViewInit(): void {
    !this.isHeightAuto && this.setHeight();
  }
  changeValue(e) {
    this.type = e.data;
  }
  changeValueDropdownSelect(e) {
    this.isShow;
    if (e.field == 'status') {
      if (e?.data?.length == 0) {
        this.listInstanceStepShow = this.listInstanceStep;
      } else {
        this.listInstanceStepShow = this.listInstanceStep.filter((step) =>
          e?.data?.includes(step.stepStatus)
        );
      }
    }
    if (e.field == 'show' && e.data?.length > 0) {
      this.isShowElement = e.data[0] == '1' ? true : false;
    } else {
      this.isShowElement = true;
    }
    this.isShowSuccess = this.isShowElement;
  }

  handelToggleStep() {
    this.isShow = !this.isShow;
    this.isShowElement = this.isShow;
    this.isShowSuccess = this.isShowElement;
  }

  handelContinueStep(event, step) {
    this.continueStep.emit({ isTaskEnd: event, step: step });
  }

  handelSaveAssignTask(event) {
    this.saveAssignTask.emit(event);
  }

  changeViewTimeGant(e) {
    this.typeTime = e;
  }

  addTask() {
    let index = this.listInstanceStep.findIndex(
      (step) => step.stepStatus == '1'
    );
    this.indexAddTask = index > -1 ? index : 0;
    setTimeout(() => {
      this.indexAddTask = -1;
    }, 1000);
  }

  async promiseAll() {
    try {
      await this.getValueListReason();
    } catch (e) {}
  }

  async getValueListReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.iconReasonSuccess = item;
          } else if (item.value === 'F') {
            this.iconReasonFail = item;
          } else if (item.value === 'R') {
            this.stepNameReason = item?.text;
          }
        }
        this.stepNameSuccess = this.iconReasonSuccess?.text;
        this.stepNameFail = this.iconReasonFail?.text;
      }
    });
  }
  async getListReason(processId, applyFor) {
    this.api
      .exec<any>('DP', 'ProcessesBusiness', 'GetListReasonByProcessIdAsync', [
        processId,
        applyFor,
      ])
      .subscribe((res) => {
        if (res) {
          if (this.instance?.status == '3' || this.instance?.status == '4') {
            this.listStepReason = this.convertStepsReason(res[0]);
          }
          if (this.instance?.status == '5' || this.instance?.status == '6') {
            this.listStepReason = this.convertStepsReason(res[1]);
          }
        }
      });
  }

  convertStepsReason(reasons: any) {
    var listReasonInstance = [];
    for (let item of reasons) {
      var reasonInstance = new tmpInstancesStepsReasons();
      reasonInstance.processID = this.instance?.processID;
      reasonInstance.stepID = item.stepID;
      reasonInstance.instanceID = this.instance?.recID;
      reasonInstance.reasonName = item.reasonName;
      reasonInstance.reasonType = item.reasonType;
      reasonInstance.createdBy = item.createdBy;
      listReasonInstance.push(reasonInstance);
    }
    return listReasonInstance;
  }

  getNameReason(isReason) {
    this.titleReason = isReason
      ? this.joinTwoString(this.stepNameReason, this.stepNameSuccess)
      : !isReason
      ? this.joinTwoString(this.stepNameReason, this.stepNameFail)
      : '';
    return this.titleReason;
  }

  getReasonValue(isReason) {
    return isReason ? this.iconReasonSuccess : this.iconReasonFail;
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
    await this.getListReason(this.instance.processID, this.applyFor);
    this.dialogPopupReason = this.callfc.openForm(
      this.viewReason,
      '',
      500,
      500
    );
  }
  getReasonByStepId(status: string) {
    // if (status == '3' || status == '4') return this.listStepSuccess;
    // if (status == '5' || status == '6') return this.listStepFail;
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
    if (this.listReasonsClick.length > 0 && this.listReasonsClick) {
      var data = [
        this.instance.recID,
        this.stepIdReason,
        this.listReasonsClick,
      ];
      this.api
        .exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'UpdateReasonStepAsync',
          data
        )
        .subscribe((res) => {
          if (res) {
            this.listStepReasonValue = JSON.parse(
              JSON.stringify(this.listReasonsClick)
            );
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
            if (this.instance.closed) {
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
    var data = [this.instance.refID, this.instance.stepID, dataReason.recID];
    // this.codxCmService.deleteListReason(data).subscribe((res) => {
    //   if (res) {
    //     let idx = this.listStepReasonValue.findIndex(
    //       (x) => x.recID === dataReason.recID
    //     );
    //     if (idx >= 0) this.listStepReasonValue.splice(idx, 1);
    //     this.notiService.notifyCode('SYS008');
    //     return;
    //   }
    // });
  }

  //#region Kanban

  //#endregion

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    !this.isHeightAuto && this.setHeight();
  }

  setHeight() {
    setTimeout(() => {
      // const main = document.querySelector('.codx-detail-main') as HTMLElement;
      // const mainHeight = main.offsetHeight;
      // let taskHeight = mainHeight - 330;
      // if (taskHeight) {
      //   this.taskHeight = taskHeight.toString() + 'px';
      //   // this.renderer.setStyle(listTask, 'height', taskHeight.toString() + 'px');
      // }
    }, 500);
  }

  autoStart(event) {
    this.changeProgress.emit(event);
  }

  showGuide() {
    if (this.isZoomIn) {
      return;
    }
    if (this.isZoomOut) {
      this.dialogGuideZoomOut?.close();
      this.isZoomOut = false;
    }
    this.isZoomIn = true;
    let option = new DialogModel();
    option.zIndex = 1001;
    if (this.popupGuide) {
      this.dialogGuideZoomIn = this.callfc.openForm(
        this.popupGuide,
        '',
        600,
        470,
        '',
        null,
        '',
        option
      );
    }
  }

  zoomGuide() {
    if (this.isZoomOut) {
      return;
    }
    if (this.isZoomIn) {
      this.dialogGuideZoomIn?.close();
    }
    this.isZoomOut = true;
    this.isZoomIn = false;
    let option = new DialogModel();
    option.zIndex = 1001;
    option.IsFull = true;
    if (this.popupGuide) {
      this.dialogGuideZoomOut = this.callfc.openForm(
        this.popupGuide,
        '',
        600,
        470,
        '',
        null,
        '',
        option
      );
    }
  }
  closeGuide() {
    if (this.isZoomOut) {
      this.dialogGuideZoomOut?.close();
    }
    if (this.isZoomIn) {
      this.dialogGuideZoomIn?.close();
    }
    this.isZoomOut = false;
    this.isZoomIn = false;
  }
  susscessStepEnd(event, step) {
    let count = this.listInstanceStepShow?.length - 1;
    let stepEnd;
    for (let i = count; i >= 0; i--) {
      if (
        !this.listInstanceStepShow[i]?.isSuccessStep &&
        !this.listInstanceStepShow[i]?.isFailStep
      ) {
        stepEnd = this.listInstanceStepShow[i];
        break;
      }
    }
    if (stepEnd?.recID == step?.recID) {
      this.isSusscess.emit(true);
    }
  }
  toggleReason() {
    this.isShowSuccess = !this.isShowSuccess;
  }

  eventAddTaskAssign(e) {
    if (e) {
      this.addTaskHaveAssign.emit(e);
    }
  }
}
