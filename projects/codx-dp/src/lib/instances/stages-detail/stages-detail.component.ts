import { DP_Instances_Steps, DP_Instances_Steps_Tasks, DP_Steps_TaskGroups } from './../../models/models';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CacheService, CallFuncService, DialogRef, FormModel, NotificationsService, SidebarModel } from 'codx-core';
import { PopupAddStaskComponent } from './popup-add-stask/popup-add-stask.component';
@Component({
  selector: 'codx-stages-detail',
  templateUrl: './stages-detail.component.html',
  styleUrls: ['./stages-detail.component.scss'],
})
export class StagesDetailComponent implements OnInit {
  @ViewChild('setJobPopup') setJobPopup: TemplateRef<any>;
  @Input() listData: any;
  @Input() formModel: any;
  @Input() currentStep: any;
  @Input() stepID: any;
  dateActual: any;
  startDate: any;
  progress: string = '0';
  lstFields = [];
  //nvthuan
  taskGroupList: DP_Steps_TaskGroups[] = [];
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
    entityPer: "DP_Processes",
    funcID: 'DP0101',
  };
  popupJob: DialogRef;
  jobType: any;
  step: DP_Instances_Steps;
  taskList: DP_Instances_Steps_Tasks[] = [];
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
  ) {}

  ngOnInit(): void {
    console.log(this.listData)
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['listData'].currentValue != null) {
      if(changes['listData'].currentValue?.actualStart != null){
        this.dateActual = new Date(changes['listData'].currentValue?.actualStart);

      }
      if(changes['listData'].currentValue?.startDate != null){
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
      this.totalProgress(tasks,taskGroups)
      this.lstFields = changes['listData'].currentValue?.fields;
      this.groupByTask(changes['listData'].currentValue);
    }else{
      this.listData = null;
    }
  }

  totalProgress(tasks, taskGroups){
    if(tasks.length > 0 || taskGroups.length > 0){
      var totalTask = 0;
      var totalTaskGroup = 0;
      for(var i = 0; i < tasks.length ; i++){
        var value = tasks[i].progress;
        totalTask += value;
      }
      for(var i = 0; i < taskGroups.length ; i++){
        var value = taskGroups[i].progress;
        totalTaskGroup += value;
      }

      this.progress = ((totalTask / tasks.length) + (totalTaskGroup / taskGroups.length)).toString();
    }else{
      this.progress = '0';
    }
  }

  clickMF(e, data){
    switch (e.functionID) {
      case 'SYS02':
        break;
      case 'SYS03':
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
  //task -- nvthuan
  openTypeJob(){
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
    }else{
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
          let index = this.taskGroupList.findIndex(
            (task) => task.recID == taskData.taskGroupID
          );
          this.taskGroupList[index]['task'].push(taskData);
          this.taskList.push(taskData);
        }else{
          if(taskData?.taskGroupID != taskGroupIdOld){
            this.changeGroupTask(taskData,taskGroupIdOld);
          }
        }
      }
    });
  }

  clickMFTask(e: any, taskList?: any, task?: any) {
    debugger
    switch (e.functionID) {
      case 'SYS02':
        // this.deleteTask(taskList, task);
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
  changeGroupTask(taskData,taskGroupIdOld ){
    let tastClone = JSON.parse(JSON.stringify(taskData));
    let indexNew = this.taskGroupList.findIndex((task) => task.recID == taskData.taskGroupID);
    let index = this.taskGroupList.findIndex((task) => task.recID == taskGroupIdOld);
    let listTaskOld = this.taskGroupList[indexNew]['task'] || [];
    let listTaskNew = this.taskGroupList[indexNew]['task'] || [];

    listTaskOld.push(tastClone);
    listTaskNew.forEach((element, i) => {
      if(element?.taskGroupID !== taskGroupIdOld){
        this.taskGroupList[index]['task'].splice(i,1);
      }
    });

    this.setIndex(listTaskOld,'indexNo');
    this.setIndex(listTaskNew,'indexNo');
  }
  //taskGroup
  groupByTask(data){
    let step =  JSON.parse(JSON.stringify(data));

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
    }
  }
  drop(event: CdkDragDrop<string[]>, data = null) {
    if (event.previousContainer === event.container) {
      if (data) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
        this.setIndex(data, 'indexNo');
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.setIndex(event.container.data, 'indexNo');
      }
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.setIndex(event.previousContainer.data, 'indexNo');
      this.setIndex(event.container.data, 'indexNo');
    }
  }
  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        // this.deletepGroupJob(data);
        break;
      case 'SYS03':
        // this.openGroupJob(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
    }
  }
  openGroupJob(data?: any) {
    // this.taskGroup = new DP_Steps_TaskGroups();
    // if (data) {
    //   this.userGroupJob = data?.roles || [];
    //   this.taskGroup = data;
    // } else {
    //   this.userGroupJob = [];
    //   this.taskGroup['createdBy'] = this.userId;
    //   this.taskGroup['stepID'] = this.step['recID'];
    //   this.taskGroup['task'] = [];
    // }

    // this.popupGroupJob = this.callfc.openForm(
    //   this.addGroupJobPopup,
    //   '',
    //   500,
    //   500
    // );
  }
// Common
   setIndex(data: any, value: string) {
    if (data.length > 0) {
      data.forEach((item, index) => {
        item[value] = index + 1;
      });
    }
  }
  //End task -- nvthuan
}
