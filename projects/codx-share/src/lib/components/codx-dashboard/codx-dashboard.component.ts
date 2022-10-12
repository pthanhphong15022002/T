import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, TemplateRef, Input } from "@angular/core";
import { AxisModel } from "@syncfusion/ej2-angular-charts";
import { DashboardLayoutComponent, PanelModel } from "@syncfusion/ej2-angular-layouts";
import { ApiHttpService, CallFuncService, DialogModel, SeriesSetting, SidebarModel } from "codx-core";
import { PopupAddChartComponent } from "./popup-add-chart/popup-add-chart.component";
import { PopupAddPanelComponent } from "./popup-add-panel/popup-add-panel.component";

@Component({
  selector: 'codx-dashboard',
  templateUrl: './codx-dashboard.component.html',
  styleUrls: ['./codx-dashboard.component.scss'],
})
export class CodxDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('dashboard') objDashboard!: DashboardLayoutComponent;
  @ViewChild('panelLayout') panelLayout?: TemplateRef<any>;
  @ViewChild('chart') chart?: TemplateRef<any>;
  @ViewChild('templateContainer') templateContainer?: TemplateRef<any>;
  @Input() template! : TemplateRef<any>;
  cellSpacing: number[] = [10, 10];
  cellAspectRatio: number = 100 / 50;
  panels: any = [];
  datas: any = [];
  marker: Object = {
    visible: true,
    width: 10,
    height: 10,
  };
  seriesSetting: SeriesSetting[] = [];
  chartArea: Object = {
    border: {
      width: 0,
    },
  };
  primaryXAxis: AxisModel = {
    valueType: 'Category',
    interval: 1,
    majorGridLines: { width: 0 },
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

  constructor(
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private api: ApiHttpService
  ) {}
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  addPanel() {
    let option = new SidebarModel();
    let dialog = this.callfunc.openForm(PopupAddPanelComponent,"",600,400,"",option);
    dialog.closed.subscribe(res=>{
      if(res.event){
        let randomNumber = Math.random();
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
        this.createPanelContainer(panel[0].id)
      }
    })
  }

  //Dashboard Layout's resizestop event function
onResizeStop(args: any) {
  this.panels = this.objDashboard.serialize();
  if (args.element) {
    if(args.element.getElementsByClassName('chart-item')[0].querySelector('ejs-accumulationchart')){
      const chartObj = args.element.getElementsByClassName('chart-item')[0].querySelector('ejs-accumulationchart').ej2_instances[0];
      if(args.element.offsetHeight < chartObj.element.offsetHeight) {
        chartObj.height = '60%';
        chartObj.width = '80%';
      }
      else{
        chartObj.height = '100%';
        chartObj.width = '100%';
      }
      chartObj.refreshChart()
    }
    if(args.element.getElementsByClassName('chart-item')[0].querySelector('ejs-chart')){
      const chartObj = args.element.getElementsByClassName('chart-item')[0].querySelector('ejs-chart').ej2_instances[0];
      chartObj.height = '100%';
      chartObj.width = '100%';
      chartObj.chartResize();
    }
  }
}
onCreate(evt:any){
  this.panels = JSON.parse(`[{"id":"0.8749760875977672_layout","row":0,"col":0,"sizeX":2,"sizeY":3,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.4529998883731361_layout","row":0,"col":2,"sizeX":3,"sizeY":3,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.9976017894147307_layout","row":3,"col":0,"sizeX":5,"sizeY":5,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]`);
  this.datas = JSON.parse(`[{"panelId":"0.4529998883731361_layout_content","data":{"width":"100%","height":"100%","opacity":10,"maxRadius":10,"enableTooltip":true,"showNormalDistribution":true,"neckWidth":"10px","neckHeight":"10px","showMean":true,"visible":true,"cardinalSplineTension":0.5,"pyramidMode":"Linear","groupMode":"Value","boxPlotMode":"Normal","columnSpacing":5,"columnWidth":10,"type":"Pyramid","columnWidthInPixel":10,"dashArray":"5","drawType":"Line","endAngle":360,"explode":true,"explodeOffset":"10%","high":"10","innerRadius":"40%","low":"0","radius":"70%","splineType":"Natural","xName":"CustomerID","yName":"Freight"}},{"panelId":"0.8749760875977672_layout_content","data":{"width":"100%","height":"100%","opacity":10,"maxRadius":10,"enableTooltip":true,"showNormalDistribution":true,"neckWidth":"10px","neckHeight":"10px","showMean":true,"visible":true,"cardinalSplineTension":0.5,"pyramidMode":"Linear","groupMode":"Value","boxPlotMode":"Normal","columnSpacing":5,"columnWidth":10,"type":"Pie","columnWidthInPixel":10,"dashArray":"5","drawType":"Line","endAngle":360,"explode":true,"explodeOffset":"10%","high":"10","innerRadius":"60%","low":"0","radius":"70%","splineType":"Natural","xName":"CustomerID","yName":"Freight","explodeAll":true,"numberFrom":-2,"groupTo":"2","name":"ABS"}},{"panelId":"0.9976017894147307_layout_content","data":{"width":"100%","height":"100%","opacity":10,"maxRadius":10,"enableTooltip":true,"showNormalDistribution":true,"neckWidth":"10px","neckHeight":"10px","showMean":true,"visible":true,"cardinalSplineTension":0.5,"pyramidMode":"Linear","groupMode":"Value","boxPlotMode":"Normal","columnSpacing":5,"columnWidth":10,"type":"Scatter","columnWidthInPixel":10,"dashArray":"5","drawType":"Line","endAngle":360,"explode":true,"explodeOffset":"10%","high":"10","innerRadius":"40%","low":"0","radius":"70%","splineType":"Natural","xName":"CustomerID","yName":"Freight"}}] `);
  if(this.panels && this.panels.length > 0){
    this.objDashboard.panels = this.panels;
    let iGenPanels = setInterval(()=>{
      if(this.objDashboard && this.objDashboard.element.childElementCount > 0){
        clearInterval(iGenPanels);
        this.panels.forEach((ele:any) => {
          let idx = this.objDashboard.panels.findIndex((x:any)=> x.id == ele.id);
          this.createPanelContainer(ele.id);
          let panelChart = this.datas.filter((x:any)=>x.panelId == ele.id+'_content')[0];
          if(idx > -1){
            (this.objDashboard.panels[idx] as any).childChangedProperties = JSON.parse(JSON.stringify(panelChart.data));
          }
          this.creatChart(ele.id,panelChart.data);
        });
      }
    },100)
  }
}

addChart(panelId: any) {
  if (panelId) {
    let elePanel = document.getElementById(panelId);
    let idx = this.objDashboard.panels.findIndex((x:any)=> x.id == elePanel?.parentElement?.id);
    if(this.template){
      let viewRef = this.template!.createEmbeddedView({ $implicit: '' });
      viewRef.detectChanges();
      let contentChart = viewRef.rootNodes;
      let html = contentChart[0] as HTMLElement;
      let eleBody = elePanel?.getElementsByClassName('card-body');
      if (eleBody && eleBody.length > 0) {
        eleBody[0].appendChild(html);
        //this.replaceChart(elePanel);
      }
    }
    else{
      let chartInfo = undefined;
      if(Object.keys((this.objDashboard.panels[idx] as any).childChangedProperties).length > 0){
        chartInfo = (this.objDashboard.panels[idx] as any).childChangedProperties;
      }
      let option = new DialogModel();
      let dialog = this.callfunc.openForm(PopupAddChartComponent,"",600,800,"",chartInfo,"",option);
      dialog.closed.subscribe(res=>{
        if(res.event){

          res.event.marker = this.marker;
          res.event.xName = 'CustomerID';
          res.event.yName=  'Freight';
          //this.seriesSetting = [res.event];
          if(idx > -1){
            (this.objDashboard.panels[idx] as any).childChangedProperties = JSON.parse(JSON.stringify(res.event));
          }
          this.creatChart(panelId,res.event);
        }
      });
    }

  }
}

deletePanel(panelId: any) {
  this.objDashboard.removePanel(panelId);
  let idx =  this.panels.findIndex((x:any)=>x.id == panelId);
  if(idx > -1){
    this.panels.splice(idx,1);
    let idxChart = this.datas.findIndex((x:any)=>x.panelId == panelId+'_content');
    idxChart >-1 && this.datas.splice(idxChart,1);
  }
}

//Create panel container
private createPanelContainer(panelId: any){
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
private creatChart(panelId: any, chartSetting: any){
  this.seriesSetting = [chartSetting];
  let elePanel = document.getElementById(panelId);
  let viewRef = this.chart!.createEmbeddedView({ $implicit: '' });
  viewRef.detectChanges();
  let contentChart = viewRef.rootNodes;
  let html = contentChart[0] as HTMLElement;
  let eleBody = elePanel?.getElementsByClassName('card-body');
  if (eleBody && eleBody.length > 0) {
    eleBody[0].appendChild(html);
    this.replaceChart(elePanel);
  }
  //delete old setting of panel
  let oldIndex = this.datas.findIndex((x:any)=>x.panelId == panelId);
  oldIndex > -1 && this.datas.splice(oldIndex,1);
  this.datas.push({panelId: panelId, data: chartSetting});
  console.log(JSON.stringify(this.datas), JSON.stringify(this.panels));
}

private replaceChart(elePanel: any){
  if (elePanel && elePanel.getElementsByTagName('codx-chart').length > 0) {
    let oldItem = elePanel.getElementsByClassName('chart-item');
    if(oldItem.length > 1){
      for(let i = 0; i<oldItem.length -1; i++){
        oldItem[i].classList.add('d-none')
       }
    }
  }
}
}
