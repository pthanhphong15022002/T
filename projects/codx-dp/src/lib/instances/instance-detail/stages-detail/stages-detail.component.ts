import {
  Component,
  EventEmitter,
  Input,
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
import { PopupAddStaskComponent } from './popup-add-stask/popup-add-stask.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { PopupAddGroupTaskComponent } from './popup-add-group-task/popup-add-group-task.component';
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
  @Input() stepID: any;
  @Input() titleDefault = '';
  @Input() isDelete: boolean = false;
  @Input() isEdit: boolean = false;
  @Input() isUpdate: boolean = false;
  @Input() isCreate: boolean = false;
  @Input() listStepReason: any;
  @Input() instance: any;
  @Input() stepNameEnd: any;
  @Input() proccesNameMove: any;
  @Input() lstIDInvo: any;
  @Input() isClosed = false;
  @Input() showColumnControl = 1;
  @Output() saveAssign = new EventEmitter<any>();
  @Input() titleHeaderCF=''
  dateActual: any;
  startDate: any;
  progress: string = '0';
  lstFields = [];
  comment: string;
  listTypeTask = [];
  //nvthuan
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
  frmModel: FormModel = {
    entityName: 'DP_Instances_Steps_Tasks',
    formName: 'DPInstancesStepsTasks',
    gridViewName: 'grvDPInstancesStepsTasks',
    entityPer: 'DP_Instance',
    funcID: 'DPT04',
  };
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

  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  titleReason: any;

  constructor(
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private dpService: CodxDpService
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.grvTaskGroupsForm = {
      entityName: 'DP_Instances_Steps_TaskGroups',
      formName: 'DPInstancesStepsTaskGroups',
      gridViewName: 'grvDPInstancesStepsTaskGroups',
    };
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
  }

  ngAfterViewInit(): void {
    this.cache.gridViewSetup('DPSteps', 'grvDPSteps').subscribe((res) => {
      if (res) {
        this.titleMemo = res?.Memo?.headerText;
      }
    });
  }

  getFormModel() {
    this.cache.gridView('grvDPStepsTaskGroups').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsTaskGroups', 'grvDPStepsTaskGroups')
        .subscribe((res) => {
          this.grvTaskGroupsForm = {
            entityName: 'DP_Instances_Steps_TaskGroups',
            formName: 'DPInstancesStepsTaskGroups',
            gridViewName: 'grvDPInstancesStepsTaskGroups',
          };
        });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['dataStep']) {
      if (changes['dataStep'].currentValue != null) {
        if (changes['dataStep'].currentValue?.actualStart != null) {
          this.dateActual = new Date(
            changes['dataStep'].currentValue?.actualStart
          );
        }
        if (changes['dataStep'].currentValue?.startDate != null) {
          var date = new Date(changes['dataStep'].currentValue?.startDate);
          this.startDate =
            date.getHours() +
            ':' +
            date.getMinutes() +
            ' ' +
            date.getDate() +
            '/' +
            (date.getMonth() + 1) +
            '/' +
            date.getFullYear();
        }
        var tasks = changes['dataStep'].currentValue?.tasks;
        var taskGroups = changes['dataStep'].currentValue?.taskGroups;
        this.lstFields = changes['dataStep'].currentValue?.fields;
        //nvthuan
        this.groupByTask(changes['dataStep'].currentValue);
        this.step = changes['dataStep'].currentValue;
        this.progress = this.step?.progress.toString();
      } else {
        this.dataStep = null;
      }
      this.titleReason = changes['dataStep'].currentValue?.isSuccessStep
        ? 'Lý do thành công'
        : changes['dataStep'].currentValue?.isFailStep
        ? 'Lý do thất bại'
        : '';
    }
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
        this.handleTask(null, 'add');
      }
    });
  }

  handleTask(data?: any, status?: string) {
    let taskGroupIdOld = '';
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    if (!data) {
      this.popupJob.close();
    } else {
      taskGroupIdOld = data['taskGroupID'];
    }
    let dataTransmit =
      status == 'copy' ? JSON.parse(JSON.stringify(data)) : data;
    let listData = [
      status,
      this.jobType,
      this.step?.recID,
      this.taskGroupList,
      dataTransmit || {},
      this.taskList,
      this.step?.stepName,
      this.groupTaskID,
      !this.step?.leadtimeControl,
    ];
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1011;
    option.FormModel = frmModel;
    let dialog = this.callfc.openSide(PopupAddStaskComponent, listData, option);

    dialog.closed.subscribe(async (e) => {
      this.groupTaskID = null; //set lại
      if (e?.event) {
        let taskData = e?.event?.data;
        if (e.event?.status === 'add' || e.event?.status === 'copy') {
          let groupTask = this.taskGroupList?.find(
            (x) => x.refID === taskData.taskGroupID
          );
          let role = new DP_Instances_Steps_Tasks_Roles();
          this.setRole(role);
          taskData['roles'] = [role];
          taskData['createdOn'] = new Date();
          taskData['modifiedOn'] = null;
          taskData['modifiedBy'] = null;
          taskData['indexNo'] = groupTask ? groupTask['task']?.length : 1;
          let progress = await this.calculateProgressTaskGroup(taskData, 'add');
          this.dpService
            .addTask([taskData, progress?.average])
            .subscribe((res) => {
              if (res) {
                this.notiService.notifyCode('SYS006');
                let index = this.taskGroupList.findIndex(
                  (task) => task.refID == taskData.taskGroupID
                );
                if (index < 0) {
                  let taskGroup = new DP_Instances_Steps_TaskGroups();
                  taskGroup['task'] = [];
                  taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
                  this.taskGroupList.push(taskGroup);
                  this.taskGroupList[0]['task'].push(taskData);
                } else {
                  this.taskGroupList[index]['task'].push(taskData);
                }
                this.taskList.push(taskData);
                this.taskGroupList[progress?.indexGroup]['progress'] =
                  progress?.average; // cập nhật tiến độ của cha
                this.calculateProgressStep();
                this.saveAssign.emit(true);
              }
            });
        } else {
          taskData['modifiedOn'] = new Date();
          this.dpService.updateTask(taskData).subscribe((res) => {
            if (res) {
              if (taskData?.taskGroupID != taskGroupIdOld) {
                this.changeGroupTask(taskData, taskGroupIdOld);
                this.notiService.notifyCode('SYS007');
                this.saveAssign.emit(true);
              }
            }
          });
        }
      }
    });
  }

  deleteTask(taskData) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let progress = this.calculateProgressTaskGroup(taskData, 'delete');
        let value = [
          taskData?.recID,
          taskData?.taskGroupID,
          taskData?.stepID,
          progress?.average,
        ];
        this.dpService.deleteTask(value).subscribe((res) => {
          if (res) {
            this.taskGroupList[progress.indexGroup]['progress'] =
              progress?.average;
            this.taskGroupList[progress.indexGroup]['task'].splice(
              progress.indexTask,
              1
            );
            this.saveAssign.emit(true);
            this.notiService.notifyCode('SYS008');
            this.calculateProgressStep();
          }
        });
      }
    });
  }

  clickMFTask(e: any, taskList?: any, task?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(task);
        break;
      case 'SYS03':
        if (task.taskType) {
          this.jobType = this.listJobType.find(
            (type) => type.value === task.taskType
          );
        }
        this.handleTask(task, 'edit');
        break;
      case 'SYS04':
        if (task.taskType) {
          this.jobType = this.listJobType.find(
            (type) => type.value === task.taskType
          );
        }
        this.handleTask(task, 'copy');
        break;
      case 'DP07':
        if (task.taskType) {
          this.jobType = this.listJobType.find(
            (type) => type?.value === task?.taskType
          );
        }
        this.viewTask(task);
        break;
      case 'DP13':
        this.assignTask(e.data, task);
        break;
    }
  }
  //giao viec
  assignTask(moreFunc, data) {
    var task = new TM_Tasks();
    task.taskName = data.taskName;
    task.refID = data?.recID;
    task.refType = 'DP_Instance';
    task.dueDate = data?.endDate;
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: task,
    };
    let option = new SidebarModel();
    option.FormModel = this.frmModel;
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
      }
      this.saveAssign.emit(doneSave);
    });
  }
  //View task
  viewTask(data?: any, type?: string) {
    let listTaskConvert = this.taskList?.map((item) => {
      return {
        ...item,
        name: item?.taskName,
        type: item?.taskType,
      };
    });
    let value = JSON.parse(JSON.stringify(data));
    value['name'] = value['taskName'] || value['taskGroupName'];
    value['type'] = value['taskType'] || type;
    if (data) {
      this.callfc.openForm(ViewJobComponent, '', 800, 550, '', {
        value: value,
        listValue: listTaskConvert,
      });
    }
  }

  changeGroupTask(taskData, taskGroupIdOld) {
    let tastClone = JSON.parse(JSON.stringify(taskData));
    let indexNew = this.taskGroupList.findIndex(
      (group) => group.recID == taskData.taskGroupID
    );
    let index = this.taskGroupList.findIndex(
      (group) => group.recID == taskGroupIdOld
    );
    let listTaskOld = this.taskGroupList[indexNew]['task'] || [];
    let listTaskNew = this.taskGroupList[indexNew]['task'] || [];
    listTaskOld.push(tastClone);
    listTaskNew.forEach((element, i) => {
      if (element?.taskGroupID !== taskGroupIdOld) {
        this.taskGroupList[index]['task'].splice(i, 1);
      }
    });
    this.changeValueDrop(listTaskOld, 'indexNo');
    this.changeValueDrop(listTaskNew, 'indexNo');
  }

  //taskGroup
  groupByTask(data) {
    let step = JSON.parse(JSON.stringify(data));
    if (!step['isSuccessStep'] && !step['isFailStep']) {
      const taskGroupList = step?.tasks.reduce((group, product) => {
        const { taskGroupID } = product;
        group[taskGroupID] = group[taskGroupID] ?? [];
        group[taskGroupID].push(product);
        return group;
      }, {});
      const taskGroupConvert = step['taskGroups'].map((taskGroup) => {
        return {
          ...taskGroup,
          task: taskGroupList[taskGroup['refID']] ?? [],
        };
      });
      step['taskGroups'] = taskGroupConvert;
      this.taskGroupList = step['taskGroups'];
      if (step['taskGroups']?.length > 0 || step['tasks']?.length > 0) {
        let taskGroup = new DP_Instances_Steps_TaskGroups();
        taskGroup['task'] = taskGroupList['null'] || [];
        taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
        this.taskGroupList.push(taskGroup);
      }
      console.log(this.taskGroupList);

      this.taskList = step['tasks'];
    }
  }

  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteGroupTask(data);
        break;
      case 'SYS03':
        this.openPopupTaskGroup(data, 'edit');
        break;
      case 'SYS04':
        this.openPopupTaskGroup(data, 'copy');
        break;
      case 'DP08':
        this.groupTaskID = data?.recID;
        this.openTypeTask();
        break;
      case 'DP12':
        this.viewTask(data, 'G');
        break;
    }
  }

  async openPopupTaskGroup(data?: any, type = '') {
    let taskGroup = new DP_Instances_Steps_TaskGroups();
    let index = this.taskGroupList.length;
    let taskBefore;
    if (index > 0) {
      taskBefore = this.taskGroupList[index - 2];
    }
    if (data) {
      let dataCopy = JSON.parse(JSON.stringify(data));
      taskGroup = dataCopy;
      taskGroup['startDate'] =
        type === 'copy'
          ? taskBefore?.endDate || new Date()
          : taskGroup['startDate'];
    } else {
      taskGroup['progress'] = 0;
      taskGroup['stepID'] = this.step['recID'];
      taskGroup['startDate'] = taskBefore?.endDate || this.step?.startDate;
      taskGroup['task'] = [];
    }
    this.popupTaskGroup = this.callfc.openForm(
      PopupAddGroupTaskComponent,
      '',
      500,
      500,
      '',
      { taskGroup, isEditTime: !this.step?.leadtimeControl }
    );
    this.popupTaskGroup.closed.subscribe(async (value) => {
      if (value?.event) {
        await this.saveGroupTask(value.event, type, data);
      }
    });
  }

  async copyTaskInGroup(taskList, groupID) {
    if (taskList?.length > 0) {
      let data = taskList.map((task) => {
        return {
          ...task,
          recID: Util.uid(),
          refID: Util.uid(),
          taskGroupID: groupID,
          createdOn: new Date(),
          modifiedOn: null,
        };
      });
      return data;
    }
    return null;
  }

  async saveGroupTask(value, type, dataOld) {
    if (!value['recID'] || type === 'copy') {
      let role = new DP_Instances_Steps_TaskGroups_Roles();
      await this.setRole(role);
      value['roles'] = [role];
      let index = this.taskGroupList?.length;
      value['recID'] = Util.uid();
      value['refID'] = Util.uid();
      value['createdOn'] = new Date();
      value['indexNo'] = index;
      let listTaskSave = await this.copyTaskInGroup(
        value['task'],
        value['refID']
      );
      value['task'] = listTaskSave || [];
      let valueSave = JSON.parse(JSON.stringify(value));
      delete valueSave['task'];

      this.dpService
        .addTaskGroups([valueSave, listTaskSave])
        .subscribe((res) => {
          if (res) {
            this.notiService.notifyCode('SYS006');
            this.taskGroupList.splice(index - 1, 0, value);
            this.calculateProgressStep();
            this.saveAssign.emit(true);
          }
        });
    } else {
      value['modifiedOn'] = new Date();
      delete value['task'];
      this.dpService.updateTaskGroups(value).subscribe(async (res) => {
        if (res) {
          this.notiService.notifyCode('SYS007');
          await this.copyValue(value, dataOld);
          this.calculateProgressStep();
          this.saveAssign.emit(true);
        }
      });
    }
  }

  deleteGroupTask(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let value = [data?.recID, data?.stepID];
        this.dpService.deleteTaskGroups(value).subscribe((res) => {
          if (res) {
            let index = this.taskGroupList?.findIndex(
              (x) => x.recID == data.recID
            );
            this.taskGroupList.splice(index, 1);
            this.notiService.notifyCode('SYS008');
            this.calculateProgressStep();
            this.saveAssign.emit(true);
          }
        });
      }
    });
  }
  // Progress
  styleProgress(progress) {
    if (progress >= 0 && progress < 50) return { background: '#FE0000' };
    else if (progress >= 50 && progress < 75) return { background: '#E1BE27' };
    else {
      return { background: '#34CDEF' };
    }
  }
  openUpdateProgress(data?: any) {
    if (data?.parentID) {
      //check công việc liên kết hoàn thành trước
      let check = false;
      let taskName = '';
      let listID = data?.parentID.split(';');
      listID?.forEach((item) => {
        let taskFind = this.taskList?.find((task) => task.refID == item);
        if (taskFind?.progress != 100) {
          check = true;
          taskName = taskFind?.taskName;
        } else {
          this.actualEndMax =
            !this.actualEndMax || taskFind?.actualEnd > this.actualEndMax
              ? taskFind?.actualEnd
              : this.actualEndMax;
        }
      });
      if (check) {
        this.notiService.notifyCode('DP023', 0, taskName);
        return;
      }
    }
    if (data) {
      this.dataProgress = JSON.parse(JSON.stringify(data));
      this.dataProgressClone = data;
      this.progressOld = data['progress'] == 100 ? 0 : data['progress'];
      this.disabledProgressInput = data['progress'] == 100 ? true : false;
    }
    this.popupUpdateProgress = this.callfc.openForm(
      this.updateProgress,
      '',
      550,
      450
    );
  }
  checkEventProgress(data) {
    if (data?.task) {
      return data?.task.length == 0 ? true : false;
    } else {
      return true;
    }
  }

  async handelProgress() {
    if (this.dataProgress?.progress == 100 && !this.dataProgress?.actualEnd) {
      this.notiService.notifyCode('SYS009', 0, 'Ngày hoàn thành thực tế');
      return;
    }
    if (new Date(this.actualEndMax) > new Date(this.dataProgress?.actualEnd)) {
      this.notiService.notifyCode('Ngày hoàn thành thực tế không phù hợp');
      return;
    }
    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.dataProgressClone['progress'] = this.dataProgress['progress'];
          this.dataProgressClone['actualEnd'] = this.dataProgress['actualEnd'];
          this.dataProgressClone['note'] = this.dataProgress['note'];
          if (this.dataProgress['taskGroupID'] === undefined) {
            this.updateProgressGroupTask();
          } else {
            this.updateProgressTask();
          }
        }
      });
    } else {
      this.dataProgressClone['progress'] = this.dataProgress['progress'];
      this.dataProgressClone['actualEnd'] = this.dataProgress['actualEnd'];
      this.dataProgressClone['note'] = this.dataProgress['note'];
      if (this.dataProgress['taskGroupID'] === undefined) {
        this.updateProgressGroupTask();
      } else {
        this.updateProgressTask();
      }
    }
  }

  updateProgressGroupTask() {
    let taskGroupSave = JSON.parse(JSON.stringify(this.dataProgress));
    delete taskGroupSave['task'];
    this.dpService.updateTaskGroups(taskGroupSave).subscribe((res) => {
      if (res) {
        this.notiService.notifyCode('SYS006');
        this.popupUpdateProgress.close();
        this.calculateProgressStep();
        this.saveAssign.emit(true);
      }
    });
  }

  updateProgressTask() {
    let value = this.calculateProgressTaskGroup(this.dataProgress, 'update');
    let dataSave = [this.dataProgress, value?.average];
    this.dpService.updateTask(dataSave).subscribe((res) => {
      if (res) {
        this.taskGroupList[value?.indexGroup]['progress'] = value?.average;
        this.notiService.notifyCode('SYS007');
        this.popupUpdateProgress.close();
        this.calculateProgressStep();
        this.saveAssign.emit(true);
      } else {
        this.popupUpdateProgress.close();
      }
    });
  }

  checkExitsParentID(taskList, task): string{
    if (task?.requireCompleted) {
      return 'text-red';
    }
    let check = 'd-none';
    if (task['groupTaskID']) {
      taskList?.forEach((taskItem) => {
        if (taskItem['parentID']?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    } else {
      this.taskList?.forEach((taskItem) => {
        if (taskItem['parentID']?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    }
    return check;
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
    return role;
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
              (type != 'group' && !this.isCreate) ||
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

  fileAdded(e) {}

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  getfileDelete(event) {
    event.data.length;
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
          case 'SYS102':
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
      var reason = this.handleReason(data, this.dataStep);
      this.listReasonsClick.push(reason);
    } else {
      let idx = this.listReasonsClick.findIndex((x) => x.recID === data.recID);
      if (idx >= 0) this.listReasonsClick.splice(idx, 1);
    }
  }
  handleReason(
    reason: DP_Instances_Steps_Reasons,
    instanceStep: DP_Instances_Steps
  ) {
    reason.stepID = instanceStep.stepID;
    reason.instanceID = instanceStep.recID;
    reason.createdBy = this.user.userID;
    reason.processID = this.instance.processID;
    // reason.reasonType = this.isReason ? '1' : '2';
    return reason;
  }
  onSaveReason() {
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
}
