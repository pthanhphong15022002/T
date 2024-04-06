import {
  Input,
  OnInit,
  Output,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import {
  AuthStore,
  FormModel,
  DialogModel,
  CodxService,
  CacheService,
  ApiHttpService,
  SidebarModel,
  CallFuncService,
  NotificationsService,
  AlertConfirmInputConfig,
  Util,
  DialogRef,
  TenantStore,
} from 'codx-core';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { FormGroup } from '@angular/forms';
import { StepService } from '../step.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CodxTypeTaskComponent } from '../codx-step-common/codx-type-task/codx-type-task.component';
import {
  Progress,
  UpdateProgressComponent,
} from '../codx-progress/codx-progress.component';
import { CodxViewTaskComponent } from '../codx-view-task/codx-view-task.component';
import { CodxAddGroupTaskComponent } from '../codx-popup-group/codx-add-group-task.component';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';
import { TN_OrderModule } from 'projects/codx-ad/src/lib/models/tmpModule.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodxViewApproveComponent } from '../codx-step-common/codx-view-approve/codx-view-approve.component';

import { Subject, firstValueFrom } from 'rxjs';
import { ContractsDetailComponent } from 'projects/codx-cm/src/lib/contracts/contracts-detail/contracts-detail.component';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { ExportData } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { PopupCustomFieldComponent } from '../../codx-input-custom-field/codx-fields-detail-temp/popup-custom-field/popup-custom-field.component';
import { CustomFieldService } from '../../codx-input-custom-field/custom-field.service';
import { CodxBookingService } from 'projects/codx-share/src/lib/components/codx-booking/codx-booking.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import {
  CO_Meetings,
  CO_Permissions,
} from 'projects/codx-share/src/lib/components/codx-tmmeetings/models/CO_Meetings.model';
import { TM_Tasks } from 'projects/codx-share/src/lib/components/codx-tasks/model/task.model';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { PopupAddMeetingComponent } from 'projects/codx-share/src/lib/components/codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { CodxAddBookingCarComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxShareTaskComponent } from '../codx-share-task/codx-share-task.component';
@Component({
  selector: 'codx-step-task',
  templateUrl: './codx-step-task.component.html',
  styleUrls: ['./codx-step-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodxStepTaskComponent implements OnInit, OnChanges {
  @ViewChild('popupGuide') popupGuide;
  @ViewChild('popupApprover') popupApprover: TemplateRef<any>;
  //#region Input
  @Input() stepId: any;
  @Input() formModel: FormModel;
  @Input() instanceStep: DP_Instances_Steps;
  @Input() groupTaskAdd: DP_Instances_Steps_TaskGroups;
  @Input() taskAdd;
  @Input() entityName;
  @Input() recIDParent;

  @Input() isTaskFirst = false; // giai đoạn đầu tiên
  @Input() isStart = true; // bắt đầu ngay
  @Input() isRoleAll = true;
  @Input() isOnlyView = true; // đang ở giai đoạn nào
  @Input() isShowFile = true;
  @Input() isDeepCopy = false; // copy sâu
  @Input() isAddTask = false;
  @Input() isShowStep = false;
  @Input() isShowElement = true; // thu gọn mở rộng group, task trong step
  @Input() isShowComment = true;
  @Input() isShowBtnAddTask = true;
  @Input() isSaveProgress = true; // lưu progress vào db
  @Input() askUpdateProgressStep = false; // lưu progress vào db
  @Input() ownerInstance; // lưu progress vào db

  @Input() isView = false; // chỉ xem
  @Input() isMoveStage = false; // chuyển giai đoạn
  @Input() isLockSuccess = false; // lọc cái task 100%

  @Input() applyFor; //tìm sesion giao việc
  @Input() sessionID = ''; // sesion giao việc
  @Input() formModelAssign: FormModel; // formModel của giao việc
  @Input() isChangeOwner = false;

  @Input() businessLineID: string;
  @Input() processID: string;
  @Input() customerName: string;
  @Input() dealName: string;
  @Input() contractName: string;
  @Input() leadName: string;
  @Input() instanceName: string;

  @Output() saveAssign = new EventEmitter<any>();
  @Output() continueStep = new EventEmitter<any>();
  @Output() isChangeProgress = new EventEmitter<any>();
  @Output() valueChangeProgress = new EventEmitter<any>(); // type A = all, D=default, R = required
  @Output() changeProgress = new EventEmitter<any>();
  @Output() isSuccessStep = new EventEmitter<any>();
  @Output() recIDTaskAdd = new EventEmitter<any>();
  //#endregion

  //#region variable
  isUpdate;
  user: any;
  id: string;
  taskType: any;
  listFieldTask;
  listTask = [];
  moveStageData = [];
  idStepOld = '';
  addCarTitle = '';
  titleAction = '';
  carFG: FormGroup;
  carFM: FormModel;
  currentStep: any;
  idTaskEnd = null;
  listTaskType = [];
  listGroupTask = [];
  progressTaskEnd = 0;
  dataPopupProgress: any;
  dateFomat = 'dd/MM/yyyy';
  grvMoreFunction: FormModel;
  isEditTimeDefault = false;
  isOpenPopupProgress = false;
  isUpdateProgressStep = false;
  isUpdateProgressGroup = false;
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  listRecIDGroupUpdateProgress: string[] = [];

  frmModelInstancesGroup: FormModel;
  frmModelInstancesTask: FormModel;
  frmModelContracts: FormModel;
  frmModelQuotation: FormModel;
  dialogGuide: DialogRef;
  vllDataTask;
  vllDataStep;
  isBoughtTM = false;
  dataTooltipDay;
  successAll = false;
  successRequired = false;
  isSuccessAll = false;
  isSuccessRequired = false;

  dialogGuideZoomIn: DialogRef;
  dialogGuideZoomOut: DialogRef;
  isZoomIn = false;
  isZoomOut = false;
  isShow = true;
  funcID = '';
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  url = '';
  taskApproval: DP_Instances_Steps_Tasks;
  frmModelInstances: FormModel = {
    funcID: 'DPT04',
    formName: 'DPInstances',
    entityName: 'DP_Instances',
    gridViewName: 'grvDPInstances',
  };

  frmModelExport: FormModel = {
    formName: 'CMTempDataSources',
    gridViewName: 'grvCMTempDataSources',
    entityName: 'CM_TempDataSources',
  };
  taskApprover;
  approverDialog;
  titleLanguageAdd = '';
  titleLanguageEdit = '';
  widthTask = '';
  isFirstTime = true;
  transferControl = '0';
  maxWidth = 0;
  //#endregion
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private callfc: CallFuncService,
    private codxService: CodxService,
    private stepService: StepService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private bookingService: CodxBookingService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private activedRouter: ActivatedRoute,
    private tenantStore: TenantStore,
    private router: Router,
    private location: Location,
    private customFieldSV: CustomFieldService
  ) {
    this.user = this.authStore.get();
    this.id = Util.uid();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  async ngOnInit(): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res?.datas;
      }
    });
    let DP048 = await firstValueFrom(this.cache.valueList('DP048'));
    if (DP048.datas) {
      this.vllDataTask = DP048?.datas;
    }
    let DP032 = await firstValueFrom(this.cache.valueList('DP032'));
    if (DP032.datas) {
      this.vllDataStep = DP032?.datas;
    }
    this.cache
      .moreFunction('DPInstancesStepsTasks', 'grvDPInstancesStepsTasks')
      .subscribe((res) => {
        // console.log("--------------", res);
        // const objectMoi = {};
        // for (const obj of res) {
        //   objectMoi[obj.id] = obj;
        // }
      });
    this.getDefaultCM();
    this.frmModelInstancesGroup = {
      formName: 'DPInstancesStepsTaskGroups',
      entityName: 'DP_Instances_Steps_TaskGroups',
      gridViewName: 'grvDPInstancesStepsTaskGroups',
    };
    this.frmModelInstancesTask = {
      funcID: 'DPT040102',
      formName: 'DPInstancesStepsTasks',
      entityName: 'DP_Instances_Steps_Tasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    this.frmModelContracts = {
      funcID: 'CM0204',
      formName: 'CMContracts',
      entityName: 'CM_Contracts',
      entityPer: 'CM_Contracts',
      gridViewName: 'grvCMContracts',
    };
    this.frmModelQuotation = {
      formName: 'CMQuotationsLines',
      gridViewName: 'grvCMQuotationsLines',
      entityName: 'CM_QuotationsLines',
      funcID: 'CM02021',
    };
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.instanceStep || changes.stepId) {
      this.grvMoreFunction = await this.getFormModel('DPT040102');
      await this.getStepById();
      if (this.isLockSuccess) {
        await this.removeTaskSuccess();
      }
      if (this.isOnlyView) {
        this.getTaskEnd();
        this.getTransferControlStep();
      }
      this.isShowElement = this.isShowStep ? this.isOnlyView : true;
    }
    if (changes?.groupTaskAdd && this.groupTaskAdd) {
      let indexGroupNoID = this.listGroupTask?.findIndex(
        (group) => !group.recID
      );
      let index = indexGroupNoID ? indexGroupNoID : this.listGroupTask?.length;
      this.listGroupTask?.splice(index, 0, this.groupTaskAdd);
    }
    if (changes?.taskAdd && this.taskAdd) {
      this.changeTaskAdd(
        this.taskAdd?.task,
        this.taskAdd?.progressGroup,
        this.taskAdd?.progressStep,
        this.taskAdd?.isCreateMeeting
      );
      this.taskAdd = null;
    }
    if (changes?.isAddTask && this.isRoleAll && this.isAddTask) {
      this.chooseTypeTask(['F']);
    }

    if (changes?.isMoveStage) {
      this.listGroupTask?.forEach((group) => {
        group?.task?.forEach((task) => {
          task['progressOld'] = task.progress;
          task['statusOld'] = task.status;
          task['isChange'] = false;
        });
        group['progressOld'] = group.progress;
        group['isChange'] = false;
        group['isChangeAuto'] = true;
      });
    }
    if (changes?.isChangeOwner && changes?.isChangeOwner?.currentValue) {
      this.setOwnerByChangeOwnerInstance(
        this.currentStep?.instanceID,
        this.currentStep?.recID
      );
    }
    this.changeDetectorRef.markForCheck();
  }

  getTransferControlStep() {
    if (this.processID && this.currentStep?.stepID) {
      this.api
        .exec<any>('DP', 'ProcessesBusiness', 'GetTransferControlStepAsync', [
          this.processID,
          this.currentStep?.stepID,
        ])
        .subscribe((res) => {
          if (res) {
            this.transferControl = res;
          }
        });
    }
  }

  ngAfterViewInit() {
    this.cache.functionList('EPT21').subscribe((res) => {
      if (res) {
        this.addCarTitle = res?.customName;
      }
    });
    this.bookingService.getFormModel('EPT21').then((res) => {
      this.carFM = res;
      this.carFG = this.codxService.buildFormGroup(
        this.carFM?.formName,
        this.carFM?.gridViewName
      );
    });
    this.waitSetWidth(100, 100);
  }

  waitSetWidth(time: number, timeAwait: number) {
    if (timeAwait >= 5000) return;
    const elements = document.getElementsByClassName('step-task-right');
    if (elements.length === 0) {
      setTimeout(() => {
        this.waitSetWidth(time, timeAwait + 100);
      }, time);
      return;
    }
    if( this.maxWidth == 0){
      let maxWidth = 0;
      for (const element of Array.from(elements)) {
        if (element instanceof HTMLElement) {
          const width = element.offsetWidth || 0;
          if (width > maxWidth) {
            maxWidth = width;
          }
        }
      }
      this.maxWidth = maxWidth;
    }    
    if(this.maxWidth > 0){
      this.widthTask = this.maxWidth + 'px';
      for (const element of Array.from(elements)) {
        if (element instanceof HTMLElement) {
          element.style.minWidth = this.widthTask;
        }
      }
      this.changeDetectorRef.markForCheck();
    }else{
      setTimeout(() => {
        this.waitSetWidth(time, timeAwait + 100);
      }, time);
      return;
    }

  }

  async drop(event: CdkDragDrop<string[]>, data = null, isParent = false) {}

  //#region get Data
  async getStepById(isLoad = false, recIDStep = '') {
    if (this.stepId || isLoad) {
      let stepID = this.stepId || recIDStep;
      this.currentStep = await firstValueFrom(
        this.api.exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'GetStepByIdAsync',
          stepID
        )
      );
    } else {
      this.currentStep = this.isDeepCopy
        ? JSON.parse(JSON.stringify(this.instanceStep))
        : this.instanceStep;
    }
    this.isRoleAll = this.isRoleAll
      ? this.isRoleAll
      : this.currentStep?.owner == this.user?.userID;
    this.isUpdateProgressGroup = this.currentStep?.progressStepControl || false;
    this.isUpdateProgressStep =
      this.currentStep?.progressTaskGroupControl || false;
    this.isEditTimeDefault = this.currentStep?.leadtimeControl || false;
    this.isOnlyView = this.currentStep?.stepStatus == '1';

    const taskGroupList = this.currentStep?.tasks?.reduce((group, product) => {
      const { taskGroupID } = product;
      group[taskGroupID] = group[taskGroupID] ?? [];
      group[taskGroupID].push(product);
      return group;
    }, {});
    const taskGroupConvert = this.currentStep['taskGroups'].map((taskGroup) => {
      let task = taskGroupList[taskGroup['refID']] ?? [];
      return {
        ...taskGroup,
        task: task.sort((a, b) => a['indexNo'] - b['indexNo']),
      };
    });
    // this.currentStep['taskGroups'] = taskGroupConvert;
    let listGroupTask = taskGroupConvert;
    if (taskGroupList['null']) {
      let taskGroup = {};
      taskGroup['task'] =
        taskGroupList['null']?.sort((a, b) => a['indexNo'] - b['indexNo']) ||
        [];
      taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
      taskGroup['refID'] = '';
      listGroupTask.push(taskGroup);
    }
    this.listGroupTask = listGroupTask;
    this.listTask = this.currentStep['tasks'];
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID) || null);
    let formModel = {};
    if (f) {
      formModel['formName'] = f?.formName;
      formModel['gridViewName'] = f?.gridViewName;
      formModel['entityName'] = f?.entityName;
      formModel['funcID'] = functionID;
    }
    return formModel;
  }

  getIconTask(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return color?.icon;
  }

  getColor(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
  }

  getRole(task) {
    let role =
      task?.roles.find((role) => role.objectID == task?.owner) ||
      task?.roles[0];
    return role?.objectName;
  }
  //#endregion

  //#region remove task progress 100%
  removeTaskSuccess() {
    if (this.listGroupTask?.length > 0) {
      for (let i = 0; i < this.listGroupTask.length; ) {
        if (this.listGroupTask[i]?.task?.length > 0) {
          for (let j = 0; j < this.listGroupTask[i]?.task.length; ) {
            let task = this.listGroupTask[i]?.task[j];
            if (task?.progress == 100) {
              this.listGroupTask[i]?.task.splice(j, 1);
            } else {
              ++j;
            }
          }
        }
        if (
          this.listGroupTask[i]?.progress == 100 &&
          this.listGroupTask[i]?.task?.length == 0
        ) {
          this.listGroupTask?.splice(i, 1);
        } else {
          i++;
        }
      }
    }
  }
  //#endregion

  //#region showTask or hideTask
  toggleTask(e, idGroup) {
    let elementGroup = document.getElementById(idGroup.toString());
    let children = e.currentTarget.children[0];
    let isClose = elementGroup.classList.contains('hiddenTask');
    if (isClose) {
      elementGroup.classList.remove('hiddenTask');
      elementGroup.classList.add('showTask');
      children.classList.remove('icon-add');
      children.classList.add('icon-horizontal_rule');
    } else {
      elementGroup.classList.remove('showTask');
      elementGroup.classList.add('hiddenTask');
      children.classList.remove('icon-horizontal_rule');
      children.classList.add('icon-add');
    }
  }
  //#endregion

  //#region handle color and icon

  //#region check parent ID
  checkExitsParentID(taskList, task): string {
    if (task?.requireCompleted) {
      return 'text-red';
    }
    let check = 'd-none';
    if (task?.groupTaskID) {
      taskList?.forEach((taskItem) => {
        if (taskItem?.parentID?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    } else {
      this.listTask?.forEach((taskItem) => {
        if (taskItem?.parentID?.includes(task?.refID)) {
          check = 'text-orange';
        }
      });
    }
    return check;
  }
  //#endregion

  //#endregion

  //#region more functions
  convertMoreFunctions(listMore, more, type) {
    let functionID = type == 'B' ? 'DP27' : 'DP24';
    let moreFind = listMore?.find((m) => m.functionID == functionID);
    let text = more?.text + ' ' + moreFind?.text?.toString()?.toLowerCase();
    more.text = text;
  }

  async changeDataMFTask(event, task, groupTask) {
    if (event != null) {
      let isGroup = false;
      let isTask = false;
      if (!this.isRoleAll) {
        isGroup = this.checRoleOwner(groupTask);
        if (!isGroup) {
          isTask = this.checRoleOwner(task);
        }
      }
      event.forEach((res) => {
        res.isbookmark = false;
        switch (res.functionID) {
          case 'SYS001':
          case 'SYS002':
            break;
          case 'SYS004': //mail
            res.disabled = task?.taskType != 'E';
            break;
          case 'SYS02': //xóa
            if (!(!task?.isTaskDefault && (this.isRoleAll || isGroup))) {
              res.disabled = true;
            }
            break;
          case 'SYS03': //sửa
            this.titleLanguageEdit;
            if (!(this.isRoleAll || isGroup || isTask)) {
              res.disabled = true;
            } else {
              if (task?.isTaskDefault && !this.isEditTimeDefault) {
                res.disabled = true;
              }
            }
            break;
          case 'SYS04': //copy
            if (!(this.isRoleAll || isGroup)) {
              res.disabled = true;
            }
            break;
          case 'SYS003': //đính kèm file
            res.disabled = true;
            break;
          case 'DP20': // tiến độ
            if (
              (task?.taskType == 'Q' || task?.taskType == 'CO') &&
              !task?.objectLinked
            ) {
              res.isblur = true;
              break;
            }
            res.isblur = this.isOnlyView
              ? !(
                  (this.isRoleAll || isGroup || isTask) &&
                  task?.startDate &&
                  task?.endDate
                )
              : !(this.isTaskFirst && this.isRoleAll);
            break;
          case 'DP13': //giao việc
            if (task?.assigned == '1') {
              res.disabled = true;
            } else if (
              !(
                task?.createTask &&
                this.isOnlyView &&
                (this.isRoleAll || isGroup || isTask)
              )
            ) {
              res.isblur = true;
            }
            break;
          case 'DP12':
            res.disabled = true;
            break;
          case 'DP08':
            res.disabled = true;
            break;
          case 'DP24': //Tạo cuộc họp
            if (task.taskType != 'M' || task?.actionStatus == '2') {
              res.disabled = true;
            } else if (task?.status == '1') {
              res.isblur = true;
            }
            break;
          case 'DP25':
          case 'DP26':
            res.disabled = true;
            break;
          case 'DP27': // đặt xe
            if (
              task?.taskType != 'B' ||
              (task?.taskType == 'B' && task?.actionStatus == '2')
            )
              res.disabled = true;
            break;
          case 'DP28': // Cập nhật
            if (['B', 'M'].includes(task.taskType)) {
              this.convertMoreFunctions(event, res, task.taskType);
              if (task?.actionStatus != '2') res.disabled = true;
            } else {
              res.disabled = true;
            }
            break;
          case 'DP29': // Hủy
            if (['B', 'M'].includes(task.taskType)) {
              this.convertMoreFunctions(event, res, task.taskType);
              if (task?.actionStatus != '2') res.disabled = true;
            } else {
              res.disabled = true;
            }
            break;
          case 'DP30': //Khôi phục
            // if (['B', 'M'].includes(task.taskType)) {
            //   this.convertMoreFunctions(event, res, task.taskType);
            //   if (task.taskType == 'M') res.disabled = true;
            // } else {
            //   res.disabled = true;
            // }
            res.disabled = true;
            break;
          case 'DP31': // bắt đầu ngay
            if (task?.dependRule != '0' || task?.status != '1') {
              res.disabled = true;
            } else if (
              !(
                (this.isRoleAll || isGroup || isTask) &&
                (this.isOnlyView || this.isTaskFirst)
              )
            ) {
              res.isblur = true;
            }
            break;
          case 'DP32': // gởi duyệt
            res.disabled =
              !task?.approveRule ||
              (task?.approveRule && ['3', '5'].includes(task?.approveStatus));
            break;
          case 'DP33': // hủy duyệt
            res.disabled = !(task?.approveRule && task?.approveStatus == '3');
            break;
        }
      });
    }
  }

  async changeDataMFGroupTask(event, group) {
    if (event != null) {
      let isGroup = false;
      if (!this.isRoleAll) {
        isGroup = this.checRoleOwner(group);
      }
      event.forEach((res) => {
        res.isbookmark = false;
        switch (res.functionID) {
          case 'DP13':
          case 'DP27': // đặt xe
          case 'DP07':
          case 'DP31':
          case 'DP30':
          case 'DP29':
          case 'DP28':
          case 'DP32':
          case 'DP33':
            res.disabled = true;
            break;
          case 'SYS02': //xóa
            if (
              !(
                !group?.isTaskDefault &&
                (this.isRoleAll || isGroup) &&
                this.isOnlyView
              )
            ) {
              res.disabled = true;
            }
            break;
          case 'SYS04': //copy
            if (!this.isRoleAll) {
              res.disabled = true;
            }
            break;
          case 'SYS03': //sửa
            if (!(this.isRoleAll || isGroup)) {
              res.disabled = true;
            }
            break;
          case 'SYS003': //đính kèm file
            if (group?.isTaskDefault && !this.isOnlyView) {
              res.isblur = true;
            }
            break;
          case 'DP08': // thêm công việc
            if (!(this.isRoleAll || isGroup)) {
              res.isblur = true;
            }
            break;
          case 'DP20': // tiến độ
            if (
              !(
                this.isUpdateProgressGroup &&
                (this.isRoleAll || isGroup) &&
                this.isOnlyView
              )
            ) {
              res.isblur = true;
            }
            break;
          case 'DP25':
          case 'DP24':
          case 'DP26':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = true;
            break;
        }
      });
    }
  }

  async changeDataMFStep(event, stepData) {
    if (event != null) {
      event.forEach((res) => {
        res.isbookmark = false;
        switch (res.functionID) {
          case 'SYS02': //xóa
          case 'SYS03': //sửa
          case 'SYS04': //copy
          case 'DP27': // đặt xe
          case 'DP13': //giao việc
          case 'DP24': //tạo lịch họp
          case 'DP07': //chi tiêt công việc
          case 'SYS003': //đính kèm file
          case 'DP12':
          case 'DP25':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'DP31':
          case 'DP30':
          case 'DP29':
          case 'DP28':
          case 'DP32':
          case 'DP33':
            res.disabled = true;
            break;
          case 'DP20': // tiến độ
            res.isbookmark = false;
            if (!(this.isRoleAll && this.isOnlyView && this.isUpdateProgressStep)) {
              res.disabled = true;
            }

            break;
          case 'DP08': // Thêm nhóm công việc
            res.isbookmark = false;
            if (!this.isRoleAll) {
              res.disabled = true;
            }
            break;
          case 'DP26': // Chi tiết giai đoạn
            res.isbookmark = false;
            break;
        }
      });
    }
  }

  clickMFStep(e: any, step: any) {
    switch (e.functionID) {
      case 'DP08': //them task
        this.chooseTypeTask(['F']);
        break;
      case 'DP20': // tien do
        this.openPopupUpdateProgress(this.currentStep, 'P');
        break;
      case 'DP26': // view
        this.viewTask(step, 'P');
        break;
    }
  }

  clickMFTask(e: any, groupTask: any, task?: any) {
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(task);
        break;
      case 'SYS03': //edit
        this.editTask(task);
        break;
      case 'SYS04': //copy
        this.copyTask(task);
        break;
      case 'DP07': // view
        this.viewTask(task, task?.taskType || 'T');
        break;
      case 'DP13': //giao viec
        this.assignTask(e.data, task);
        break;
      case 'DP20': // tien do
        this.openPopupUpdateProgress(task, 'T');
        break;
      case 'DP24': // tạo lịch họp
        this.createMeeting(task);
        break;
      case 'DP28':
        if (task.taskType === 'M') {
          this.editMeeting(task);
        } else if (task.taskType === 'B') {
          this.updateBookingCar(task);
        }
        break;
      case 'DP29':
        this.deleteMeeting(task);
        break;
      case 'SYS004':
        this.sendMail(task, false);
        break;
      case 'DP27':
        this.addBookingCar(task);
        break;
      case 'DP31':
        this.startTask(task, groupTask);
        break;
      case 'DP32':
        this.approvalTrans(task);
        break;
      case 'DP33':
        this.cancelApprover(task);
        break;
      case 'DP35':
        this.popupPermissions(task);
        break;
      case 'SYS002':
        this.exportTemplet(e, task);
        break;
      default:
        let customData = {
          refID: task.recID,
          refType: 'DP_Instances_Steps_Tasks',
        };
        // if(task?.isTaskDefault){
        //   customData.refID =  task.refID ;
        //   customData.refType ='DP_Steps_Tasks'
        // }
        // let frmModel: FormModel;
        // switch (task?.taskType) {
        //   case 'CO':
        //     frmModel = this.frmModelContracts;
        //     break;
        //   case 'Q':
        //     frmModel = this.frmModelQuotation;
        //     break;
        //   default:
        //     frmModel = this.frmModelInstancesTask;
        // }
        this.codxShareService.defaultMoreFunc(
          e,
          task,
          this.afterSave.bind(this),
          this.frmModelInstancesTask,
          null,
          this,
          customData
        );
        break;
    }
  }
  //data trar ve
  afterSave(e) {}

  clickMFTaskGroup(e: any, group: any) {
    switch (e.functionID) {
      case 'SYS02': //delete
        this.deleteGroupTask(group);
        break;
      case 'SYS03': //edit
        this.editGroupTask(group);
        break;
      case 'SYS04': //copy
        this.copyGroupTask(group);
        break;
      case 'DP08': //them task
        this.chooseTypeTask(['G', 'F'], group?.refID);
        break;
      case 'DP12':
        this.viewTask(group, 'G');
        break;
      case 'DP20': //Progress
        this.openPopupUpdateProgress(group, 'T');
        break;
    }
  }
  //#endregion

  //#region start task
  async startTask(task: DP_Instances_Steps_Tasks, groupTask) {
    let objectLinked = task?.objectLinked;
    if (task?.taskType == 'Q') {
      this.addQuotation();
    } else if (task?.taskType == 'CO' && !task?.objectLinked) {
      let taskContract = await this.addContract(task, groupTask);
      objectLinked = taskContract?.objectLinked;
      if (!taskContract) {
        return;
      }
    }
    this.api
      .exec<any>('DP', 'InstancesStepsBusiness', 'StartTaskAsync', [
        task?.stepID,
        task?.recID,
        objectLinked,
      ])
      .subscribe((res) => {
        if (res) {
          let indexTaskView = groupTask?.task?.findIndex(
            (taskFind) => taskFind?.recID == task?.recID
          );
          task.objectLinked = objectLinked;
          task.status = '2';
          task.actualStart = res;
          task.modifiedBy = this.user.userID;
          task.modifiedOn = new Date();
          if (indexTaskView >= 0) {
            groupTask?.task?.splice(
              indexTaskView,
              1,
              JSON.parse(JSON.stringify(task))
            );
          }
          let taskFind = this.currentStep?.tasks?.find(
            (taskFind) => taskFind.recID == task.recID
          );
          if (taskFind) {
            taskFind.status = '2';
            taskFind.modifiedBy = this.user?.userID;
            taskFind.modifiedOn = new Date();
          }
          if (this.isTaskFirst && !this.isStart && this.isRoleAll) {
            this.changeProgress.emit(true);
          }
          this.notiService.notifyCode('SYS007');
        }
      });
  }

  addQuotation() {
    let quotation;
    this.getDefault().subscribe((res) => {
      if (res) {
        let data = res.data;
        data['_uuid'] = data['quotationsID'] ?? Util.uid();
        data['idField'] = 'quotationsID';
        quotation = data;
        if (!quotation.quotationsID) {
          this.api
            .execSv<any>(
              'SYS',
              'AD',
              'AutoNumbersBusiness',
              'GenAutoNumberAsync',
              ['CM0202', 'CM_Quotations', 'QuotationsID']
            )
            .subscribe((id) => {
              quotation.quotationID = id;
              this.openPopup(quotation, 'add');
            });
        } else this.openPopup(quotation, 'add');
      }
    });
  }

  async addContract(task: DP_Instances_Steps_Tasks, groupTask) {
    let data = {
      action: 'add',
      type: 'task',
      entityName: this.entityName,
      parentID: this.recIDParent,
      processID: this.processID,
      businessLineID: this.businessLineID,
    };
    return await this.stepService.openPopupTaskContract(
      data,
      'add',
      task,
      this.currentStep?.recID,
      groupTask,
      this.isStart
    );
  }

  getDefault() {
    return this.api.execSv<any>(
      'CM',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      ['CM0202', 'CM_Quotations', 'quotationsID']
    );
  }

  openPopup(res?, action?) {
    res = {};
    res.versionNo = res.versionNo ?? 'V1';
    res.revision = res.revision ?? 0;
    res.versionName = res.versionNo + '.' + res.revision;
    res.status = res.status ?? '0';
    res.exchangeRate = res.exchangeRate ?? 1;
    res.totalAmt = res.totalAmt ?? 0;
    res.currencyID = res.currencyID ?? 'VND';
    let formModel: FormModel = {
      entityName: 'CM_Quotations',
      formName: 'CMQuotations',
      gridViewName: 'grvCMQuotations',
      funcID: 'CM0202',
    };
    var obj = {
      data: res,
      disableRefID: false,
      action: 'add',
      headerText: this.titleAction,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.FormModel = formModel;
    this.cache
      .gridViewSetup('CMQuotations', 'grvCMQuotations')
      .subscribe((res) => {
        let dialog = this.callfc.openForm(
          PopupAddQuotationsComponent,
          '',
          null,
          null,
          '',
          obj,
          '',
          option
        );
        dialog.closed.subscribe((e) => {
          if (e?.event) {
            let quotatision = e?.event;
            let task = new DP_Instances_Steps_Tasks();
            task['taskType'] = this.taskType?.value;
            task['stepID'] = this.currentStep?.recID;
            task['progress'] = 0;
            task['taskGroupID'] = null;
            task['refID'] = Util.uid();
            task['isTaskDefault'] = false;
            task['dependRule'] = '0';
            task.objectLinked = quotatision?.recID;
            task.taskName = quotatision?.quotationName;
            task.owner = this.user?.userID;
            let role = new DP_Instances_Steps_Tasks_Roles();
            role.recID = Util.uid();
            role.objectName = this.user?.objectName;
            role.objectID = this.user?.userID;
            role.roleType = 'O';
            task.roles = [role];
            task.startDate = quotatision?.createdOn;
            task.endDate = quotatision?.deadline;
            // this.saveTask(task);
          }
        });
      });
  }

  getTaskEnd() {
    let countGroup = this.listGroupTask?.length;
    if (countGroup > 0) {
      for (let i = countGroup - 1; i >= 0; i--) {
        const groupTask = this.listGroupTask[i];
        const task = groupTask?.task
          ?.slice()
          .reverse()
          .find((t) => t?.isTaskDefault);
        if (task) {
          this.idTaskEnd = task.recID;
          this.progressTaskEnd = task?.progress || 0;
          return;
        }
      }
    }
  }
  //#endregion

  //#region chon loai task
  async chooseTypeTask(typeDisableds = [], groupID = null) {
    this.isAddTask = false;
    setTimeout(async () => {
      let popupTypeTask = this.callfc.openForm(
        CodxTypeTaskComponent,
        '',
        450,
        580,
        '',
        { typeDisableds }
      );
      let dataOutput = await firstValueFrom(popupTypeTask.closed);
      if (dataOutput?.event?.value) {
        this.taskType = dataOutput?.event;
        if (this.taskType?.value == 'G') {
          this.addGroupTask();
        } else {
          this.addTask(groupID);
        }
      }
    }, 0);
  }
  //#endregion
  setDataTaskNew() {
    let task = new DP_Instances_Steps_Tasks();
    task.taskType = this.taskType?.value;
    task.stepID = this.currentStep?.recID;
    task.progress = 0;
    task.refID = Util.uid();
    task.isTaskDefault = false;
    task.dependRule = '0';
    return task;
  }
  //#region CRUD Task

  async addTask(groupID) {
    let task = this.setDataTaskNew();
    if (this.taskType?.value == 'Q') {
      this.stepService.addQuotation(
        'add',
        'Thêm',
        null,
        this.currentStep?.recID,
        groupID
      );
      this.stepService.popupClosedSubject.subscribe((res) => {
        let task = res;
        // this.stepService.popupClosedSubject = null;
        if (task) {
          this.api
            .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
              task,
            ])
            .subscribe((res) => {
              if (res) {
                this.changeTaskAdd(res[0], res[1], res[2], false);
              }
            });
        }
      });
    } else if (this.taskType?.value == 'CO') {
      let data = {
        action: 'add',
        type: 'task',
        entityName: this.entityName,
        parentID: this.recIDParent,
        businessLineID: this.businessLineID,
        processID: this.processID,
      };
      let taskContract = await this.stepService.openPopupTaskContract(
        data,
        'add',
        null,
        this.currentStep?.recID,
        groupID,
        this.isStart
      );
      this.api
        .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
          taskContract,
        ])
        .subscribe((res) => {
          if (res) {
            this.changeTaskAdd(res[0], res[1], res[2], false);
          }
        });
    } else if (this.taskType?.value == 'E') {
      this.handelMail(null, 'add');
    } else {
      let type = groupID ? 'group' : 'step';
      let taskOutput = await this.openPopupTask('add', type, task, groupID);
      this.changeTaskAdd(
        taskOutput?.task,
        taskOutput?.progressGroup,
        taskOutput?.progressStep,
        taskOutput?.isCreateMeeting
      );
    }
  }

  changeTaskAdd(task, progressGroup, progressStep, isCreateMeeting) {
    if (task) {
      let groupData = this.currentStep?.taskGroups.find((group) =>
        this.comparison(group.refID, task?.taskGroupID)
      );
      if (this.listGroupTask && this.listGroupTask?.length <= 0) {
        let taskGroup = { recID: null, refID: null };
        this.listGroupTask.push(taskGroup);
      }
      let group = this.listGroupTask.find((group) =>
        this.comparison(group.refID, task?.taskGroupID)
      );
      if (group) {
        if (!group?.task) {
          group['task'] = [];
        }
        group?.task?.push(task);
        group['progress'] = progressGroup;
      }
      if (groupData) {
        groupData['progress'] = progressGroup;
      }
      this.currentStep?.tasks?.push(task);
      this.currentStep.progress = progressStep;
      this.notiService.notifyCode('SYS006');
      isCreateMeeting && this.addMeetings(task);
      if (task?.assigned == '1') {
        this.recIDTaskAdd.emit(task?.recID);
      }
    }
    this.changeDetectorRef.markForCheck();
  }

  addMeetings(task) {
    let dataTask: DP_Instances_Steps_Tasks = task;
    let functionID = 'TMT0501';
    let meeting = new CO_Meetings();
    meeting.meetingName = dataTask?.taskName;
    meeting.startDate = dataTask?.startDate;
    meeting.endDate = dataTask?.endDate;
    meeting.fromDate = dataTask?.startDate;
    meeting.toDate = dataTask?.endDate;
    meeting.reminder = 15;
    meeting.isOnline = dataTask?.isOnline;
    meeting.meetingType = '1';
    meeting.refID = dataTask?.recID;
    meeting.refType = 'DP_Instances_Steps_Tasks';
    meeting.permissions = meeting.permissions ? meeting.permissions : [];
    let roles = JSON.parse(JSON.stringify(dataTask?.roles));
    roles.forEach((role) => {
      var tmpResource = new CO_Permissions();
      if (role.objectID == dataTask?.owner) {
        tmpResource.objectID = role?.objectID;
        tmpResource.objectName = role?.objectName;
        tmpResource.positionName = role?.positionName;
        tmpResource.roleType = 'A';
        tmpResource.taskControl = true;
        tmpResource.objectType = role?.objectType;
        tmpResource.full = true;
        tmpResource.read = true;
        tmpResource.create = true;
        tmpResource.update = true;
        tmpResource.assign = true;
        tmpResource.delete = true;
        tmpResource.share = true;
        tmpResource.upload = true;
        tmpResource.download = true;
      } else {
        tmpResource.objectID = role?.objectID;
        tmpResource.objectName = role?.objectName;
        tmpResource.positionName = role?.positionName;
        tmpResource.roleType = 'P';
        tmpResource.taskControl = true;
        tmpResource.objectType = role?.objectType;
        tmpResource.read = true;
        tmpResource.download = true;
      }
      meeting.permissions.push(tmpResource);
    });

    this.api
      .execSv<any>('CO', 'CO', 'MeetingsBusiness', 'AddMeetingsAsync', [
        meeting,
        functionID,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  async editTask(task) {
    if (task) {
      if (
        task?.taskType == 'Q' &&
        ((task?.isTaskDefault && task?.objectLinked) || !task?.isTaskDefault)
      ) {
        //báo giá
        this.addQuotation();
      } else if (
        task?.taskType == 'CO' &&
        ((task?.isTaskDefault && task?.objectLinked) || !task?.isTaskDefault)
      ) {
        if (task?.objectLinked) {
          let data = {
            action: 'edit',
            type: 'task',
            recIDContract: task.objectLinked,
            stepsTasks: task,
          };
          let taskContract = await this.stepService.openPopupTaskContract(
            data,
            'edit',
            task,
            this.currentStep?.recID,
            null,
            this.isStart
          );
          if (taskContract == 'not data') {
            task.objectLinked = null;
            this.api
              .exec<any>(
                'DP',
                'InstancesStepsBusiness',
                'UpdateTaskStepAsync',
                [task]
              )
              .subscribe((res) => {
                if (res) {
                  this.changeDetectorRef.markForCheck();
                }
              });
          } else if (taskContract?.recID) {
            this.api
              .exec<any>(
                'DP',
                'InstancesStepsBusiness',
                'UpdateTaskStepAsync',
                [taskContract]
              )
              .subscribe((res) => {
                if (res) {
                  this.changeTaskEdit(res, res?.taskGroupID);
                }
              });
          }
        } else {
          this.notiService.notify('Hợp đồng không tồn tại', '3');
          this.startTask(task, task?.taskGroupID);
        }
      } else if (task?.taskType == 'E') {
        this.handelMail(task, 'edit');
      } else {
        let groupIdOld = task?.taskGroupID;
        this.taskType = this.listTaskType.find(
          (type) => type.value == task?.taskType
        );
        let dataOutput = await this.openPopupTask('edit', 'step', task);
        this.titleAction = '';
        if (dataOutput?.task) {
          this.changeTaskEdit(dataOutput?.task, groupIdOld);
        }
      }
    }
  }

  changeTaskEdit(task, groupIdOld) {
    if (task) {
      let group = this.listGroupTask.find((group) =>
        this.comparison(group.refID, task?.taskGroupID)
      );
      let indexTask = this.currentStep?.tasks?.findIndex(
        (taskFind) => taskFind.recID == task.recID
      );
      if (task?.taskGroupID != groupIdOld) {
        let groupOld = this.listGroupTask.find(
          (group) => group.refID == groupIdOld
        );
        if (groupOld) {
          let index = groupOld?.task?.findIndex(
            (taskFind) => taskFind.recID == task.recID
          );
          if (index >= 0) {
            groupOld?.task?.splice(index, 1);
          }
        }
        if (group) {
          group?.task?.push(task);
        }
      } else {
        if (group) {
          let index = group?.task?.findIndex(
            (taskFind) => taskFind.recID == task.recID
          );
          if (index >= 0) {
            group?.task?.splice(index, 1, task);
          }
        }
      }
      if (indexTask >= 0) {
        this.currentStep?.tasks?.splice(indexTask, 1, task);
      }
      this.changeDetectorRef.markForCheck();
      this.notiService.notifyCode('SYS007');
    }
  }

  async copyTask(task) {
    if (task) {
      if (task?.taskType == 'Q') {
        //báo giá
        this.addQuotation();
      } else if (task?.taskType == 'CO') {
        let data = {
          action: 'copy',
          type: 'task',
          recIDContract: task.objectLinked,
          businessLineID: this.businessLineID,
        };
        let taskContract = await this.stepService.openPopupTaskContract(
          data,
          'copy',
          task,
          this.currentStep?.recID,
          null,
          this.isStart
        );
        this.api
          .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
            taskContract,
          ])
          .subscribe((res) => {
            if (res) {
              this.changeTaskAdd(res[0], res[1], res[2], false);
            }
          });
      } else if (task?.taskType == 'E') {
        this.handelMail(task, 'copy');
      } else {
        this.taskType = this.listTaskType.find(
          (type) => type.value == task?.taskType
        );
        let taskOutput = await this.openPopupTask('copy', 'step', task);
        this.titleAction = '';
        if (taskOutput?.task) {
          let data = taskOutput;
          this.currentStep?.tasks?.push(data.task);
          this.currentStep['progress'] = data.progressStep;
          let group = this.listGroupTask.find((group) =>
            this.comparison(group.refID, data.task.taskGroupID)
          );
          if (group) {
            group?.task.push(data.task);
            group['progress'] = data.progressGroup;
            this.changeDetectorRef.markForCheck();
          }
        }
      }
    }
  }

  deleteTask(task) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api
          .exec<any>(
            'DP',
            'InstancesStepsBusiness',
            'DeleteTaskStepAsync',
            task
          )
          .subscribe((data) => {
            if (data) {
              let indexTask = this.currentStep?.tasks?.findIndex(
                (taskFind) => taskFind.recID == task.recID
              );
              let group = this.listGroupTask.find((group) =>
                this.comparison(group.refID, task.taskGroupID)
              );
              let groupData = this.currentStep?.taskGroups?.find((group) =>
                this.comparison(group.refID, task.taskGroupID)
              );
              let indexTaskGroup = -1;
              if (group?.task?.length > 0) {
                indexTaskGroup = group?.task?.findIndex(
                  (taskFind) => taskFind.recID == task.recID
                );
              }
              if (indexTask >= 0) {
                this.currentStep?.tasks?.splice(indexTask, 1);
              }
              if (indexTaskGroup >= 0) {
                group?.task?.splice(indexTaskGroup, 1);
              }
              if (group) {
                group['progress'] = data[0];
              }
              if (groupData) {
                groupData['progress'] = data[0];
              }
              this.currentStep['progress'] = data[1];
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
  }

  async openPopupTask(action, type, dataTask, groupTaskID = null) {
    let dataInput = {
      action,
      titleName: this.titleAction,
      taskType: this.taskType,
      instanceStep: this.currentStep,
      dataTask: dataTask || {},
      listTask: this.listTask,
      isEditTimeDefault: this.currentStep?.leadtimeControl,
      groupTaskID, // trường hợp chọn thêm từ nhóm
      isStart: this.isStart,
      isBoughtTM: this.isBoughtTM,
      ownerInstance: this.ownerInstance,
      isRoleFull: this.isRoleAll,
      type: type,
    };
    let dataPopupOutput = await this.stepService.openPopupCodxTask(
      dataInput,
      'right'
    );
    return dataPopupOutput;
  }
  //#endregion

  //#region giao viec
  assignTask(moreFunc, data) {
    if (data?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    this.getSession().then((session) => {
      if (session) {
        var task = new TM_Tasks();
        task.taskName = data.taskName;
        task.refID = data?.recID;
        task.refType = 'DP_Instances_Steps_Tasks';
        task.dueDate = data?.endDate;
        task.sessionID = this.sessionID ?? this.currentStep?.instanceID;
        let dataReferences = [
          {
            recIDReferences: data.recID,
            refType: 'DP_Instances_Steps_Tasks',
            createdOn: data.createdOn,
            memo: data.taskName,
            createdBy: data.createdBy,
          },
        ];
        let assignModel: AssignTaskModel = {
          vllRole: 'TM001',
          title: moreFunc.customName,
          vllShare: 'TM003',
          task: task,
        };
        let option = new SidebarModel();

        option.FormModel = this.formModelAssign
          ? this.formModelAssign
          : this.frmModelInstances;

        option.Width = '550px';
        var dialogAssign = this.callfc.openSide(
          AssignInfoComponent,
          assignModel,
          option
        );
        dialogAssign.closed.subscribe((e) => {
          var doneSave = false;
          if (e && e.event != null) {
            doneSave = true;
            this.api
              .execSv<any>(
                'DP',
                'DP',
                'InstancesStepsBusiness',
                'UpdatedAssignedStepTasksAsync',
                [data.stepID, data.recID]
              )
              .subscribe((res) => {
                if (res) {
                  data.assigned = '1';
                  this.changeDetectorRef.markForCheck();
                }
              });
          }
          this.saveAssign.emit(doneSave);
        });
      }
    });
  }

  //getSessionTask - session khi giao việc
  getSession(): Promise<string> {
    return new Promise<string>((resolve, rejects) => {
      if (this.sessionID) {
        resolve(this.sessionID);
      } else if (this.applyFor == 0) resolve(this.currentStep?.instanceID);
      else {
        this.api
          .execSv<any>(
            'CM',
            'CM',
            'DealsBusiness',
            'GetRecIDCRMByRecIDInstancesAsync',
            [this.currentStep?.instanceID, this.applyFor]
          )
          .subscribe((sessionID) => {
            resolve(sessionID);
          });
      }
    });
  }
  //#endregion

  //#region group tasks
  async addGroupTask() {
    let taskGroup = new DP_Instances_Steps_TaskGroups();
    taskGroup.recID = Util.uid();
    taskGroup.refID = Util.uid();
    taskGroup['isTaskDefault'] = false;
    taskGroup['progress'] = 0;
    taskGroup['stepID'] = this.currentStep['recID'];

    let taskBeforeIndex = -1;
    for (let i = this.listGroupTask?.length - 1; i >= 0; i--) {
      if (this.listGroupTask[i]?.recID) {
        taskBeforeIndex = i;
        break;
      }
    }
    if (taskBeforeIndex >= 0) {
      taskGroup['startDate'] =
        this.listGroupTask[taskBeforeIndex]?.endDate ||
        this.currentStep?.startDate;
      taskGroup['indexNo'] = taskBeforeIndex + 1;
    } else {
      taskGroup['startDate'] = this.currentStep?.startDate;
      taskGroup['indexNo'] = taskBeforeIndex + 1;
    }
    let taskOutput = await this.openPopupGroup('add', taskGroup);
    if (taskOutput?.event.groupTask) {
      let data = taskOutput?.event;
      this.currentStep?.taskGroups?.push(data.groupTask);
      this.listGroupTask.splice(taskBeforeIndex + 1, 0, data.groupTask);
      this.currentStep['progress'] = data.progressStep;
      this.changeDetectorRef.detectChanges();
    }
  }

  async copyGroupTask(group) {
    if (group) {
      let groupCopy = JSON.parse(JSON.stringify(group));
      let taskBeforeIndex = -1;
      for (let i = this.listGroupTask?.length - 1; i >= 0; i--) {
        if (this.listGroupTask[i]?.recID) {
          taskBeforeIndex = i;
          break;
        }
      }
      if (taskBeforeIndex >= 0) {
        groupCopy['startDate'] =
          this.listGroupTask[taskBeforeIndex]?.endDate ||
          this.currentStep?.startDate;
        groupCopy['endDate'] = null;
        groupCopy['indexNo'] = taskBeforeIndex + 1;
      }
      groupCopy['isTaskDefault'] = false;
      let taskOutput = await this.openPopupGroup('copy', groupCopy);
      if (taskOutput?.event?.groupTask) {
        let data = taskOutput?.event;
        this.currentStep?.taskGroups?.push(data.groupTask);
        this.currentStep.tasks =
          data?.listTask?.lenght > 0
            ? [...this.currentStep?.tasks, ...data?.listTask]
            : this.currentStep.tasks;
        let groupCopyView = JSON.parse(JSON.stringify(data.groupTask));
        groupCopyView['task'] = data?.listTask || [];
        this.listGroupTask.splice(taskBeforeIndex + 1, 0, groupCopyView);
        this.currentStep['progress'] = data.progressStep;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  async editGroupTask(group) {
    if (group) {
      let groupEdit = JSON.parse(JSON.stringify(group));
      let task = groupEdit?.task || [];
      delete groupEdit?.task;
      let groupOutput = await this.openPopupGroup('edit', groupEdit);

      if (groupOutput?.event.groupTask) {
        let data = groupOutput?.event;
        let index = this.currentStep?.taskGroups?.findIndex(
          (groupFind) => groupFind.recID == data?.groupTask?.recID
        );
        let indexView = this.listGroupTask?.findIndex(
          (groupFind) => groupFind.recID == data?.groupTask?.recID
        );
        if (index >= 0 && indexView >= 0) {
          this.currentStep?.taskGroups?.splice(index, 1, data?.groupTask);
          group['endDate'] = data?.groupTask?.endDate;
          group['modifiedOn'] = data?.groupTask?.modifiedOn;
          group['modifiedBy'] = data?.groupTask?.modifiedBy;
          group['durationDay'] = data?.groupTask?.durationDay;
          group['durationHour'] = data?.groupTask?.durationHour;
          group['owner'] = data?.groupTask?.owner;
          if (!group?.isTaskDefault) {
            group['taskGroupName'] = data?.groupTask?.taskGroupName;
            group['memo'] = data?.groupTask?.memo;
          }
        }
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  deleteGroupTask(group) {
    if (!group.recID && !group.stepID) return;
    let data = [group.recID, group.stepID];
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api
          .exec<any>(
            'DP',
            'InstancesStepsBusiness',
            'DeleteGroupTaskStepAsync',
            data
          )
          .subscribe((res) => {
            if (res) {
              let index = this.currentStep?.taskGroups?.findIndex(
                (groupFind) => groupFind.recID == group.recID
              );
              let indexView = this.listGroupTask?.findIndex(
                (groupFind) => groupFind.recID == group.recID
              );
              if (index >= 0 && indexView >= 0) {
                this.currentStep?.taskGroups?.splice(index, 1);
                this.listGroupTask?.splice(indexView, 1);
              }
              if (this.currentStep?.tasks?.length > 0) {
                for (let i = 0; i < this.currentStep?.tasks?.length; ) {
                  if (this.currentStep?.tasks[i]?.taskGroupID == group?.refID) {
                    this.currentStep?.tasks.splice(i, 1);
                  } else {
                    i++;
                  }
                }
              }
              this.changeDetectorRef.detectChanges();
            } else {
            }
          });
      }
    });
  }

  async openPopupGroup(action, group) {
    let dataInput = {
      action,
      step: this.currentStep,
      dataGroup: group || {},
      isEditTimeDefault: this.currentStep?.leadtimeControl,
      isStart: this.isStart,
      owner: this.ownerInstance,
    };
    let popupTask = this.callfc.openForm(
      CodxAddGroupTaskComponent,
      '',
      500,
      550,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
  //#endregion

  //#region progress
  checkRoleUpdateProgress(data, type) {
    if (this.isMoveStage) {
      return type !== 'G';
    }
    if (this.isView) {
      return false;
    }
    if (this.isOnlyView && this.isStart) {
      if (!(data?.startDate && data?.endDate)) {
        return false;
      } else {
        return this.stepService.checkUpdateProgress(
          data,
          type,
          this.currentStep,
          this.isRoleAll,
          this.isOnlyView,
          this.isUpdateProgressGroup,
          this.isUpdateProgressStep,
          this.user
        );
      }
    }
    if (
      (data?.taskType == 'Q' || data?.taskType == 'CO') &&
      !data?.objectLinked &&
      this.isTaskFirst &&
      this.isRoleAll
    ) {
      return false;
    }
    return this.isTaskFirst && this.isRoleAll;
  }

  async openPopupUpdateProgress(data, type) {
    let check = this.checkRoleUpdateProgress(data, type);
    if (!check) {
      return;
    }
    let askUpdateParent = false;
    let checkUpdateGroup = this.listRecIDGroupUpdateProgress.some(
      (id) => id == data?.taskGroupID
    );
    if (type != 'P' && type != 'G') {
      if (
        (data?.taskType == 'Q' || data?.taskType == 'CO') &&
        !data?.objectLinked
      ) {
        this.notiService.notify('Hợp đồng chưa được tạo', '3');
        return;
      }
      let checkTaskLink = this.stepService.checkTaskLink(
        data,
        this.currentStep
      );
      if (!checkTaskLink) return;
      checkUpdateGroup = this.listRecIDGroupUpdateProgress.some(
        (id) => id == data?.taskGroupID
      );
      askUpdateParent =
        checkUpdateGroup || this.askUpdateProgressStep ? true : false;
    }
    if (type == 'G') {
      askUpdateParent = this.askUpdateProgressStep;
    }
    let dataInput = {
      data,
      type,
      isUpdateParent: askUpdateParent,
      step: this.currentStep,
      isSave: this.isSaveProgress,
      formModel: this.grvMoreFunction,
    };
    let popupTask = this.callfc.openForm(
      UpdateProgressComponent,
      '',
      550,
      600,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let dataProgress = dataPopupOutput?.event;
    if (dataProgress) {
      if (type == 'G') {
        this.askUpdateProgressStep = false;
        let check = this.listRecIDGroupUpdateProgress.some(
          (id) => id == data?.recID
        );
        if (!check) {
          this.listRecIDGroupUpdateProgress.push(data?.refID);
        }
      }
      if (type != 'P' && type != 'G' && checkUpdateGroup) {
        this.askUpdateProgressStep = false;
        let index = this.listRecIDGroupUpdateProgress?.findIndex(
          (id) => id == data?.taskGroupID
        );
        if (index >= 0) {
          this.listRecIDGroupUpdateProgress?.splice(index, 1);
        }
      }
      this.handelProgress(data, dataProgress);
      if (this.isTaskFirst && !this.isStart) {
        this.changeProgress.emit(true);
      }
    }
    this.changeDetectorRef.detectChanges();
    return dataPopupOutput;
  }

  updateDataProgress(data, dataProgress) {
    if (dataProgress?.type == 'P') {
      data.progress = dataProgress?.progressStep;
    } else if (dataProgress?.type == 'G') {
      data.progress = dataProgress?.progressGroupTask;
    } else {
      data.progress = dataProgress?.progressTask;
      data.status = dataProgress?.progressTask == 100 ? '3' : '2';
      this.moreDefaut = JSON.parse(JSON.stringify(this.moreDefaut));
      if (this.isMoveStage) {
        let index = this.moveStageData?.findIndex(
          (task) => task.taskID == dataProgress?.taskID
        );
        if (index >= 0) {
          let progressData = this.setProgressOutput(data, null);
          this.moveStageData?.splice(index, 1, progressData);
          this.valueChangeProgress.emit(this.moveStageData);
        } else {
          let progressData = this.setProgressOutput(data, null);
          this.moveStageData?.push(progressData);
          this.valueChangeProgress.emit(this.moveStageData);
        }
      }
    }
    data.note = dataProgress?.note;
    data.actualEnd = dataProgress?.actualEnd;
  }

  startTaskAuto(task) {
    const taskFinds = this.currentStep?.tasks?.filter((taskF) =>
      taskF?.parentID?.includes(task?.refID)
    );
    if (taskFinds && taskFinds.length > 0) {
      taskFinds.forEach((element) => {
        if (element?.dependRule == '1') {
          const listIDTask = element?.parentID?.split(';');
          const areAllTasksCompleted = listIDTask.every((idTask) => {
            const taskF = this.currentStep?.tasks?.find(
              (taskF) => taskF.refID === idTask
            );
            return taskF && taskF.progress >= 100;
          });
          if (areAllTasksCompleted) {
            element.status = '2';
            let groupView = this.listGroupTask.find(
              (group) => group.refID == element?.taskGroupID
            );
            if (groupView && groupView?.task?.length > 0) {
              let taskViewIndex = groupView?.task?.findIndex(
                (t) => t?.recID == element?.recID
              );
              if (taskViewIndex >= 0) {
                groupView?.task?.splice(
                  taskViewIndex,
                  1,
                  JSON.parse(JSON.stringify(element))
                );
              }
            }
          }
        }
      });
    }
  }

  handelProgress(data, dataProgress) {
    if (dataProgress) {
      if (dataProgress?.type == 'P') {
        this.updateDataProgress(data, dataProgress);
        if (dataProgress?.progressStep == 100) {
          this.isSuccessStep.emit(true);
        }
      } else if (dataProgress?.type == 'G') {
        this.updateDataProgress(data, dataProgress);
        let groupData = this.currentStep?.taskGroups?.find(
          (group) => group.recID == dataProgress?.groupTaskID
        );
        if (groupData) {
          this.updateDataProgress(groupData, dataProgress);
        }
        if (dataProgress?.isUpdate) {
          this.currentStep.progress = dataProgress?.progressStep;
          this.isChangeProgress.emit(true);
          if (dataProgress?.progressStep == 100) {
            this.isSuccessStep.emit(true);
          }
        }
      } else {
        this.updateDataProgress(data, dataProgress);
        if (this.isMoveStage) {
          data.progressOld = dataProgress?.progressTask; // dành cho cập nhật tất cả
          data.isChange = true;
          data.statusOld = dataProgress?.progressTask == 100 ? '3' : '2';
        }
        let taskFind = this.currentStep?.tasks?.find(
          (task) => task.recID == dataProgress.taskID
        );
        taskFind && this.updateDataProgress(taskFind, dataProgress);

        //cập nhật group và step
        if (dataProgress?.isUpdate) {
          let groupView = this.listGroupTask.find(
            (group) =>
              group.recID == dataProgress?.groupTaskID ||
              group.refID == dataProgress?.groupTaskID
          );
          let groupData = this.currentStep?.taskGroups?.find(
            (group) => group.recID == dataProgress?.groupTaskID
          );
          if (groupView) {
            groupView.progress = dataProgress?.progressGroupTask;
            groupView.actualEnd = groupView.progress == 100 ? new Date() : null;
          }
          if (groupData) {
            groupData.progress = dataProgress?.progressGroupTask;
            groupView.actualEnd = groupView.progress == 100 ? new Date() : null;
          }
          this.currentStep.progress = dataProgress?.progressStep;
          this.isChangeProgress.emit(true);
          dataProgress?.progressStep == 100 && this.isSuccessStep.emit(true);
        }
        //làm như vậy để cập nhật file
        let dataCopy = JSON.parse(JSON.stringify(data));
        // let groupFind = this.listGroupTask.find(
        //   (group) => group.refID == dataCopy?.taskGroupID
        // );
        let groupFind = this.listGroupTask.find((group) => {
          if (dataCopy?.taskGroupID) {
            return group.refID == dataCopy?.taskGroupID;
          } else {
            return !!group.refID == !!dataCopy?.taskGroupID;
          }
        });
        if (groupFind) {
          let index = groupFind?.task?.findIndex(
            (taskFind) => taskFind.recID == dataCopy?.recID
          );
          index >= 0 && groupFind?.task?.splice(index, 1, dataCopy);
        }
        if (dataProgress?.progressTask == 100 && this.transferControl != '0') {
          if (this.transferControl == '2') {
            let isTaskEnd =
              dataProgress.taskID == this.idTaskEnd ? true : false;
            if (isTaskEnd) {
              this.continueStep.emit(true);
            }
          } else if (this.transferControl == '1') {
            let check = this.currentStep?.tasks?.some((x) => x?.progress < 100);
            if (!check) {
              this.continueStep.emit(true);
            }
          }
        }
        //Bắt đầu công việc khi công việc cha hoàn tất
        if (dataProgress?.progressTask == 100) {
          this.startTaskAuto(data);
        }
        setTimeout(() => {
          this.waitSetWidth(100, 100);
        },50);
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  //#endregion

  //#region view
  viewTask(data, type) {
    if (data && !this.isMoveStage) {
      if (data?.taskType == 'CO') {
        if (data?.objectLinked) {
          const url1 = this.location.prepareExternalUrl(this.location.path());
          const parser = document.createElement('a');
          parser.href = url1;
          const domain = parser.origin;

          let tenant = this.tenantStore.get().tenant;
          let url = `${domain}/${tenant}/cm/contracts/CM0206?predicate=RecID=@0&dataValue=${data?.objectLinked}`;
          window.open(url, '_blank');
          return;
        } else {
          this.notiService.notify('Bắt đầu ngay để thiết lập hợp đồng', '3');
        }
      } else {
      }
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      //a thao laasy refID
      let listRefIDAssign = '';
      switch (type) {
        case 'T':
          listRefIDAssign = data.recID;
          break;
        case 'G':
          if (data.task?.length > 0) {
            let arrRecIDTask = data.task.map((x) => x.recID);
            listRefIDAssign = arrRecIDTask.join(';');
          }
          break;
        case 'P':
          if (data.taskGroup?.length > 0) {
            if (data.taskGroup?.task?.length > 0) {
              let arrRecIDTask = data.taskGroup.task.map((x) => x.recID);
              if (listRefIDAssign && listRefIDAssign.trim() != '')
                listRefIDAssign += ';' + arrRecIDTask.join(';');
              else listRefIDAssign = arrRecIDTask.split(';');
            }
            //thieu cong task ngooai mai hoir thuan de xets
          }
          break;
      }

      let listData = {
        type,
        value: data,
        step: this.currentStep,
        isRoleAll: this.isRoleAll,
        isUpdate: this.isUpdate,
        isOnlyView: this.isOnlyView,
        isUpdateProgressGroup: this.isUpdateProgressGroup,
        listRefIDAssign: listRefIDAssign,
        instanceStep: this.currentStep,
        sessionID: this.sessionID, // session giao việc
        formModelAssign: this.formModelAssign, // formModel của giao việc
        customerName: this.customerName,
        dealName: this.dealName,
        contractName: this.contractName,
        leadName: this.leadName,
        listField: this.listFieldTask,
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
      dialog.closed.subscribe(async (dataOuput) => {
        if (dataOuput?.event?.dataProgress) {
          this.handelProgress(data, dataOuput?.event?.dataProgress);
        }
        if (dataOuput?.event?.task || dataOuput?.event?.group) {
          await this.getStepById();
        }
        this.moreDefaut = { ...this.moreDefaut };
      });
    }
  }

  viewDetailContract(task) {
    if (task?.objectLinked) {
      this.stepService.getOneContract(task?.objectLinked).subscribe((res) => {
        if (res) {
          let data = {
            contract: res,
          };
          let option = new DialogModel();
          option.IsFull = true;
          option.zIndex = 1001;
          this.callfc.openForm(
            ContractsDetailComponent,
            '',
            null,
            null,
            '',
            data,
            '',
            option
          );
        } else {
          this.notiService.notify('Không tìm thấy hợp đồng', '3');
        }
      });
    } else {
      this.notiService.notify('Không tìm thấy hợp đồng', '3');
    }
  }
  //#endregion

  //#region cheack
  checRoleOwner(data) {
    return this.user.userID == data?.owner;
  }

  checkTaskLink(task) {
    let check = true;
    let tasks = this.currentStep?.tasks;
    if (task?.parentID && tasks?.length > 0) {
      //check công việc liên kết hoàn thành trước
      let taskName = '';
      let listID = task?.parentID.split(';');
      listID?.forEach((item) => {
        let taskFind = tasks?.find((task) => task.refID == item);
        if (taskFind?.progress != 100) {
          check = false;
          taskName = taskFind?.taskName;
        }
      });
      if (!check) {
        this.notiService.notifyCode('DP023', 0, "'" + taskName + "'");
      }
    }
    return check;
  }
  //#endregion

  //#region tao lich hop
  async createMeeting(data) {
    this.stepService
      .getDefault('CO', 'TMT0501', 'CO_Meetings')
      .subscribe(async (res) => {
        if (res && res?.data) {
          let meeting = res.data;
          meeting['_uuid'] = meeting['meetingID'] ?? Util.uid();
          meeting['idField'] = 'meetingID';
          meeting.meetingName = data?.taskName;
          meeting.meetingType = '1';
          meeting.refID = data.recID;
          meeting.refType = 'DP_Instances_Steps_Tasks';
          meeting.meetingType = '1';
          meeting.reminder = Number.isNaN(data.reminders)
            ? 0
            : Number.parseInt(data.reminders);
          let option = new SidebarModel();
          option.Width = '800px';
          option.zIndex = 1011;
          let formModel = new FormModel();

          let preside;
          let participants;
          let listPermissions = '';
          if (data?.roles?.length > 0) {
            preside = data?.roles.filter((x) => x.objectID == data.owner)[0]
              ?.objectID;
            if (preside) listPermissions += preside;
            participants = data?.roles.filter((x) => x.objectID != data.owner);
            if (participants?.length) {
              let userIDPar = await this.getListUserIDByOther(participants);
              if (userIDPar?.length > 0) {
                let idxPre = userIDPar.findIndex((x) => x == preside);
                if (idxPre != -1) userIDPar.splice(idxPre, 1);
                listPermissions += ';' + userIDPar.join(';');
              }
            }
          }

          this.cache.functionList('TMT0501').subscribe((f) => {
            if (f) {
              this.cache.gridView(f.gridViewName).subscribe((res) => {
                this.cache
                  .gridViewSetup(f.formName, f.gridViewName)
                  .subscribe((grvSetup) => {
                    if (grvSetup) {
                      formModel.funcID = 'TMT0501';
                      formModel.entityName = f.entityName;
                      formModel.formName = f.formName;
                      formModel.gridViewName = f.gridViewName;
                      option.FormModel = formModel;
                      option.Width = '800px';
                      let obj = {
                        action: 'add',
                        titleAction: this.titleAction,
                        disabledProject: false,
                        preside: preside,
                        data: meeting,
                        listPermissions: listPermissions,
                        isOtherModule: true,
                      };
                      let dialog = this.callfc.openSide(
                        PopupAddMeetingComponent,
                        obj,
                        option
                      );
                      dialog.closed.subscribe((e) => {
                        if (e?.event) {
                          if (this.listGroupTask?.length > 0) {
                            let group = this.listGroupTask.find(
                              (g) => g.refID == data?.taskGroupID
                            );
                            if (group) {
                              let indexTask = group?.task?.findIndex(
                                (taskFind) => taskFind.recID == data.recID
                              );
                              if (indexTask != -1) {
                                group.task[indexTask].actionStatus = '2';
                                let taskConvert = JSON.parse(
                                  JSON.stringify(group.task[indexTask])
                                );
                                group.task?.splice(indexTask, 1, taskConvert);
                                let taskFind = this.currentStep?.task?.find(
                                  (task) => taskFind.recID == data.recID
                                );
                                if (taskFind) {
                                  taskFind['actionStatus'] = '2';
                                }
                              }
                            }
                          }
                          this.notiService.notifyCode(
                            'E0322',
                            0,
                            '"' + this.titleAction + '"'
                          );
                          this.changeDetectorRef.detectChanges();
                        }
                      });
                    }
                  });
              });
            }
          });
        }
      });
  }

  async editMeeting(data) {
    var meeting = await firstValueFrom(
      this.api.execSv<any>(
        'CO',
        'ERM.Business.CO',
        'MeetingsBusiness',
        'GetMeetingByStepTaskAsync',
        [data.recID, 'DP_Instances_Steps_Tasks']
      )
    );
    if (meeting != null) {
      let option = new SidebarModel();
      option.Width = '800px';
      option.zIndex = 1011;
      let formModel = new FormModel();
      this.cache.functionList('TMT0501').subscribe((f) => {
        if (f) {
          this.cache.gridView(f.gridViewName).subscribe((res) => {
            this.cache
              .gridViewSetup(f.formName, f.gridViewName)
              .subscribe((grvSetup) => {
                if (grvSetup) {
                  formModel.funcID = 'TMT0501';
                  formModel.entityName = f.entityName;
                  formModel.formName = f.formName;
                  formModel.gridViewName = f.gridViewName;
                  option.FormModel = formModel;
                  option.Width = '800px';
                  let obj = {
                    action: 'edit',
                    titleAction: this.titleAction,
                    disabledProject: true,
                    data: meeting,
                    isOtherModule: true,
                  };
                  let dialog = this.callfc.openSide(
                    PopupAddMeetingComponent,
                    obj,
                    option
                  );
                  dialog.closed.subscribe((e) => {
                    if (e?.event) {
                      this.notiService.notifyCode(
                        'E0322',
                        0,
                        '"' + this.titleAction + '"'
                      );
                    }
                  });
                }
              });
          });
        }
      });
    }
  }

  async deleteMeeting(data) {
    var meeting: any;
    meeting = await firstValueFrom(
      this.api.execSv(
        'CO',
        'ERM.Business.CO',
        'MeetingsBusiness',
        'GetMeetingByStepTaskAsync',
        [data.recID, 'DP_Instances_Steps_Tasks']
      )
    );
    if (meeting != null) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x?.event?.status == 'Y') {
          this.api
            .execSv<any>(
              'CO',
              'ERM.Business.CO',
              'MeetingsBusiness',
              'DeleteMeetingsAsync',
              [meeting.meetingID]
            )
            .subscribe((res) => {
              if (res) {
                if (this.listGroupTask?.length > 0) {
                  let group = this.listGroupTask.find(
                    (g) => g.refID == data?.taskGroupID
                  );
                  if (group) {
                    let indexTask = group?.task?.findIndex(
                      (taskFind) => taskFind.recID == data.recID
                    );
                    if (indexTask != -1) {
                      group.task[indexTask].actionStatus = '2';
                      let taskConvert = JSON.parse(
                        JSON.stringify(group.task[indexTask])
                      );
                      group.task?.splice(indexTask, 1, taskConvert);
                      let taskFind = this.currentStep?.task?.find(
                        (task) => taskFind.recID == data.recID
                      );
                      if (taskFind) {
                        taskFind['actionStatus'] = '0';
                      }
                    }
                  }
                }
                this.notiService.notifyCode(
                  'E0322',
                  0,
                  '"' + this.titleAction + '"'
                );
              }
            });
        }
      });
    }
  }
  //get userID cuộc họp
  async getListUserIDByOther(list = []) {
    let lstUserID = [];
    if (list != null && list.length > 0) {
      lstUserID = list
        .filter((x) => x.objectType == 'U' || x.objectType == '1')
        .map((x) => x.objectID);
      //org
      let listO = list
        .filter((x) => x.objectType == 'O')
        .map((x) => x.objectID);

      if (listO?.length > 0) {
        let userIDO = await firstValueFrom(this.getListUserIDBy(listO, 'O'));
        if (userIDO?.length > 0) {
          const set = new Set(lstUserID.concat(userIDO));
          lstUserID = [...set];
        }
      }
      // dep
      let listD = list
        .filter((x) => x.objectType == 'D')
        .map((x) => x.objectID);

      if (listD?.length > 0) {
        let userIDD = await firstValueFrom(this.getListUserIDBy(listD, 'D'));
        if (userIDD?.length > 0) {
          let set = new Set(lstUserID.concat(userIDD));
          lstUserID = [...set];
        }
      }

      let listP = list
        .filter((x) => x.objectType == 'P')
        .map((x) => x.objectID);
      // positon
      if (listP?.length > 0) {
        let userIDP = await firstValueFrom(this.getListUserIDBy(listP, 'P'));
        if (userIDP?.length > 0) {
          let set = new Set(lstUserID.concat(userIDP));
          lstUserID = [...set];
        }
      }

      // Role
      let listR = list
        .filter((x) => x.objectType == 'R')
        .map((x) => x.objectID);

      if (listR?.length > 0) {
        let userIDR = await firstValueFrom(this.getListUserIDByRoleID(listR));
        if (userIDR?.length > 0) {
          let set = new Set(lstUserID.concat(userIDR));
          lstUserID = [...set];
        }
      }
    }
    return lstUserID;
  }
  //#endregion

  //#region user
  getListUserIDBy(lstId, type) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListODPIDAsync',
      [lstId, type]
    );
  }

  getListUserIDByRoleID(id) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListUserByRoleIDAsync',
      [id]
    );
  }
  //#endregion

  //#region Booking Car
  async updateBookingCar(task) {
    let booking = await firstValueFrom(
      this.api.exec<any>(
        'EP',
        'BookingsBusiness',
        'GetBookingByIDAsync',
        task?.reference
      )
    );
    if (booking) {
      let option = new SidebarModel();
      option.FormModel = this.carFM;
      option.Width = '800px';
      let data = [booking, 'DPT04', this.addCarTitle, null, null, false];
      let dialog = this.callfc.openSide(
        CodxAddBookingCarComponent,
        data,
        option
      );
    }
  }
  addBookingCar(task) {
    let roleTypeP = task?.roles?.filter((role) => role.roleType == 'P') || [];
    let option = new SidebarModel();
    option.FormModel = this.carFM;
    option.Width = '800px';
    let data = [
      this.carFG?.value,
      'SYS01',
      this.addCarTitle,
      null,
      null,
      false,
      roleTypeP,
    ];
    let dialog = this.callfc.openSide(CodxAddBookingCarComponent, data, option);

    dialog.closed.subscribe((e) => {
      if (e?.event) {
        task.actionStatus = '2';
        task.reference = e?.event?.recID;
        this.api
          .exec<any>(
            'DP',
            'InstancesStepsBusiness',
            'UpdateTaskStepAsync',
            task
          )
          .subscribe((res) => {
            if (res) {
              let group = this.listGroupTask.find(
                (group) => group.refID == res?.taskGroupID
              );
              if (group) {
                let index = group?.task?.findIndex(
                  (taskFind) => taskFind.recID == task.recID
                );
                if (index >= 0) {
                  group?.task?.splice(index, 1, res);
                }
              }
            }
          });
      }
    });
  }
  //#endregion

  //#region status
  setStatusGroup(group) {
    if (!group) {
      return '1';
    }
    if (group?.task?.length > 0) {
      let check = group?.task?.some((task) => task?.status != '1');
      if (check || (group?.progress > 0 && group?.progress < 100)) {
        return '2';
      } else {
        return group?.progress <= 0 ? '1' : '3';
      }
    } else {
      return group?.progress > 0 && group?.progress < 100
        ? '2'
        : group?.progress <= 0
        ? '1'
        : '3';
    }
  }
  //#endregion

  //#region Guide
  toggleElemen() {
    this.isShowElement = !this.isShowElement;
    this.maxWidth = 0;
    this.waitSetWidth(50, 1000);
  }

  showGuide() {
    if (this.isZoomIn) return;
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
    if (this.isZoomOut) return;
    this.isZoomIn && this.dialogGuideZoomIn?.close();
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

  openTooltip(popup, data) {
    this.dataTooltipDay = data;
    popup.open();
  }
  //#endregion

  //#region Move Stage
  setProgressOutput(task, group) {
    let dataOutput = {};
    if (task) {
      dataOutput['isUpdate'] = true;
      dataOutput['actualEnd'] = new Date();
      dataOutput['note'] = null;
      dataOutput['type'] = 'T';
      dataOutput['progressTask'] = task?.progress;
      dataOutput['taskID'] = task?.recID;
      dataOutput['groupTaskID'] = group?.refID;
      dataOutput['stepID'] = this.currentStep?.recID;
    } else {
      dataOutput['isUpdate'] = true;
      dataOutput['actualEnd'] = new Date();
      dataOutput['note'] = null;
      dataOutput['type'] = 'G';
      dataOutput['progressTask'] = null;
      dataOutput['taskID'] = task?.recID;
      dataOutput['groupTaskID'] = group?.recID;
      dataOutput['stepID'] = this.currentStep?.recID;
      dataOutput['progressGroupTask'] = group?.progress;
    }
    return dataOutput;
  }

  updateProgress(group, progressData, isRequired = false) {
    let countTask = group?.task?.length;
    if (countTask > 0) {
      let sumProgress = 0;
      const processTask = (task) => {
        task.progress = 100;
        task.status = '3';
        task.actualEnd = new Date();
        progressData.push(this.setProgressOutput(task, null));
      };

      if (isRequired) {
        group?.task?.forEach((task) => {
          if (task?.requireCompleted) {
            processTask(task);
          } else if (task?.isChange) {
            task.progress = task?.progressOld;
            task.status = task?.statusOld;
            progressData.push(this.setProgressOutput(task, null));
          } else {
            task.progress = task?.progressOld;
            task.status = task?.statusOld;
          }
          sumProgress += task.progress;
        });
        if (group?.recID) {
          group.progress = Number((sumProgress / countTask).toFixed(2));
          // progressData.push(this.setProgressOutput(null, group));
        }
      } else {
        group?.task?.forEach((task) => {
          processTask(task);
        });
        group.progress = 100;
        if (group?.recID) {
          // progressData.push(this.setProgressOutput(null, group));
        }
      }
    }
  }

  resetProgress(group, progressData, isRequired = false) {
    let countTask = group?.task?.length;
    if (countTask > 0) {
      let sumProgress = 0;
      group?.task?.forEach((task) => {
        task.progress = task?.progressOld;
        task.status = task?.statusOld;
        task.actualEnd = null;
        if (task?.isChange) {
          progressData.push(this.setProgressOutput(task, null));
        }
        sumProgress += task.progress;
      });
      if (group?.isChangeAuto) {
        group.progress = Number((sumProgress / countTask).toFixed(2));
      }
      // if (group?.recID && group?.isChange) {
      //   progressData.push(this.setProgressOutput(null, group));
      // }
    }
  }

  changeSuccessAll(event) {
    this.isSuccessRequired = false;
    this.moveStageData = [];
    if (event && event?.checked) {
      this.successAll = true;
      this.successRequired = false;
      this.listGroupTask?.forEach((group) => {
        this.updateProgress(group, this.moveStageData);
      });
    } else {
      this.successAll = false;
      this.listGroupTask?.forEach((group) => {
        this.resetProgress(group, this.moveStageData);
      });
    }
    this.valueChangeProgress.emit(this.moveStageData);
  }

  changeSuccessRequired(event) {
    this.isSuccessAll = false;
    this.moveStageData = [];
    if (event && event?.checked) {
      this.successAll = false;
      this.successRequired = true;
      this.listGroupTask?.forEach((group) => {
        this.updateProgress(group, this.moveStageData, true);
      });
    } else {
      this.successRequired = false;
      this.listGroupTask?.forEach((group) => {
        this.resetProgress(group, this.moveStageData, true);
      });
    }
    this.valueChangeProgress.emit(this.moveStageData);
  }
  //#endregion

  //#region common
  comparison(value1, value2) {
    return (
      value1 === value2 ||
      (value1 === null && value2 === '') ||
      (value1 === '' && value2 === null)
    );
  }
  //#endregion
  setNameTypeTask(taskType) {
    let type = this.listTaskType?.find((task) => task?.value == taskType);
    return type?.text;
  }

  getDefaultCM() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GetListBoughtModuleAsync',
        ''
      )
      .subscribe((res: Array<TN_OrderModule>) => {
        if (res) {
          let lstModule = res;
          this.isBoughtTM = lstModule?.some(
            (md) =>
              !md?.boughtModule?.refID &&
              md.bought &&
              md.boughtModule?.moduleID == 'TM1'
          );
        }
      });
  }

  //field chứa trong form
  getFields(listField, fieldID) {
    if (listField?.length > 0) {
      this.listFieldTask = listField?.filter((field) =>
        fieldID.includes(field?.recID)
      );
      return this.listFieldTask;
    }
    return null;
  }
  //field khác và có giá trị ddeer tisnh toan => tối ưu sẽ lấy các trường liên quan
  getFieldsOther(listField, fieldID) {
    var check = this.listFieldTask.some((x) => x.dataType == 'CF');
    if (!check) return null;
    if (listField?.length > 0) {
      let fieldOrther = listField?.filter(
        (field) =>
          !fieldID.includes(field?.recID) &&
          field.dataValue &&
          field.dataType == 'N'
      );
      return fieldOrther;
    }
    return null;
  }

  //#region set owner
  setOwnerByChangeOwnerInstance(instanceID, insStepID) {
    // this.getStepById(true, this.currentStep?.recID);
    this.api
      .exec<any>(
        'DP',
        'InstancesBusiness',
        'UpdateOwnerInsStepByChangeInstanceAsync',
        [instanceID, insStepID]
      )
      .subscribe((res) => {
        if (res) {
          res?.forEach((element) => {
            if (
              !element?.taskGroupID &&
              !element.taskID &&
              element.stepID == this.currentStep?.recID
            ) {
              this.currentStep.owner = element?.objectID;
            } else if (element.taskGroupID && !element.taskID) {
              let group = this.listGroupTask?.find(
                (g) => g.recID == element.taskGroupID
              );
              if (group) {
                group.owner = element?.objectID;
              }
            } else if (element.taskID) {
              let group = this.listGroupTask?.find(
                (g) => g.refID == element.taskGroupID
              );
              if (group?.task?.length > 0) {
                let task = group?.task?.find((t) => t.recID == element.taskID);
                if (task) {
                  task.owner = element?.objectID;
                }
              }
            }
          });
        }
      });
  }

  //#endregion

  approvalTrans(task: DP_Instances_Steps_Tasks) {
    this.taskApproval = task;
    let idTask = task?.isTaskDefault ? task?.refID : task?.recID;
    let category = task?.isTaskDefault
      ? 'DP_Steps_Tasks'
      : 'DP_Instances_Steps_Tasks';
    if (task?.approveRule && task?.recID) {
      this.api
        .execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDTypeAsync',
          [idTask, category, null]
        )
        .subscribe((res) => {
          if (!res) {
            this.notiService.notifyCode('ES028');
            return;
          } else {
            this.stepService
              .getDataSource(
                task,
                this.currentStep.instanceID,
                this.entityName,
                this.recIDParent
              )
              .then((source) => {
                let formModelEx = this.frmModelExport;
                if (task.taskType != 'CO' && task.taskType != 'Q') {
                  formModelEx = this.getFormModelEx(formModelEx);
                }
                let exportData: ExportData = {
                  funcID: 'DPT04',
                  recID: task?.recID,
                  data: source,
                  entityName: formModelEx.entityName,
                  formName: formModelEx.formName,
                  gridViewName: formModelEx.gridViewName,
                };
                this.release(task, res, exportData);
              });
          }
        });
    } else {
      this.notiService.notifyCode('DP040');
    }
  }

  release(data: any, category: any, exportData = null) {
    this.codxCommonService.codxReleaseDynamic(
      'DP',
      data,
      category,
      'DP_Instances_Steps_Tasks', // entyname của đối tượng gửi duyệt ???????????
      'DPT04',
      data?.taskName,
      this.releaseCallback.bind(this),
      null,
      null,
      'DP_Instances_Steps_Tasks',
      null,
      null,
      exportData
    );
  }

  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notiService.notify(res?.msgCodeError);
    else {
      this.taskApproval.approveStatus = res?.returnStatus || '3';
      this.waitSetWidth(100, 100);
      this.moreDefaut = JSON.parse(JSON.stringify(this.moreDefaut));
      this.changeDetectorRef.markForCheck();
    }
  }

  cancelApprover(task) {
    let idTask = task?.isTaskDefault ? task?.refID : task?.recID;
    let category = task?.isTaskDefault
      ? 'DP_Steps_Tasks'
      : 'DP_Instances_Steps_Tasks';
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.api
          .execSv<any>(
            'ES',
            'ES',
            'CategoriesBusiness',
            'GetByCategoryIDTypeAsync',
            [idTask, category, null]
          )
          .subscribe((res: any) => {
            if (res) {
              this.codxCommonService
                .codxCancel(
                  'DP',
                  task?.recID,
                  'DP_Instances_Steps_Tasks',
                  null,
                  null
                )
                .subscribe((res2: any) => {
                  if (res2?.msgCodeError)
                    this.notiService.notify(res?.msgCodeError);
                  else {
                    task.approveStatus = res2?.returnStatus || '0';
                    this.moreDefaut = JSON.parse(
                      JSON.stringify(this.moreDefaut)
                    );
                    this.changeDetectorRef.markForCheck();
                  }
                });
            } else {
              this.notiService.notifyCode('SYS021');
            }
          });
      }
    });
  }

  openFormApprover(task) {
    this.taskApproval = task;
    this.approverDialog = this.callfc.openForm(
      CodxViewApproveComponent,
      '',
      500,
      550,
      '',
      { categoryID: task?.recID, type: '2', stepsTasks: task }
    );
  }

  openFormField(task) {
    if (!(this.isOnlyView || (this.isTaskFirst && this.isRoleAll))) {
      return;
    }
    let listField = this.getFields(this.currentStep?.fields, task?.fieldID);
    let obj = {
      data: JSON.parse(JSON.stringify(listField)),
      titleHeader: task?.taskName,
      objectIdParent: task?.stepID,
      // customerID: '',
      isAdd: true, ///là add form để lấy giá trị mặc định gán vào
      taskID: task.recID,
      fieldOther: this.getFieldsOther(this.currentStep?.fields, task?.fieldID),
      isView: this.isView,
    };
    let formModel: FormModel = {
      entityName: 'DP_Instances_Steps_Fields',
      formName: 'DPInstancesStepsFields',
      gridViewName: 'grvDPInstancesStepsFields',
    };
    let option = new DialogModel();
    option.FormModel = formModel;
    option.zIndex = 1000;
    let fieldPopup = this.callfc.openForm(
      PopupCustomFieldComponent,
      '',
      550,
      800,
      '',
      obj,
      '',
      option
    );
    fieldPopup.closed.subscribe((res) => {
      let fields = res?.event;
      let listFieldStep = this.currentStep?.fields;
      let countFieldChange = 0;
      if (fields?.length > 0 && listFieldStep?.length > 0) {
        fields?.forEach((element) => {
          let field = listFieldStep?.find((x) => x.recID == element?.recID);
          if (field) {
            field.dataValue = element?.dataValue;
            field['versions'] = element?.versions; // lưu version
            if (element?.dataValue) {
              countFieldChange++;
            }
          }
        });
        this.currentStep.fields = this.caculateField(
          task?.fieldID,
          listFieldStep
        );

        if (countFieldChange == fields?.length) {
          task.status = '3';
          let actualEnd = new Date();
          this.updateProgressForm(
            task,
            actualEnd,
            100,
            this.currentStep?.recID,
            task?.recID,
            'F',
            true
          );
        } else {
          let progress = Math.floor((countFieldChange / fields?.length) * 100);
          task.progress = progress >= 0 ? progress : 0;
          task.status = '2';
          this.updateProgressForm(
            task,
            null,
            progress,
            this.currentStep?.recID,
            task?.recID,
            'F',
            true
          );
        }
        if (this.isTaskFirst && !this.isStart && this.isRoleAll) {
          this.changeProgress.emit(true);
        }
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  updateProgressForm(
    task,
    actualEnd,
    progress,
    stepID,
    taskID,
    type,
    isUpdate = true
  ) {
    let dataSave = new Progress();
    dataSave.stepID = stepID;
    dataSave.recID = taskID;
    dataSave.progress = progress;
    dataSave.actualEnd = actualEnd;
    dataSave.type = type;
    dataSave.isUpdate = isUpdate;
    this.api
      .exec<any>(
        'DP',
        'InstancesStepsBusiness',
        'UpdateProgressAsync',
        dataSave
      )
      .subscribe((res) => {
        if (res) {
          this.handelProgress(task, res);
        }
      });
  }

  exportTemplet(e, data) {
    this.stepService
      .getDataSource(
        data,
        this.currentStep.instanceID,
        this.entityName,
        this.recIDParent
      )
      .then((res) => {
        var customData = {
          refID: data.recID,
          refType: 'DP_Instances_Steps_Tasks',
          dataSource: res ?? '',
        };

        if (data?.isTaskDefault) {
          customData.refID = data.refID;
          customData.refType = 'DP_Steps_Tasks';
        }

        let formModelEx = this.frmModelExport;
        if (data.taskType != 'CO' && data.taskType != 'Q') {
          formModelEx = this.getFormModelEx(formModelEx);
        }

        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          formModelEx,
          null,
          this,
          customData
        );
        this.changeDetectorRef.detectChanges();
      });
  }

  getFormModelEx(formModelEx: FormModel) {
    switch (this.entityName) {
      case 'CM_Deals':
        formModelEx.entityName = 'CM_Deals';
        formModelEx.gridViewName = 'grvCMDeals';
        formModelEx.formName = 'CMDeals';
        break;
      case 'CM_Cases':
        formModelEx.entityName = 'CM_Cases';
        formModelEx.gridViewName = 'grvCMCases';
        formModelEx.formName = 'CMDeals';
        break;
      case 'CM_Leads':
        formModelEx.entityName = 'CM_Leads';
        formModelEx.gridViewName = 'grvCMLeads';
        formModelEx.formName = 'CMLeads';
        break;
      //contrack và quations thì dùng măc định
      // case 'CM_Contracts':
      //   formModelEx.entityName = 'CM_Contracts';
      //   formModelEx.gridViewName = 'grvCMContracts';
      //   formModelEx.formName = 'CMContracts';
      //   break;
      case 'CM_Campaigns':
        formModelEx.entityName = 'CM_Campaigns';
        formModelEx.gridViewName = 'grvCMCampaigns';
        formModelEx.formName = 'CMCampaigns';
        break;
    }
    return formModelEx;
  }

  //export Form Nhập liệu

  sendMail(task, group) {
    let data = {
      dialog: null,
      formGroup: null,
      templateID: task?.reference,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: false,
    };

    let popEmail = this.callfc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res?.event?.isSendMail && task?.status == '1') {
        this.startTask(task, group);
      }
    });
  }

  handelMail(stepsTasks: DP_Instances_Steps_Tasks, action) {
    let task = stepsTasks ? stepsTasks : new DP_Instances_Steps_Tasks();
    let data = {
      formGroup: null,
      templateID: task?.reference || null,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: action == 'edit' ? false : true,
      saveIsTemplate: action == 'edit' || this.isStart ? false : true,
      notSendMail: this.isStart ? false : true,
    };

    let popEmail = this.callfc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res && res?.event) {
        let mail = res?.event;
        if (action === 'add' || action === 'copy') {
          task.refID = Util.uid();
          task.status = '1';
          task.progress = 0;
          task.assigned = '0';
          task.dependRule = '0';
          task.approveStatus = '1';
          task.approveStatus = '1';
          task.isTaskDefault = false;
          task.taskType = 'E';
          task.stepID = this.currentStep?.recID;
          task.taskName = mail?.subject || this.taskType?.text;
          task.durationDay = 1;
          task.reference = mail?.recID;
          task.memo = mail?.message;
          task.indexNo = this.currentStep?.tasks.length + 1;
          if (this.isStart) {
            if (mail?.isSendMail) {
              task.actualEnd = new Date();
              task.status = '3';
              task.progress = 100;
            } else {
              task.startDate = new Date();
              task.endDate = new Date();
              task.endDate.setDate(task.startDate.getDate() + 1);
              task.status = '1';
              task.progress = 0;
            }
          }
          this.setRole(task);
          this.api
            .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
              task,
            ])
            .subscribe((res) => {
              if (res) {
                this.changeTaskAdd(res[0], res[1], res[2], false);
              }
            });
        } else {
          task.taskName = mail?.subject || 'Email';
          task.memo = mail?.message;
          this.api
            .exec<any>('DP', 'InstancesStepsBusiness', 'UpdateTaskStepAsync', [
              task,
            ])
            .subscribe((res) => {
              if (res) {
                this.changeTaskEdit(res, res?.taskGroupID);
              }
            });
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  setRole(task) {
    let role = new DP_Instances_Steps_Tasks_Roles();
    role.recID = Util.uid();
    role.objectName = this.user?.userName;
    role.objectID = this.user?.userID;
    role.createdOn = new Date();
    role.createdBy = this.user?.userID;
    role.roleType = 'O';
    role.objectType = this.user?.objectType;
    task.owner = role.objectID;
    task.roles = [role];
    return role;
  }

  //Caculate
  caculateField(fieldID, fields) {
    let arrCaculateField = fields.filter(
      (x) => x.dataType == 'CF' && !fieldID.includes(x.recID)
    );
    if (!arrCaculateField || arrCaculateField?.length == 0) return fields;

    arrCaculateField.sort((a, b) => {
      if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
      else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
      else return 0;
    });
    let fieldsNum = fields.filter((x) => x.dataType == 'N');

    if (!fieldsNum || fieldsNum?.length == 0) return fields;

    arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;

      fieldsNum.forEach((f) => {
        if (dataFormat.includes('[' + f.fieldName + ']')) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;

          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      fields.forEach((x) => {
        if (dataFormat.includes('[' + x.fieldName + ']')) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = fields.findIndex((x) => x.recID == obj.recID);
        if (index != -1) {
          fields[index].dataValue = obj.dataValue;
        }
      }
    });
    return fields;
  }

  popupPermissions(data) {
    let dialogModel = new DialogModel();
    let formModel = new FormModel();
    formModel.formName = 'DPInstancesStepsTasksRoles';
    formModel.gridViewName = 'grvDPInstancesStepsTasksRoles';
    formModel.entityName = 'DP_Instances_Steps_Tasks_Roles';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      data: data,
      title: "Chia sẻ",
      entityName: "DP_Instances_Steps_Tasks_Roles",
    };
    this.callfc
      .openForm(
        CodxShareTaskComponent,
        '',
        950,
        650,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          
        }
      });
  }
}
