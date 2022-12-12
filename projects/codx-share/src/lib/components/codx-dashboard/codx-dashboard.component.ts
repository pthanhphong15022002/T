declare var window: any;
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AxisModel,
  ChartAnnotationSettingsModel,
  ChartTheme,
} from '@syncfusion/ej2-angular-charts';
import {
  DashboardLayoutComponent,
  PanelModel,
} from '@syncfusion/ej2-angular-layouts';
import { TreeMapComponent } from '@syncfusion/ej2-angular-treemap';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  SeriesSetting,
  SidebarModel,
} from 'codx-core';
import { LayoutPanelComponent } from './layout-panel/layout-panel.component';
import { PopupAddChartComponent } from './popup-add-chart/popup-add-chart.component';
import { PopupAddPanelComponent } from './popup-add-panel/popup-add-panel.component';
import { PopupSelectTemplateComponent } from './popup-select-template/popup-select-template.component';

@Component({
  selector: 'codx-dashboard',
  templateUrl: 'codx-dashboard.component.html',
  styleUrls: ['codx-dashboard.component.scss'],
})
export class CodxDashboardComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    let ins = setInterval(() => {
      let _layout = document.getElementsByTagName('ejs-dashboardlayout')[0];
      if (_layout) {
        clearInterval(ins);
        document.getElementsByTagName(
          'ejs-dashboardlayout'
        )[0].parentElement!.parentElement!.style.padding = '5px';
      }
    }, 200);
  }
  @Input() columns: number = 10;
  @Input() cellSpacing: number[] = [10, 10];
  @Input() cellAspectRatio: number = 100 / 50;
  @Input() name!: string;
  @Input() templates!: any;

  @ViewChild('dashboard') objDashboard!: DashboardLayoutComponent;
  @ViewChild('panelLayout') panelLayout?: TemplateRef<any>;
  @ViewChild('chart') chart?: TemplateRef<any>;
  @ViewChild('dfLine') dfLine?: TemplateRef<any>;
  @ViewChild('dfStepLine') dfStepLine?: TemplateRef<any>;
  @ViewChild('dfStackingLine') dfStackingLine?: TemplateRef<any>;
  @ViewChild('dfStackingLine100') dfStackingLine100?: TemplateRef<any>;
  @ViewChild('dfSpLine') dfSpLine?: TemplateRef<any>;
  @ViewChild('dfSpLineArea') dfSpLineArea?: TemplateRef<any>;
  @ViewChild('dfMultiColoredLine') dfMultiColoredLine?: TemplateRef<any>;
  @ViewChild('dfArea') dfArea?: TemplateRef<any>;
  @ViewChild('dfRangeArea') dfRangeArea?: TemplateRef<any>;
  @ViewChild('dfSplineRangeArea') dfSplineRangeArea?: TemplateRef<any>;
  @ViewChild('dfStackingArea') dfStackingArea?: TemplateRef<any>;
  @ViewChild('dfStackingArea100') dfStackingArea100?: TemplateRef<any>;
  @ViewChild('dfStepArea') dfStepArea?: TemplateRef<any>;
  @ViewChild('dfStackingStepArea') dfStackingStepArea?: TemplateRef<any>;
  @ViewChild('dfMultiColoredArea') dfMultiColoredArea?: TemplateRef<any>;
  @ViewChild('dfColumn') dfColumn?: TemplateRef<any>;
  @ViewChild('dfRangeColumn') dfRangeColumn?: TemplateRef<any>;
  @ViewChild('dfStackingColumn') dfStackingColumn?: TemplateRef<any>;
  @ViewChild('dfStackingColumn100') dfStackingColumn100?: TemplateRef<any>;
  @ViewChild('dfBar') dfBar?: TemplateRef<any>;
  @ViewChild('dfStackingBar') dfStackingBar?: TemplateRef<any>;
  @ViewChild('dfStackingBar100') dfStackingBar100?: TemplateRef<any>;
  @ViewChild('dfScatter') dfScatter?: TemplateRef<any>;
  @ViewChild('dfPolar') dfPolar?: TemplateRef<any>;
  @ViewChild('dfRadar') dfRadar?: TemplateRef<any>;
  @ViewChild('dfHilo') dfHilo?: TemplateRef<any>;
  @ViewChild('dfHistogram') dfHistogram?: TemplateRef<any>;
  @ViewChild('dfPareto') dfPareto?: TemplateRef<any>;
  @ViewChild('dfPie') dfPie?: TemplateRef<any>;
  @ViewChild('dfPyramid') dfPyramid?: TemplateRef<any>;
  @ViewChild('dfFunnel') dfFunnel?: TemplateRef<any>;

  dialog: any;
  service: string = 'EP';
  assembly: string = 'EP';
  className: string = 'BookingsBusiness';
  method: string = 'GetEventsAsync';
  panels: any = [];
  datas: any = [];
  isChart: boolean = false;
  annotations: ChartAnnotationSettingsModel[] = [];
  primaryXAxis: AxisModel = {
    valueType: 'Category',
    interval: 1,
    labelIntersectAction: 'Rotate90',
  };
  primaryYAxis = {
    minimum: 0,
    maximum: 10,
    interval: 1,
    // lineStyle: { width: 0 },
    // labelFormat: '{value}°C',

    // majorTickLines: { width: 0 },
    // minorTickLines: { width: 0 }
  };
  legendSetting: Object = {
    visible: true,
    enableHighlight: true,
  };
  marker: Object = {
    visible: true,
    width: 10,
    height: 10,
  };
  chartArea: Object = {
    border: {
      width: 0,
    },
  };
  seriesSetting: SeriesSetting[] = [
    {
      yName: 'Freight',
      name: 'salesss1',
      type: 'Histogram',
      marker: this.marker,
      bitInterval: 1,
      showNormalDistribution: true,
      width: 2,
      columnWidth: 0.99,
    },
    {
      xName: 'CustomerID',
      yName: 'Freight',
      name: 'salesss1',
      type: 'Scatter',
      fill: '#328da8',
      marker: this.marker,
      errorBar: { visible: true, verticalError: 1, horizontalError: 3 },
    },

    {
      xName: 'CustomerID',
      yName: 'Freight',
      name: 'salesss1',
      type: 'StackingColumn',
      fill: '#d758e0',
      radius: '70%',
    },
    {
      xName: 'CustomerID',
      yName: 'Freight',
      name: 'salesss2',
      type: 'Spline',
      marker: {
        visible: true,
        width: 10,
        height: 10,
      },
      width: 2,
    },
    {
      xName: 'CustomerID',
      yName: 'Freight',
      name: 'salesss2',
      type: 'StepLine',
      dashArray: '2 3 5',
      marker: {
        visible: true,
        width: 10,
        height: 10,
      },
      width: 2,
      fill: '#000000',
    },
  ];

  dataItem: any;
  enableCrosshair: boolean = false;

  constructor(
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if (dt?.data) {
      this.dataItem = dt?.data[0];
      this.templates = dt?.data[1];
      let a = Array.from(this.templates);

    }
  }

  savePanel(evt: any){
    let dataSettings: any = {id: this.dataItem.recID, panels: [], panelDatas:[] };
    let arrPanels = this.objDashboard.serialize();
    dataSettings.panels = arrPanels;
    arrPanels.forEach((item:any)=>{
      let itemSetting = this.objDashboard.panels.filter((x:any)=> x.id == item.id)[0] as any;
      if(itemSetting){
        let objPanelSetting:any = {};
        objPanelSetting.panelId = item.id;
        if(itemSetting.isTemplate){
          objPanelSetting.data = itemSetting.templateId;
        }
        else {
          objPanelSetting.data = itemSetting.chartSetting? JSON.stringify(itemSetting.chartSetting) : '';
        }
        dataSettings.panelDatas.push(objPanelSetting);
      }
    });
    console.log(JSON.stringify(dataSettings.panels,function replacer(key, value) { return value}));
    console.log(JSON.stringify(dataSettings.panelDatas, function replacer(key, value) { return value}));
    debugger

  }

  addPanel(isAuto: boolean = false, chartType?: string, data?: any) {
    let randomNumber = Math.random();
    if (isAuto) {
      let panel: PanelModel[] = [
        {
          id: randomNumber + '_layout',
          sizeX: 2,
          sizeY: 4,
          row: 0,
          col: 0,
        },
      ];
      this.objDashboard.addPanel(panel[0]);
      this.createPanelContainer(panel[0].id);
      setTimeout(()=>{
        let panelID = panel[0].id + '_content';
      if (chartType && chartType != 'template') {
        this.addDefaultChart(chartType,panelID);
      } else {
        if (data) {
          this.createPanelContent(panelID, data);
        }
      }
      },100)

    } else {
      let option = new SidebarModel();
      let dialog = this.callfunc.openForm(
        PopupAddPanelComponent,
        '',
        600,
        400,
        '',
        option
      );
      dialog.closed.subscribe((res: any) => {
        if (res.event) {
          let panel: PanelModel[] = [
            {
              id: randomNumber + '_layout',
              sizeX: res.event.sizeX,
              sizeY: res.event.sizeY,
              row: res.event.row,
              col: res.event.col,
            },
          ];
          this.objDashboard.addPanel(panel[0]);
          this.createPanelContainer(panel[0].id);
        }
      });
    }
  }

  deletePanel(panelId: any) {
    this.objDashboard.removePanel(panelId);
    let idx = this.panels.findIndex((x: any) => x.id == panelId);
    if (idx > -1) {
      this.panels.splice(idx, 1);
      let idxChart = this.datas.findIndex(
        (x: any) => x.panelId == panelId + '_content'
      );
      idxChart > -1 && this.datas.splice(idxChart, 1);
    }
  }

  addChart(evt: any, eleLayout: any) {
    if (evt.panelID) {
      let elePanel = document.getElementById(evt.panelID);
      let idx = this.objDashboard.panels.findIndex(
        (x: any) => x.id == elePanel?.parentElement?.id
      );
      if (evt.template) {
        let option = new SidebarModel();
        option.zIndex = 9999;
        option.Width = '550px'
        //let elePanel = document.getElementById(evt.panelID);
        let dialog = this.callfunc.openSide(PopupSelectTemplateComponent,[evt.template,evt.panelID,null],option);
        dialog.closed.subscribe((res:any)=>{
          let eleOverLay = Array.from(document.getElementsByClassName('e-dlg-overlay')).pop();
          if(eleOverLay){
            (eleOverLay as HTMLElement).style.zIndex = '-1';
          }
          if(res.event){

            if(res.event.type =='template'){
              eleLayout.isChart = false;
              let selectedTemplate = res.event.data;
              this.createPanelContent(evt.panelID, selectedTemplate);

            } else {
              this.addDefaultChart(res.event.type,evt.panelID);
            }
          }
        });
      } else {
        let chartInfo: any = undefined;
        let xAxis = { ...this.primaryXAxis };
        let yAxis = { ...this.primaryYAxis };
        let legend = { ...this.legendSetting };
        if (
          Object.keys(
            (this.objDashboard.panels[idx] as any).childChangedProperties
          ).length > 0
        ) {
          chartInfo = (this.objDashboard.panels[idx] as any)
            .childChangedProperties;
        }

        if (!chartInfo && (this.objDashboard.panels[idx] as any).chartType) {
          chartInfo = {
            type: (this.objDashboard.panels[idx] as any).chartType,
          };
          if ((this.objDashboard.panels[idx] as any).chartSetting) {
            let setting = (this.objDashboard.panels[idx] as any).chartSetting;
            legend = setting.legendSetting;
            xAxis = setting.primaryXAxis;
            yAxis = setting.primaryYAxis;
            //chartInfo.marker = setting.marker;
            //chartInfo.border = setting.border;
            //chartInfo.tooltip = setting.tooltip;
            //chartInfo.emptyPointSettings = setting.emptyPointSettings;
            let _seriesSetting = JSON.parse(JSON.stringify(setting));
            if(_seriesSetting.legendSetting) delete _seriesSetting.legendSetting;
            if(_seriesSetting.primaryXAxis) delete _seriesSetting.primaryXAxis;
            if(_seriesSetting.primaryYAxis) delete _seriesSetting.primaryYAxis;
            for(let i in _seriesSetting){
              chartInfo[i] = _seriesSetting[i];
            }
          }
        }
        let option = new SidebarModel();
        option.zIndex = 9999;
        option.Width= '550px'
        let settingChart = {
          serieSetting: chartInfo.serieSetting
            ? chartInfo.serieSetting
            : chartInfo,
          axisX: xAxis,
          axisY: yAxis,
          legendSetting: legend,
        };
        let dialog = this.callfunc.openSide(
          PopupAddChartComponent,
          settingChart,
          option
        );
        dialog.closed.subscribe((res) => {
        let eleOverLay = Array.from(document.getElementsByClassName('e-dlg-overlay')).pop();
        if(eleOverLay){
          (eleOverLay as HTMLElement).style.zIndex = '-1';
        }
          if (res.event) {
            if (
              !res.event.serieSetting.marker ||
              Object.keys(res.event.serieSetting.marker).length == 0
            ) {
              res.event.serieSetting.marker = this.marker;
            }
            this.legendSetting = res.event.legendSetting;
            this.primaryXAxis = res.event.axisX;
            this.primaryYAxis = res.event.axisY;
            if(res.event.crosshair) this.enableCrosshair = true;

            if (idx > -1) {
              (this.objDashboard.panels[idx] as any).childChangedProperties =
                JSON.parse(JSON.stringify(res.event));
                (this.objDashboard.panels[idx] as any).chartSetting =
                JSON.parse(JSON.stringify(res.event));
            }
            this.createChart(
              evt.panelID,
              res.event.serieSetting,
              res.event.axisX,
              res.event.axisY
            );
          }
        });
      }
    }
  }

  //Dashboard Layout's resizestart event function
  onResizeStart(args: any) {
    //console.log('Resize start');
  }

  //Dashboard Layout's resize event function
  onResize(args: any) {
    //console.log('Resizing');
  }

  //Dashboard Layout's resizestop event function
  onResizeStop(args: any) {
    this.panels = this.objDashboard.serialize();
    if (args.element) {
      if (args.element.querySelector('ejs-accumulationchart')) {
        const chartObj = args.element
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-accumulationchart').ej2_instances[0];
        if (args.element.offsetHeight < chartObj.element.offsetHeight) {
          chartObj.height = '60%';
          chartObj.width = '80%';
        } else {
          chartObj.height = '100%';
          chartObj.width = '100%';
        }
        chartObj.refreshChart();
      }
      if (args.element.querySelector('ejs-chart')) {
        const chartObj = args.element
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-chart').ej2_instances[0];
        chartObj.height = '90%';
        chartObj.width = '90%';
        chartObj.chartResize();
      }
      if (args.element.querySelector('ejs-treemap')) {
        let component = args.element.getElementsByTagName('ejs-treemap')[0];
        if (component) {
          let instance = window.ng.getComponent(component) as TreeMapComponent;
          instance.width = '100%';
          instance.height = '100%';
          instance.refresh();
        }
      }
    }
  }

  onCreate(evt: any) {
    //let itemData = JSON.parse('{"id":"cff7b1a6-4b3a-4b9a-8d3c-bd33d99b2e66","panels":[{"id":"0.678896381234823_layout","row":0,"col":4,"sizeX":6,"sizeY":5,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.1257922786025789_layout","row":0,"col":0,"sizeX":4,"sizeY":5,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}],"panelDatas":[{"panelId":"0.678896381234823_layout","data":"{\"serieSetting\":{\"type\":\"StepArea\",\"marker\":{\"visible\":true,\"width\":10,\"height\":10},\"border\":{\"width\":2},\"tooltip\":{\"enable\":true},\"xName\":\"bookingNo\",\"yName\":\"attendees\",\"name\":\"a rê a chạc\"},\"axisX\":{\"valueType\":\"Category\",\"majorTickLines\":{\"width\":0}},\"axisY\":{\"title\":\"\",\"minimum\":0,\"maximum\":30,\"interval\":4,\"lineStyle\":{\"width\":0},\"majorTickLines\":{\"width\":0}},\"legendSetting\":{\"visible\":true,\"enableHighlight\":true}}"},{"panelId":"0.1257922786025789_layout","data":"TextCLGT"}]}')
    this.panels = JSON.parse('[{"id":"0.9272112695591359_layout","row":0,"col":3,"sizeX":7,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.2912252785831644_layout","row":0,"col":0,"sizeX":3,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]');

    //debugger
    this.datas = JSON.parse('[{"panelId":"0.9272112695591359_layout","data":"{\\"serieSetting\\":{\\"type\\":\\"Line\\",\\"marker\\":{\\"visible\\":true,\\"width\\":10,\\"height\\":10},\\"tooltip\\":{\\"enable\\":true},\\"xName\\":\\"bookingNo\\",\\"yName\\":\\"attendees\\",\\"name\\":\\"kkkk\\"},\\"axisX\\":{\\"valueType\\":\\"Category\\",\\"edgeLabelPlacement\\":\\"Shift\\",\\"majorGridLines\\":{\\"width\\":0}},\\"axisY\\":{\\"title\\":\\" \\",\\"minimum\\":0,\\"maximum\\":30,\\"interval\\":4,\\"lineStyle\\":{\\"width\\":0},\\"majorTickLines\\":{\\"width\\":0}},\\"legendSetting\\":{\\"visible\\":true,\\"enableHighlight\\":true}}"},{"panelId":"0.2912252785831644_layout","data":"TextCLGT"}]');


    if (this.panels && this.panels.length > 0) {
      this.objDashboard.panels = this.panels;
      let iGenPanels = setInterval(() => {
        if (
          this.objDashboard &&
          this.objDashboard.element.childElementCount > 0
        ) {
          clearInterval(iGenPanels);
          this.panels.forEach((ele: any) => {
            let idx = this.objDashboard.panels.findIndex(
              (x: any) => x.id == ele.id
            );
            this.createPanelContainer(ele.id);
            let panelChart = this.datas.filter(
              (x: any) => x.panelId == ele.id
            )[0];
            if(panelChart){

              let panelData =panelChart.data ;
              if(this.isJSON(panelChart.data)) panelData = JSON.parse(panelChart.data);
              if( panelData.serieSetting){
                if (idx > -1) {
                  (this.objDashboard.panels[idx] as any).chartSetting =
                  panelData;
                    (this.objDashboard.panels[idx] as any).chartType = panelData.serieSetting.type
                }
                this.createChart(ele.id, panelData.serieSetting);
              }  else{
                let selectedTemplate: any;
                if(this.templates){
                  let i=0;
                  this.templates.forEach((item:any)=>{
                    let ele = item.createEmbeddedView();
                    if(typeof panelChart.data == 'string'){
                      if(ele.rootNodes[0].id == panelData){
                        selectedTemplate = Array.from(this.templates)[i];
                      }
                    }
                    i++;
                  });
                  if(selectedTemplate){
                    this.createPanelContent(ele.id, selectedTemplate);
                  }
                }
              }


            }

          });
        }
      }, 100);
    }
  }

  addPanelAuto() {
    let option = new SidebarModel();
    option.Width ='550px';
    option.zIndex= 9999;
    option.ShowBackdrop = false;
    let dialog = this.callfunc.openSide(
      PopupSelectTemplateComponent,
      [this.templates,null,this],
      option
    );
    dialog.closed.subscribe((res) => {
        let eleOverLay = Array.from(document.getElementsByClassName('e-dlg-overlay')).pop();
        if(eleOverLay){
          (eleOverLay as HTMLElement).style.zIndex = '-1';
        }
      if (res.event && res.event.type) {
        this.addPanel(true, res.event.type, res.event.data);
      }
    });
  }

  isJSON(str:any) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}
  private createPanelContent(
    panelID: any,
    childEle: any,
    chartType?: string,
    defaultSetting?: any
  ) {
    let isTemplate = false;
    let elePanel = document.getElementById(panelID);
    let objPanel = this.objDashboard.panels.filter(
      (x: any) => x.id == panelID.split('_content')[0]
    )[0];
    if (chartType) {
      let component = elePanel?.getElementsByTagName('layout-panel')[0];
      if (component) {
        let instance = window.ng.getComponent(
          component
        ) as LayoutPanelComponent;
        instance.isChart = true;
      }
      if (objPanel) {
        (objPanel as any).chartType = chartType;
        if (defaultSetting) {
          (objPanel as any).chartSetting = defaultSetting;
        }
      }
    }
    else{
      isTemplate = true;
    }
    if (elePanel) {
      let viewRef = childEle!.createEmbeddedView({ $implicit: '' });
      viewRef.detectChanges();
      let contentInner = viewRef.rootNodes;
      let html = contentInner[0] as HTMLElement;
      if(isTemplate){
       let templateId =  html.id;
       if (objPanel) {
        (objPanel as any).isTemplate = true;
        (objPanel as any).templateId = templateId;
      }
      }
      let eleBody = elePanel?.getElementsByClassName('card-body');
      if (eleBody && eleBody.length > 0) {
        eleBody[0].innerHTML = '';
        elePanel
          ?.getElementsByClassName('card-header')[0]
          .classList.add('d-none');
        this.showHideButton(elePanel);
        eleBody[0].appendChild(html);
        this.replaceChart(elePanel);
      }
    }
  }

  //Create panel container
  private createPanelContainer(panelId: any) {
    let elePanel = document.getElementById(panelId);
    var viewRef = this.panelLayout!.createEmbeddedView({ $implicit: '' });
    viewRef.detectChanges();
    let contentCPanel = viewRef.rootNodes;
    let html = contentCPanel[0] as HTMLElement;
    let eleContainer = elePanel?.getElementsByClassName('e-panel-container');
    if (eleContainer && eleContainer.length > 0) {
      eleContainer[0].appendChild(html);
      this.panels = this.objDashboard.serialize();
    }
  }

  //Create chart base on Panel id & chart setting
  private createChart(
    panelId: any,
    chartSetting: any,
    primaryXAxis?: any,
    primaryYAxis?: any
  ) {
    this.seriesSetting = [chartSetting];
    this.legendSetting = { ...this.legendSetting };
    if(primaryXAxis) this.primaryXAxis = {...primaryXAxis}
    if(primaryYAxis) this.primaryYAxis = {...primaryYAxis}
    let elePanel = document.getElementById(panelId);
    this.createPanelContent(panelId, this.chart!, chartSetting.type);
    let component = elePanel?.getElementsByTagName('layout-panel')[0];
    if (component) {
      let instance = window.ng.getComponent(component) as LayoutPanelComponent;
      instance.isChart = true;
    }
    //delete old setting of panel
    let oldIndex = this.datas.findIndex((x: any) => x.panelId == panelId);
    oldIndex > -1 && this.datas.splice(oldIndex, 1);
    this.datas.push({ panelId: panelId, data: chartSetting });
    this.showHideButton(elePanel);
    let insAcc = setInterval(() => {
      if (
        (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-accumulationchart') &&
        (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-accumulationchart').ej2_instances
      ) {
        clearInterval(insAcc);
        const accChartObj = (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-accumulationchart').ej2_instances[0];
        if (accChartObj) {
          if (
            (elePanel as any).offsetHeight < accChartObj.element.offsetHeight
          ) {
            accChartObj.height = '60%';
            accChartObj.width = '80%';
          } else {
            accChartObj.height = '100%';
            accChartObj.width = '100%';
          }
          accChartObj.refreshChart();
        }
      }
    }, 100);
    let insChart = setInterval(() => {
      if (
        (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-chart') &&
        (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-chart').ej2_instances
      ) {
        clearInterval(insChart);
        const chartObj = (elePanel as any)
          .getElementsByClassName('chart-item')[0]
          .querySelector('ejs-chart').ej2_instances[0];
        if (chartObj) {
          chartObj.height = '90%';
          chartObj.width = '90%';
          chartObj.chartResize();
        }
      }
    }, 100);
  }

  private replaceChart(elePanel: any) {
    if (elePanel && elePanel.getElementsByTagName('codx-chart').length > 0) {
      let oldItem = elePanel.getElementsByClassName('chart-item');
      if (oldItem.length > 1) {
        for (let i = 0; i < oldItem.length - 1; i++) {
          !oldItem[i].classList.contains('d-none') &&
            oldItem[i].classList.add('d-none');
        }
      }
    }
  }

  private showHideButton(elePanel: any) {
    const newspaperSpinning = [
      { transform: 'rotate(0) scale(1)' },
      { transform: 'rotate(180deg) scale(0)' },
    ];

    const newspaperTiming = {
      duration: 500,
      iterations: 1,
    };

    elePanel?.getElementsByClassName('card-header')[0].classList.add('d-none');
    (elePanel as HTMLElement).onmouseover = (evt) => {
      //elePanel?.getElementsByClassName('card-header')[0].animate(newspaperSpinning, newspaperTiming);
      if (
        elePanel
          ?.getElementsByClassName('card-header')[0]
          .classList.contains('d-none')
      ) {
        elePanel
          ?.getElementsByClassName('card-header')[0]
          .classList.remove('d-none');
      }
    };
    (elePanel as HTMLElement).onmouseout = (evt) => {
      //elePanel?.getElementsByClassName('card-header')[0].animate(newspaperSpinning, newspaperTiming);
      !elePanel
        ?.getElementsByClassName('card-header')[0]
        .classList.contains('d-none') &&
        elePanel
          ?.getElementsByClassName('card-header')[0]
          .classList.add('d-none');
    };
  }

  private addDefaultChart(chartType: string, panelID: string){
    let selectedTemplate: any;
    let defaultSetting: any;
        switch (chartType) {
          case 'Line':
            (selectedTemplate = this.dfLine),
              (defaultSetting = this.lineSettings);
            break;
          case 'StepLine':
            (selectedTemplate = this.dfStepLine),
              (defaultSetting = this.stepLineSettings);
            break;
          case 'StackingLine':
            (selectedTemplate = this.dfStackingLine),
              (defaultSetting = this.stackingLineSettings);
            break;
          case 'StackingLine100':
            (selectedTemplate = this.dfStackingLine100),
              (defaultSetting = this.stackingLine100Settings);
            break;
          case 'Spline':
            (selectedTemplate = this.dfSpLine),
              (defaultSetting = this.splineSettings);
            break;
          case 'SplineArea':
            (selectedTemplate = this.dfSpLineArea),
              (defaultSetting = this.splineAreaSettings);
            break;
          case 'MultiColoredLine':
            (selectedTemplate = this.dfMultiColoredLine),
              (defaultSetting = this.multiColoredLineSettings);
            break;
          case 'Area':
            (selectedTemplate = this.dfArea),
              (defaultSetting = this.areaSettings);
            break;
          case 'RangeArea':
            (selectedTemplate = this.dfRangeArea),
              (defaultSetting = this.rangeAreaSettings);
            break;
          case 'SplineRangeArea':
            (selectedTemplate = this.dfSplineRangeArea),
              (defaultSetting = this.splinerRangeAreaSettings);
            break;
          case 'StackingArea':
            (selectedTemplate = this.dfStackingArea),
              (defaultSetting = this.stackingAreaSettings);
            break;
          case 'StackingArea100':
            (selectedTemplate = this.dfStackingArea100),
              (defaultSetting = this.stackingArea100Settings);
            break;
          case 'StepArea':
            (selectedTemplate = this.dfStepArea),
              (defaultSetting = this.stepAreaSettings);
            break;
          case 'StackingStepArea':
            (selectedTemplate = this.dfStackingStepArea),
              (defaultSetting = this.stackingStepAreaSettings);
            break;
          case 'MultiColoredArea':
            (selectedTemplate = this.dfMultiColoredArea),
              (defaultSetting = this.multiColoredAreaSettings);
            break;
          case 'Column':
            (selectedTemplate = this.dfColumn),
              (defaultSetting = this.columnSettings);
            break;
          case 'RangeColumn':
            (selectedTemplate = this.dfRangeColumn),
              (defaultSetting = this.rangeColumnSettings);
            break;
          case 'StackingColumn':
            (selectedTemplate = this.dfStackingColumn),
              (defaultSetting = this.stackingColumnSettings);
            break;
          case 'StackingColumn100':
            (selectedTemplate = this.dfStackingColumn100),
              (defaultSetting = this.stackingColumn100Settings);
            break;
          case 'Bar':
            (selectedTemplate = this.dfBar),
              (defaultSetting = this.barSettings);
            break;
          case 'StackingBar':
            (selectedTemplate = this.dfStackingBar),
              (defaultSetting = this.stackingBarSettings);
            break;
          case 'StackingBar100':
            (selectedTemplate = this.dfStackingBar100),
              (defaultSetting = this.stackingBar100Settings);
            break;
          case 'Scatter':
            (selectedTemplate = this.dfScatter),
              (defaultSetting = this.scatterSettings);
            break;
          case 'Polar':
            (selectedTemplate = this.dfPolar),
              (defaultSetting = this.polarSettings);
            break;
          case 'Radar':
            (selectedTemplate = this.dfRadar),
              (defaultSetting = this.polarSettings);
            break;
          case 'Hilo':
            (selectedTemplate = this.dfHilo),
              (defaultSetting = this.hiloSettings);
            break;
          case 'Histogram':
            (selectedTemplate = this.dfHistogram),
              (defaultSetting = this.histogramSettings);
            break;
          case 'Pareto':
            (selectedTemplate = this.dfPareto),
              (defaultSetting = this.paretoSettings);
            break;
          case 'Pie':
            (selectedTemplate = this.dfPie),
              (defaultSetting = this.pieSettings);
            break;
          case 'Pyramid':
            (selectedTemplate = this.dfPyramid),
              (defaultSetting = this.pyramidSettings);
            break;
          case 'Funnel':
            (selectedTemplate = this.dfFunnel),
              (defaultSetting = this.funnelSettings);
            break;
        }
        this.createPanelContent(
          panelID,
          selectedTemplate,
          chartType,
          defaultSetting
        );
        let elePanel = document.getElementById(panelID);
        let component = elePanel?.getElementsByTagName('layout-panel')[0];
        if (component) {
          let instance = window.ng.getComponent(
            component
          ) as LayoutPanelComponent;
          instance.isChart = true;
        }
  }
  //#endregion

  //#region default Line chart

  public data: Object[] = [
    {
      Period: 2020,
      Can_Growth: 11.0,
      Viet_Growth: 19.5,
      Mal_Growth: 7.1,
      Egy_Growth: 8.2,
      Ind_Growth: 9.3,
    },
    {
      Period: 2019,
      Can_Growth: 12.9,
      Viet_Growth: 17.5,
      Mal_Growth: 6.8,
      Egy_Growth: 7.3,
      Ind_Growth: 7.8,
    },
    {
      Period: 2018,
      Can_Growth: 13.4,
      Viet_Growth: 15.5,
      Mal_Growth: 4.1,
      Egy_Growth: 7.8,
      Ind_Growth: 6.2,
    },
    {
      Period: 2017,
      Can_Growth: 13.7,
      Viet_Growth: 10.3,
      Mal_Growth: 2.8,
      Egy_Growth: 6.8,
      Ind_Growth: 5.3,
    },
    {
      Period: 2016,
      Can_Growth: 12.7,
      Viet_Growth: 7.8,
      Mal_Growth: 2.8,
      Egy_Growth: 5.0,
      Ind_Growth: 4.8,
    },
    {
      Period: 2015,
      Can_Growth: 12.5,
      Viet_Growth: 5.7,
      Mal_Growth: 3.8,
      Egy_Growth: 5.5,
      Ind_Growth: 4.9,
    },
    {
      Period: 2014,
      Can_Growth: 12.7,
      Viet_Growth: 5.9,
      Mal_Growth: 4.3,
      Egy_Growth: 6.5,
      Ind_Growth: 4.4,
    },
    {
      Period: 2013,
      Can_Growth: 12.4,
      Viet_Growth: 5.6,
      Mal_Growth: 4.7,
      Egy_Growth: 6.8,
      Ind_Growth: 2.6,
    },
    {
      Period: 2012,
      Can_Growth: 13.5,
      Viet_Growth: 5.3,
      Mal_Growth: 5.6,
      Egy_Growth: 6.6,
      Ind_Growth: 2.3,
    },
  ];

  //Initializing Primary X Axis
  public xAxisLine: Object = {
    valueType: 'Category',
    edgeLabelPlacement: 'Shift',
    majorGridLines: { width: 0 }
};
//Initializing Primary Y Axis
public yAxisLine: Object = {
    title: ' ',
    minimum: 0,
    maximum: 20,
    interval: 5,
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
  };
  public chartAreaLine: Object = {
    border: {
      width: 0,
    },
  };
  public width: string = '80%';
  public circleMarker: Object = {
    visible: true,
    height: 7,
    width: 7,
    shape: 'Circle',
    isFilled: true,
  };
  public triangleMarker: Object = {
    visible: true,
    height: 6,
    width: 6,
    shape: 'Triangle',
    isFilled: true,
  };
  public diamondMarker: Object = {
    visible: true,
    height: 7,
    width: 7,
    shape: 'Diamond',
    isFilled: true,
  };
  public rectangleMarker: Object = {
    visible: true,
    height: 5,
    width: 5,
    shape: 'Rectangle',
    isFilled: true,
  };
  public pentagonMarker: Object = {
    visible: true,
    height: 7,
    width: 7,
    shape: 'Pentagon',
    isFilled: true,
  };

  public tooltip: Object = {
    enable: true,
  };
  public legend: Object = {
    visible: true,
    enableHighlight: true,
  };

  titleLine: string = 'Biểu đồ đường dây điện';

  lineSettings: any = {
    primaryXAxis: this.xAxisLine,
    primaryYAxis: this.yAxisLine,
    tooltip: this.tooltip,
    legendSetting: this.legend,
    marker: this.marker,
    width:"2"
  };
  //#endregion

  //#region Default StepLine

  dataStepLine: Object[] = [
    { Period : "ONE", CHN_UnemploymentRate : 16, AUS_UnemploymentRate : 35, ITA_UnemploymentRate : 3.4 },
    { Period : "TWO", CHN_UnemploymentRate : 12.5, AUS_UnemploymentRate : 45, ITA_UnemploymentRate : 4.4 },
    { Period : "THREE", CHN_UnemploymentRate : 19, AUS_UnemploymentRate : 55, ITA_UnemploymentRate : 6 },
    { Period : "FOUR", CHN_UnemploymentRate : 14.4, AUS_UnemploymentRate : 20, ITA_UnemploymentRate : 7 },
    { Period : "FIVE", CHN_UnemploymentRate : 11.5, AUS_UnemploymentRate : 10, ITA_UnemploymentRate : 11.3 },
    { Period : "SIX", CHN_UnemploymentRate : 14, AUS_UnemploymentRate : 42, ITA_UnemploymentRate : 10.1 },
    { Period : "SEVEN", CHN_UnemploymentRate : 10, AUS_UnemploymentRate : 35, ITA_UnemploymentRate : 7.8 },
    { Period : "EIGHT", CHN_UnemploymentRate : 16, AUS_UnemploymentRate : 22, ITA_UnemploymentRate : 8.5 },
    { Period : "NINE", CHN_UnemploymentRate : 16, AUS_UnemploymentRate : 65, ITA_UnemploymentRate : 8.5 },
    { Period : "TEN", CHN_UnemploymentRate : 16, AUS_UnemploymentRate : 65, ITA_UnemploymentRate : 8.5 },
    { Period : "ELEVEN", CHN_UnemploymentRate : 16, AUS_UnemploymentRate : 58, ITA_UnemploymentRate : 8.5 }
];
xAxisStepLine: Object = {
  majorGridLines: { width: 0 },
  valueType: 'Category',
  edgeLabelPlacement: 'Shift'
};
yAxisStepLine: Object = {
  title: ' ',
  lineStyle: { width: 0 },
  interval: 10,
  minimum: 0,
  maximum: 80,
  majorTickLines: { width: 0 },
  labelFormat: '{value}'
};
tooltipStepLine: Object = {
  enable: true,
  header: "",
  shared: true,
  format: ' ',
};
legendStepLine: Object = {
  visible: true,
  enableHighlight : true
}
markerStepLine: Object = {
  visible: true,
  width: 7,
  height: 7
};

stepLineSettings:any = {
  primaryXAxis: this.xAxisStepLine,
  primaryYAxis: this.yAxisStepLine,
  tooltip: this.tooltipStepLine,
  legendSetting: this.legendStepLine,
  marker: this.markerStepLine,
  width: '5'
}
  //#endregion


  //#region Default StackingLine

  dataStackingLine0: Object[] = [
    { x: 'Food', y: 90 },
    { x: 'Transport', y: 80 },
    { x: 'Medical', y: 50 },
    { x: 'Clothes', y: 70 },
    { x: 'Personal Care', y: 30 },
    { x: 'Books', y: 10 },
    { x: 'Fitness', y: 100 },
    { x: 'Electricity', y: 55 },
    { x: 'Tax', y: 20 },
    { x: 'Pet Care', y: 40 },
    { x: 'Education', y: 45 },
    { x: 'Entertainment', y: 75 },
];
// dataStackingLine1: Object[] = [
//     { x: 'Food', y: 40 },
//     { x: 'Transport', y: 90 },
//     { x: 'Medical', y: 80 },
//     { x: 'Clothes', y: 30 },
//     { x: 'Personal Care', y: 80 },
//     { x: 'Books', y: 40 },
//     { x: 'Fitness', y: 30 },
//     { x: 'Electricity', y: 95 },
//     { x: 'Tax', y: 50 },
//     { x: 'Pet Care', y: 20 },
//     { x: 'Education', y: 15 },
//     { x: 'Entertainment', y: 45 },
// ];
tooltipStackingLine: Object = {
  enable: true
};
markerStackingLine0: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
//markerStackingLine1:  Object = { visible: true, height: 7, width: 7 , shape: 'Diamond' , isFilled: true };
yAxisStackingLine: Object = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 100,
  interval: 10,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  //minorGridLines: { width: 1 },
  //minorTickLines: { width: 0 },
};
xAxisStackingLine: Object = {
  majorGridLines: { width: 0 },
  //minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  valueType: 'Category'
};

stackingLineSettings:any = {
  primaryXAxis: this.xAxisStackingLine,
  primaryYAxis: this.yAxisStackingLine,
  tooltip: this.tooltipStackingLine,
  legendSetting: this.legendStepLine,
  marker: this.markerStackingLine0,
  dashArray:"5,1",
  width:"2"
}
  //#endregion


  //#region  Default StackingLine100

  dataStackingline100_0: Object[] = [
    { x: 'Food', y: 90 },
    { x: 'Transport', y: 80 },
    { x: 'Medical', y: 50 },
    { x: 'Clothes', y: 70 },
    { x: 'Personal Care', y: 30 },
    { x: 'Books', y: 10 },
    { x: 'Fitness', y: 100 },
    { x: 'Electricity', y: 55 },
    { x: 'Tax', y: 20 },
    { x: 'Pet Care', y: 40 },
    { x: 'Education', y: 45 },
    { x: 'Entertainment', y: 75 },
];
dataStackingline100_1: Object[] = [
    { x: 'Food', y: 40 },
    { x: 'Transport', y: 90 },
    { x: 'Medical', y: 80 },
    { x: 'Clothes', y: 30 },
    { x: 'Personal Care', y: 80 },
    { x: 'Books', y: 40 },
    { x: 'Fitness', y: 30 },
    { x: 'Electricity', y: 95 },
    { x: 'Tax', y: 50 },
    { x: 'Pet Care', y: 20 },
    { x: 'Education', y: 15 },
    { x: 'Entertainment', y: 45 },
];
xAxisStackingLine100: Object = {
  majorGridLines: { width: 0 },
  //minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 },
  //interval: 1,
  lineStyle: { width: 0 },
  valueType: 'Category'
};
yAxisStackingLine100: Object = {
  title: ' ',
  lineStyle: { width: 0 },
  interval: 10,
  minimum: 0,
  maximum: 100,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  //minorGridLines: { width: 1 },
  //minorTickLines: { width: 0 },
};
tooltipStackingLine100: Object = {
  enable: true,
  format: ' '
};
stackingLine100Settings:any = {
  primaryXAxis: this.xAxisStackingLine100,
  primaryYAxis: this.yAxisStackingLine100,
  tooltip: this.tooltipStackingLine100,
  legendSetting: this.legendStepLine,
  marker: this.markerStackingLine0,
  width:"2"
}
  //#endregion


  //#region Default SpLine
  xAxisSpLine: Object = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    labelIntersectAction: 'Rotate90'
};
yAxisSpLine: Object = {
  labelFormat: '{value}',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 }
};
markerSpLine: Object = {
  visible: true,
  width: 7,
  height: 7
};
dataSpLine: Object[] = [
  { x: 'Sun', y: 15 }, { x: 'Mon', y: 22 },
  { x: 'Tue', y: 32 },
  { x: 'Wed', y: 31 },
  { x: 'Thu', y: 29 }, { x: 'Fri', y: 24 },
  { x: 'Sat', y: 18 },
];
tooltipSpLine: Object = {
  enable: true
};
splineSettings:any = {
  primaryXAxis: this.xAxisSpLine,
  primaryYAxis: this.yAxisSpLine,
  tooltip: this.tooltipSpLine,
  legendSetting: this.legendStepLine,
  marker: this.markerSpLine,
  width:"2"
}
  //#endregion

  //#region Default SplineArea

  dataSplineArea: Object[] = [
    { Period : "A", US_InflationRate : 2.2, FR_InflationRate : 2    },
    { Period : "B", US_InflationRate : 3.4, FR_InflationRate : 1.7  },
    { Period : "C", US_InflationRate : 2.8, FR_InflationRate : 1.8, },
    { Period : "D", US_InflationRate : 1.6, FR_InflationRate : 2.1, },
    { Period : "E", US_InflationRate : 2.3, FR_InflationRate : 2.3, },
    { Period : "F", US_InflationRate : 2.5, FR_InflationRate : 1.7, },
    { Period : "G", US_InflationRate : 2.9, FR_InflationRate : 1.5, },
    { Period : "H", US_InflationRate : 1.1, FR_InflationRate : 0.5, },
    { Period : "I", US_InflationRate : 1.4, FR_InflationRate : 1.5, },
    { Period : "J", US_InflationRate : 1.1, FR_InflationRate : 1.3, }
];
xAxisSplineArea: Object = {
  valueType: 'Category',
  majorGridLines: { width: 0 },
  edgeLabelPlacement: 'Shift'
};
yAxisSplineArea: Object = {
  labelFormat: '{value}',
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 4,
  interval: 1,
  majorTickLines: { width: 0 },
};
borderSplineArea: Object = {
  width: 2,
};
splineAreaSettings:any = {
  primaryXAxis: this.xAxisSplineArea,
  primaryYAxis: this.yAxisSplineArea,
  tooltip: this.tooltipSpLine,
  legendSetting: this.legend,
  marker: this.markerSpLine,
  border: this.borderSplineArea,
  width:"2"
}
  //#endregion

  //#region  Default MultiColoredLine

  xAxisMultiColoredLine: Object = {
    valueType: 'DateTime',
    labelFormat: 'y',
    intervalType: 'Years',
    edgeLabelPlacement: 'Shift',
    majorGridLines: { width: 0 }
};
yAxisMultiColoredLine: Object = {
  rangePadding: 'None',
  minimum: 4,
  maximum: 10,
  title: 'Particulate Matter(PM)',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 }
};
colors: string[] = ['red', 'green', '#ff0097', 'crimson', 'blue', 'darkorange', 'deepskyblue',
'mediumvioletred', 'violet', 'peru', 'gray', 'deeppink', 'navy'];
dataMultiColoredLine:any= []
chartData: any = [
  {
      x: new Date( '2012-04-02' ),
      open : 85.9757,
      high : 90.6657,
      low : 85.7685,
      close : 90.5257,
      volume : 660187068
    },
    {
      x: new Date( '2012-04-09' ),
      open : 89.4471,
      high : 92,
      low : 86.2157,
      close : 86.4614,
      volume : 912634864
    },
    {
      x: new Date( '2012-04-16' ),
      open : 87.1514,
      high : 88.6071,
      low : 81.4885,
      close : 81.8543,
      volume : 1221746066
    },
    ];
load(args: any): void {
  // custom code start
  let selectedTheme: string = location.hash.split('/')[1];
  selectedTheme = selectedTheme ? selectedTheme : 'Material';
  args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
  // custom code end
  this.chartData.map((value: number, index: number) => {
      this.dataMultiColoredLine.push({
          XValue: new Date(2017, -index, 1), YValue: value ,
          color: this.colors[Math.floor(index / 16)]
      });
  });
  [150, 71.5, 106.4, 100.25, 70.0, 106.0, 85.6, 78.5, 76.4, 86.1, 155.6, 160.4].map((value: number, index: number) => {
    this.dataValues.push({ XValue: new Date(2016, index, 1), YValue: value });
});
};

multiColoredLineSettings:any = {
  primaryXAxis: this.xAxisMultiColoredLine,
  primaryYAxis: this.yAxisMultiColoredLine,
  tooltip: this.tooltip,
  legendSetting: this.legend,
}
  //#endregion

  //#region Default Area


dataArea1: Object[] = [
    { Period : 'VND', USD : 22.58 },
    { Period : 'USD', USD : 12.25 },
    { Period : 'EURO', USD : 33.55 },
    { Period : 'YEN', USD : 16.42 },
    { Period : 'CND', USD : -0.24 },
    { Period : 'BATH', USD : -0 }
];

xAxisArea: Object = {
  valueType: 'Category',
  majorGridLines: { width: 0 },
  //minorTickLines: { width: 0 },
  edgeLabelPlacement: 'Shift'

};
yAxisArea: Object = {
  title: ' ',
  maximum: 40,
  minimum: 0,
  interval: 5,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 }
};
borderArea: Object = {
  width: 1.5,
  color: '#fff'
};
markerArea: Object = {
  visible: false
};

areaSettings:any = {
  primaryXAxis: this.xAxisArea,
  primaryYAxis: this.yAxisArea,
  tooltip: this.tooltip,
  border: this.borderArea,
  marker: this.markerArea,
}
  //#endregion

  //#region Default RangeArea

  zoomSettings: Object = {
    enableSelectionZooming: true,
    mode: 'X',
    enableMouseWheelZooming: true,
    enablePan: true,
    enablePinchZooming: true
  };
  tooltipRangeArea: Object = {
    enable: true,
    format:' ',
    shared: true
  };
  opacity: number = 0.4;
  yAxisRangeArea: Object = {
    labelFormat: '{value}',
    maximum: 70,
    minimum: 0,
    interval: 10,
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
  };
  xAxisRangeArea: Object = {
    valueType: 'DateTime',
    labelFormat: 'dd MMM',
    interval: 2,
    edgeLabelPlacement: 'Shift',
    majorGridLines: { width: 0 },
  };
  dataRangeArea: Object[] = [
    { Period : new Date(2015, 0, 1), HighTemp : 42.5, LowTemp : 12.5, LineTemp : 32.5, Text : "32.5˚C" },
    { Period : new Date(2015, 0, 2), HighTemp : 37.5, LowTemp : 17.5, LineTemp : 27.5, Text : "27.5˚C" },
    { Period : new Date(2015, 0, 3), HighTemp : 47.5, LowTemp : 15.5, LineTemp : 25.5, Text : "25.5˚C" },
    { Period : new Date(2015, 0, 4), HighTemp : 42.5, LowTemp : 18.5, LineTemp : 28.5, Text : "28.5˚C" },
    { Period : new Date(2015, 0, 5), HighTemp : 45.5, LowTemp : 16.5, LineTemp : 28.5, Text : "28.5˚C" },
    { Period : new Date(2015, 0, 6), HighTemp : 42.5, LowTemp : 12.5, LineTemp : 31.5, Text : "31.5˚C" },
    { Period : new Date(2015, 0, 7), HighTemp : 43.5, LowTemp : 13.5, LineTemp : 33.5, Text : "33.5˚C" },
    { Period : new Date(2015, 0, 8), HighTemp : 45.5, LowTemp : 15.5, LineTemp : 31.5, Text : "31.5˚C" },
    { Period : new Date(2015, 0, 9), HighTemp : 41.7, LowTemp : 12.7, LineTemp : 25.7, Text : "25.7˚C" },
    { Period : new Date(2015, 0, 10), HighTemp : 45.5, LowTemp : 11.5, LineTemp : 31.5, Text : "31.5˚C" },
    { Period : new Date(2015, 0, 11), HighTemp : 43.5, LowTemp : 15.5, LineTemp : 30.5, Text : "30.5˚C" },
    { Period : new Date(2015, 0, 12), HighTemp : 45.5, LowTemp : 21.5, LineTemp : 32.5, Text : "32.5˚C" },
    { Period : new Date(2015, 0, 13), HighTemp : 39.5, LowTemp : 9.5, LineTemp : 20.5, Text : "20.5˚C" },
    { Period : new Date(2015, 0, 14), HighTemp : 33.5, LowTemp : 15.5, LineTemp : 23.5, Text : "23.5˚C" },
    { Period : new Date(2015, 0, 15), HighTemp : 38.5, LowTemp : 11.5, LineTemp : 24.5, Text : "24.5˚C" },
    { Period : new Date(2015, 0, 16), HighTemp : 45.5, LowTemp : 14.5, LineTemp : 30.5, Text : "30.5˚C" },
    { Period : new Date(2015, 0, 17), HighTemp : 40.5, LowTemp : 9.5, LineTemp : 20.5, Text : "20.5˚C" },
    { Period : new Date(2015, 0, 18), HighTemp : 42.5, LowTemp : 15.5, LineTemp : 22.5, Text : "22.5˚C" },
    { Period : new Date(2015, 0, 19), HighTemp : 40.5, LowTemp : 13.5, LineTemp : 25.5, Text : "25.5˚C" },
    { Period : new Date(2015, 0, 20), HighTemp : 45.7, LowTemp : 20.5, LineTemp : 31.5, Text : "31.5˚C" },
    { Period : new Date(2015, 0, 21), HighTemp : 43.5, LowTemp : 19.5, LineTemp : 34.5, Text : "34.5˚C" },
    { Period : new Date(2015, 0, 22), HighTemp : 42.5, LowTemp : 15.5, LineTemp : 29.5, Text : "29.5˚C" },
    { Period : new Date(2015, 0, 23), HighTemp : 45.5, LowTemp : 10.5, LineTemp : 21.5, Text : "21.5˚C" },
    { Period : new Date(2015, 0, 24), HighTemp : 42.5, LowTemp : 13.5, LineTemp : 23.5, Text : "23.5˚C" },
    { Period : new Date(2015, 0, 25), HighTemp : 39.5, LowTemp : 9.9, LineTemp : 20.5, Text : "20.5˚C" },
    { Period : new Date(2015, 0, 26), HighTemp : 43.5, LowTemp : 10.5, LineTemp : 23.5, Text : "23.5˚C" },
    { Period : new Date(2015, 0, 27), HighTemp : 42.5, LowTemp : 13.5, LineTemp : 31.5, Text : "31.5˚C" },
    { Period : new Date(2015, 0, 28), HighTemp : 45.5, LowTemp : 13.5, LineTemp : 28.5, Text : "28.5˚C" },
    { Period : new Date(2015, 0, 29), HighTemp : 46.5, LowTemp : 15.5, LineTemp : 34.5, Text : "34.5˚C" },
    { Period : new Date(2015, 0, 30), HighTemp : 48.5, LowTemp : 18.5, LineTemp : 29.5, Text : "29.5˚C" },
    { Period : new Date(2015, 0, 31), HighTemp : 45.5, LowTemp : 11.5, LineTemp : 31.5, Text : "31.5˚C" }
];

rangeAreaSettings:any = {
  primaryXAxis: this.xAxisRangeArea,
  primaryYAxis: this.yAxisRangeArea,
  tooltip: this.tooltipRangeArea,
  border: this.borderArea,
  marker: this.markerArea,
  zoomSettings: this.zoomSettings,
  legendSetting: this.legend,
  high:" ",
  low:" ",
  opacity:this.opacity,
  enableTooltip: false
}
  //#endregion


  //#region  Default SplineRangeArea

  xAxisSplineRangeArea: Object = {
    valueType: 'Category',
    edgeLabelPlacement: 'Shift',
    majorGridLines: { width: 0 }
  };
  yAxisSplineRangeArea: Object = {
    labelFormat: '{value}',
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    minimum: 0,
    maximum: 40
  };
  dataSplineRangeArea: Object[] = [
    { x: 'Jan', high: 14, low: 4 },
    { x: 'Feb', high: 17, low: 7 },
    { x: 'Mar', high: 20, low: 10 },
    { x: 'Apr', high: 22, low: 12 },
    { x: 'May', high: 20, low: 10 },
    { x: 'Jun', high: 17, low: 7 },
    { x: 'Jul', high: 15, low: 5 },
    { x: 'Aug', high: 17, low: 7 },
    { x: 'Sep', high: 20, low: 10 },
    { x: 'Oct', high: 22, low: 12 },
    { x: 'Nov', high: 20, low: 10 },
    { x: 'Dec', high: 17, low: 7 }

  ];
  splinerRangeAreaSettings:any = {
    primaryXAxis: this.xAxisSplineRangeArea,
    primaryYAxis: this.yAxisSplineRangeArea,
    tooltip: this.tooltip,
    border: this.borderArea,
    marker: this.markerArea,
    legendSetting: this.legend,
    low: " ",
    hight: " ",
    opacity:this.opacity
  };
  //#endregion

  //#region Default Stacking Area
  dataStackingArea: Object[] = [
    { Period : new Date(2000, 1, 1), OrganicSales : 0.61, FairTradeSales : 0.03, VegAlternativesSales : 0.48, OtherSales : 0.23 },
    { Period : new Date(2002, 1, 1), OrganicSales : 0.91, FairTradeSales : 0.06, VegAlternativesSales : 0.57, OtherSales : 0.17 },
    { Period : new Date(2004, 1, 1), OrganicSales : 1.19, FairTradeSales : 0.14, VegAlternativesSales : 0.63, OtherSales : 0.23 },
    { Period : new Date(2006, 1, 1), OrganicSales : 1.74, FairTradeSales : 0.29, VegAlternativesSales : 0.66, OtherSales : 0.43 },
    { Period : new Date(2008, 1, 1), OrganicSales : 1.99, FairTradeSales : 0.64, VegAlternativesSales : 0.77, OtherSales : 0.72 },
    { Period : new Date(2010, 1, 1), OrganicSales : 1.48, FairTradeSales : 1.06, VegAlternativesSales : 0.54, OtherSales : 1.38 },
    { Period : new Date(2012, 1, 1), OrganicSales : 1.66, FairTradeSales : 1.55, VegAlternativesSales : 0.61, OtherSales : 2.16 },
    { Period : new Date(2014, 1, 1), OrganicSales : 1.67, FairTradeSales : 1.65, VegAlternativesSales : 0.67, OtherSales : 2.61 }
];
xAxisStackingArea: Object = {
  valueType: 'DateTime',
  intervalType: 'Years',
  majorGridLines: { width: 0 },
  labelFormat: 'y',
  edgeLabelPlacement: 'Shift'
};
yAxisStackingArea: Object = {
  title: ' ',
  minimum: 0,
  maximum: 7,
  interval: 1,
  labelFormat: '{value}',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 }
};

stackingAreaSettings:any = {
  primaryXAxis: this.xAxisStackingArea,
  primaryYAxis: this.yAxisStackingArea,
  tooltip: this.tooltip,
  border: this.borderArea,
  legendSetting: this.legend
}
  //#endregion

  //#region Default StackingArea100

  dataStackingArea100_0: Object[] = [
    { x: new Date(2000, 0, 1), y: 0.61 },
    { x: new Date(2001, 0, 1), y: 0.81 }, { x: new Date(2002, 0, 1), y: 0.91 },
    { x: new Date(2003, 0, 1), y: 1.00 }, { x: new Date(2004, 0, 1), y: 1.19 },
    { x: new Date(2005, 0, 1), y: 1.47 }, { x: new Date(2006, 0, 1), y: 1.74 },
    { x: new Date(2007, 0, 1), y: 1.98 }, { x: new Date(2008, 0, 1), y: 1.99 },
    { x: new Date(2009, 0, 1), y: 1.70 }, { x: new Date(2010, 0, 1), y: 1.48 },
    { x: new Date(2011, 0, 1), y: 1.38 }, { x: new Date(2012, 0, 1), y: 1.66 },
    { x: new Date(2013, 0, 1), y: 1.66 }, { x: new Date(2014, 0, 1), y: 1.67 }
];
dataStackingArea100_1: Object[]  = [
    { x: new Date(2000, 0, 1), y: 0.03 },
    { x: new Date(2001, 0, 1), y: 0.05 }, { x: new Date(2002, 0, 1), y: 0.06 },
    { x: new Date(2003, 0, 1), y: 0.09 }, { x: new Date(2004, 0, 1), y: 0.14 },
    { x: new Date(2005, 0, 1), y: 0.20 }, { x: new Date(2006, 0, 1), y: 0.29 },
    { x: new Date(2007, 0, 1), y: 0.46 }, { x: new Date(2008, 0, 1), y: 0.64 },
    { x: new Date(2009, 0, 1), y: 0.75 }, { x: new Date(2010, 0, 1), y: 1.06 },
    { x: new Date(2011, 0, 1), y: 1.25 }, { x: new Date(2012, 0, 1), y: 1.55 },
    { x: new Date(2013, 0, 1), y: 1.55 }, { x: new Date(2014, 0, 1), y: 1.65 }
];
xAxisStackingArea100: Object = {
  valueType: 'DateTime',
  minimum: new Date(1999, 0, 1),
  maximum: new Date(),
  majorGridLines: { width: 0 },
  intervalType: 'Years',
  labelFormat: 'y',
  edgeLabelPlacement: 'Shift'
};
yAxisStackingArea100: Object = {
  title: ' ',
  majorTickLines: { width: 0 },
  lineStyle: { width: 0 },
  rangePadding: 'None',
  interval: 1,
  minimum: 0,
  maximum: 20
};
stackingArea100Settings:any = {
  primaryXAxis: this.xAxisStackingArea100,
  primaryYAxis: this.yAxisStackingArea100,
  tooltip: this.tooltip,
  border: this.borderArea,
  legendSetting: this.legend
}
  //#endregion

  //#region  Default StepArea
  dataStepArea: Object[] = [{ x: 2000, y: 416 }, { x: 2001, y: 490 }, { x: 2002, y: 470 }, { x: 2003, y: 500 },
    { x: 2004, y: 449 }, { x: 2005, y: 470 }, { x: 2006, y: 437 }, { x: 2007, y: 458 },
    { x: 2008, y: 500 }, { x: 2009, y: 473 }, { x: 2010, y: 520 }, { x: 2011, y: 520 }];
    xAxisStepArea: Object = {
      valueType: 'Double',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift'
  };
  yAxisStepArea: Object = {
    title: ' ',
    valueType: 'Double',
    labelFormat: '<br>{value}',
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 }
};
borderStepArea: Object = {
  width: 2,
};
stepAreaSettings:any = {
  primaryXAxis: this.xAxisStepArea,
  primaryYAxis: this.yAxisStepArea,
  tooltip: this.tooltip,
  border: this.borderStepArea,
  legendSetting: this.legend,
  marker: this.marker,
  width: '2',
  opacity: this.opacity,

}
  //#endregion

  //#region Default StackingStepArea

  dataStackingStepArea: Object[] = [{ x: 2000, y: 416 }, { x: 2001, y: 490 }, { x: 2002, y: 470 }, { x: 2003, y: 500 },
    { x: 2004, y: 449 }, { x: 2005, y: 470 }, { x: 2006, y: 437 }, { x: 2007, y: 458 },
    { x: 2008, y: 500 }, { x: 2009, y: 473 }, { x: 2010, y: 520 }, { x: 2011, y: 520 }];

    xAxisStackingStepArea: Object = {
      valueType: 'Double',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift',
  };
  yAxisStackingStepArea: Object = {
    title: ' ',
    valueType: 'Double',
    labelFormat: '{value}',
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
};
stackingStepAreaSettings:any = {
  primaryXAxis: this.xAxisStackingStepArea,
  primaryYAxis: this.yAxisStackingStepArea,
  tooltip: this.tooltip,
  border: this.borderStepArea,
  legendSetting: this.legend,
  fill:"#56CCF2",

}
  //#endregion

  //#region Default MultiColoredArea
  dataValues: any = [];
  tooltipMultiColoredArea: Object = {
    enable: true,
    header: ' ',
    format: ' ',
    shared: true
};
segments: Object[] = [{
  value: new Date(2016, 4, 1),
  color: 'url(#winter)'
}, {
  value: new Date(2016, 8, 1),
  color: 'url(#summer)'
}, {
  color: 'url(#spring)'
}];
xAxisMultiColoredArea: Object = {
  valueType: 'DateTime',
  labelFormat: 'MMM',
  intervalType: 'Months',
  edgeLabelPlacement: 'Shift',
  majorGridLines: { width: 0 }
};
yAxisMultiColoredArea: Object = {
  labelFormat: '${value}K',
  rangePadding: 'None',
  minimum: 0,
  maximum: 200,
  interval: 50,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 }
};

multiColoredAreaSettings:any = {
  primaryXAxis: this.xAxisMultiColoredArea,
  primaryYAxis: this.yAxisMultiColoredArea,
  tooltip: this.tooltipMultiColoredArea,
  border: this.borderStepArea,
  legendSetting: this.legend,
  segments: this.segments
}
  //#endregion

  //#region Column
  dataColumn: Object[] = [
    { Country : "GBR", GoldMedal : 27, SilverMedal : 23, BronzeMedal : 17, MappingName : "Great Britain" },
    { Country : "CHN", GoldMedal : 26, SilverMedal : 18, BronzeMedal : 26, MappingName : "China" },
    { Country : "AUS", GoldMedal : 8, SilverMedal : 11, BronzeMedal : 10, MappingName : "Australia" },
    { Country : "RUS", GoldMedal : 19, SilverMedal : 17, BronzeMedal : 20, MappingName : "Russia" },
    { Country : "GER", GoldMedal : 17, SilverMedal : 10, BronzeMedal : 15, MappingName : "Germany" },
    { Country : "UA", GoldMedal : 2, SilverMedal : 5, BronzeMedal : 24, MappingName : "Ukraine" },
    { Country : "ES", GoldMedal : 7, SilverMedal : 4, BronzeMedal : 6, MappingName : "Spain" },
    { Country : "UZB", GoldMedal : 4, SilverMedal : 2, BronzeMedal : 7, MappingName : "Uzbekistan" },
    { Country : "JPN", GoldMedal : 12, SilverMedal : 8, BronzeMedal : 21, MappingName : "Japan" },
    { Country : "NL", GoldMedal : 8, SilverMedal : 7, BronzeMedal : 4, MappingName : "NetherLand" },
    { Country : "USA", GoldMedal : 46, SilverMedal : 37, BronzeMedal : 38, MappingName : "United States" },
];
xAxisColumn: Object = {
  valueType: 'Category',
   interval: 1,
   majorGridLines: { width: 0 },
    majorTickLines: { width: 0 }
};
yAxisColumn: Object = {
  title: ' ',
  maximum: 50,
  interval: 10,
  majorTickLines: { width: 0 }, lineStyle: { width: 0 },
};
tooltipColumn: Object = {
  enable: true,
  header: ' ',
  shared: true
};
markerColumn: Object = {
 dataLabel:
  { visible: false,
    position: 'Top',
    font: { fontWeight: '600', color: '#ffffff' }
  }
 }

 columnSettings:any = {
  primaryXAxis: this.xAxisColumn,
  primaryYAxis: this.yAxisColumn,
  tooltip: this.tooltipColumn,
  legendSetting: this.legend,
  marker: this.markerColumn,
  columnSpacing:0.1,
  tooltipMappingName:" ",
  width:"2"
}
  //#endregion

  //#region Default RangeColumn
  dataRangeColumn: Object[] = [
    { Days : "Sun", IND_LowTemp : 3.1, IND_HighTemp : 10.8, GER_LowTemp : 2.5, GER_HighTemp : 9.8  },
    { Days : "Mon", IND_LowTemp : 5.7, IND_HighTemp : 14.4, GER_LowTemp : 4.7, GER_HighTemp : 11.4  },
    { Days : "Tue", IND_LowTemp : 8.4, IND_HighTemp : 16.9, GER_LowTemp : 6.4, GER_HighTemp : 14.4  },
    { Days : "Wed", IND_LowTemp : 9.6, IND_HighTemp : 18.2, GER_LowTemp : 9.6, GER_HighTemp : 17.2 },
    { Days : "Thu", IND_LowTemp : 8.5, IND_HighTemp : 16.1, GER_LowTemp : 7.5, GER_HighTemp : 15.1 },
    { Days : "Fri", IND_LowTemp : 6.0, IND_HighTemp : 12.5, GER_LowTemp : 3.0, GER_HighTemp : 10.5 },
    { Days : "Sat", IND_LowTemp : 1.5, IND_HighTemp : 6.9, GER_LowTemp : 1.2, GER_HighTemp : 7.9  }
];
xAxisRangeColumn: Object = {
  valueType: 'Category',
  majorGridLines: { width: 0 }
};
yAxisRangeColumn: Object = {
  title: ' ',
  labelFormat: '{value}',
  maximum: 20,
  edgeLabelPlacement: 'Shift',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 }
};
markerRangeColumn :Object = {
  dataLabel:{visible: true, position: 'Outer'}
}

rangeColumnSettings:any = {
  primaryXAxis: this.xAxisRangeColumn,
  primaryYAxis: this.yAxisRangeColumn,
  tooltip: this.tooltip,
  legendSetting: this.legend,
  marker: this.markerRangeColumn,
  columnSpacing:0.1,
  high:" ",
  low:" "

}
  //#endregion

  //#region Default Stacking Column

  dataStackingColum: Object[] = [
    { Year : "2013", General : 9628912, Honda : 4298390, Suzuki : 2842133, BMW : 2006366 },
    { Year : "2014", General : 9609326, Honda : 4513769, Suzuki : 3016710, BMW : 2165566 },
    { Year : "2015", General : 7485587, Honda : 4543838, Suzuki : 3034081, BMW : 2279503 },
    { Year : "2016", General : 7793066, Honda : 4999266, Suzuki : 2945295, BMW : 2359756 },
    { Year : "2017", General : 6856880, Honda : 5235842, Suzuki : 3302336, BMW : 2505741 },
];
xAxisStackingColumn: Object = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 },
  //interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: 'Rotate45',
  valueType: 'Category'
};
yAxisStackingColumn: Object = {
  title: ' ',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  //minorTickLines: { width: 0 },
};

stackingColumnSettings:any = {
  primaryXAxis: this.xAxisStackingColumn,
  primaryYAxis: this.yAxisStackingColumn,
  tooltip: this.tooltip,
  legendSetting: this.legend,
  border: this.borderArea,
  columnWidth:0.5,
  width:"2"

}
  //#endregion

  //#region  Default StackingColumn100

  dataStackingColumn100: Object[] = [
    { Year : "2013", General : 9628912, Honda : 4298390, Suzuki : 2842133, BMW : 2006366 },
    { Year : "2014", General : 9609326, Honda : 4513769, Suzuki : 3016710, BMW : 2165566 },
    { Year : "2015", General : 7485587, Honda : 4543838, Suzuki : 3034081, BMW : 2279503 },
    { Year : "2016", General : 7793066, Honda : 4999266, Suzuki : 2945295, BMW : 2359756 },
    { Year : "2017", General : 6856880, Honda : 5235842, Suzuki : 3302336, BMW : 2505741 },
];
  xAxisStackingColumn100: Object = {
  valueType: 'Category',
  labelIntersectAction: 'Rotate45',
  majorGridLines: { width: 0 },
  //minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  //minorTickLines: { width: 0 }
};
yAxisStackingColumn100: Object = {
  title: ' ',
  rangePadding: 'None',
  interval: 20,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  //minorTickLines: { width: 0 },
  lineStyle: {
      width: 0
  }
};
tooltipStackingColumn100: Object = {
  enable: true,
  format: ' '
};

stackingColumn100Settings:any = {
  primaryXAxis: this.xAxisStackingColumn100,
  primaryYAxis: this.yAxisStackingColumn100,
  tooltip: this.tooltipStackingColumn100,
  legendSetting: this.legend,
  border: this.borderArea,
  columnWidth:0.5,
  width:"2"
}

  //#endregion

  //#region  Default Bar
  dataBar: Object[] = [
    { Country : "Canada",  GDP : 3.05 , WorldShare : 2.04 },
    { Country : "Italy", GDP : 1.50 , WorldShare : 2.40 },
    { Country : "Germany",  GDP : 2.22, WorldShare : 4.56 },
    { Country : "India", GDP : 6.68 , WorldShare : 3.28  },
    { Country : "France",  GDP : 1.82, WorldShare : 3.19 },
    { Country : "Japan",  GDP : 1.71, WorldShare : 6.02 }
];
markerBar: Object = {
  dataLabel: {
      visible: false,
      position: 'Top',
      font: {
          fontWeight: '600', color: '#ffffff'
      }
  }
};
xAxisBar: Object = {
  valueType: 'Category',
  title: ' ',
  majorGridLines: { width: 0 }
};
yAxisBar: Object = {
  labelFormat: '{value}',
  title: ' ',
  edgeLabelPlacement: 'Shift',
  majorTickLines: { width: 0 },
  lineStyle: { width: 0 },
};

barSettings:any = {
  primaryXAxis: this.xAxisBar,
  primaryYAxis: this.yAxisBar,
  tooltip: this.tooltip,
  legendSetting: this.legend,
  marker: this.markerBar,
  columnSpacing:0.1
}
  //#endregion

  //#region  Default StackingBar

  dataStackingBar: Object[] = [
    { Month : "Jan", AppleSales : 6, OrangeSales : 6, Wastage : -1 },
    { Month : "Feb", AppleSales : 8, OrangeSales : 8, Wastage : -1.5 },
    { Month : "Mar", AppleSales : 12, OrangeSales : 11, Wastage : -2 },
    { Month : "Apr", AppleSales : 15.5, OrangeSales : 16, Wastage : -2.5 },
    { Month : "May", AppleSales : 20, OrangeSales : 21, Wastage : -3 },
    { Month : "Jun", AppleSales : 24, OrangeSales : 25, Wastage : -3.5 }
];
xAxisStackingbar: Object = {
  valueType: 'Category',
  majorGridLines: { width: 0 },
  majorTickLines: { width: 0 }
};
yAxisStackingbar: Object = {
  title: 'Sales (In Percentage)',
  lineStyle: { width: 0},
  majorTickLines: {width: 0},
  labelFormat: '{value}%',
  edgeLabelPlacement: 'Shift'
};

stackingBarSettings:any = {
  primaryXAxis: this.xAxisStackingbar,
  primaryYAxis: this.yAxisStackingbar,
  tooltip: this.tooltip,
  legendSetting: this.legend,
  border:this.borderArea,
  width:"2",
  columnWidth:0.6
}
  //#endregion

  //#region StackingBar100
  dataStackingBar100: Object[] = [
    { Month : "Jan", AppleSales : 6, OrangeSales : 6, Wastage : 1 },
    { Month : "Feb", AppleSales : 8, OrangeSales : 8, Wastage : 1.5 },
    { Month : "Mar", AppleSales : 12, OrangeSales : 11, Wastage : 2 },
    { Month : "Apr", AppleSales : 15, OrangeSales : 16, Wastage : 2.5 },
    { Month : "May", AppleSales : 20, OrangeSales : 21, Wastage : 3 },
    { Month : "Jun", AppleSales : 24, OrangeSales : 25, Wastage : 3.5 }
];
xAxisStackingBar100: Object = {
  valueType: 'Category',
  majorGridLines: { width: 0 },
  majorTickLines: { width: 0 }
};
yAxisStackingBar100: Object = {
  title: ' ',
  lineStyle: { width: 0},
  majorTickLines: {width: 0},
  labelFormat: '{value}',
  edgeLabelPlacement: 'Shift'
};

  stackingBar100Settings: any = {
    primaryXAxis: this.xAxisStackingBar100,
    primaryYAxis: this.yAxisStackingBar100,
    tooltip: this.tooltipStackingColumn100,
    legendSetting: this.legend,
    border: this.borderArea,
    width:"2",
    columnWidth:0.6
  };
  //#endregion

  //#region Default Scatter

  cluster1Value: Object[] = [
    { Breadth: 41.3, Circumference: 78.1 },
    { Breadth: 41.3, Circumference: 78.04 },
    { Breadth: 42.9, Circumference: 78.9 },
    { Breadth: 42.4, Circumference: 80.4 },
    { Breadth: 42.3, Circumference: 81.7 },
    { Breadth: 42.1, Circumference: 83.9 },
    { Breadth: 41.9, Circumference: 82.9 },
    { Breadth: 41.6, Circumference: 84.6 },
    { Breadth: 41.6, Circumference: 84.6 },
    { Breadth: 41.5, Circumference: 85.1 },
    { Breadth: 41.5, Circumference: 84.3 },
    { Breadth: 41.5, Circumference: 84.3 },
    { Breadth: 41.9, Circumference: 87.9 },
    { Breadth: 42.6, Circumference: 84.0 },
    { Breadth: 42.6, Circumference: 84.0 },
    { Breadth: 42.9, Circumference: 84.9 },
    { Breadth: 42.9, Circumference: 84.9 },
    { Breadth: 43.4, Circumference: 85.8 },
    { Breadth: 43.1, Circumference: 83.5 },
    { Breadth: 42.9, Circumference: 82.2 },
    { Breadth: 43.2, Circumference: 81.7 },
  ];

xAxisScatter: Object = {
  minimum: 40,
  maximum: 56,
  majorGridLines: { width: 0 },
  title: ' '
};
yAxisScatter: Object = {
  majorTickLines: { width: 0 },
  minimum: 70,
  maximum: 140,
  interval: 10,
  lineStyle: {
      width: 0
  },
  rangePadding: 'None',
  title: ' '
};
markerScatter: Object = {
  width: 10,
  height: 10,
  shape:  'Circle'
};

scatterSettings:any = {
  primaryXAxis: this.xAxisScatter,
  primaryYAxis: this.yAxisScatter,
  tooltip: this.tooltipStackingColumn100,
  legendSetting: this.legend,
  marker: this.markerScatter,
  width:"2"
}
  //#endregion

  //#region  Default Polar
  yAxisPolar: Object = {
    title: ' ',
    minimum: -25,
    maximum: 25,
    interval: 10,
    edgeLabelPlacement: 'Shift',
    labelFormat: '{value} ',
};
xAxisPolar: Object = {
  title: ' ',
  valueType: 'Category',
  labelPlacement: 'OnTicks',
  interval: 1,
  coefficient:  100

};
markerPolar: Object = {
  visible: true,
  height: 10, width: 10,
  shape: 'Pentagon',
};
dataPolar: Object[] = [
  { x: 'Jan', y: -7.1 }, { x: 'Feb', y: -3.7 },
  { x: 'Mar', y: 0.8 }, { x: 'Apr', y: 6.3 },
  { x: 'May', y: 13.3 }, { x: 'Jun', y: 18.0 },
  { x: 'Jul', y: 19.8 }, { x: 'Aug', y: 18.1 },
  { x: 'Sep', y: 13.1 }, { x: 'Oct', y: 4.1 },
  { x: 'Nov', y: -3.8 }, { x: 'Dec', y: -6.8 },
];

  polarSettings: any = {
    primaryXAxis: this.xAxisPolar,
    primaryYAxis: this.yAxisPolar,
    tooltip: this.tooltip,
    marker: this.markerPolar,
    drawType:"Line",
    width:"2"

  };
  //#endregion

  //#region Default Hilo

  xAxisHilo: Object = {
    valueType: 'Category',
    crosshairTooltip: { enable: true },
    majorGridLines: { width: 0 }
};
yAxisHilo: Object = {
  title: ' ',
  minimum: 100,
  maximum: 180,
  interval: 20,
  labelFormat: '{value}',
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 }
};
markerHilo: Object = {
  visible: false
};
tooltipHilo: Object = {
  enable: true,
  shared: true
};
legendHilo: Object = {
  visible: false
};
crosshairHilo: Object = {
  enable: true,
  lineType: 'Vertical', line: {
      width: 0,
  }
};
dataHilo: any = [ {
  x: "A",
  open : 137.14,
  high : 140.2786,
  low : 136.28,
  close : 139.78,
  volume : 127757050
},
{
  x: "B",
  open : 139.365,
  high : 139.98,
  low : 137.05,
  close : 139.14,
  volume : 99061270
},
{
  x:"C",
  open : 138.85,
  high : 141.02,
  low : 138.82,
  close : 139.99,
  volume : 120881720
},
{
  x: "D",
  open : 140.4,
  high : 142.8,
  low : 139.73,
  close : 140.64,
  volume : 129178500
},
{
  x: "E",
  open : 139.39,
  high : 144.5,
  low : 138.62,
  close : 143.66,
  volume : 126819590
},
{
  x: "F",
  open : 143.71,
  high : 145.46,
  low : 143.05,
  close : 143.34,
  volume : 105274540
},
{
  x: "G",
  open : 143.6,
  high : 143.8792,
  low : 140.06,
  close : 141.05,
  volume : 87342130
},
{
  x: "H",
  open : 141.48,
  high : 142.92,
  low : 140.45,
  close : 142.27,
  volume : 89092650
},
{
  x: "I",
  open : 143.5,
  high : 144.9,
  low : 143.18,
  close : 143.65,
  volume : 90423600
},
{
  x: "J",
  open : 145.1,
  high : 148.98,
  low : 144.27,
  close : 148.96,
  volume : 173861760
},
{
  x: "K",
  open : 149.03,
  high : 156.42,
  low : 149.03,
  close : 156.1,
  volume : 173087500
},
{
  x: "L",
  open : 156.01,
  high : 156.65,
  low : 149.71,
  close : 153.06,
  volume : 156993820
},
{
  x: "N",
  open : 154,
  high : 154.9,
  low : 152.67,
  close : 153.61,
  volume : 103151450
},
{
  x: "O",
  open : 153.42,
  high : 155.45,
  low : 152.22,
  close : 155.45,
  volume : 88670120
},
{
  x: "Ô",
  open : 154.34,
  high : 155.98,
  low : 146.02,
  close : 148.98,
  volume : 158814040
},
{
  x: "Ơ",
  open : 145.74,
  high : 147.5,
  low : 142.2,
  close : 142.27,
  volume : 219638930
},
{
  x: "P",
  open : 143.66,
  high : 147.16,
  low : 143.66,
  close : 146.28,
  volume : 132832660
},
{
  x: "Q",
  open : 147.17,
  high : 148.28,
  low : 142.28,
  close : 144.02,
  volume : 126890110
},
{
  x: "R",
  open : 144.88,
  high : 145.3001,
  low : 142.41,
  close : 144.18,
  volume : 78465450
},
{
  x: "S",
  open : 144.11,
  high : 149.33,
  low : 143.37,
  close : 149.04,
  volume : 109759170
},
{
  x: "T",
  open : 148.82,
  high : 151.74,
  low : 148.57,
  close : 150.27,
  volume : 104744470
},
{
  x: "U",
  open : 150.58,
  high : 153.99,
  low : 147.3,
  close : 149.5,
  volume : 105536280
}];

  hiloSettings: any = {
    primaryXAxis: this.xAxisHilo,
    primaryYAxis: this.yAxisHilo,
    tooltip: this.tooltipHilo,
    marker: this.markerHilo,
    crosshair: this.crosshairHilo,
    legendSetting: this.legendHilo,
    low: " ",
    hight: " "
  };
  //#endregion

  //#region Default Histogram

    dataHistogram: any = JSON.parse(`[{"y":5.25},{"y":7.75},{"y":0},{"y":8.275},{"y":9.75},{"y":7.75},{"y":8.275},{"y":6.25},{"y":5.75},{"y":5.25},{"y":23},{"y":26.5},{"y":27.75},{"y":25.025},{"y":26.5},{"y":26.5},{"y":28.025},{"y":29.25},{"y":26.75},{"y":27.25},{"y":26.25},{"y":25.25},{"y":34.5},{"y":25.625},{"y":25.5},{"y":26.625},{"y":36.275},{"y":36.25},{"y":26.875},{"y":40},{"y":43},{"y":46.5},{"y":47.75},{"y":45.025},{"y":56.5},{"y":56.5},{"y":58.025},{"y":59.25},{"y":56.75},{"y":57.25},{"y":46.25},{"y":55.25},{"y":44.5},{"y":45.525},{"y":55.5},{"y":46.625},{"y":46.275},{"y":56.25},{"y":46.875},{"y":43},{"y":46.25},{"y":55.25},{"y":44.5},{"y":45.425},{"y":55.5},{"y":56.625},{"y":46.275},{"y":56.25},{"y":46.875},{"y":43},{"y":46.25},{"y":55.25},{"y":44.5},{"y":45.425},{"y":55.5},{"y":46.625},{"y":56.275},{"y":46.25},{"y":56.875},{"y":41},{"y":63},{"y":66.5},{"y":67.75},{"y":65.025},{"y":66.5},{"y":76.5},{"y":78.025},{"y":79.25},{"y":76.75},{"y":77.25},{"y":66.25},{"y":75.25},{"y":74.5},{"y":65.625},{"y":75.5},{"y":76.625},{"y":76.275},{"y":66.25},{"y":66.875},{"y":80},{"y":85.25},{"y":87.75},{"y":89},{"y":88.275},{"y":89.75},{"y":97.75},{"y":98.275},{"y":96.25},{"y":95.75},{"y":95.25}]`);
     binInterval: number = 20;
     columnWidth: number = 0.99;
     showNormalDistribution: boolean = true;
     yAxisHistogram: Object = {
      title: ' ',
      minimum: 0, maximum: 50, interval: 10,
      majorTickLines: { width: 0 }, lineStyle: { width: 0 }
    };
    xAxisHistogram: Object = {
      majorGridLines: { width: 0 }, title: ' ',
      minimum: 0, maximum: 100
  };
    markerHistogram: Object = { dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600', color: '#ffffff' } } }

  histogramSettings: any = {
    primaryXAxis: this.xAxisHistogram,
    primaryYAxis: this.yAxisHistogram,
    tooltip: this.tooltip,
    marker: this.markerHistogram,
    crosshair: this.crosshairHilo,
    legendSetting: this.legendHilo,
    binInterval: this.binInterval,
    columnWidth: this.columnWidth,
    showNormalDistribution: this.showNormalDistribution,
    width:"2"
  };
  //#endregion

  //#region Default Pareto

  dataPareto: Object[] = [
    { x: 'Traffic', y: 56 }, { x: 'Child Care', y: 44.8 },
    { x: 'Transport', y: 27.2 }, { x: 'Weather', y: 19.6 },
    { x: 'Emergency', y: 6.6 }
];
markerPareto: Object = {
  visible: true,
  width: 10,
  height: 10
}
xAxisPareto: Object = {
  title: ' ',
  interval: 1,
  valueType: 'Category',
  majorGridLines: { width: 0 }, minorGridLines: { width: 0 },
  majorTickLines: { width: 0 }, minorTickLines: { width: 0 },
  lineStyle: { width: 0 },
};
yAxisPareto: Object = {
  title: ' ',
  minimum: 0,
  maximum: 150,
  interval: 30,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 }, majorGridLines: { width: 1 },
  minorGridLines: { width: 1 }, minorTickLines: { width: 0 }
};

  paretoSettings: any = {
    primaryXAxis: this.xAxisPareto,
    primaryYAxis: this.yAxisPareto,
    tooltip: this.tooltip,
    marker: this.markerPareto,
    legendSetting: this.legend,
    width: '2'
  };
  //#endregion

  //#region Default Pie

  dataPie: Object[] = [
    {
      Browser: 'Chrome',
      Users: 59.28,
      DataLabelMappingName: '  Chrome: 59.28%',
    },
    {
      Browser: 'UC Browser',
      Users: 4.37,
      DataLabelMappingName: '  UC Browser: 4.37%',
    },
    { Browser: 'Opera', Users: 3.12, DataLabelMappingName: '  Opera: 3.12%' },
    {
      Browser: 'Sogou Explorer',
      Users: 1.73,
      DataLabelMappingName: '  Sogou Explorer: 1.73%',
    },
    { Browser: 'QQ', Users: 3.96, DataLabelMappingName: '  QQ: 3.96%' },
    { Browser: 'Safari', Users: 4.73, DataLabelMappingName: '  Safari: 4.73%' },
    {
      Browser: 'Internet Explorer',
      Users: 6.12,
      DataLabelMappingName: '  Internet Explorer: 6.12%',
    },
    { Browser: 'Edge', Users: 7.48, DataLabelMappingName: '  Edge: 7.48%' },
    { Browser: 'Others', Users: 9.57, DataLabelMappingName: '  Others: 9.57%' },
  ];
  startAngle: number = 30;
  explode: boolean = true;
  enableAnimation: boolean = true;
  tooltipPie: Object = {
    enable: true,
    format: ' ',
    header:'',

};

  pieSettings: any = {
    tooltip: this.tooltipPie,
    legendSetting: this.legend,
    enableAnimation: this.enableAnimation,
    startAngle: this.startAngle,
    endAngle: 360,
    explode: this.explode,
    explodeIndex: 0,
    explodeOffset:"10%",
    innerRadius:"0%",
    radius:"60%",
  };
  //#endregion

  //#region  Default Pyramid
  dataPyramid: Object[] = [
    { Foods :  "Milk, Youghnut, Cheese", Calories : 435, DataLabelMappingName : "Milk, Youghnut, Cheese: 435 cal" },
    { Foods :  "Vegetables", Calories : 470, DataLabelMappingName : "Vegetables: 470 cal" },
    { Foods :  "Meat, Poultry, Fish", Calories : 475, DataLabelMappingName : "Meat, Poultry, Fish: 475 cal" },
    { Foods :  "Fruits", Calories : 520, DataLabelMappingName : "Fruits: 520 cal" },
    { Foods :  "Bread, Rice, Pasta", Calories : 930, DataLabelMappingName : "Bread, Rice, Pasta: 930 cal" },
];
neckWidth: string = '15%';
gapRatio: number = 0.03;
emptyPointSettings: Object = {
  fill: 'red', mode: 'Drop'
};
tooltipPyramid: Object = { header:'', enable: true, format: ' ' };

  pyramidSettings: any = {
    tooltip: this.tooltipPyramid,
    legendSetting: this.legend,
    explode: this.explode,
    explodeIndex: 0,
    neckWidth: this.neckWidth,
    emptyPointSettings: this.emptyPointSettings,
    gapRatio: this.gapRatio,
    width:"45%",
    height:"80%",

  };
  //#endregion

  //#region Default Funnel
  dataFunnel: Object[] = [
    {
      InterviewProcess: 'Hired',
      Candidates: 55,
      DataLabelMappingName: 'Hired: 55',
    },
    {
      InterviewProcess: 'Personal Interview',
      Candidates: 58,
      DataLabelMappingName: 'Personal Interview: 58',
    },
    {
      InterviewProcess: 'Telephonic Interview',
      Candidates: 85,
      DataLabelMappingName: 'Telephonic Interview: 85',
    },
    {
      InterviewProcess: 'Screening',
      Candidates: 105,
      DataLabelMappingName: 'Screening: 105',
    },
    {
      InterviewProcess: 'Initial Validation',
      Candidates: 145,
      DataLabelMappingName: 'Initial Validation: 145',
    },
    {
      InterviewProcess: 'Candidates Applied',
      Candidates: 250,
      DataLabelMappingName: 'Candidates Applied: 250',
    },
  ];
  public neckHeight: string = '15%';
  tooltipFunnel: Object = { enable: false };

  funnelSettings: any = {
    tooltip: this.tooltipFunnel,
    legendSetting: this.legend,
    explode: this.explode,
    explodeIndex: 0,
    neckWidth: this.neckWidth,
    neckHeight: this.neckHeight,
    gapRatio: this.gapRatio,
    //enableAnimation: this.enableAnimation,
  };

  //#endregion
}
