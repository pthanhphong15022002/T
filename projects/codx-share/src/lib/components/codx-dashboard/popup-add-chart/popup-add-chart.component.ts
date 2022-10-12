import { Component, OnInit, Optional } from "@angular/core";
import { NotificationsService, ApiHttpService, DialogData, DialogRef, SeriesSetting } from "codx-core";

@Component({
  selector: 'popup-add-chart',
  templateUrl: './popup-add-chart.component.html',
  styleUrls: ['./popup-add-chart.component.scss'],
})
export class PopupAddChartComponent  implements OnInit{
  data!: any;
  dialog: any;
  chartFields: any = [];
  chartSetting!: any;
  value: any ='Line';
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
    )
  {
    //this.dataID = dt?.data[];
    if(dt?.data) this.chartSetting = dt.data;
    this.dialog = dialog;

  }
  chartTypes: any = [
    {text: 'Line', value: 'Line'},
    {text: 'StepLine', value: 'StepLine'},
    {text: 'StackingLine', value: 'StackingLine'},
    {text: 'StackingLine100', value: 'StackingLine100'},
    {text: 'Spline', value: 'Spline'},
    {text: 'SplineArea', value: 'SplineArea'},
    {text: 'MultiColoredLine', value: 'MultiColoredLine'},
    {text: 'Area', value: 'Area'},
    {text: 'RangeArea', value: 'RangeArea'},
    {text: 'SplineRangeArea', value: 'SplineRangeArea'},
    {text: 'StackingArea', value: 'StackingArea'},
    {text: 'StackingArea100', value: 'StackingArea100'},
    {text: 'StepArea', value: 'StepArea'},
    {text: 'StackingStepArea', value: 'StackingStepArea'},
    {text: 'MultiColoredArea', value: 'MultiColoredArea'},
    {text: 'Column', value: 'Column'},
    {text: 'RangeColumn', value: 'RangeColumn'},
    {text: 'StackingColumn', value: 'StackingColumn'},
    {text: 'StackingColumn100', value: 'StackingColumn100'},
    {text: 'Bar', value: 'Bar'},
    {text: 'StackingBar', value: 'StackingBar'},
    {text: 'StackingBar100', value: 'StackingBar100'},
    {text: 'Scatter', value: 'Scatter'},
    {text: 'Bubble', value: 'Bubble'},
    {text: 'Polar', value: 'Polar'},
    {text: 'Radar', value: 'Radar'},
    {text: 'Hilo', value: 'Hilo'},
    {text: 'HiloOpenClose', value: 'HiloOpenClose'},
    {text: 'Candle', value: 'Candle'},
    {text: 'BoxAndWhisker', value: 'BoxAndWhisker'},
    {text: 'Waterfall', value: 'Waterfall'},
    {text: 'Histogram', value: 'Histogram'},
    {text: 'Pareto', value: 'Pareto'},
    {text: 'Pareto', value: 'Pareto'},
  ]
  ngOnInit(): void {
    let objSetting = new SeriesSetting;
    objSetting.bearFillColor = '';
    objSetting.bitInterval = 0;
    objSetting.borderColor = '';
    objSetting.boxPlotMode = 'Normal';
    objSetting.bullFillColor = '';
    objSetting.closed = false;
    objSetting.columnSpacing =5;
    objSetting.columnWidth =10;
    objSetting.type = 'Line';
    objSetting.columnWidthInPixel =10;
    objSetting.dashArray = '5';
    objSetting.drawType = 'Line';
    objSetting.enableComplexProperty = false;
    objSetting.enableSolidCandles = false;
    objSetting.enableTooltip = true;
    objSetting.endAngle = 360;
    objSetting.explode = true;
    objSetting.explodeAll = false;
    objSetting.explodeIndex = 0;
    objSetting.explodeOffset = '10%';
    objSetting.fill = '';
    objSetting.gapRatio = 0;
    objSetting.groupName ='';
    objSetting.groupTo = '';
    objSetting.height = '100%';
    objSetting.high = '10';
    objSetting.innerRadius= '40%';
    objSetting.isMultiple = false;
    objSetting.legendImageUrl = '';
    objSetting.low = '0';
    objSetting.maxRadius = 10;
    objSetting.minRadius = 0;
    objSetting.name = '';
    objSetting.neckHeight ='10px';
    objSetting.neckWidth='10px';
    objSetting.negativeFillColor ='';
    objSetting.nonHighlightStyle = '';
    objSetting.opacity = 10;
    objSetting.pointColorMapping = '';
    objSetting.pyramidMode = 'Linear';
    objSetting.radius = '70%';
    objSetting.selectionStyle = '';
    objSetting.showMean = true;
    objSetting.showNormalDistribution = true;
    objSetting.splineType = 'Natural';
    objSetting.stackingGroup = '';
    objSetting.startAngle = 0;
    objSetting.summaryFillColor = '';
    objSetting.tooltipFormat = '';
    objSetting.tooltipMappingName = '';
    objSetting.unSelectedStyle = '';
    objSetting.visible = true;
    objSetting.volume = '';
    objSetting.width = '100%';
    //objSetting.xAxisName = '';
    objSetting.xName = '';
    //objSetting.yAxisName = '';
    objSetting.yName = '';
    objSetting.zOrder = 0;
    let propSetting = Object.getOwnPropertyDescriptors(objSetting);
    this.chartFields = [];
    for(let prop in propSetting){
      (propSetting[prop] as any).type = typeof ((propSetting[prop] as any).value);
      (propSetting[prop] as any).name = prop;
      this.chartFields.push(propSetting[prop])
    }
    if(!this.chartSetting)this.chartSetting = objSetting;
  }

  valueChange(evt:any){
    this.chartSetting[evt.field] = evt.data;
    if(!evt.data || evt.data == ''){
      delete this.chartSetting[evt.field];
    }
  }
  onChange(evt:any){
    let setting = new SeriesSetting();
    if(evt.value.includes('Line') ||evt.value.includes('Area') ){

      setting.xName = '';
      setting.yName = '';
      setting.name='';
      setting.width = 0;
      setting.fill = '';
      setting.dashArray = '';
      setting.opacity = 1;
      setting.low = '';
      setting.high = '';
      setting.type = evt.value;
    }
    this.chartFields = [];
    let propSetting = Object.getOwnPropertyDescriptors(setting);
    for(let prop in propSetting){
      (propSetting[prop] as any).type = typeof ((propSetting[prop] as any).value);
      (propSetting[prop] as any).name = prop;
      this.chartFields.push(propSetting[prop])
    }
  }
  saveForm(){
    for(let prop in this.chartSetting){
      if(!this.chartSetting[prop] || this.chartSetting[prop]==''){
        delete this.chartSetting[prop];
      }
    }
    this.dialog && this.dialog.close(this.chartSetting);
  }
}
