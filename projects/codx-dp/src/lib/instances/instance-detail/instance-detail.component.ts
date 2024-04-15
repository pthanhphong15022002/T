import {
  DP_Steps,
  DP_Instances_Steps,
  DP_Instances,
  DP_Instances_Steps_Reasons,
} from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  CRUDService,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogRef,
  FormModel,
  AuthStore,
  CodxDetailTmpComponent,
  SidebarModel,
  CodxService,
} from 'codx-core';
import { InstancesComponent } from '../instances.component';
import { DomSanitizer } from '@angular/platform-browser';
import { StagesDetailComponent } from './stages-detail/stages-detail.component';
import { ActivatedRoute } from '@angular/router';
import { CodxTabsComponent } from 'projects/codx-share/src/lib/components/codx-tabs/codx-tabs.component';
import { CodxViewTaskComponent } from '../../share-crm/codx-step/codx-view-task/codx-view-task.component';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.scss'],
})
export class InstanceDetailComponent implements OnInit {
  @ViewChild('codxStage') codxStage: StagesDetailComponent;
  @ViewChild('tabFooter') tabFooter: CodxTabsComponent;
  @ViewChild('viewDetail') viewDetail: CodxDetailTmpComponent;
  @Input() formModel: any;
  @Input() stepName: string;
  @Input() progress = '0';
  @Input() dataSelect: any;
  @Input() listStepsProcess: any;
  @Input() listCbxProccess: any;
  @Input() viewModelDetail = 'S';
  @ViewChild('viewDetailsItem') viewDetailsItem;
  // @Input() viewType = 'd';
  @Input() listSteps: DP_Instances_Steps[] = []; //instanceStep
  @Input() tabInstances = [];
  @Input() viewsCurrent = '';
  @Input() moreFunc: any;
  // @Input() reloadData = false;
  @Input() stepStart: any;
  @Input() vllApprover = 'DP043';
  @Input() reasonStepsObject: any;
  @Input() lstStepProcess = [];
  @Input() colorFail: any;
  @Input() colorSuccesss: any;
  // View deatail Of approrver
  @Input() runMode = '';
  @Input() hideMF = false;
  @Input() autoNameTabFields: string;
  @Input() applyFor: any;
  @Input() isChangeOwner: any;
  @Input() progressControl: any;

  @Output() progressEvent = new EventEmitter<object>();
  @Output() moreFunctionEvent = new EventEmitter<any>();
  @Output() clickStartInstances = new EventEmitter<any>();
  @Output() saveDatasInstance = new EventEmitter<any>();
  @Output() outStepInstance = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @Output() autoStartInstance = new EventEmitter<any>();

  @Output() changeProgress = new EventEmitter<any>();
  @Output() move = new EventEmitter<any>();

  id: any;
  isView = false;
  totalInSteps: any;
  tmpDataSteps: DP_Instances_Steps;
  currentNameStep: Number;
  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  idCbx = 'S';
  listStepInstance: any;
  instanceStatus: any;
  currentStep = 0;
  isChangeData = false;
  listTypeTask = [];

  dialogPopupDetail: DialogRef;
  currentElmID: any;
  frmModelInstancesTask: FormModel;
  moreFuncCrr: any;
  listReasonSuccess: DP_Instances_Steps_Reasons[] = [];
  listReasonFail: DP_Instances_Steps_Reasons[] = [];
  isOnlyView: boolean = true;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    // { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  titleDefault = '';

  isHiddenReason: boolean = false;

  instanceId: string;
  proccesNameMove: string;
  onwer: string;
  lstInv = '';
  stepValue = {};
  readonly strInstnace: string = 'instnace';
  readonly strInstnaceStep: string = 'instnaceStep';
  treeTask = [];
  isSaving = false;
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  isStart = false;
  user: any;
  maxSize: number = 4;
  ownerInstance: string[] = [];
  HTMLProgress = `<div style="font-size:12px;font-weight:bold;color:#005DC7;fill:#005DC7;margin-top: 2px;"><span></span></div>`;
  //gan chart
  //gantchat
  ganttDs = [];
  ganttDsClone = [];
  dataColors = [];
  taskFields = {
    id: 'recID',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    type: 'type',
    color: 'color',
  };
  vllViewGannt = 'DP042';
  crrViewGant = 'W';
  columns = [
    { field: 'name', headerText: 'Tên', width: '250' },
    { field: 'startDate', headerText: 'Ngày bắt đầu' },
    { field: 'endDate', headerText: 'Ngày kết thúc' },
  ];
  timelineSettings: any;
  tags = '';
  stepIDFirst = '';
  timelineSettingsHour: any = {
    topTier: {
      unit: 'Day',
      formatter: (date: Date) => {
        let day = date.getDay();
        let text = '';
        if (day == 0) {
          text = 'Chủ nhật';
        }
        if (day == 1) {
          text = 'Thứ Hai';
        }
        if (day == 2) {
          text = 'Thứ Ba';
        }
        if (day == 3) {
          text = 'Thứ Tư';
        }
        if (day == 4) {
          text = 'Thứ Năm';
        }
        if (day == 5) {
          text = 'Thứ Sáu';
        }
        if (day == 6) {
          text = 'Thứ Bảy';
        }
        return `${text} ( ${date.toLocaleDateString()} )`; // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Hour',
      //format: 'HH',
      formatter: (h: Date) => {
        return h.getHours();
      },
    },
    timelineUnitSize: 25,
  };
  timelineSettingsDays = {
    topTier: {
      unit: 'Month',
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1) + '-' + date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Day',
      count: 1,
      formatter: (date: Date) => {
        let day = date.getDay();
        let text = '';
        if (day == 0) {
          text = 'Chủ nhật';
        }
        if (day == 1) {
          text = 'Thứ Hai';
        }
        if (day == 2) {
          text = 'Thứ Ba';
        }
        if (day == 3) {
          text = 'Thứ Tư';
        }
        if (day == 4) {
          text = 'Thứ Năm';
        }
        if (day == 5) {
          text = 'Thứ Sáu';
        }
        if (day == 6) {
          text = 'Thứ Bảy';
        }
        return `${text} ( ${date.toLocaleDateString()} )`;
      },
    },
    timelineUnitSize: 150,
  };
  timelineSettingsWeek = {
    topTier: {
      unit: 'Month',
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1) + '-' + date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Week',
      count: 1,
      formatter: (date: Date) => {
        return date.toLocaleDateString();
      },
    },
    timelineUnitSize: 100,
  };
  timelineSettingsMonth = {
    topTier: {
      unit: 'Year',
      formatter: (date: Date) => {
        return date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Month',
      count: 1,
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1);
      },
    },
    timelineUnitSize: 100,
  };
  //end gan
  loaded: boolean;
  listRefTask = []; //chuoi recID cua task

  //approver
  active = 1;
  approveStatus = '0';
  aproveTranID = ''; //instance CRR
  listIDTransApprove = [];
  asideMode: string;
  listRecIDAddNew: any;

  constructor(
    private callfc: CallFuncService,
    private dpSv: CodxDpService,
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetec: ChangeDetectorRef,
    private callFC: CallFuncService,
    private popupInstances: InstancesComponent,
    public sanitizer: DomSanitizer,
    private authStore: AuthStore,
    private router: ActivatedRoute,
    private serviceInstance: InstancesComponent,
    private codxService: CodxService
  ) {
    this.cache.functionList('DPT03').subscribe((fun) => {
      if (fun) this.titleDefault = fun.customName || fun.description;
    });
    this.user = this.authStore.get();
    this.asideMode = codxService.asideMode;
    this.cache.functionList('DPT040102').subscribe((res) => {
      if (res) {
        let formModel = new FormModel();
        formModel.formName = res?.formName;
        formModel.gridViewName = res?.gridViewName;
        formModel.entityName = res?.entityName;
        formModel.funcID = 'DPT040102';
        this.frmModelInstancesTask = formModel;
      }
    });
    this.timelineSettings = this.timelineSettingsWeek;
  }

  async ngOnInit(): Promise<void> {
    if (this.dataSelect?.permissions?.length > 0) {
      this.ownerInstance =
        this.dataSelect?.permissions
          .filter((role) => role.roleType == 'O')
          ?.map((item) => {
            return item.objectID;
          }) || [];
    }
    this.ownerInstance.push(this.dataSelect?.owner);

    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.viewModelDetail) this.viewModelDetail = 'S';
    this.rollHeight();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['dataSelect']) {
      var instance = changes['dataSelect']?.currentValue as DP_Instances;
      if (instance?.recID == null || instance?.recID === this.id) return;
      this.loaded = false; /// bien này không cần cũng được tại luôn có dataSelect -- bỏ loader vào  loadChangeData thì bị giật
      this.id = instance?.recID;
      this.loadChangeData();
      this.listRecIDAddNew = [];
      this.isChangeData = false;
      this.isView = ["3","4","5","6"].includes(instance?.status) || instance?.closed || instance?.approveStatus == "3";
    }
  }

  loadChangeData() {
    this.instanceStatus = this.dataSelect.status;
    this.autoNameTabFields = JSON.parse(JSON.stringify(this.autoNameTabFields));
    this.GetStepsByInstanceIDAsync();
    // this.getDataGanttChart(this.dataSelect.recID, this.dataSelect.processID);
    this.listReasonBySteps(this.reasonStepsObject);
    this.maxSize = 4;
    this.isOnlyView = true;
    this.changeDetec.detectChanges();
  }

  GetStepsByInstanceIDAsync() {
    this.tags = '';
    var data = [
      this.id,
      this.dataSelect.processID,
      this.instanceStatus,
      this.applyFor,
    ];
    this.dpSv.GetStepsByInstanceIDAsync(data).subscribe((res) => {
      if (res && res?.length > 0) {
        this.tags = this.dataSelect?.tags;
        this.listStepInstance = JSON.parse(JSON.stringify(res));
        this.listSteps = res;
        this.stepIDFirst = this.listSteps[0]?.recID;
        this.getViewApprove();

        if (this.applyFor != '0') this.getListTaskRef();
        //this.loadTree(this.id); // load khi change tabs

        this.handleProgressInstance();
        if (this.runMode != '1') {
          this.getStageByStep();
        }
      } else {
        this.listSteps = [];
        this.stepName = '';
        this.progress = '0';
        this.tmpDataSteps = null;
      }

      this.loaded = true;
    });
  }
  getViewApprove() {
    this.listIDTransApprove = this.listStepInstance.map((x) => x.recID);
    this.aproveTranID = this.listStepInstance.find(
      (x) => x.stepID == this.dataSelect.stepID
    )?.recID;
  }

  saveDataStep(e) {
    let stepInsIdx = this.listSteps.findIndex((x) => {
      x.recID == e.recID;
    });
    if (stepInsIdx != -1) {
      this.listSteps[stepInsIdx] = e;
    }
    if (e?.fields?.length > 0) this.updateDuplicateField(e);
    //datas đã get từ trong ra nên ko cần cái này nữa
    //this.loadingDatas();
  }

  updateDuplicateField(step) {
    let fields = step.fields;
    this.listSteps.forEach((st) => {
      if (st?.fields?.length > 0 && st.recID != step.recID) {
        fields.forEach((f) => {
          let idxField = st.fields.findIndex(
            (x) => x.fieldName == f.fieldName && x.dataValue != f.dataValue
          );
          if (idxField != -1) {
            st.fields[idxField].dataValue = f.dataValue;
          }
        });
      }
    });
  }

  loadingDatas() {
    let listField = [];
    this.listSteps.forEach((st) => {
      listField = listField.concat(st.fields);
    });
    let datas = '';
    if (listField?.length > 0) {
      listField.forEach((obj) => {
        datas += '"' + obj.fieldName + '":"' + obj.dataValue + '",';
      });
    }
    datas = datas.substring(0, datas.length - 1);
    datas = '[{' + datas + '}]';
    this.dataSelect.datas = datas;
    this.saveDatasInstance.emit(datas);
  }

  getStageByStep() {
    this.isStart =
      this.listSteps?.length > 0 && this.listSteps[0]['startDate']
        ? true
        : false;
    for (var i = 0; i < this.listSteps.length; i++) {
      var stepNo = i;
      var data = this.listSteps[i];
      if (data.stepID == this.dataSelect.stepID) {
        this.lstInv = this.getInvolved(data.roles);
        this.stepName = data.stepName;
        this.currentStep = stepNo;
        this.currentNameStep = this.currentStep;
        // this.tmpDataSteps = JSON.parse(JSON.stringify(data));
        this.tmpDataSteps = data;
        this.outStepInstance.emit({ data: this.tmpDataSteps });
        this.stepValue = {
          textColor: data.textColor,
          backgroundColor: data.backgroundColor,
          icon: data.icon,
          iconColor: data.iconColor,
        };
      }
      stepNo = i + 1;
    }
    this.currentStep = this.listSteps.findIndex((x) => x.stepStatus === '1');
    this.checkCompletedInstance(this.instanceStatus);
  }

  getInvolved(roles) {
    var id = '';
    if (roles != null && roles.length > 0) {
      var lstRole = roles.filter((x) => x.roleType == 'R');
      lstRole.forEach((element) => {
        if (!id.split(';').includes(element.objectID)) {
          id = id + ';' + element.objectID;
        }
      });
    }
    return id;
  }

  sortListSteps(ins, process) {
    var listStep = process?.steps.sort(function (x, y) {
      return x.stepNo > 0 && y.stepNo > 0
        ? x.stepNo - y.stepNo
        : x.stepNo > 0
        ? -1
        : y.stepNo > 0
        ? 1
        : x.stepNo - y.stepNo;
    });
    ins = listStep
      .reduce((result, x) => {
        let matches = ins.filter((y) => x.recID === y.stepID);
        if (matches.length) {
          result.push(matches[0]);
        }
        return result;
      }, [])
      .sort((x, y) => {
        let firstStep = listStep.find((z) => z.recID === y.stepID);
        return listStep.indexOf(firstStep);
      });

    return ins;
  }

  cbxChange(e) {
    this.viewModelDetail = e?.data;
  }

  clickMF(e, data) {
    this.moreFunctionEvent.emit({
      e: e,
      data: data,
      lstStepCbx: this.listStepInstance,
    });
  }

  changeDataMF(e, data) {
    this.changeMF.emit({
      e: e,
      data: data,
      listStepCbx: this.listSteps,
      isStart: this.isStart,
    });
  }
  clickStage($event) {
    if ($event) {
      var indexNo = $event?.indexNo;
      var stepId = $event?.id;
      this.isOnlyView = $event?.isOnlyView;
      this.currentNameStep = indexNo;
      var indx = this.listSteps.findIndex((x) => x.stepID == stepId);
      this.tmpDataSteps = this.listSteps[indx];
      this.outStepInstance.emit({ data: this.tmpDataSteps });
      this.lstInv = this.getInvolved(this.tmpDataSteps.roles);
      this.onwer = this.tmpDataSteps?.owner; // nhớ cho phép null cái
    }
  }

  setHTMLCssStages(oldStage, newStage) {}

  //ganttchar
  // getDataGanttChart(instanceID, processID) {
  //   this.api
  //     .exec<any>('DP', 'InstancesStepsBusiness', 'GetDataGanntChartAsync', [
  //       instanceID,
  //       processID,
  //     ])
  //     .subscribe((res) => {
  //       if (res && res?.length > 0) {
  //         this.ganttDs = res;
  //         this.ganttDsClone = JSON.parse(JSON.stringify(this.ganttDs));
  //         let test = this.ganttDsClone.map((i) => {
  //           return {
  //             name: i.name,
  //             start: i.startDate,
  //             end: i.endDate,
  //           };
  //         });

  //         this.changeDetec.detectChanges();
  //       }
  //     });
  // }
  // getColor(recID) {
  //   var idx = this.ganttDs.findIndex((x) => x.recID == recID);
  //   return this.ganttDs[idx]?.color;
  // }
  clickDetailGanchart(recID) {
    let data = this.ganttDsClone?.find((item) => item.recID === recID);
    if (data) {
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      let listData = {
        value: data,
        listIdRoleInstance: this.ownerInstance,
        type: data?.type,
      };
      let option = new SidebarModel();
      option.Width = '550px';
      option.zIndex = 1011;
      option.FormModel = frmModel;
      let dialog = this.callfc.openSide(
        CodxViewTaskComponent,
        listData,
        option
      );
      dialog.closed.subscribe((data) => {
        let dataProgress = data?.event;
        if (dataProgress) {
          let stepFind = this.listSteps.find(
            (step) => step.recID == dataProgress?.stepID
          );
          if (stepFind) {
            if (dataProgress?.type == 'P') {
              stepFind.progress = dataProgress?.progressStep;
              stepFind.note = dataProgress?.note;
              stepFind.actualEnd = dataProgress?.actualEnd;
            } else if (dataProgress?.type == 'G') {
              let groupFind = stepFind?.taskGroups?.find(
                (group) => group?.recID == dataProgress?.groupTaskID
              );
              if (groupFind) {
                groupFind.progress = dataProgress?.progressGroupTask;
                groupFind.note = dataProgress?.note;
                groupFind.actualEnd = dataProgress?.actualEnd;
                if (dataProgress?.isUpdate) {
                  stepFind.progress = dataProgress?.progressStep;
                }
              }
            } else {
              let taskFind = stepFind?.tasks?.find(
                (task) => task?.recID == dataProgress?.taskID
              );
              if (taskFind) {
                taskFind.progress = dataProgress?.progressTask;
                taskFind.note = dataProgress?.note;
                taskFind.actualEnd = dataProgress?.actualEnd;
                if (dataProgress?.isUpdate) {
                  let groupFind = stepFind?.taskGroups?.find(
                    (group) => group?.recID == dataProgress?.groupTaskID
                  );
                  if (groupFind) {
                    groupFind.progress = dataProgress?.progressGroupTask;
                  }
                  stepFind.progress = dataProgress?.progressStep;
                }
              }
            }
          }
        }
        console.log(dataProgress?.event);
      });
    }
  }
  // getTaskEnd(step) {
  //   let countGroup = this.listGroupTask?.length;
  //   if (countGroup > 0) {
  //     for (let i = countGroup - 1; i >= 0; i--) {
  //       const groupTask = this.listGroupTask[i];
  //       const task = groupTask?.task
  //         ?.slice()
  //         .reverse()
  //         .find((t) => t?.isTaskDefault);
  //       if (task) {
  //         this.idTaskEnd = task.recID;
  //         this.progressTaskEnd = task?.progress || 0;
  //         return;
  //       }
  //     }
  //   }
  // }

  continueStep(isTaskEnd, step) {
    let isShowFromTaskAll = false;
    let isShowFromTaskEnd = !this.checkContinueStep(true, step);
    let isContinueTaskEnd = isTaskEnd;
    let isContinueTaskAll = this.checkContinueStep(false, step);
    let dataInstance = {
      instance: this.dataSelect,
      listStep: this.listSteps,
      step: step,
      isAuto: {
        isShowFromTaskAll,
        isShowFromTaskEnd,
        isContinueTaskEnd,
        isContinueTaskAll,
      },
    };
    this.serviceInstance.autoMoveStage(dataInstance);
  }
  checkContinueStep(isDefault, step) {
    let check = true;
    let listTask = isDefault
      ? step?.tasks?.filter((task) => task?.requireCompleted)
      : step?.tasks;
    if (listTask?.length <= 0) {
      return isDefault ? true : false;
    }
    for (let task of listTask) {
      if (task.progress != 100) {
        check = false;
        break;
      }
    }
    return check;
  }

  changeViewTimeGant(e) {
    this.crrViewGant = e.data;
    switch (this.crrViewGant) {
      case 'D':
        this.timelineSettings = this.timelineSettingsDays;
        break;
      case 'H':
        this.timelineSettings = this.timelineSettingsHour;
        break;
      case 'W':
        this.timelineSettings = this.timelineSettingsWeek;
        break;
      case 'M':
        this.timelineSettings = this.timelineSettingsMonth;
        break;
    }
    this.changeDetec.detectChanges();
  }
  //end ganttchar

  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  checkCompletedInstance(instanceStatus: any) {
    if (
      instanceStatus == '1' ||
      instanceStatus == '2' ||
      instanceStatus == '15'
    ) {
      this.deleteListReason(this.listSteps);
    }
  }

  getbackgroundColor(step) {
    return step?.backgroundColor
      ? '--primary-color:' + step?.backgroundColor
      : '--primary-color: #23468c';
  }

  getColorStepName(status: string) {
    if (status === '1') {
      return 'step current';
    } else if (
      status === '3' ||
      status === '4' ||
      status === '5' ||
      status === '' ||
      status === null
    ) {
      return 'step old';
    }
    return 'step';
  }

  getReasonByStepId(status: string) {
    if (status == '3' || status == '4') return this.listReasonSuccess;
    if (status == '5' || status == '6') return this.listReasonFail;
    return null;
  }
  listReasonBySteps(reasonStepsObject) {
    if (reasonStepsObject) {
      this.listReasonSuccess = this.convertStepsReason(
        reasonStepsObject.stepReasonSuccess
      );
      this.listReasonFail = this.convertStepsReason(
        reasonStepsObject.stepReasonFail
      );
    }
  }
  convertStepsReason(reasons: any) {
    var listReasonInstance = [];
    for (let item of reasons) {
      var reasonInstance = new DP_Instances_Steps_Reasons();
      reasonInstance.processID = this.dataSelect.processID;
      reasonInstance.stepID = item.stepID;
      reasonInstance.instanceID = this.dataSelect.recID;
      reasonInstance.reasonName = item.reasonName;
      reasonInstance.reasonType = item.reasonType;
      reasonInstance.createdBy = item.createdBy;
      listReasonInstance.push(reasonInstance);
    }
    return listReasonInstance;
  }
  getStepNameIsComlepte(data) {
    var idx = this.listSteps.findIndex(
      (x) => x.stepStatus == '4' || x.stepStatus == '5'
    );
    if (idx > -1) {
      var reasonStep = this.listSteps[idx];
      var indexProccess = this.listCbxProccess.findIndex(
        (x) => x.recID === data?.refID
      );
      if (indexProccess <= -1) {
        var indexProccess = this.listCbxProccess.findIndex(
          (x) => x.recID === this.guidEmpty
        );
      }
      var proccesMove = this.listCbxProccess[indexProccess];
      this.proccesNameMove = proccesMove?.processName;
    }
    return reasonStep?.stepName ?? '';
  }

  rollHeight() {
    this.maxSize = 6;
    this.isOnlyView = true;
    let classViewDetail: any;
    var heighOut = 25;
    if (this.viewsCurrent == 'd-') {
      classViewDetail = document.getElementsByClassName('codx-detail-main')[0];
    }
    if (!classViewDetail) return;
    let heightVD = classViewDetail.clientHeight;
    let classHeader = document.getElementsByClassName('codx-detail-header')[0];
    let heightHD = classHeader.clientHeight;
    let classFooter = document.getElementsByClassName('codx-detail-footer')[0];
    let heightFT = classFooter.clientHeight;

    var maxHeight = heightVD - heightHD - heightFT - heighOut;
    var div = document.getElementById('viewModeDetail');
    // if (div) {
    //   div.style.setProperty('max-height', maxHeight + 'px', 'important');
    // }
  }
  loadTree(recID) {
    if (this.applyFor == '0') {
      this.dpSv.getTreeBySession(recID).subscribe((res) => {
        if (res) this.treeTask = res;
      });
    } else {
      this.listRefTask = [];
      this.listStepInstance.forEach((x) => {
        let refTask = (x.tasks as Array<any>).map((x) => {
          return x.recID;
        });
        if (refTask?.length > 0) {
          this.listRefTask = this.listRefTask.concat(refTask);
        }
      });

      this.dpSv
        .getTreeByListRef(JSON.stringify(this.listRefTask))
        .subscribe((res) => {
          if (res) this.treeTask = res;
        });
    }
  }

  saveAssign(e) {
    if (e && this.tabFooter) {
      //this.loadTree(this.id);//cũ
      if (this.applyFor != '0') {
        // this.getListTaskRef();
        this.tabFooter.listRefID = this.listRefTask;
        this.tabFooter.sessionID = null;
      } else this.tabFooter.sessionID = this.id;
      this.tabFooter.changeTreeAssign();
    }
  }
  getListTaskRef() {
    this.listRefTask = [];
    this.listStepInstance.forEach((x) => {
      let refTask = (x.tasks as Array<any>).map((x) => {
        return x.recID;
      });
      if (refTask?.length > 0) {
        this.listRefTask = this.listRefTask.concat(refTask);
      }
    });
  }

  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
  }

  inputElmIDCustomField(e) {
    this.currentElmID = e;
  }
  actionSaveCustomField(e) {
    this.isSaving = e;
  }
  clickMenu(e) {
    this.viewModelDetail = e;
    this.isSaving = false;
    this.currentElmID = null;
    // if (this.viewModelDetail == 'G' && this.isChangeData) {
    //   this.getDataGanttChart(this.dataSelect.recID, this.dataSelect.processID);
    // }
  }

  startInstances() {
    this.clickStartInstances.emit(true);
  }

  checkOwnerRoleProcess(roles) {
    if (roles != null && roles.length > 0) {
      var checkOwner = roles.find((x) => x.roleType == 'S');

      return checkOwner != null ? checkOwner.objectID : null;
    } else {
      return null;
    }
  }

  handleProgressInstance(event?) {
    let listStepConvert = this.listSteps?.filter(
      (step) => !step.isSuccessStep && !step.isFailStep
    );
    if (listStepConvert?.length <= 0) {
      this.progress = '0';
      return;
    }
    if (['3', '4'].includes(this.dataSelect?.status)) {
      this.progress = '100';
      return;
    }

    if (this.dataSelect?.status == '2') {
    }

    if (event) {
      let stepFind = listStepConvert?.find(
        (step) => step.recID === event.recID
      );
      if (stepFind) {
        stepFind.progress = event?.progress || 0;
      }
    }
    if (this.progressControl) {
      let index = this.listSteps?.findIndex((step) => step.stepStatus == '1');
      let stepIns = index > 0 ? this.listSteps[index - 1] : null;
      let step = stepIns
        ? this.listStepsProcess?.find((step) => step.recID == stepIns?.stepID)
        : null;
      this.progress = index > 0 ? step?.instanceProgress.toString() : '0';
    } else {
      let index = listStepConvert.findIndex(
        (step) => step.stepID == this.dataSelect?.stepID
      );
      if (index < 0) {
        this.progress = '0';
      } else {
        let conut = listStepConvert?.length;
        if (conut > 0) {
          let a = parseFloat((100 / conut).toFixed(2));
          if (listStepConvert[index]?.progress == 0) {
            this.progress = (a * index).toFixed(2);
          } else {
            this.progress = (
              a * index +
              (listStepConvert[index]?.progress * a) / 100
            )?.toFixed(2);
          }
        }
      }
      // let sumProgress = listStepConvert.reduce((sum, step) => {
      //   return sum + (Number(step.progress) || 0);
      // }, 0);
      // this.progress = (sumProgress / listStepConvert?.length).toFixed(1);
    }
  }

  loadOwnerStep(owner) {
    if (this.codxStage) {
      this.codxStage.dataStep.owner = owner;
    }
    this.changeDetec.detectChanges();
  }

  handleViewFile(e: any) {
    // if (e == true) {
    //   var index = this.data.listInformationRel.findIndex(
    //     (x) => x.userID == this.userID && x.relationType != '1'
    //   );
    //   if (index >= 0) this.data.listInformationRel[index].view = '3';
    // }
  }

  getDetailSignFile(e) {}

  //continueStep(event) {
  //   let isTaskEnd = event?.isTaskEnd;
  //   let step = event?.step;

  //   let transferControl = this.dataSelected.steps.transferControl;
  //   if (transferControl == '0') return;

  //   let isShowFromTaskEnd = !this.checkContinueStep(true, step);
  //   let isContinueTaskEnd = isTaskEnd;
  //   let isContinueTaskAll = this.checkContinueStep(false, step);
  //   let isShowFromTaskAll = !isContinueTaskAll;

  //   if (transferControl == '1' && isContinueTaskAll) {
  //     isShowFromTaskAll && this.dealComponent.moveStage(this.dataSelected);
  //     !isShowFromTaskAll &&
  //       this.handleMoveStage(this.completedAllTasks(step), step.stepID);
  //   }

  //   if (transferControl == '2' && isContinueTaskEnd) {
  //     isShowFromTaskEnd && this.dealComponent.moveStage(this.dataSelected);
  //     !isShowFromTaskEnd &&
  //       this.handleMoveStage(this.completedAllTasks(step), step.stepID);
  //   }
  //}
  handleMoveStage(isStopAuto, stepID) {
    //   if (!isStopAuto) {
    //     this.dealComponent.moveStage(this.dataSelected);
    //   } else {
    //     let index = this.listSteps.findIndex((x) => x.stepID === stepID);
    //     let isUpdate = false;
    //     let nextStep;
    //     if (index != -1) {
    //       nextStep = this.listSteps.findIndex(
    //         (x) => x.stepID == this.listSteps[index + 1].stepID
    //       );
    //       if (nextStep != -1) {
    //         isUpdate = true;
    //       }
    //     }
    //     if (isUpdate) {
    //       var config = new AlertConfirmInputConfig();
    //       config.type = 'YesNo';
    //       this.notificationsService.alertCode('DP034', config).subscribe((x) => {
    //         if (x.event?.status == 'Y') {
    //           this.listSteps[nextStep].stepStatus = '1';
    //           this.listSteps[nextStep].actualStart = new Date();
    //           this.listSteps[index].stepStatus = '3';
    //           if (this.listSteps[index].actualEnd !== null) {
    //             this.listSteps[index].actualEnd = new Date();
    //           }
    //           var listInstanceStep = [];
    //           listInstanceStep.push(this.listSteps[index]);
    //           listInstanceStep.push(this.listSteps[nextStep]);
    //           var nextStepDeal = this.listSteps.find(
    //             (x) => x.stepID == this.listSteps[nextStep + 1].stepID
    //           );
    //           this.dataSelected.stepID = this.listSteps[nextStep].stepID;
    //           if (nextStepDeal) {
    //             this.dataSelected.nextStep = nextStepDeal.stepID;
    //           } else {
    //             this.dataSelected.nextStep = null;
    //           }
    //           this.promiseAll(listInstanceStep);
    //         }
    //       });
    //     }
    //   }
  }
  saveAssignTask(e) {
    // if (e) this.saveAssign.emit(e);
    //if (e) this.getTree();
  }
  autoStart(event) {
    this.changeProgress.emit(event);
  }

  addTaskHaveAssign(e) {
    if (e) {
      this.listRefTask.push(e);
    }
    if (this.tabFooter && this.applyFor != '0') {
      this.tabFooter.listRefID = this.listRefTask;
      this.tabFooter.changeTreeAssign();
    }
  }
}
