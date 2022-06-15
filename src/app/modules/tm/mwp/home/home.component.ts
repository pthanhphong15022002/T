import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';
import { AssignInfoComponent } from '@shared/components/assign-info/assign-info.component';

import {
  AccPoints,
  AccumulationChart,
  AccumulationChartComponent,
  ChartTheme,
  IAccAnimationCompleteEventArgs,
  IAccTextRenderEventArgs,
  IAxisLabelRenderEventArgs,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-charts';
import { ViewsComponent, CacheService } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';



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
  @ViewChild('assignInfo') assignInfo: AssignInfoComponent;
  @ViewChild('taskInfo') taskInfo: TaskInfoComponent;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  isAssign :boolean = false;

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
    this.views = [{
      id: '1',
      type: 'content',
      active: false,
      model: {
        panelLeftRef: this.chart,
        sideBarRightRef: this.sidebarRight,
        widthAsideLeft: '550px',
        widthAsideRight: '900px'
      }
    },
    {
      id: '2',
      type: 'kanban',
      active: false,
      model: {
        panelLeftRef: this.kanban,
        sideBarRightRef: this.settingPanel,
        widthAsideRight: '900px'
      }
    },
    {
      id: '3',
      type: 'kanban',
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: true,
      model: {
        panelLeftRef: this.listDetails,
        // itemTemplate: this.templateTask,
        sideBarLeftRef: this.asideLeft,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '900px'
      }
    },
    {
      id: '4',
      type: 'list',
      icon: 'icon-format_list_bulleted',
      text: 'List-tasks',
      active: false,
      model: {
        panelLeftRef: this.listTasks,
        sideBarLeftRef: this.asideLeft,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '900px'
      }
    },
      // {
      //   id: '5',
      //   type: 'schedule',
      //   text: 'schedule',
      //   active: false,
      //   model: {
      //     panelLeftRef: this.schedule,
      //     sideBarLeftRef: this.asideLeft,
      //     sideBarRightRef: this.sidebarRight,
      //     widthAsideRight: '900px'
      //   }
      // },
      // {
      //   id: '6',
      //   type: 'list',
      //   text: 'treeViews',
      //   sameData: false,
      //   active: false,
      //   model: {
      //     panelLeftRef: this.treeViews,
      //     sideBarLeftRef: this.asideLeft,
      //     sideBarRightRef: this.sidebarRight,
      //     widthAsideRight: '900px'
      //   }
      // },
      // {
      //   id: '7',
      //   type: 'calendar',
      //   text: 'calendar',
      //   sameData: false,
      //   active: false,
      //   model: {
      //     panelLeftRef: this.calendar,
      //     widthAsideRight: '900px'
      //   }
      // },
    ];
    console.log(this.viewBase?.userPermission);
    this.cf.detectChanges();
  }

  receiveActionAssign(event){
      this.isAssign = event
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
