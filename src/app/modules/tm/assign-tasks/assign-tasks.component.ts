import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ViewsComponent } from 'codx-core';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';

@Component({
  selector: 'assign-task',
  templateUrl: './assign-tasks.component.html',
  styleUrls: ['./assign-tasks.component.scss']
})
export class AssignTaskComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('taskInfo') taskInfo: TaskInfoComponent;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any> | null;

  constructor(private cf: ChangeDetectorRef) { }

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [
    {
      id: '1',
      icon: 'icon-list-checkbox',
      text: 'Settings',
    }
  ]

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '2',
      type: 'kanban',
      active: false,
      model: {
        panelLeftRef: this.listDetails,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '600px'
      }
    }];
    this.cf.detectChanges();
  }

  click(evt: any) {
    console.log(evt.id);
    switch (evt.id) {
      case 'add':
        this.taskInfo.openTask();
        this.taskInfo.title = 'Tạo mới công việc';
        this.viewBase.currentView.openSidebarRight();
        break;
      case '1':
        this.viewBase.currentView.openSidebarRight();
        break;
      default:
        break;
    }
  }
}
