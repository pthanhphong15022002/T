import { update } from '@syncfusion/ej2-angular-inplace-editor';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_TaskGroups_Roles,
  DP_Instances_Steps_Tasks,
  DP_Steps_TaskGroups,
} from './../../models/models';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
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
import { CodxDpService } from '../../codx-dp.service';
import { PopupCustomFieldComponent } from '../popup-custom-field/popup-custom-field.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { log } from 'console';
@Component({
  selector: 'codx-stages-detail',
  templateUrl: './stages-detail.component.html',
  styleUrls: ['./stages-detail.component.scss'],
})
export class StagesDetailComponent implements OnInit {
  @ViewChild('setJobPopup') setJobPopup: TemplateRef<any>;
  @ViewChild('addGroupJobPopup') addGroupJobPopup: TemplateRef<any>;
  @ViewChild('updateProgress') updateProgress: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() listData: any;
  @Input() formModel: any;
  @Input() currentStep: any;
  @Input() stepID: any;
  dateActual: any;
  startDate: any;
  progress: string = '0';
  lstFields = [];
  comment: string;
  //nvthuan
  taskGroupList: DP_Instances_Steps_TaskGroups[] = [];
  userTaskGroup: DP_Instances_Steps_TaskGroups_Roles;
  taskGroup: DP_Instances_Steps_TaskGroups;
  grvTaskGroupsForm: FormModel;
  dataProgress: any;
  dataProgressCkeck: any;
  showLabelAttachment = false;
  user;
  disabledProgressInput = false;
  disabledProgressCkeck = false;
  isHaveFile = false;
  folderID = '';
  funcIDparent: any;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  frmModel: FormModel = {
    entityName: 'DP_Processes',
    formName: 'DPProcesses',
    gridViewName: 'grvDPProcesses',
    entityPer: 'DP_Processes',
    funcID: 'DP0101',
  };
  popupJob: DialogRef;
  popupTaskGroup: DialogRef;
  popupUpdateProgress: DialogRef;
  jobType: any;
  step: DP_Instances_Steps;
  taskList: DP_Instances_Steps_Tasks[] = [];
  userGroupJob = [];
  listJobType = [
    {
      id: 'C',
      icon: 'icon-i-layout-three-columns',
      text: 'Cuộc gọi',
      funcID: 'BPT101',
      color: { background: '#f1ff19' },
    },
    {
      id: 'T',
      icon: 'icon-i-journal-check',
      text: 'Công việc',
      funcID: 'BPT103',
      color: { background: '#ffa319' },
    },
    {
      id: 'E',
      icon: 'icon-i-envelope',
      text: 'Gửi mail',
      funcID: 'BPT104',
      color: { background: '#4799ff' },
    },
    {
      id: 'M',
      icon: 'icon-i-calendar-week',
      text: 'Cuộc họp',
      funcID: 'BPT105',
      color: { background: '#ff9adb' },
    },
    {
      id: 'S',
      icon: 'icon-i-clipboard-check',
      text: 'Khảo sát',
      funcID: 'BPT106',
      color: { background: '#1bc5bd' },
    },
  ];

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
    console.log(this.listData);
    if (changes['listData']) {
      if (changes['listData'].currentValue != null) {
        if (changes['listData'].currentValue?.actualStart != null) {
          this.dateActual = new Date(
            changes['listData'].currentValue?.actualStart
          );
        }
        if (changes['listData'].currentValue?.startDate != null) {
          var date = new Date(changes['listData'].currentValue?.startDate);
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
        var tasks = changes['listData'].currentValue?.tasks;
        var taskGroups = changes['listData'].currentValue?.taskGroups;
        this.totalProgress(tasks, taskGroups);
        this.lstFields = changes['listData'].currentValue?.fields;
        //nvthuan
        this.groupByTask(changes['listData'].currentValue);
        this.step = changes['listData'].currentValue;
      } else {
        this.listData = null;
      }
    }
  }

  totalProgress(tasks, taskGroups) {
    if (tasks.length > 0 || taskGroups.length > 0) {
      var totalTask = 0;
      var totalTaskGroup = 0;
      for (var i = 0; i < tasks.length; i++) {
        var value = tasks[i].progress;
        totalTask += value;
      }
      for (var i = 0; i < taskGroups.length; i++) {
        var value = taskGroups[i].progress;
        totalTaskGroup += value;
      }

      this.progress = (
        totalTask / tasks.length +
        totalTaskGroup / taskGroups.length
      ).toString();
    } else {
      this.progress = '0';
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
  openTypeJob() {
    this.popupJob = this.callfc.openForm(this.setJobPopup, '', 400, 400);
  }
  getTypeJob(e, value) {
    this.jobType = value;
  }
  openPopupJob(data?: any) {
    let taskGroupIdOld = '';
    let status = 'edit';
    let frmModel: FormModel = {
      entityName: 'DP_Steps_Tasks',
      formName: 'DPStepsTasks',
      gridViewName: 'grvDPStepsTasks',
    };
    if (!data) {
      this.popupJob.close();
      status = 'add';
    } else {
      taskGroupIdOld = data['taskGroupID'];
    }
    let listData = [
      status,
      this.jobType,
      this.step?.recID,
      this.taskGroupList,
      data || {},
      this.taskList,
      this.step?.stepName,
    ];

    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    option.FormModel = frmModel;

    let dialog = this.callfc.openSide(PopupAddStaskComponent, listData, option);

    dialog.closed.subscribe((e) => {
      if (e?.event) {
        let taskData = e?.event?.data;
        if (e.event?.status === 'add') {
          let role = new DP_Instances_Steps_TaskGroups_Roles();
          let lengthTask = this.taskGroupList.find(
            (x) => x.recID === taskData.taskGroupID
          );
          role.objectName = this.user['userName'];
          role.objectID = this.user['userID'];
          taskData['roles'] = [role];
          taskData['createdOn'] = new Date();
          taskData['indexNo'] = lengthTask['task'].length;

          let progress = this.updateProgressTaskGroupByTaskGroupID(
            taskData,
            'add'
          );

          this.dpService
            .addTask([taskData, progress?.average])
            .subscribe((res) => {
              if (res) {
                this.notiService.notifyCode('SYS006');
                let index = this.taskGroupList.findIndex(
                  (task) => task.recID == taskData.taskGroupID
                );
                this.taskGroupList[index]['task'].push(taskData);
                this.taskList.push(taskData);
                this.taskGroupList[progress?.indexGroup]['progress'] =
                  progress?.average; // cập nhật tiến độ của cha
              }
            });
        } else {
          taskData['modifiedOn'] = new Date();
          this.dpService.updateTask(taskData).subscribe((res) => {
            if (res) {
              if (taskData?.taskGroupID != taskGroupIdOld) {
                this.changeGroupTask(taskData, taskGroupIdOld);
                this.notiService.notifyCode('SYS007');
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
      }
      let progress = this.updateProgressTaskGroupByTaskGroupID(
        taskData,
        'delete'
      );
      let value = [
        taskData?.recID,
        taskData?.taskGroupID,
        taskData?.stepID,
        progress?.average,
      ];
      console.log(value);
      this.dpService.deleteTask(value).subscribe((res) => {
        if (res) {
          this.taskGroupList[progress.indexGroup]['progress'] =
            progress?.average;
          this.taskGroupList[progress.indexGroup]['task'].splice(
            progress.indexTask,
            1
          );
          this.notiService.notifyCode('SYS008');
        }
      });
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
            (type) => type.id === task.taskType
          );
        }
        this.openPopupJob(task);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
      case 'DP01':
        // if (task.taskType) {
        //   this.jobType = this.listJobType.find(
        //     (type) => type.id === task.taskType
        //   );
        // }
        // this.openPopupViewJob(task);
        break;
    }
  }
  changeGroupTask(taskData, taskGroupIdOld) {
    let tastClone = JSON.parse(JSON.stringify(taskData));
    let indexNew = this.taskGroupList.findIndex(
      (task) => task.recID == taskData.taskGroupID
    );
    let index = this.taskGroupList.findIndex(
      (task) => task.recID == taskGroupIdOld
    );
    let listTaskOld = this.taskGroupList[indexNew]['task'] || [];
    let listTaskNew = this.taskGroupList[indexNew]['task'] || [];

    listTaskOld.push(tastClone);
    listTaskNew.forEach((element, i) => {
      if (element?.taskGroupID !== taskGroupIdOld) {
        this.taskGroupList[index]['task'].splice(i, 1);
      }
    });

    this.setIndex(listTaskOld, 'indexNo');
    this.setIndex(listTaskNew, 'indexNo');
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
          task: taskGroupList[taskGroup['recID']] ?? [],
        };
      });
      step['taskGroups'] = taskGroupConvert;
      this.taskGroupList = step['taskGroups'];
      let taskGroup = new DP_Instances_Steps_TaskGroups();
      taskGroup['task'] = [];
      this.taskGroupList.push(taskGroup);
      console.log(this.taskGroupList);
    }
  }
  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteGroupTask(data);
        break;
      case 'SYS03':
        this.openPopupTaskGroup(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
    }
  }
  openPopupTaskGroup(data?: any) {
    this.taskGroup = new DP_Instances_Steps_TaskGroups();
    if (data) {
      this.userTaskGroup = data?.roles[0] || {};
      this.taskGroup = data;
    } else {
      this.userTaskGroup;
      this.taskGroup['progress'] = 0;
      this.taskGroup['stepID'] = this.step['recID'];
      this.taskGroup['task'] = [];
    }
    this.popupTaskGroup = this.callfc.openForm(
      this.addGroupJobPopup,
      '',
      500,
      500
    );
  }

  saveGroupTask() {
    this.popupTaskGroup.close();
    if (!this.taskGroup['recID']) {
      let index = this.taskGroupList.length;
      let role = new DP_Instances_Steps_TaskGroups_Roles();

      role.objectName = this.user['userName'];
      role.objectID = this.user['userID'];

      this.taskGroup['roles'] = [role];
      this.taskGroup['recID'] = Util.uid();
      this.taskGroup['createdOn'] = new Date();
      this.taskGroup['indexNo'] = index;

      let taskGroupSave = JSON.parse(JSON.stringify(this.taskGroup));
      delete taskGroupSave['task'];

      this.dpService.addTaskGroups(taskGroupSave).subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS006');
          this.taskGroupList.splice(index - 1, 0, this.taskGroup);
          console.log(this.taskGroup);
        }
      });
    } else {
      this.taskGroup['modifiedOn'] = new Date();
      let taskGroupSave = JSON.parse(JSON.stringify(this.taskGroup));
      delete taskGroupSave['task'];
      this.dpService.updateTaskGroups(taskGroupSave).subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS007');
          console.log(this.taskGroup);
        }
      });
    }
  }
  deleteGroupTask(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
      }
      let value = [data?.recID, data?.stepID];
      console.log(value);
      this.dpService.deleteTaskGroups(value).subscribe((res) => {
        if (res) {
          let index = this.taskGroupList.findIndex(
            (x) => x.recID == data.recID
          );
          this.taskGroupList.splice(index, 1);
          this.notiService.notifyCode('SYS008');
        }
      });
    });
  }
  // Progress
  styleProgress(progress) {
    if (progress >= 0 && progress < 50) return { background: '#FE0000' };
    else if (progress >= 50 && progress < 75) return { background: '#E1BE27' };
    else {
      return progress > 90
        ? { background: '#34CDEF', 'border-radius': '10px' }
        : { background: '#34CDEF' };
    }
  }
  openUpdateProgress(data?: any) {
    if (data) {
      this.dataProgress = data;
      console.log(this.dataProgress);
    }
    this.popupUpdateProgress = this.callfc.openForm(
      this.updateProgress,
      '',
      550,
      370
    );
  }
  checkEventProgress(data) {
    if (data?.task) {
      return data?.task.length == 0 ? true : false;
    } else {
      return true;
    }
  }
  handelProgress() {
    if (this.dataProgress['taskGroupID']) {
      this.updateProgressTask();
    } else {
      this.updateProgressGroupTask();
    }
  }

  updateProgressGroupTask() {
    let taskGroupSave = JSON.parse(JSON.stringify(this.dataProgress));
    delete taskGroupSave['task'];
    this.dpService.updateTaskGroups(taskGroupSave).subscribe((res) => {
      if (res) {
        this.notiService.notifyCode('SYS006');
        this.popupUpdateProgress.close();
      }
    });
  }

  updateProgressTask() {
    let value = this.updateProgressTaskGroupByTaskGroupID(
      this.dataProgress,
      'update'
    );
    let dataSave = [this.dataProgress, value?.average];
    this.dpService.updateTask(dataSave).subscribe((res) => {
      if (res) {
        this.taskGroupList[value?.indexGroup]['progress'] = value?.average;
        this.notiService.notifyCode('SYS006');
        this.popupUpdateProgress.close();
      }
    });
  }

  checkProgress(event, data) {
    if (event?.data) {
      data[event?.field] = 100;
    }
    this.disabledProgressInput = event?.data;
  }
  // Common
  updateProgressTaskGroupByTaskGroupID(data, status) {
    let proggress = 0;
    let average = 0;
    let indexTask = -1;
    let indexGroup = this.taskGroupList.findIndex(
      (task) => task.recID == data?.taskGroupID
    );

    let taskGroupFind = JSON.parse(
      JSON.stringify(this.taskGroupList[indexGroup]['task'])
    );

    if (status == 'add') {
      taskGroupFind.push(data);
    } else if (status == 'delete') {
      indexTask = taskGroupFind.findIndex((task) => task.recID == data.recID);
      taskGroupFind.splice(indexTask, 1);
    }

    taskGroupFind.forEach((item) => {
      proggress += parseFloat(item?.progress) || 0;
    });

    average = parseFloat((proggress / taskGroupFind.length).toFixed(1)) || 0;
    return { average: average, indexGroup: indexGroup, indexTask: indexTask };
  }

  async drop(event: CdkDragDrop<string[]>, data = null) {
    if (event.previousContainer === event.container) {
      if (data) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
        await this.setIndex(data, 'indexNo');
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        await this.setIndex(event.container.data, 'indexNo');
      }
    } else {
      let groupTaskIdOld = '';
      if (event.previousContainer.data.length > 0 && data?.recID) {
        groupTaskIdOld = event.previousContainer.data[event.previousIndex]['taskGroupID']
        event.previousContainer.data[event.previousIndex]['taskGroupID'] = data?.recID;
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      await this.setIndex(event.previousContainer.data, 'indexNo',groupTaskIdOld);
      await this.setIndex(event.container.data, 'indexNo',groupTaskIdOld);

      let groupPrevious = this.taskGroupList.find((group) => group.recID == groupTaskIdOld);
      let group = this.taskGroupList.find((group) => group.recID == event.container.data[0]['taskGroupID']);

      let listGroupTaskSave = [groupPrevious,group];
      
    }
  }

  updateDropDrap(){

  }

  async setIndex(data: any, value: string, recID = '') {
    if (data.length > 0) {
      let index = this.taskGroupList.findIndex(
        (group) => group.recID == data[0]['taskGroupID']
      );
      let sum = 0;
      let average = 0;
      data.forEach((item, index) => {
        item[value] = index + 1;
        sum += item['progress'] + 0;
      });
      average = parseFloat((sum / data.length).toFixed(1)) || 0;
      this.taskGroupList[index]['progress'] = average;
    }else{
      let index = this.taskGroupList.findIndex((group) => group.recID == recID);
      this.taskGroupList[index]['progress'] = 0;
    }
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }
  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
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
}
