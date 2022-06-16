import { ButtonModel, CacheService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { SettingPanelComponent } from '../controls/setting-panel/setting-panel.component';

import { TaskGroupComponent } from '../settings/task-group/task-group.component';

@Component({
  selector: 'onwer-task',
  templateUrl: './owner-task.component.html',
  styleUrls: ['./owner-task.component.scss'],
})
export class OwnerTaskComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('kanban') kanban: TemplateRef<any>;
  //List-detail
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('templateTask') templateTask: TemplateRef<any> | null;
  //End List-detail
  @ViewChild('listTasks') listTasks: TemplateRef<any>;
  @ViewChild('schedule') schedule: TemplateRef<any>;

  @ViewChild('calendar') calendar: TemplateRef<any>;

  @ViewChild('treeViews') treeViews: TemplateRef<any>;

  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any> | null;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any> | null;
  @ViewChild('settingPanel') settingPanel: TemplateRef<any> | null;
  @ViewChild('calendarPanel') calendarPanel: TemplateRef<any> | null;
  @ViewChild('taskGroup') taskGroup: TemplateRef<any>;
  @ViewChild('rangesKanban') rangesKanban: TemplateRef<any>;

  // @ViewChild("sidebar") sidebar :TaskInfoComponent ;
  @ViewChild('taskInfo') taskInfo: TaskInfoComponent;
  @ViewChild('TaskGroup') TaskGroup: TaskGroupComponent;

  public showBackdrop: boolean = true;
  public type: string = 'Push';
  public width: string = '550px';
  public closeOnDocumentClick: boolean = true;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  constructor(private cf: ChangeDetectorRef, private cache: CacheService) { }

  ngOnInit(): void {
    this.buttons = [
      {
        id: '1',
        icon: 'icon-list-checkbox',
        text: 'Settings',
      },
      {
        id: '2',
        icon: 'icon-list-checkbox',
        text: 'button 2',
      },
    ];

    this.moreFunc = [
      {
        id: '1',
        icon: 'icon-list-checkbox',
        text: 'more 1',
      },
      {
        id: '2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '2',
      type: ViewType.kanban,
      active: false,

      model: {
        panelLeftRef: this.kanban,
        // sideBarLeftRef: this.asideLeft,
        // sideBarRightRef: this.sidebarRight,
        // widthAsideRight: '900px'
      }
    },
    {
      id: '3',
      type: ViewType.kanban,
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: true,
      //   viewInput: null,
      model: {
        panelLeftRef: this.listDetails,
        // itemTemplate: this.templateTask,
        // sideBarLeftRef: this.asideLeft,
        // sideBarRightRef: this.sidebarRight,
        // widthAsideRight: '900px'
      }
    },
    {
      id: '4',
      type: ViewType.list,
      icon: 'icon-format_list_bulleted',
      text: 'List-tasks',
      active: false,

      model: {
        panelLeftRef: this.listTasks,
        // sideBarLeftRef: this.asideLeft,
        // sideBarRightRef: this.sidebarRight,
        // widthAsideRight: '900px'
      }
    },
    {
      id: '5',
      type: ViewType.schedule,
      text: 'schedule',
      active: false,
      //   viewInput: null,
      model: {
        panelLeftRef: this.schedule,
        // sideBarLeftRef: this.asideLeft,
        // sideBarRightRef: this.sidebarRight,
        // widthAsideRight: '900px'
      }
    },
    ];
    this.cf.detectChanges();
  }

  click(evt: any) {
    switch (evt.id) {
      case 'add':
        this.taskInfo.openTask();
        this.taskInfo.title = 'Tạo mới công việc';
        //this.viewBase.currentView.openSidebarRight();
        break;
      case 'add1':
        this.TaskGroup.openTask();
        this.TaskGroup.title = 'Tạo mới nhóm làm việc';
        //this.viewBase.currentView.openSidebarRight();
        break;
      case 'edit':
        this.taskInfo.openInfo(evt.data.taskID, 'edit');
        //this.viewBase.currentView.openSidebarRight();
        break;
      case '1':
        //this.viewBase.currentView.openSidebarRight();
        break;
      default:
        break;
    }
  }
}
