import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';
import { ViewsComponent, CacheService, ViewModel, ButtonModel } from 'codx-core';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
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
  //  @ViewChild('assignInfo') assignInfo: AssignInfoComponent;
  @ViewChild('taskInfo') taskInfo: TaskInfoComponent;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  isAssign: boolean = false;

  constructor(private cf: ChangeDetectorRef,
    private cache: CacheService) { }

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
    // this.views = [{
    //   id: '1',
    //    type: ViewType.content,
    //   active: true,
    //   model: {
    //     panelLeftRef: this.chart,
    //     sideBarRightRef: this.sidebarRight,
    //     widthAsideLeft: '550px',
    //     widthAsideRight: '900px'
    //   }
    // },
    // {
    //   id: '2',
    //  type: ViewType.kanban,
    //   active: false,
    //   model: {
    //     panelLeftRef: this.kanban,
    //     sideBarRightRef: this.settingPanel,
    //     widthAsideRight: '900px'
    //   }
    // },
    // {
    //   id: '3',
    //  type: ViewType.kanban,
    //   icon: 'icon-chrome_reader_mode1',
    //   text: 'List-details',
    //   active: false,
    //   model: {
    //     panelLeftRef: this.listDetails,
    //     itemTemplate: this.templateTask,
    //     sideBarLeftRef: this.asideLeft,
    //     sideBarRightRef: this.sidebarRight,
    //     widthAsideRight: '900px'
    //   }
    // },
    // {
    //   id: '4',
    //   type: ViewType.list,
    //   icon: 'icon-format_list_bulleted',
    //   text: 'List-tasks',
    //   active: false,
    //   model: {
    //     panelLeftRef: this.listTasks,
    //     sideBarLeftRef: this.asideLeft,
    //     sideBarRightRef: this.sidebarRight,
    //     widthAsideRight: '900px'
    //   }
    // },
    //   // {
    //   //   id: '5',
    //   //  type: ViewType.schedule,
    //   //   text: 'schedule',
    //   //   active: false,
    //   //   model: {
    //   //     panelLeftRef: this.schedule,
    //   //     sideBarLeftRef: this.asideLeft,
    //   //     sideBarRightRef: this.sidebarRight,
    //   //     widthAsideRight: '900px'
    //   //   }
    //   // },
    //   // {
    //   //   id: '6',
    //   //   type: ViewType.list,
    //   //   text: 'treeViews',
    //   //   sameData: false,
    //   //   active: false,
    //   //   model: {
    //   //     panelLeftRef: this.treeViews,
    //   //     sideBarLeftRef: this.asideLeft,
    //   //     sideBarRightRef: this.sidebarRight,
    //   //     widthAsideRight: '900px'
    //   //   }
    //   // },
    //   // {
    //   //   id: '7',
    //   //  type: ViewType.calendar,
    //   //   text: 'calendar',
    //   //   sameData: false,
    //   //   active: false,
    //   //   model: {
    //   //     panelLeftRef: this.calendar,
    //   //     widthAsideRight: '900px'
    //   //   }
    //   // },
    // ];
    console.log(this.viewBase?.userPermission);
    this.cf.detectChanges();
  }

  receiveActionAssign(event) {
    this.isAssign = event
  }

  click(evt: any) {
    console.log(evt.id);
    switch (evt.id) {
      case 'add':
        this.taskInfo.openTask();
        this.taskInfo.title = 'Tạo mới công việc';
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
