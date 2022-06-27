import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, ViewType, CallFuncService, ViewsComponent, SidebarModel, DialogRef } from 'codx-core';
import { ProjectChartComponent } from './project-chart/project-chart.component';

@Component({
  selector: 'lib-task-by-projects',
  templateUrl: './task-by-projects.component.html',
  styleUrls: ['./task-by-projects.component.css']
})
export class TaskByProjectsComponent implements OnInit {
  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("buttonPupop", { static: true }) buttonPupop: TemplateRef<any>;
  @ViewChild("itemRateTaskDone", { static: true }) itemRateTaskDone: TemplateRef<any>;
  @ViewChild("itemRateTaskDoneTime", { static: true }) itemRateTaskDoneTime: TemplateRef<any>;

  @ViewChild('view') view!: ViewsComponent;

  constructor(
    private callfc: CallFuncService
  ) { }
  columnsGrid = [];
  views: Array<ViewModel> = [];
  dialog!: DialogRef;

  ngOnInit(): void {
    this.columnsGrid = [
        { field: 'projectName', headerText: 'Danh sách dự án', width: 120 },
        { field: 'resource', headerText: 'Nguồn lực', template: this.itemOwner, width: 100 },
        { field: 'totalTask', headerText: 'Tổng số công việc', width: 80 },
        { field: 'taskCompleted', headerText: 'Đã hoàn tất', width: 80 },
        { field: 'taskUnComplete', headerText: 'Chưa thực hiện', width: 80 },
        { field: 'rateTaskDone', headerText: 'Tỉ lệ hoàn thành', template: this.itemRateTaskDone, width: 80 },
        { field: 'rateTaskDoneTime', headerText: 'Tỉ lệ hoàn thành đúng hạn', template: this.itemRateTaskDoneTime, width: 80 },
        { field: '', headerText: '', template: this.buttonPupop, width: 30 }
      ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
      }
    }];
  }

  openPopup(item: any) {
    this.dialog = this.callfc.openForm(ProjectChartComponent, 'ERM_Phát triển nội bộ', 1500, 800, '', item);
    this.dialog.closed.subscribe(e => {
      console.log(e);
    })
  }
}
