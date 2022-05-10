import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { AccPoints, AccumulationChart, AccumulationChartComponent, ChartTheme, IAccAnimationCompleteEventArgs, IAccTextRenderEventArgs, IAxisLabelRenderEventArgs, ILoadedEventArgs } from '@syncfusion/ej2-angular-charts';
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

  // Chart bar
  public data: Object[] = [
    { value: new Date(2005, 0, 1), id: 21 },
    { value: new Date(2006, 0, 1), id: 24 },
    { value: new Date(2007, 0, 1), id: 36 },
    { value: new Date(2008, 0, 1), id: 38 },
    { value: new Date(2009, 0, 1), id: 54 },
    { value: new Date(2010, 0, 1), id: 57 },
    { value: new Date(2011, 0, 1), id: 70 }
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
    enable: false
  };
  public title: string = 'Inflation - Consumer Price';
  public legendSettingsBar: Object = {
    visible: false,
  };
  //End chart bar


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
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '550px'
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
        widthAsideRight: '550px'
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
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '550px'
      }
    },
    ];
    console.log(this.viewBase?.funcID);
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


  //Donut
  public pie: AccumulationChartComponent | AccumulationChart;
  public execute = false;
  public count = 0;
  public startAngle: number = 0;
  public endAngle: number = 360;
  public data2: Object[] = [
    { 'x': 'Net-tution', y: 21, text: '21%' },
    { 'x': 'Private Gifts', y: 8, text: '8%' },
    { 'x': 'All Other', y: 9, text: '9%' },
    { 'x': 'Local Revenue', y: 4, text: '4%' },
    { 'x': 'State Revenue', y: 21, text: '21%' },
    { 'x': 'Federal Revenue', y: 16, text: '16%' },
    { 'x': 'Self-supporting Operations', y: 21, text: '21%' }
  ];
  public titleDonut: string = 'Education Institutional Revenue';
  public legendSettings: Object = {
    visible: true,
    toggleVisibility: false,
    position: 'Right',
    height: '28%',
    width: '50%',
    textWrap: 'Wrap',
    maximumLabelWidth: 100,
  };
  //Initializing Datalabel
  public dataLabel: Object = {
    visible: true, position: 'Inside',
    name: '${point.y}',
    font: {
      color: 'white',
      fontWeight: 'Bold',
      size: '14px'
    }
  };

  public onAnimationComplete(args: IAccAnimationCompleteEventArgs): void {
    let centerTitle: HTMLDivElement = document.getElementById('center_title') as HTMLDivElement;
    console.log('centerTitle: ', centerTitle);
    centerTitle.style.fontSize = this.getFontSize(args.accumulation.initialClipRect.width);
    let rect: ClientRect = centerTitle.getBoundingClientRect();
    centerTitle.style.top = (args.accumulation.origin.y + args.accumulation.element.offsetTop - (rect.height / 2)) + 'px';
    centerTitle.style.left = (args.accumulation.origin.x + args.accumulation.element.offsetLeft - (rect.width / 2)) + 'px';
    centerTitle.style.visibility = 'visible';
    let points: AccPoints[] = args.accumulation.visibleSeries[0].points;
    for (let point of points) {
      if (point.labelPosition === 'Outside' && point.labelVisible) {
        let label: Element = document.getElementById('donut-container_datalabel_Series_0_text_' + point.index);
        label.setAttribute('fill', 'black');
      }
    }
  };

  public onTextRender(args: IAccTextRenderEventArgs): void {
    // args.series.dataLabel.font.size = this.getFontSize(this.pie.initialClipRect.width);
    // args.text = args.text + '%';
  }

  public getFontSize(width: number): string {
    if (width > 300) {
      return '13px';
    } else if (width > 250) {
      return '8px';
    } else {
      return '6px';
    }
  };
  //End donut
}
