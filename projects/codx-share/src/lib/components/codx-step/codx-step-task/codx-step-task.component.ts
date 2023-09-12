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
} from 'codx-core';
import {
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks,
} from 'projects/codx-dp/src/lib/models/models';
import { firstValueFrom } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { StepService } from '../step.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TM_Tasks } from '../../codx-tasks/model/task.model';
import { AssignTaskModel } from '../../../models/assign-task.model';
import { CodxEmailComponent } from '../../codx-email/codx-email.component';
import { AssignInfoComponent } from '../../assign-info/assign-info.component';
import { CodxCalendarService } from '../../codx-calendar/codx-calendar.service';
import { CodxAddTaskComponent } from '../codx-add-stask/codx-add-task.component';
import { CodxTypeTaskComponent } from '../codx-type-task/codx-type-task.component';
import { UpdateProgressComponent } from '../codx-progress/codx-progress.component';
import { CodxViewTaskComponent } from '../codx-view-task/codx-view-task.component';
import { CodxAddGroupTaskComponent } from '../codx-add-group-task/codx-add-group-task.component';
import { PopupAddMeetingComponent } from '../../codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { AddContractsComponent } from 'projects/codx-cm/src/lib/contracts/add-contracts/add-contracts.component';
import { CodxAddBookingCarComponent } from '../../codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';
import { TN_OrderModule } from 'projects/codx-ad/src/lib/models/tmpModule.model';
import {
  CO_Meetings,
  CO_Permissions,
} from '../../codx-tmmeetings/models/CO_Meetings.model';

@Component({
  selector: 'codx-step-task',
  templateUrl: './codx-step-task.component.html',
  styleUrls: ['./codx-step-task.component.scss'],
})
export class CodxStepTaskComponent implements OnInit, OnChanges {
  @ViewChild('popupGuide') popupGuide;
  //#region Input
  @Input() stepId: any;
  @Input() dataSources: any;
  @Input() formModel: FormModel;
  @Input() taskAdd: DP_Instances_Steps_Tasks;
  1;
  @Input() groupTaskAdd: DP_Instances_Steps_TaskGroups;

  @Input() isTaskFirst = false; // giai đoạn đầu tiên
  @Input() isStart = true; // bắt đầu ngay
  @Input() isClose = false; // đóng nhiệm vụ
  @Input() isRoleAll = true;
  @Input() isOnlyView = true; // đang ở giai đoạn nào
  @Input() isShowFile = true;
  @Input() isDeepCopy = true; // copy sâu
  @Input() isAddTask = false;
  @Input() isShowStep = false;
  @Input() isShowElement = true; // thu gọn mở rộng group, task trong step
  @Input() isShowComment = true;
  @Input() isShowBtnAddTask = true;
  @Input() isSaveProgress = true; // lưu progress vào db
  @Input() askUpdateProgressStep = false; // lưu progress vào db

  @Input() isViewStep = false; // chỉ xem
  @Input() isMoveStage = false; // chuyển giai đoạn
  @Input() isLockSuccess = false; // lọc cái task 100%

  @Output() saveAssign = new EventEmitter<any>();
  @Output() continueStep = new EventEmitter<any>();
  @Output() isChangeProgress = new EventEmitter<any>();
  @Output() valueChangeProgress = new EventEmitter<any>(); // type A = all, D=default, R = required
  @Output() changeProgress = new EventEmitter<any>();
  @Output() isSuccessStep = new EventEmitter<any>();
  //#endregion
  
  //#region variable
  isUpdate;
  user: any;
  id: string;
  taskType: any;
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

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
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
    private calendarService: CodxCalendarService
  ) {
    this.user = this.authStore.get();
    this.id = Util.uid();
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
    if (DP048.datas) {
      this.vllDataStep = DP032?.datas;
    }
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
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.dataSources || changes.stepId) {
      this.grvMoreFunction = await this.getFormModel('DPT040102');
      await this.getStepById();
      if (this.isLockSuccess) {
        await this.removeTaskSuccess();
      }
      if (this.isOnlyView) {
        this.getTaskEnd();
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
      let group = this.listGroupTask?.find(
        (group) => group.refID == this.taskAdd?.taskGroupID
      );
      if (group) {
        if (!group?.task) {
          group['task'] = [];
        }
        group?.task?.push(this.taskAdd);
      }
    }
    if (
      changes?.isAddTask &&
      this.isRoleAll &&
      this.isOnlyView &&
      this.isAddTask
    ) {
      this.chooseTypeTask();
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
  }

  ngAfterViewInit() {
    this.cache.functionList('EPT21').subscribe((res) => {
      if (res) {
        this.addCarTitle = res?.customName;
      }
    });
    this.calendarService.getFormModel('EPT21').then((res) => {
      this.carFM = res;
      this.carFG = this.codxService.buildFormGroup(
        this.carFM?.formName,
        this.carFM?.gridViewName
      );
    });
  }

  async drop(event: CdkDragDrop<string[]>, data = null, isParent = false) {}

  //#region get Data
  async getStepById() {
    if (this.stepId) {
      this.currentStep = await firstValueFrom(
        this.api.exec<any>(
          'DP',
          'InstanceStepsBusiness',
          'GetStepByIdAsync',
          this.stepId
        )
      );
    } else {
      this.currentStep = this.isDeepCopy
        ? JSON.parse(JSON.stringify(this.dataSources))
        : this.dataSources;
    }
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
    this.listGroupTask = taskGroupConvert;
    if (taskGroupList['null']) {
      let taskGroup = {};
      taskGroup['task'] =
        taskGroupList['null']?.sort((a, b) => a['indexNo'] - b['indexNo']) ||
        [];
      taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
      this.listGroupTask.push(taskGroup);
    }
    this.listTask = this.currentStep['tasks'];
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID) || null);
    let formModel = {};
    if(f){
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
        switch (res.functionID) {
          case 'SYS02': //xóa
            if (
              !(
                !task?.isTaskDefault &&
                (this.isRoleAll || isGroup) &&
                this.isOnlyView
              )
            ) {
              res.disabled = true;
            }
            break;
          case 'SYS03': //sửa
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
            if (!task?.isTaskDefault) {
              res.isblur = true;
            }
            break;
          case 'DP20': // tiến độ
            if (
              !(
                (this.isRoleAll || isGroup || isTask) &&
                this.isOnlyView &&
                task?.status != '1'
              )
            ) {
              res.isblur = true;
            }
            break;
          case 'DP13': //giao việc
            if (
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
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
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
              !((this.isRoleAll || isGroup || isTask) && this.isOnlyView)
            ) {
              res.isblur = true;
            }
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
        switch (res.functionID) {
          case 'DP13':
          case 'DP27': // đặt xe
          case 'DP07':
          case 'DP31':
          case 'DP30':
          case 'DP29':
          case 'DP28':
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
            res.disabled = true;
            break;
          case 'DP20': // tiến độ
            res.isbookmark = false;
            if (
              !(this.isRoleAll && this.isOnlyView && this.isUpdateProgressStep)
            ) {
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
        this.chooseTypeTask();
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
        // this.addTask(groupTask);
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
        this.sendMail();
        break;
      case 'DP27':
        this.addBookingCar(task);
        break;
      case 'DP31':
        this.startTask(task, groupTask);
        break;
    }
  }

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
        this.chooseTypeTask(false, group?.refID);
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
  startTask(task: DP_Instances_Steps_Tasks, groupTask) {
    if (task?.taskType == 'Q') {
      //báo giá
      this.addQuotation();
    } else if (task?.taskType == 'CO') {
      // hợp đồng
      this.openPopupContract('add');
    }
    this.api
      .exec<any>('DP', 'InstanceStepsBusiness', 'StartTaskAsync', [
        task?.stepID,
        task?.recID,
      ])
      .subscribe((res) => {
        if (res) {
          let indexTaskView = groupTask?.task?.findIndex(
            (taskFind) => taskFind?.recID == task?.recID
          );
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
            taskFind.modifiedBy = this.user.userID;
            taskFind.modifiedOn = new Date();
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

  getDefault() {
    return this.api.execSv<any>(
      'CM',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      ['CM0202', 'CM_Quotations', 'quotationsID']
    );
  }

  openPopup(res, action) {
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
  }

  async openPopupContract(action, contract?) {
    let data = {
      action,
      contract: contract || null,
      // account: this.account,
      type: 'task',
    };
    let formModel: FormModel = {
      entityName: 'CM_Contracts',
      entityPer: 'CM_Contracts',
      formName: 'CMContracts',
      funcID: 'CM0204',
      gridViewName: 'grvCMContracts',
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    option.FormModel = formModel;
    let popupContract = this.callfc.openForm(
      AddContractsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
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
  async chooseTypeTask(showTask = true, groupID = null) {
    this.isAddTask = false;
    setTimeout(async () => {
      let popupTypeTask = this.callfc.openForm(
        CodxTypeTaskComponent,
        '',
        450,
        580,
        '',
        { isShowGroup: showTask }
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

  //#region CRUD Task
  async addTask(groupID) {
    let task = new DP_Instances_Steps_Tasks();
    task['taskType'] = this.taskType?.value;
    task['stepID'] = this.currentStep?.recID;
    task['progress'] = 0;
    task['taskGroupID'] = groupID || null;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;
    task['dependRule'] = '0';

    let taskOutput = await this.openPopupTask('add', task, groupID);
    if (taskOutput?.event?.task) {
      let data = taskOutput?.event;
      let groupData = this.currentStep?.taskGroups.find(
        (group) => group.refID == data.task.taskGroupID
      );
      if (this.listGroupTask && this.listGroupTask?.length <= 0) {
        let taskGroup = {};
        taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
        this.listGroupTask.push(taskGroup);
      }
      let group = this.listGroupTask.find(
        (group) => group.refID == data.task.taskGroupID
      );

      if (group) {
        if (!group?.task) {
          group['task'] = [];
        }
        group?.task?.push(data.task);
        group['progress'] = data.progressGroup;
      }
      if (groupData) {
        groupData['progress'] = data.progressGroup;
      }
      this.currentStep?.tasks?.push(data.task);
      this.currentStep['progress'] = data?.progressStep;
      this.notiService.notifyCode('SYS006');
      if (taskOutput?.event?.isCreateMeeting) {
        let dataTask: DP_Instances_Steps_Tasks = data.task;
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
        // this.createMeeting(data.task);
      }
    }
  }

  async editTask(task) {
    if (task) {
      let taskEdit = JSON.parse(JSON.stringify(task));
      let groupIdOld = taskEdit?.taskGroupID;
      this.taskType = this.listTaskType.find(
        (type) => type.value == taskEdit?.taskType
      );
      let dataOutput = await this.openPopupTask('edit', taskEdit);
      if (dataOutput?.event.task) {
        let taskOutput = dataOutput?.event?.task;
        let group = this.listGroupTask.find(
          (group) => group.refID == taskOutput?.taskGroupID
        );
        let indexTask = this.currentStep?.tasks?.findIndex(
          (taskFind) => taskFind.recID == task.recID
        );

        if (taskOutput?.taskGroupID != groupIdOld) {
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
            group?.task?.push(taskOutput);
          }
        } else {
          if (group) {
            let index = group?.task?.findIndex(
              (taskFind) => taskFind.recID == task.recID
            );
            if (index >= 0) {
              group?.task?.splice(index, 1, taskOutput);
            }
          }
        }
        if (indexTask >= 0) {
          this.currentStep?.tasks?.splice(indexTask, 1, taskOutput);
        }
        this.notiService.notifyCode('SYS007');
      }
    }
  }

  async copyTask(task) {
    if (task) {
      let taskCopy = JSON.parse(JSON.stringify(task));
      taskCopy.recID = Util.uid();
      taskCopy.refID = Util.uid();
      taskCopy['progress'] = 0;
      taskCopy['isTaskDefault'] = false;
      taskCopy['requireCompleted'] = false;
      taskCopy['dependRule'] = '0';
      this.taskType = this.listTaskType.find(
        (type) => type.value == taskCopy?.taskType
      );
      let taskOutput = await this.openPopupTask('copy', taskCopy);

      if (taskOutput?.event.task) {
        let data = taskOutput?.event;
        this.currentStep?.tasks?.push(data.task);
        this.currentStep['progress'] = data.progressStep;
        let group = this.listGroupTask.find(
          (group) => group.refID == data.task.taskGroupID
        );
        if (group) {
          group?.task.push(data.task);
          group['progress'] = data.progressGroup;
        }
      }
    }
  }

  deleteTask(task) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api
          .exec<any>('DP', 'InstanceStepsBusiness', 'DeleteTaskStepAsync', task)
          .subscribe((data) => {
            if (data) {
              let indexTask = this.currentStep?.tasks?.findIndex(
                (taskFind) => taskFind.recID == task.recID
              );
              let group = this.listGroupTask.find(
                (group) => group.refID == task.taskGroupID
              );
              let groupData = this.currentStep?.taskGroups?.find(
                (group) => group.refID == task.taskGroupID
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
            }
          });
      }
    });
  }

  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
      action,
      titleName: this.titleAction,
      taskType: this.taskType,
      step: this.currentStep,
      listGroup: this.listGroupTask,
      dataTask: dataTask || {},
      listTask: this.listTask,
      isEditTimeDefault: this.currentStep?.leadtimeControl,
      groupTaskID, // trường hợp chọn thêm từ nhóm
      isStart: this.isStart,
      isBoughtTM: this.isBoughtTM,
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1011;
    option.FormModel = frmModel;
    let popupTask = this.callfc.openSide(
      CodxAddTaskComponent,
      dataInput,
      option
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
  //#endregion

  //#region giao viec
  assignTask(moreFunc, data) {
    if (data?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    var task = new TM_Tasks();
    task.taskName = data.taskName;
    task.refID = data?.recID;
    task.refType = 'DP_Instances_Steps_Tasks';
    task.dueDate = data?.endDate;
    task.sessionID = this.currentStep?.instanceID;
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
    option.FormModel = this.frmModelInstancesTask;
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
            'InstanceStepsBusiness',
            'UpdatedAssignedStepTasksAsync',
            [data.stepID, data.recID]
          )
          .subscribe((res) => {
            if (res) {
              data.assigned == '1';
            }
          });
      }
      this.saveAssign.emit(doneSave);
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
          if (!group?.isTaskDefault) {
            group['taskGroupName'] = data?.groupTask?.taskGroupName;
            group['memo'] = data?.groupTask?.memo;
          }
        }
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
            'InstanceStepsBusiness',
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
    };
    let popupTask = this.callfc.openForm(
      CodxAddGroupTaskComponent,
      '',
      500,
      500,
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
      // chuyển giai đoạn
      if (type == 'G') {
        return false;
      } else {
        return true;
      }
    } else {
      if (this.isTaskFirst && this.currentStep?.stepStatus == '0') {
        return true;
      } else {
        if (
          !this.isOnlyView ||
          !this.isStart ||
          this.isClose ||
          this.isViewStep
        ) {
          return false;
        } else {
          let checkUpdate = this.stepService.checkUpdateProgress(
            data,
            type,
            this.currentStep,
            this.isRoleAll,
            this.isOnlyView,
            this.isUpdateProgressGroup,
            this.isUpdateProgressStep,
            this.user
          );
          return checkUpdate;
        }
      }
    }
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
    };
    let popupTask = this.callfc.openForm(
      UpdateProgressComponent,
      '',
      550,
      400,
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
      if(this.isMoveStage && !this.moveStageData?.some(task => task.taskID == dataProgress?.taskID)){
        this.moveStageData?.push(this.setProgressOutput(data, null));
        this.valueChangeProgress.emit({ type: 'A', data: this.moveStageData });     
      }
    }
    data.note = dataProgress?.note;
    data.actualEnd = dataProgress?.actualEnd;
  }

  startTaskAuto(task) {
    const taskFinds = this.currentStep?.tasks?.filter((taskF) =>
      taskF.parentID.includes(task?.refID)
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
        if (this.isMoveStage) {
          data.progressOld = dataProgress?.progressTask; // dành cho cập nhật tất cả
          data.isChange = true;
          data.isChangeProgressAuto = false;
        }
      } else {
        this.updateDataProgress(data, dataProgress);
        if (this.isMoveStage) {
          data.progressOld = dataProgress?.progressTask; // dành cho cập nhật tất cả
          data.isChange = true;
        }
        let taskFind = this.currentStep?.tasks?.find(
          (task) => task.recID == dataProgress.taskID
        );
        if (taskFind) {
          this.updateDataProgress(taskFind, dataProgress);
        }
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
            if (this.isMoveStage) {
              groupView.progressOld = dataProgress?.progressGroupTask; // dành cho cập nhật tất cả
              groupView.isChange = false;
              data.isChangeProgressAuto = true;
            }
          }
          if (groupData) {
            groupData.progress = dataProgress?.progressGroupTask;
          }
          this.currentStep.progress = dataProgress?.progressStep;
          this.isChangeProgress.emit(true);
          if (dataProgress?.progressStep == 100) {
            this.isSuccessStep.emit(true);
          }
        }
        //làm như vậy để cập nhật file
        let dataCopy = JSON.parse(JSON.stringify(data));
        let groupFind = this.listGroupTask.find(
          (group) => group.refID == dataCopy?.taskGroupID
        );
        if (groupFind) {
          let index = groupFind?.task?.findIndex(
            (taskFind) => taskFind.recID == dataCopy?.recID
          );
          if (index >= 0) {
            groupFind?.task?.splice(index, 1, dataCopy);
          }
        }
        if (dataProgress?.progressTask == 100) {
          let isTaskEnd = dataProgress.taskID == this.idTaskEnd ? true : false;
          this.continueStep.emit(isTaskEnd);
        }
        //Bắt đầu công việc khi công việc cha hoàn tất
        if (dataProgress?.progressTask == 100) {
          this.startTaskAuto(data);
        }
      }
    }
  }
  //#endregion

  //#region view
  viewTask(data, type) {
    if (data && !this.isViewStep && !this.isMoveStage) {
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
      });
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
      .getDefault('TMT0501', 'CO_Meetings')
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
  
  //#region mail
  sendMail() {
    let dialogEmail = this.callfc.openForm(CodxEmailComponent, '', 900, 800);
    dialogEmail.closed.subscribe((x) => {
      if (x.event != null) {
      }
    });
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
          .exec<any>('DP', 'InstanceStepsBusiness', 'UpdateTaskStepAsync', task)
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
      let check = false;
      const processTask = (task) => {
        task.progress = 100;
        task.status = '3';
        task.actualEnd = new Date();
        progressData.push(this.setProgressOutput(task, group));
        check = true;
      };

      if (isRequired) {
        group?.task?.forEach((task) => {
          if (task?.requireCompleted || task?.isChange) {
            processTask(task);
          }else{
            task.progress = task?.progressOld;
            task.status = task?.statusOld;
          }
          sumProgress += task.progress;
        });
        if (check && group?.recID) {
          group.progress = Number((sumProgress / countTask).toFixed(2));
          progressData.push(this.setProgressOutput(null, group));
        }
      } else {
        group?.task?.forEach((task) => {processTask(task);});
        group.progress = 100;
        if (group?.recID) {
          progressData.push(this.setProgressOutput(null, group));
        }
      }
    }
  }
  
  resetProgress(group, progressData,isRequired = false) {
    let countTask = group?.task?.length;
    if (countTask > 0) {
      let sumProgress = 0;
      group?.task?.forEach((task) => {
        task.progress = task?.progressOld;
        task.status = task?.statusOld;
        task.actualEnd = null;
        if (task?.isChange) {
          progressData.push(this.setProgressOutput(null, group));
        }   
        sumProgress += task.progress;
      });
      if (group?.isChangeAuto) {
        group.progress = Number((sumProgress / countTask).toFixed(2));
      }
      if (group?.recID && group?.isChange) {
        progressData.push(this.setProgressOutput(null, group));
      }
    }
  }
  
  changeSuccessAll(event) {
      this.isSuccessRequired = false;
      this.moveStageData = [];
      if (event && event?.checked) {
        this.successAll = true;
        this.successRequired = false;
        this.listGroupTask?.forEach((group) => {
          this.updateProgress(group,this.moveStageData)
        });        
      } else {
        this.successAll = false;
        this.listGroupTask?.forEach((group) => {
          this.resetProgress(group, this.moveStageData);
        });
      }
      this.valueChangeProgress.emit({ type: 'A', data: this.moveStageData });
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
      this.valueChangeProgress.emit({ type: 'A', data: this.moveStageData });
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

  getFields(listField, fieldID) {
    if (listField?.length > 0) {
      let a = listField?.filter((field) => fieldID.includes(field?.recID));
      return a;
    }
    return null;
  }
}
