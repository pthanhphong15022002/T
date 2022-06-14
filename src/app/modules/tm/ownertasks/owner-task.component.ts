import { CacheService, ViewsComponent } from 'codx-core';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { SettingPanelComponent } from '../controls/setting-panel/setting-panel.component';

import { TaskGroupComponent } from '../settings/task-group/task-group.component';
import { ActivatedRoute } from '@angular/router';
import { OnwerTaskDetailsComponent } from './owner-task-details/owner-task-details.component';
import { AssignInfoComponent } from '@shared/components/assign-info/assign-info.component';

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

  @ViewChild(OnwerTaskDetailsComponent) ownerDetails   ;
  @ViewChild('taskInfo') taskInfo: TaskInfoComponent;
  @ViewChild('TaskGroup') TaskGroup: TaskGroupComponent;
  @ViewChild('assignInfo') assignInfo: AssignInfoComponent;
  @ViewChild('sidebarRightToAssign') sidebarRightToAssign: TemplateRef<any> | null;
  // public showBackdrop: boolean = true;
  // public type: string = 'Push';
   widthSidebar: string = '900px';
   closeOnDocumentClick: boolean = true;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  funcID: any;
  isAssign : boolean = false ;
  constructor(
    private cf: ChangeDetectorRef,
    private cache: CacheService,
    private activedRouter: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
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
   //this.isAssign = false ;
    this.views = [
      {
        id: '1',
        type: 'listdetail',
        icon: 'icon-chrome_reader_mode1',
        text: 'List-details',
        active: true,
        model: {
          panelLeftRef: this.listDetails,
          sideBarLeftRef: this.asideLeft,
          sideBarRightRef:this.sidebarRight, //this.isAssign?  this.sidebarRightToAssign: this.sidebarRight,
          widthAsideRight: '900px',
        },
      },
      {
        id: '2',
        type: 'list',
        icon: 'icon-format_list_bulleted',
        text: 'List-tasks',
        active: false,

        model: {
          panelLeftRef: this.listTasks,
          sideBarLeftRef: this.asideLeft,
          sideBarRightRef: this.sidebarRight,
          widthAsideRight: '900px',
        },
      },
      {
        id: '3',
        type: 'kanban',
        active: false,
        model: {
          panelLeftRef: this.kanban,
          sideBarLeftRef: this.asideLeft,
          sideBarRightRef: this.sidebarRight,
          widthAsideRight: '900px',
        },
      },
      {
        id: '4',
        type: 'schedule',
        text: 'schedule',
        active: false,
        //   viewInput: null,
        model: {
          panelLeftRef: this.schedule,
          sideBarLeftRef: this.asideLeft,
          sideBarRightRef: this.sidebarRight,
          widthAsideRight: '900px',
        },
      },
    ];
  
  }

  receiveActionAssign($event) {
    this.isAssign = $event;
  
    if(this.isAssign) this.assignInfo.showPanel();
    this.cf.detectChanges();
  }
 


  click(evt: any) {
    switch (evt.id) {
      case 'add':
        this.taskInfo.openTask();
        this.taskInfo.title = 'Tạo mới công việc';
        this.viewBase.currentView.openSidebarRight();
        break;
      case 'add1':
        this.TaskGroup.openTask();
        this.TaskGroup.title = 'Tạo mới nhóm làm việc';
        this.viewBase.currentView.openSidebarRight();
        break;
      case 'edit':
        this.taskInfo.openInfo(evt.data.taskID, 'edit');
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
