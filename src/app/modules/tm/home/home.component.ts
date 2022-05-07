import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ChartTheme, IAxisLabelRenderEventArgs, ILoadedEventArgs } from '@syncfusion/ej2-angular-charts';
import { ViewsComponent } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';

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
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('listTasks') listTasks: TemplateRef<any>;
  @ViewChild('schedule') schedule: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any> | null;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any> | null;

  // @ViewChild("sidebar") sidebar :TaskInfoComponent ;
  @ViewChild("task-info") taskInfo: TaskInfoComponent;
  public showBackdrop: boolean = true;
  public type: string = 'Push';
  public width: string = '550px';
  public closeOnDocumentClick: boolean = true;


  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  // Chart
  public data: Object[] = [
    { x: new Date(2005, 0, 1), y: 21 }, { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 }, { x: new Date(2008, 0, 1), y: 38 },
    { x: new Date(2009, 0, 1), y: 54 }, { x: new Date(2010, 0, 1), y: 57 },
    { x: new Date(2011, 0, 1), y: 70 }
  ];
  public primaryXAxis: Object = {
    valueType: 'DateTime',
    labelFormat: 'y',
    intervalType: 'Years',
    edgeLabelPlacement: 'Shift',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'transparent'
    }
  };

  //Initializing Primary Y Axis
  public primaryYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    labelStyle: {
      color: 'transparent'
    }
  };
  public chartArea: Object = {
    border: {
      width: 0
    }
  };
  public marker: Object = {
    visible: true,
    height: 10,
    width: 10
  };
  public tooltip: Object = {
    enable: true
  };
  public title: string = 'Inflation - Consumer Price';

  constructor(private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    // this.buttons = [{
    //   id: '1',
    //   icon: 'icon-list-checkbox',
    //   text: 'button 1',
    // },
    // {
    //   id: '2',
    //   icon: 'icon-list-checkbox',
    //   text: 'button 2',
    // }]

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
      active: true,
      model: {
        panelLeftRef: this.chart,
        sideBarRightRef: this.sidebarRight,
        widthAsideLeft: '550px',
        widthAsideRight: '550px'
      }
    },
    {
      id: '2',
      type: 'kanban',
      active: false,
      model: {
        panelLeftRef: this.kanban,
      }
    },
    {
      id: '3',
      type: 'kanban',
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: false,
      model: {
        panelLeftRef: this.listDetails,
        sideBarLeftRef: this.asideLeft,
        //       itemTemplate: this.itemTemplate,
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
        // itemTemplate: this.itemTemplate,
      }
    },
    {
      id: '5',
      type: 'schedule',
      text: 'schedule',
      active: false,
      model: {
        panelLeftRef: this.schedule,
        sideBarLeftRef: this.asideLeft,
        // itemTemplate: this.itemTemplate,
      }
    },
    ];
    this.cf.detectChanges();
  }

  public labelRender(args: IAxisLabelRenderEventArgs): void {
    if (args.axis.orientation === 'Horizontal') {
      args.cancel = args.value === 15 || args.value === 21;
    }
  };

  load(args: ILoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
  };

  click(evt: any) {
    console.log(evt);
    // alert("bắt sự kiện click")
    this.viewBase.currentView.openSidebarRight();
  }
}
