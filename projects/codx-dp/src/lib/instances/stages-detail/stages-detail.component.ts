import { DP_Instances_Steps, DP_Steps_TaskGroups } from './../../models/models';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormModel } from 'codx-core';
@Component({
  selector: 'codx-stages-detail',
  templateUrl: './stages-detail.component.html',
  styleUrls: ['./stages-detail.component.scss'],
})
export class StagesDetailComponent implements OnInit {
  @Input() listData: any;
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
  constructor() {}

  ngOnInit(): void {}

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

  }
  openGroupJob(){

  }
  clickMFTask(e: any, taskList?: any, task?: any) {
    switch (e.functionID) {
      case 'SYS02':
        // this.deleteTask(taskList, task);
        break;
      case 'SYS03':
        // if (task.taskType) {
        //   this.jobType = this.listJobType.find(
        //     (type) => type.id === task.taskType
        //   );
        // }
        // this.openPopupJob(task);
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
