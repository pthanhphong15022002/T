import { filter } from 'rxjs';
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
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  ViewModel,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstancesStepsReasons } from '../../models/tmpModel';
import {
  CardRenderedEventArgs,
  CardSettingsModel,
  ColumnsModel,
  DialogSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import { extend, addClass } from '@syncfusion/ej2-base';
import { CodxStepTaskComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-step-task/codx-step-task.component';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';
@Component({
  selector: 'step-task',
  templateUrl: './step-task.component.html',
  styleUrls: ['./step-task.component.scss'],
})
export class StepTaskComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('task') task: CodxStepTaskComponent;
  @ViewChild('popupGuide') popupGuide;
  @ViewChild('cardKanban') cardKanban: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban: TemplateRef<any>;
  applyProcess = false; // 2 = hợp đồng
  @Input() dataCM; // CM_Customers, CM_Deal, CM_Lead, CM_Case, CM_Contracts
  @Input() isAdmin = false;
  @Input() applyFor;
  @Input() owner = '';

  @Input() isPause = false;
  @Input() isDataLoading = false;
  // @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() listInstanceStep: any[];
  @Input() entityName = '';
  @Input() isChangeOwner: string;

  @Input() customerName: string;
  @Input() dealName: string;
  @Input() contractName: string;
  @Input() leadName: string;
  @Input() isHeightAuto = true;
  @Input() taskAdd;
  @Input() isViewStep = false;
  @Input() isMoveStage = false;

  @Output() continueStep = new EventEmitter<any>();
  @Output() saveAssignTask = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();
  @Output() isSusscess = new EventEmitter<any>();
  @Output() moveStage = new EventEmitter<any>();
  @Output() startStep = new EventEmitter<any>();
  @ViewChild('viewReason', { static: true }) viewReason;
  dialogPopupReason: DialogRef;
  isRoleFullStep = false;
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
  listStepSuccess: tmpInstancesStepsReasons[] = [];
  listStepFail: tmpInstancesStepsReasons[] = [];
  stepIdReason: string = '';
  dialogGuideZoomIn: DialogRef;
  dialogGuideZoomOut: DialogRef;
  stepViews = [];
  isZoomIn = false;
  isZoomOut = false;
  isShow = false;
  isShowSuccess = false;
  isShowFail = false;
  isRoleFull = false;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  elementRef: any;
  renderer: any;
  taskHeight = '415px';
  user;
  isAddTask = false;
  dataTaskAdd;
  listType: any = [];
  listTask = [];

  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName2 = 'DP_Processes';
  className = 'InstancesStepsBusiness';
  method = 'LoadDataColumnsAsync';
  idField = 'recID';
  views: Array<ViewModel> = [];
  request: ResourceModel;
  resourceKanban: ResourceModel;
  funcID = '';

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private callfc: CallFuncService,
    private stepService: StepService,
    private callFunc: CallFuncService,
    private codxCmService: CodxCmService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef
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
    this.request = new ResourceModel();
    this.request.service = 'DP';
    this.request.assemblyName = 'DP';
    this.request.className = 'InstancesStepsBusiness';
    this.request.method = 'LoadDataColumnsAsync';
    this.request.idField = 'recID';
    this.request.dataObj = { instanceID: this.dataCM?.refID };

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = { processID: this.dataCM?.processID };

    this.funcID = 'CM0201';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.listInstanceStep) {
      let listInStep = changes?.listInstanceStep?.currentValue;
      this.listInstanceStepShow = [];
      if (!listInStep) {
        this.isDataLoading = true;
      } else if (listInStep?.length == 0) {
        this.isDataLoading = false;
      } else {
        this.isDataLoading = false;
        this.listInstanceStepShow = this.listInstanceStep;
        if (!['0', '1', '2', '15'].includes(this.dataCM?.status)) {
          this.stepIdReason =
            this.listInstanceStep[this.listInstanceStep?.length - 1].stepID;
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
        this.listInstanceStepShow?.forEach((step) => {
          this.listTask = [...this.listTask, ...step?.tasks];
        });
      }
    }
    if (changes?.dataCM) {
      this.type = this.dataCM.viewModeDetail || 'S';
      if (this.isAdmin) {
        this.isRoleFullStep = true;
      } else {
        this.isRoleFullStep = this.dataCM?.owner == this.user?.userID;
        if (!this.isRoleFullStep) {
          let checkRole = this.dataCM?.permissions?.some(
            (x) => x?.objectID == this.user?.userID && x?.memberType == '1'
          );
          this.isRoleFullStep = checkRole ? true : false;
        }
      }
      if (this.entityName == 'CM_Customers') {
        this.applyProcess = false;
      }
      // else if(this.entityName == 'CM_Deals')
      // {
      //   this.applyProcess = true;
      // }
      else {
        this.applyProcess = this.dataCM?.applyProcess;
      }
      this.owner = this.dataCM?.owner;
    }

    if (changes?.taskAdd && changes?.taskAdd?.currentValue?.task) {
      this.dataTaskAdd = JSON.parse(JSON.stringify(this.taskAdd));
      this.taskAdd.task = null;
      this.isAddTask = true;
    } else {
      this.isAddTask = false;
    }
  }

  ngAfterViewInit(): void {
    !this.isHeightAuto && this.setHeight();
    let a = document.getElementById('container-step');
    if (a) {
      console.log('------------', a);
      const computedWidth = window.getComputedStyle(a).width;
      console.log(computedWidth);
    }
    this.views = [
      {
        id: '6',
        type: 6,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
    ];

    this.changeDetectorRef.detectChanges();
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
    if (event) {
      this.nextStep();
    }
  }

  // continueStep(isTaskEnd) {
  //   let isShowFromTaskAll = false;
  //   let isShowFromTaskEnd = !this.checkContinueStep(true);
  //   let isContinueTaskEnd = isTaskEnd;
  //   let isContinueTaskAll = this.checkContinueStep(false);
  //   let dataInstance = {
  //     instance: this.instance,
  //     listStep: this.listStep,
  //     step: this.step,
  //     isAuto: {
  //       isShowFromTaskAll,
  //       isShowFromTaskEnd,
  //       isContinueTaskEnd,
  //       isContinueTaskAll,
  //     },
  //   };
  //   this.serviceInstance.autoMoveStage(dataInstance);
  // }

  // checkContinueStep(isDefault) {
  //   let check = true;
  //   let listTask = isDefault
  //     ? this.step?.tasks?.filter((task) => task?.requireCompleted)
  //     : this.step?.tasks;
  //   if (listTask?.length <= 0) {
  //     return isDefault ? true : false;
  //   }
  //   for (let task of listTask) {
  //     if (task.progress != 100) {
  //       check = false;
  //       break;
  //     }
  //   }
  //   return check;
  // }

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
    var datas = [processId, applyFor];
    this.codxCmService.getListReasonByProcessId(datas).subscribe((res) => {
      if (res) {
        this.listStepSuccess = this.convertStepsReason(res[0]);
        this.listStepFail = this.convertStepsReason(res[1]);
        this.listStepReason = this.getReasonByStepId(this.dataCM.status);
      }
    });
  }

  convertStepsReason(reasons: any) {
    var listReasonInstance = [];
    for (let item of reasons) {
      var reasonInstance = new tmpInstancesStepsReasons();
      reasonInstance.processID = this.dataCM.processID;
      reasonInstance.stepID = item.stepID;
      reasonInstance.instanceID = this.dataCM.refID;
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
    await this.getListReason(this.dataCM.processID, this.applyFor);
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
    if (this.listReasonsClick.length > 0 && this.listReasonsClick) {
      var data = [this.dataCM.refID, this.stepIdReason, this.listReasonsClick];
      this.codxCmService.updateListReason(data).subscribe((res) => {
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
            if (this.dataCM.closed) {
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
    var data = [this.dataCM.refID, this.dataCM.stepID, dataReason.recID];
    this.codxCmService.deleteListReason(data).subscribe((res) => {
      if (res) {
        let idx = this.listStepReasonValue.findIndex(
          (x) => x.recID === dataReason.recID
        );
        if (idx >= 0) this.listStepReasonValue.splice(idx, 1);
        this.notiService.notifyCode('SYS008');
        return;
      }
    });
  }

  //#region Kanban

  //#endregion

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    !this.isHeightAuto && this.setHeight();
  }

  setHeight() {
    setTimeout(() => {
      const main = document.querySelector('.codx-detail-main') as HTMLElement;
      const mainHeight = main.offsetHeight;
      let taskHeight = mainHeight - 330;
      if (taskHeight) {
        this.taskHeight = taskHeight.toString() + 'px';
        // this.renderer.setStyle(listTask, 'height', taskHeight.toString() + 'px');
      }
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
  setTask(stepID) {
    if (!this.dataTaskAdd || !this.dataTaskAdd?.task) {
      return null;
    } else {
      let data =
        stepID == this.dataTaskAdd?.task?.stepID ? this.dataTaskAdd : null;
      if (data) {
        this.isAddTask = false;
      }
      return data;
    }
  }
  nextStep() {
    this.moveStage.emit(true);
  }
  startStepFunction() {
    this.startStep.emit(true);
  }
  getObjectName(data) {
    return data.roles.find((x) => x.objectID == data?.owner)?.objectName;
  }
  public cardSettings: CardSettingsModel = {
    contentField: 'Summary',
    headerField: 'Id',
    tagsField: 'Tags',
    grabberField: 'Color',
    footerCssField: 'ClassName',
  };

  public dialogSettings: DialogSettingsModel = {
    fields: [
      { text: 'ID', key: 'Title', type: 'TextBox' },
      { key: 'Status', type: 'DropDown' },
      { key: 'Assignee', type: 'DropDown' },
      { key: 'RankId', type: 'TextBox' },
      { key: 'Summary', type: 'TextArea' },
    ],
  };
  public getString(assignee: string) {
    return assignee
      .match(/\b(\w)/g)
      .join('')
      .toUpperCase();
  }
  // public columns: ColumnsModel[] = [
  //   { headerText: 'To Do', keyField: 'Open', allowToggle: true },
  //   { headerText: 'In Progress', keyField: 'InProgress', allowToggle: true },
  //   { headerText: 'In Review', keyField: 'Review', allowToggle: true },
  //   { headerText: 'Done', keyField: 'Close', allowToggle: true }
  // ];
  cardRendered(args: CardRenderedEventArgs): void {
    const val: string = (<{ [key: string]: Object }>args.data)
      .Priority as string;
    addClass([args.element], val);
  }
  kanbanData: Object[] = [
    {
      Id: 'Task 1',
      Title: 'Task - 29001',
      Status: ' a49a2391-a101-400c-ac45-c2c40cbcdee9',
      Summary: 'Analyze the new requirements gathered from the customer.',
      Type: 'Story',
      Priority: 'Low',
      Tags: 'Analyze,Customer',
      Estimate: 3.5,
      Assignee: 'Nancy Davloio',
      RankId: 1,
      Color: '#02897B',
      ClassName: 'e-story, e-low, e-nancy-davloio',
    },
    {
      Id: 'Task 2',
      Title: 'Task - 29002',
      Status: ' a49a2391-a101-400c-ac45-c2c40cbcdee9',
      Summary: 'Improve application performance',
      Type: 'Improvement',
      Priority: 'Normal',
      Tags: 'Improvement',
      Estimate: 6,
      Assignee: 'Andrew Fuller',
      RankId: 2,
      Color: '#673AB8',
      ClassName: 'e-improvement, e-normal, e-andrew-fuller',
    },
    {
      Id: 'Task 3',
      Title: 'Task - 29003',
      Status: ' 25e80568-288f-4981-af25-964c6d5e1f7e',
      Summary:
        'Arrange a web meeting with the customer to get new requirements.',
      Type: 'Others',
      Priority: 'Critical',
      Tags: 'Meeting',
      Estimate: 5.5,
      Assignee: 'Janet Leverling',
      RankId: 2,
      Color: '#1F88E5',
      ClassName: 'e-others, e-critical, e-janet-leverling',
    },
    {
      Id: 'Task 4',
      Title: 'Task - 29004',
      Status: ' aceb053d-3673-4b6a-88b2-80a474a8d43b',
      Summary: 'Fix the issues reported in the IE browser.',
      Type: 'Bug',
      Priority: 'Critical',
      Tags: 'IE',
      Estimate: 2.5,
      Assignee: 'Janet Leverling',
      RankId: 2,
      Color: '#E64A19',
      ClassName: 'e-bug, e-release, e-janet-leverling',
    },
    {
      Id: 'Task 5',
      Title: 'Task - 29005',
      Status: 'aceb053d-3673-4b6a-88b2-80a474a8d43b',
      Summary: 'Fix the issues reported by the customer.',
      Type: 'Bug',
      Priority: 'Low',
      Tags: 'Customer',
      Estimate: '3.5',
      Assignee: 'Steven walker',
      RankId: 1,
      Color: '#E64A19',
      ClassName: 'e-bug, e-low, e-steven-walker',
    },
    {
      Id: 'Task 6',
      Title: 'Task - 29007',
      Status: 'Validate',
      Summary: 'Validate new requirements',
      Type: 'Improvement',
      Priority: 'Low',
      Tags: 'Validation',
      Estimate: 1.5,
      Assignee: 'Robert King',
      RankId: 1,
      Color: '#673AB8',
      ClassName: 'e-improvement, e-low, e-robert-king',
    },
    {
      Id: 'Task 7',
      Title: 'Task - 29009',
      Status: 'Review',
      Summary: 'Fix the issues reported in Safari browser.',
      Type: 'Bug',
      Priority: 'Critical',
      Tags: 'Fix,Safari',
      Estimate: 1.5,
      Assignee: 'Nancy Davloio',
      RankId: 2,
      Color: '#E64A19',
      ClassName: 'e-bug, e-release, e-nancy-davloio',
    },
    {
      Id: 'Task 8',
      Title: 'Task - 29010',
      Status: 'Close',
      Summary: 'Test the application in the IE browser.',
      Type: 'Story',
      Priority: 'Low',
      Tags: 'Review,IE',
      Estimate: 5.5,
      Assignee: 'Margaret hamilt',
      RankId: 3,
      Color: '#02897B',
      ClassName: 'e-story, e-low, e-margaret-hamilt',
    },
    {
      Id: 'Task 9',
      Title: 'Task - 29011',
      Status: 'Validate',
      Summary: 'Validate the issues reported by the customer.',
      Type: 'Story',
      Priority: 'High',
      Tags: 'Validation,Fix',
      Estimate: 1,
      Assignee: 'Steven walker',
      RankId: 1,
      Color: '#02897B',
      ClassName: 'e-story, e-high, e-steven-walker',
    },
    {
      Id: 'Task 10',
      Title: 'Task - 29015',
      Status: 'Open',
      Summary: 'Show the retrieved data from the server in grid control.',
      Type: 'Story',
      Priority: 'High',
      Tags: 'Database,SQL',
      Estimate: 5.5,
      Assignee: 'Margaret hamilt',
      RankId: 4,
      Color: '#02897B',
      ClassName: 'e-story, e-high, e-margaret-hamilt',
    },
    {
      Id: 'Task 11',
      Title: 'Task - 29016',
      Status: 'InProgress',
      Summary: 'Fix cannot open user’s default database SQL error.',
      Priority: 'Critical',
      Type: 'Bug',
      Tags: 'Database,Sql2008',
      Estimate: 2.5,
      Assignee: 'Janet Leverling',
      RankId: 4,
      Color: '#E64A19',
      ClassName: 'e-bug, e-critical, e-janet-leverling',
    },
  ];
}
