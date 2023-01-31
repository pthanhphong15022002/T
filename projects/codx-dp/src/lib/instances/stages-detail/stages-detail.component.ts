import { DP_Instances_Steps } from './../../models/models';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

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
}
