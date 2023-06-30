import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_Reasons,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_TaskGroups_Roles,
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from '../../../models/models';
import { CodxDpService } from '../../../codx-dp.service';
import { PopupCustomFieldComponent } from '../field-detail/popup-custom-field/popup-custom-field.component';
import { ViewJobComponent } from '../../../dynamic-process/popup-add-dynamic-process/step-task/view-step-task/view-step-task.component';
import { PopupTypeTaskComponent } from '../../../dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { TM_Tasks } from 'projects/codx-share/src/lib/components/codx-tasks/model/task.model';
import { InstancesComponent } from '../../instances.component';
import { firstValueFrom } from 'rxjs';
import { UpdateProgressComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-progress/codx-progress.component';
@Component({
  selector: 'codx-stages-detail',
  templateUrl: './stages-detail.component.html',
  styleUrls: ['./stages-detail.component.scss'],
})
export class StagesDetailComponent implements OnInit {
  Number(arg0: string) {
    throw new Error('Method not implemented.');
  }
  @ViewChild('addGroupJobPopup') addGroupJobPopup: TemplateRef<any>;
  @ViewChild('updateProgress') updateProgress: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('viewReason', { static: true }) viewReason;
  @Input() dataStep: any;
  @Input() formModel: any;
  @Input() currentStep: any;
  @Input() titleDefault = '';
  @Input() listStepReason: any;
  @Input() instance: any;
  @Input() stepNameEnd: any;
  @Input() proccesNameMove: any;
  @Input() lstIDInvo: any;
  @Input() showColumnControl = 1;
  @Input() listStep: any;
  @Input() viewsCurrent = '';
  @Input() currentElmID: string;
  @Input() listUserIdRole: string[] = [];
  @Input() lstStepProcess: any;
  @Input() isOnlyView: any;
  @Input() frmModelInstancesTask: FormModel;
  @Output() saveAssign = new EventEmitter<any>();
  @Output() outDataStep = new EventEmitter<any>();
  @Output() progressEmit = new EventEmitter<any>();
  @Output() isChangeProgress = new EventEmitter<any>();

  stepID: any;
  isDelete: boolean = false;
  isEdit: boolean = false;
  isUpdate: boolean = false;
  isCreate: boolean = false;
  permissionCloseInstances: boolean = false;
  isClosed = false;
  dateActual: any;
  startDate: any;
  endDate: any;
  progress: string = '0';
  lstFields = [];
  comment: string;
  listTypeTask = [];
  //nvthuan
  isStart = false;
  taskGroupList: DP_Instances_Steps_TaskGroups[] = [];
  userTaskGroup: DP_Instances_Steps_TaskGroups_Roles;
  progressOld = 0;
  actualEndMax: Date;
  grvTaskGroupsForm: FormModel;
  dataProgress: any;
  dataProgressClone: any;
  dataProgressCkeck: any;
  showLabelAttachment = false;
  user;
  disabledProgressInput = false;
  disabledProgressCkeck = false;
  isHaveFile = false;
  folderID = '';
  groupTaskID = null;
  funcIDparent: any;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  moreReason = {
    delete: true,
  };
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  frmModelInstancesSteps: FormModel;
  frmModelInstancesGroup: FormModel;
  headerTextInsStep = {};
  popupJob: DialogRef;
  popupTaskGroup: DialogRef;
  popupUpdateProgress: DialogRef;
  jobType: any;
  step: DP_Instances_Steps;
  taskList: DP_Instances_Steps_Tasks[] = [];
  userGroupJob = [];
  listJobType = [];
  titleMemo = '';
  listReasonStep: DP_Instances_Steps_Reasons[] = [];
  listReasonsClick: DP_Instances_Steps_Reasons[] = [];
  dialogPopupReason: DialogRef;
  viewCrr = '';
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  titleReason: string = '';
  stepNameSuccess: string = '';
  stepNameFail: string = '';
  stepNameReason: string = '';
  idTaskEnd: string = '';
  isContinueTaskEnd = false;
  isContinueTaskAll = false;
  isShowFromTaskEnd = false;
  isShowFromTaskAll = false;
  isRoleAll = false;
  leadtimeControl = false; //sửa thời hạn công việc mặc định
  progressTaskGroupControl = false; //Cho phép người phụ trách cập nhật tiến độ nhóm công việc
  progressStepControl = false; //Cho phép người phụ trách cập nhật tiến độ nhóm giai đoạn
  ownerStepProcess: any;
  constructor(
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private dpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private serviceInstance: InstancesComponent
  ) {
    this.user = this.authStore.get();
    this.viewCrr = this.viewsCurrent;
  }

  async ngOnInit(): Promise<void> {
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        let data = [];
        res.datas.forEach((element) => {
          if (['T', 'E', 'M', 'C', 'S'].includes(element['value'])) {
            data.push(element);
          }
        });
        this.listJobType = data.map((item) => {
          return {
            ...item,
            color: { background: item['color'] },
            icon: 'icon-local_phone',
            checked: false,
          };
        });
      }
    });
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
    this.frmModelInstancesGroup = {
      entityName: 'DP_Instances_Steps_TaskGroups',
      formName: 'DPInstancesStepsTaskGroups',
      gridViewName: 'grvDPInstancesStepsTaskGroups',
    };
    this.frmModelInstancesTask = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      funcID: 'DPT040102',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    this.getgridViewSetup(this.frmModelInstancesGroup);
    this.frmModelInstancesSteps = await this.getFormModel('DPT0402');
  }

  getgridViewSetup(data) {
    this.cache
      .gridViewSetup(data?.formName, data?.gridViewName)
      .subscribe((res) => {
        if (res) {
          for (let item in res) {
            this.headerTextInsStep[item] = res[item]['headerText'];
          }
        }
      });
  }
  saveDataStep(e) {
    this.dataStep = e;
    this.outDataStep.emit(this.dataStep);
  }

  ngAfterViewInit(): void {
    this.cache.gridViewSetup('DPSteps', 'grvDPSteps').subscribe((res) => {
      if (res) {
        this.titleMemo = res?.Memo?.headerText;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    this.stepID = this.instance.stepID;
    this.permissionCloseInstances = this.instance?.permissionCloseInstances;
    this.isDelete = this.instance.delete;
    this.isEdit = this.instance.edit;
    this.isUpdate =
      this.instance.write &&
      !this.instance.closed &&
      (this.instance.status == '1' || this.instance.status == '2') &&
      this.dataStep.stepStatus < '2' &&
      this.instance.approveStatus != '3';
    this.isCreate = this.instance.create;
    this.isClosed = this.instance.closed;
    this.isStart = this.instance?.status == 2 ? true : false;
    if (changes['dataStep']) {
      if (changes['dataStep'].currentValue != null) {
        if (this.lstStepProcess != null && this.lstStepProcess.length > 0) {
          this.lstStepProcess.forEach((element) => {
            if (element.stepID == this.dataStep.stepID) {
              this.ownerStepProcess =
                element.roles != null && element.roles.length > 0
                  ? this.checkOwnerRoleProcess(element.roles)
                  : null;
            }
          });
        }
        if (changes['dataStep'].currentValue?.startDate != null) {
          var date = new Date(changes['dataStep'].currentValue?.startDate);
          this.startDate =
            this.padTo2Digits(date.getHours()) +
            ':' +
            this.padTo2Digits(date.getMinutes()) +
            ' ' +
            date.getDate() +
            '/' +
            (date.getMonth() + 1) +
            '/' +
            date.getFullYear();
        }
        if (changes['dataStep'].currentValue?.endDate != null) {
          var endDate = new Date(changes['dataStep'].currentValue?.endDate);
          this.endDate =
            this.padTo2Digits(endDate.getHours()) +
            ':' +
            this.padTo2Digits(endDate.getMinutes()) +
            ' ' +
            endDate.getDate() +
            '/' +
            (endDate.getMonth() + 1) +
            '/' +
            endDate.getFullYear();
        }
        var tasks = changes['dataStep'].currentValue?.tasks;
        var taskGroups = changes['dataStep'].currentValue?.taskGroups;
        this.lstFields = changes['dataStep'].currentValue?.fields;
        //nvthuan
        // this.groupByTask(changes['dataStep'].currentValue);
        this.checkRole(changes['dataStep'].currentValue?.roles || []);
        this.step = changes['dataStep'].currentValue;
        this.progress = this.step?.progress.toString();
      } else {
        this.dataStep = null;
      }
      if (!this.titleReason) {
        this.getValueListReason(changes['dataStep']);
      }
    }
  }

  padTo2Digits(num) {
    return String(num).padStart(2, '0');
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        break;
      case 'SYS03':
        this.popupCustomField(data);
        break;
      case 'SYS04':
        break;
    }
  }

  clickShow(e, id) {
    let children = e.currentTarget.children[0];
    let element = document.getElementById(id);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        children.classList.add('icon-expand_less');
        children.classList.remove('icon-expand_more');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        children.classList.remove('icon-expand_less');
        children.classList.add('icon-expand_more');
      }
    }
  }

  toggleTask(e, id) {
    let elementGroup = document.getElementById('group' + id.toString());
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
  getIconTask(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return color?.icon;
  }
  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
  }

  //huong dan buoc nhiem vu
  openPopupSup(popup, data) {
    this.callfc.openForm(popup, '', 800, 400, '', data);
  }

  valueChange(data) {}

  onSave() {}

  //Field
  popupCustomField(data) {
    var list = [];
    if (data && data.length > 0) {
      list = data;
    } else {
      list.push(data);
    }
    var obj = { data: list };
    let formModel: FormModel = {
      entityName: 'DP_Instances_Steps_Fields',
      formName: 'DPInstancesStepsFields',
      gridViewName: 'grvDPInstancesStepsFields',
    };
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    option.zIndex = 1010;
    let field = this.callfc.openSide(PopupCustomFieldComponent, obj, option);
  }

  //task -- nvthuan
  openTypeTask() {
    this.popupJob = this.callfc.openForm(PopupTypeTaskComponent, '', 400, 400);
    this.popupJob.closed.subscribe(async (value) => {
      if (value?.event && value?.event?.value) {
        this.jobType = value?.event;
        // this.handleTask(null, 'add');
      }
    });
  }

  async openPopupTaskGroup(data?: any, type = '') {}
  async openUpdateProgress(data?: any) {
    let dataInput = {
      data: this.step,
      type: 'P',
      step: this.step,
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
    console.log(dataProgress);
    if (dataProgress) {
      this.step.progress = dataProgress?.progressStep;
      this.step.note = dataProgress?.note;
      this.step.actualEnd = dataProgress?.actualEnd;
      this.isChangeProgress.emit({
        recID: this.step?.recID,
        progress: this.step?.progress,
      });
    }
  }

  updateProgressStep() {
    let idStep = this.dataProgress['recID'];
    let progress = this.dataProgress['progress'];
    let actualEnd = this.dataProgress['actualEnd'];
    let note = this.dataProgress['note'];
    this.dpService
      .updateProgressStep([idStep, Number(progress), actualEnd, note])
      .subscribe((res) => {
        if (res) {
          this.step.progress = Number(progress);
          this.step.actualEnd = actualEnd;
          this.step.note = note;
          this.progress = progress;
          this.notiService.notifyCode('SYS006');
          this.popupUpdateProgress.close();
          this.progressEmit.emit({
            stepID: this.step.recID,
            progress: progress,
          });
        }
      });
  }

  continueStep(isTaskEnd) {
    let isShowFromTaskAll = false;
    let isShowFromTaskEnd = !this.checkContinueStep(true);
    let isContinueTaskEnd = isTaskEnd;
    let isContinueTaskAll = this.checkContinueStep(false);
    let dataInstance = {
      instance: this.instance,
      listStep: this.listStep,
      step: this.step,
      isAuto: {
        isShowFromTaskAll,
        isShowFromTaskEnd,
        isContinueTaskEnd,
        isContinueTaskAll,
      },
    };
    this.serviceInstance.autoMoveStage(dataInstance);
  }

  checkContinueStep(isDefault) {
    let check = true;
    let listTask = isDefault
      ? this.step?.tasks?.filter((task) => task?.requireCompleted)
      : this.step?.tasks;
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

  changeProgressStep(event) {
    if (event) {
      this.isChangeProgress.emit({
        recID: this.step?.recID,
        progress: this.step?.progress,
      });
    }
  }

  // Common
  calculateProgressTaskGroup(data, status) {
    let proggress = 0;
    let average = 0;
    let indexTask = -1;
    let indexGroup = this.taskGroupList?.findIndex(
      (task) => task.refID == data?.taskGroupID
    );
    let taskGroupFind = JSON.parse(
      JSON.stringify(this.taskGroupList[indexGroup]['task'])
    );
    if (status == 'add') {
      taskGroupFind.push(data);
    } else if (status == 'delete') {
      indexTask = taskGroupFind?.findIndex((task) => task.recID == data.recID);
      taskGroupFind.splice(indexTask, 1);
    }
    taskGroupFind.forEach((item) => {
      proggress += parseFloat(item?.progress) || 0;
    });
    average = parseFloat((proggress / taskGroupFind.length).toFixed(1)) || 0;
    return { average: average, indexGroup: indexGroup, indexTask: indexTask };
  }

  calculateProgressStep() {
    let sum = 0;
    let length = 0;
    this.taskGroupList?.forEach((group) => {
      if (!group['recID'] && group['task']?.length > 0) {
        sum += group['task']?.reduce((accumulator, currentValue) => {
          return accumulator + Number(currentValue['progress'] || 0);
        }, 0);
        length += group['task']?.length;
      }
      if (group['recID']) {
        sum += Number(group['progress'] || 0);
        length++;
      }
    });
    let medium = (sum / length).toFixed(2);
    let stepID = this.step?.recID;
    this.dpService
      .updateProgressStep([stepID, Number(medium)])
      .subscribe((res) => {
        if (res) {
          this.step.progress = Number(medium);
          this.progress = medium;
        }
      });
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    role['roleType'] = 'O';
    return role;
  }

  getRole(task, type) {
    let role =
      task?.roles.find((role) => role.roleType == 'O') || task?.roles[0];
    return type == 'ID' ? role?.objectID : role?.objectName;
  }

  copyValue(dataCopy, data) {
    if (typeof data === 'object') {
      for (let key in data) {
        if (typeof data[key] !== 'object') {
          data[key] = dataCopy[key];
        }
      }
    }
  }

  async drop(event: CdkDragDrop<string[]>, data = null, isParent = false) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex == event.currentIndex) return;
      if (data && isParent) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
        await this.changeValueDrop(data, 'indexNo');
        await this.updateDropDrap('parent');
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        await this.changeValueDrop(event.container.data, 'indexNo');
        await this.updateDropDrap('child');
      }
    } else {
      let groupTaskIdOld = '';
      if (event.previousContainer.data.length > 0) {
        groupTaskIdOld =
          event.previousContainer.data[event.previousIndex]['taskGroupID'];
        event.previousContainer.data[event.previousIndex]['taskGroupID'] =
          data?.recID;
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.calculateProgressStep();
      await this.changeValueDrop(
        event.previousContainer.data,
        'indexNo',
        groupTaskIdOld,
        true
      );
      await this.changeValueDrop(
        event.container.data,
        'indexNo',
        groupTaskIdOld,
        true
      );
      await this.updateDropDrap('all');
    }
  }

  async updateDropDrap(status) {
    let listTask = [];
    let taskGroupListClone = JSON.parse(JSON.stringify(this.taskGroupList));
    let listGroupTask = taskGroupListClone?.map((group) => {
      listTask = [...listTask, ...group['task']];
      delete group['task'];
      return group;
    });
    listGroupTask.pop();
    let dataSave = [];
    switch (status) {
      case 'all':
        dataSave = [listGroupTask, listTask, this.step.recID];
        break;
      case 'parent':
        dataSave = [listGroupTask, null, this.step.recID];
        break;
      case 'child':
        dataSave = [null, listTask, this.step.recID];
        break;
    }
    this.dpService.updateDataDrop(dataSave).subscribe((res) => {
      if (res) {
        this.notiService.notifyCode('SYS007');
      }
    });
  }

  async changeValueDrop(
    data: any,
    value: string,
    recID = '',
    isProgress = false
  ) {
    if (data.length > 0) {
      let index = this.taskGroupList?.findIndex(
        (group) => group.recID == data[0]['taskGroupID']
      );
      let sum = 0;
      let average = 0;
      data.forEach((item, index) => {
        item[value] = index + 1; // cập nhật số thứ tự
        sum += Number(item['progress']); // tổng tiến độ
      });
      if (isProgress) {
        average = parseFloat((sum / data.length).toFixed(1)) || 0;
        this.taskGroupList[index]['progress'] = average;
      }
    } else if (data.length == 0 && isProgress) {
      let index = this.taskGroupList.findIndex((group) => group.recID == recID);
      this.taskGroupList[index]['progress'] = 0;
    }
    this.calculateProgressStep();
  }

  changeProgress(e, data) {
    data['progress'] = e?.value ? e?.value : 0;
    if (data['progress'] < 100) {
      data['actualEnd'] = null;
    }
    if (data['progress'] == 100 && !data['actualEnd']) {
      data['actualEnd'] = new Date();
    }
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }

  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
    if (data['progress'] < 100) {
      data['actualEnd'] = null;
    }
  }

  // check checkbox 100%
  checkRadioProgress(event, data) {
    if (event?.data) {
      data[event?.field] = 100;
      data['actualEnd'] = new Date();
    } else {
      data[event?.field] = this.progressOld;
      data['actualEnd'] = null;
    }
    this.disabledProgressInput = event?.data;
  }

  checkRole(listRoleStep) {
    if (
      this.permissionCloseInstances ||
      this.listUserIdRole?.some((id) => id == this.user.userID) ||
      listRoleStep?.some(
        (role) => role.objectID == this.user.userID && role.roleType == 'S'
      )
    ) {
      this.isRoleAll = true;
    } else if (this.dataStep?.roles?.length > 0) {
      this.isRoleAll =
        this.dataStep?.roles?.some(
          (element) =>
            element?.objectID == this.user.userID && element.roleType == 'S'
        ) || false;
    }
    this.leadtimeControl = this.dataStep?.leadtimeControl || false; //sửa thời hạn công việc mặc định
    this.progressTaskGroupControl =
      this.dataStep?.progressTaskGroupControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm công việc
    this.progressStepControl = this.dataStep?.progressStepControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm giai đoạn
  }

  async changeDataMF(e, type, data = null) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          //xóa
          case 'SYS102':
          case 'SYS02':
            if (
              !this.isDelete ||
              (this.instance.status != 1 && this.instance.status != 2) ||
              !this.isUpdate
            )
              res.disabled = true;
            break;
          //EDIT
          //Đính kèm file
          case 'SYS003':
          case 'SYS103':
          case 'SYS03':
            if (
              !this.isEdit ||
              (this.instance.status != 1 && this.instance.status != 2) ||
              !this.isUpdate
            )
              res.disabled = true;
            break;
          //copy
          case 'SYS104':
          case 'SYS04':
            if (
              !this.isCreate ||
              (this.instance.status != 1 && this.instance.status != 2) ||
              !this.isUpdate
            )
              res.disabled = true;
            break;
          //"Chi tiết nhóm công việc"
          case 'DP12':
            if (
              type != 'group' ||
              (this.instance.status != 1 && this.instance.status != 2)
            )
              res.disabled = true;
            break;
          //Thêm công việc
          case 'DP08':
            if (
              type != 'group' ||
              (this.instance.status != 1 && this.instance.status != 2) ||
              !this.isUpdate
            )
              res.disabled = true;
            break;
          //Chi tiết công việc
          case 'DP07':
            if (
              type == 'group' ||
              (this.instance.status != 1 && this.instance.status != 2)
            )
              res.disabled = true;
            break;
          // giao viẹc
          case 'DP13':
            if (
              type == 'group' ||
              (this.instance.status != 1 && this.instance.status != 2) ||
              !this.isUpdate
            )
              res.disabled = true;
            if (!data?.createTask) res.isblur = true;
            break;
        }
      });
    }
  }

  changeFieldMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS103':
          case 'SYS03':
            if (!this.isUpdate) res.disabled = true;
            break;
          default:
            res.disabled = true;
            break;
        }
      });
    }
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = JSON.parse(JSON.stringify(this.formModel)) || {};
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }

  //End task -- nvthuan

  openPopupReason() {
    this.listReasonsClick = [];
    this.dialogPopupReason = this.callfc.openForm(
      this.viewReason,
      '',
      500,
      500
    );
  }
  changeReasonMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
            if (this.isClosed) {
              res.disabled = true;
            }
            break;
          case 'SYS102':
            if (this.isClosed) {
              res.disabled = true;
            }
            // this.deleteReason();
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
        this.dataStep.stepID,
        this.listReasonsClick,
      ];
      this.dpService.updateListReason(data).subscribe((res) => {
        if (res) {
          this.dataStep.reasons = this.listReasonsClick;
          this.dialogPopupReason.close();
          this.notiService.notifyCode('SYS007');
          return;
        }
      });
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
    var data = [this.instance.recID, this.dataStep.stepID, dataReason.recID];
    this.dpService.DeleteListReason(data).subscribe((res) => {
      if (res) {
        let idx = this.dataStep.reasons.findIndex(
          (x) => x.recID === dataReason.recID
        );
        if (idx >= 0) this.dataStep.reasons.splice(idx, 1);
        this.notiService.notifyCode('SYS008');
        return;
      }
    });
  }
  getValueListReason(dataChange) {
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
        this.titleReason = dataChange.currentValue?.isSuccessStep
          ? this.joinTwoString(this.stepNameReason, this.stepNameSuccess)
          : dataChange.currentValue?.isFailStep
          ? this.joinTwoString(this.stepNameReason, this.stepNameFail)
          : '';
        this.changeDetectorRef.detectChanges();
      }
    });
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
  checkOwnerRoleProcess(roles) {
    if (roles != null && roles.length > 0) {
      var checkOwner = roles.find((x) => x.roleType == 'S');

      return checkOwner != null ? checkOwner.objectID : null;
    } else {
      return null;
    }
  }
  saveAssignStepTask(e) {
    this.saveAssign.emit(e);
  }
}
