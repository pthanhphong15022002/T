import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { AxisModel, LegendSettingsModel } from '@syncfusion/ej2-angular-charts';
import { isObject } from '@syncfusion/ej2-base';
import {
  NotificationsService,
  ApiHttpService,
  DialogData,
  DialogRef,
} from 'codx-core';

@Component({
  selector: 'popup-add-chart',
  templateUrl: './popup-add-chart.component.html',
  styleUrls: ['./popup-add-chart.component.scss'],
})
export class PopupAddChartComponent implements OnInit {
  data!: any;
  dialog: any;
  @Input() chartFields: any = [];
  chartSetting!: any;
  majorTickLineWidthX: any = 0;
  majorGridLineWidthX: any = 0;
  majorTickLineWidthY: any = 0;
  majorGridLineWidthY: any = 0;
  lineStyleWidthY: any = 0;
  lineStyleWidthX: any = 0;
  value: any = 'Line';
  markerShape: any = ['Circle',
    'Rectangle',
    'Triangle',
    'Diamond',
    'HorizontalLine',
    'VerticalLine',
    'Pentagon',
    'InvertedTriangle']
  marker: any = {
    visible: true,
    width: 10,
    height: 10,
    position: 'Top',
    shape: 'Circle',
    isFilled: false,
    fill: '#fff'
  };
  border!: any;
  tooltip!:any;
  legendSetting: any = {
    visible: true,
    opacity: 1,
    maximumTitleWidth: 100,
    width: '100px',
    background: '#fff',
  };
  axisXmodel: any = {
    name: '',
    columnIndex: 0,
    valueType: 'Category',
    //minimum: 0,
    //maximum: 10,
    //interval: 5,
    //labelFormat: '',
    visible: true,
    labelIntersectAction: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  };
  axisYmodel: any = {
    name: '',
    //columnIndex: 0,
    valueType: 'Category',
    minimum: 0,
    maximum: 10,
    interval: 5,
    //labelFormat: '',
    visible: true,
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  };
  valueType: any = [
    'Category',
    //'DateTimeCategory',
    'DateTime',
    'Double',
    'Logarithmic',
  ];
  intervalType: any = [
    'Auto','Years','Months','Days','Hours','Minutes','Seconds'
  ]
  labelDateFormats:any =[
    {value:"E",text: "wd"},
    {value:"EEEE",text: "weekday"},
    {value:"EHm",text: "wd hh:mm"} ,
    {value:"EHms",text: "wd hh:mm:ss"},
    {value:"Ed",text: "dd wd"},
    {value:"Ehm",text: "wd h:mm"},
    {value:"Ehms",text: "wd h:mm:ss"},
    {value:"Gy",text: "yyyy AD"},
    {value:"GyMMM",text: "MMM yyyy AD"},
    {value:"GyMMMEd",text: "wd,MMM dd,yyyy AD"},
    {value:"GyMMMd",text: "MMM dd,yyyy AD"},
    {value:"H",text: "hh"},
    {value:"Hm",text: "hh:mm"},
    {value:"Hms",text: "hh:mm:ss"},
    {value:"M",text: "MM"},
    {value:"MEd",text: "wd, MM/dd"},
    {value:"MMM",text: "MMM"},
    {value:"MMMM",text: "MMMM"},
    {value:"MMMEd",text: "wd, MMM dd"},
    {value:"MMMd",text: "MMM dd"},
    {value:"Md",text: "MM/dd"},
    {value:"d",text: "dd"},
    {value:"h",text: "h"},
    {value:"hm",text: "h:mm"},
    {value:"hms",text: "h:mm:ss"},
    {value:"ms",text: "mm:ss"},
    {value:"y",text: "yyyy"},
    {value:"yyyy",text: "yyyy"},
    {value:"yM",text: "MM/yyyy"},
    {value:"yMEd",text: "wd, MM/dd/yyyy"},
    {value:"yMMM",text: "MMM yyyy"},
    {value:"yMMMEd",text: "wd, MMM dd, yyyy"},
    {value:"yMMMd",text: " MMM dd, yyyy"},
    {value:"yMd",text: " MM/dd/yyyy"},
    {value:"yQQQ",text: " Q yyyy"},
    {value:"yQQQQ",text: " Q quarter yyyy"},
    {value:"yQQQQ",text: " Q quarter yyyy"},

  ];
  rangePaddings: any = ["None",
    "Round",
    "Additional"];
    labelPlacements:any = ['BetweenTicks','OnTicks']
  crosshair!:any;
  crosshairType: any = ['None','Both','Vertical','Horizontal']
  valuePlacement: any = [ 'Shift','None','Hide'];
  labelIntersectAction = ['Hide','MultipleRows','None','Rotate45','Rotate90','Trim'];
  drawTypes:any=['Line','Spline','Area','StackingArea','Scatter','Column','StackingColumn','RangeColumn']
  constructor(
    private cd: ChangeDetectorRef,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    //this.dataID = dt?.data[];
    if (dt?.data) {
      this.chartSetting = dt.data['serieSetting'];
      // if(this.chartSetting && Object.keys(this.chartSetting).length >0 && !this.chartSetting.width){
      //   this.chartSetting.width = '2';
      // }
      if(!this.chartSetting.enableTooltip) this.chartSetting.enableTooltip = false;
      if (dt.data['axisX']) {
        // for(let i in dt.data['axisX']){
        //   this.axisXmodel[i] = dt.data['axisX'][i];
        // }
        this.axisXmodel = dt.data['axisX'];
        if(this.axisXmodel.crosshairTooltip){
          if(this.axisXmodel.crosshairTooltip.enable != undefined) this.crosshairXEnable =  this.axisXmodel.crosshairTooltip.enable;
          if(this.axisXmodel.crosshairTooltip.fill !=undefined) this.crosshairXFill =  this.axisXmodel.crosshairTooltip.fill;
        }
        //this.axisXmodel = JSON.parse(JSON.stringify(this.axisXmodel));
      }
      if (dt.data['axisY']) {
        // for(let i in dt.data['axisY']){
        //   this.axisYmodel[i] = dt.data['axisY'][i];
        // }
        this.axisYmodel = dt.data['axisY'];
        if(this.axisYmodel.crosshairTooltip){
          if(this.axisYmodel.crosshairTooltip.enable != undefined) this.crosshairYEnable =  this.axisYmodel.crosshairTooltip.enable;
          if(this.axisYmodel.crosshairTooltip.fill !=undefined) this.crosshairYFill =  this.axisYmodel.crosshairTooltip.fill;
        }
        //this.axisYmodel = JSON.parse(JSON.stringify(this.axisYmodel));
      }
      if (this.axisXmodel?.majorTickLines?.width)
        this.majorTickLineWidthX = this.axisXmodel?.majorTickLines?.width;
      if (this.axisXmodel?.majorGridLines?.width)
        this.majorTickLineWidthX = this.axisXmodel?.majorGridLines?.width;
      if (this.axisXmodel?.lineStyle?.width)
        this.lineStyleWidthX = this.axisXmodel?.lineStyle?.width;
      if (this.axisYmodel?.majorTickLines?.width)
        this.majorTickLineWidthY = this.axisYmodel?.majorTickLines?.width;
      if (this.axisYmodel?.majorGridLines?.width)
        this.majorTickLineWidthY = this.axisYmodel?.majorGridLines?.width;
      if (this.axisYmodel?.lineStyle?.width)
        this.lineStyleWidthY = this.axisYmodel?.lineStyle?.width;
      if (dt.data['legendSetting']) {
        // for(let i in dt.data['legendSetting']){
        //   this.legendSetting[i] =  dt.data['legendSetting'][i];
        // }
        this.legendSetting = dt.data['legendSetting'];
      }
      if (
        this.chartSetting?.marker &&
        Object.keys(this.chartSetting.marker).length > 0
      ) {
        for(let i in this.chartSetting.marker){
         this.marker[i] = this.chartSetting.marker[i];
        }
        this.marker = JSON.parse(JSON.stringify(this.marker));
        //this.marker = this.chartSetting.marker;
      }
      if (
        this.chartSetting?.border &&
        Object.keys(this.chartSetting.border).length > 0
      ) {
        this.border = {};
        for(let i in this.chartSetting.border){
         this.border[i] = this.chartSetting.border[i];
        }
        this.border = JSON.parse(JSON.stringify(this.border));
      }
      if (
        this.chartSetting?.tooltip &&
        Object.keys(this.chartSetting.tooltip).length > 0
      ) {
        this.tooltip = {};
        for(let i in this.chartSetting.tooltip){
         this.tooltip[i] = this.chartSetting.tooltip[i];
        }
        this.tooltip = JSON.parse(JSON.stringify(this.tooltip));
      }
      if (
        this.chartSetting?.crosshair &&
        Object.keys(this.chartSetting.crosshair).length > 0
      ) {
        this.crosshair = {};
        for(let i in this.chartSetting.crosshair){
         this.crosshair[i] = this.chartSetting.crosshair[i];
        }
        this.crosshair = JSON.parse(JSON.stringify(this.crosshair));
        if(this.crosshair.line){
          if(this.crosshair.line.width != undefined) this.crosshairLineWidth =  this.crosshair.line.width;
          if(this.crosshair.line.color !=undefined) this.crosshairLineColor =  this.crosshair.line.color;
        }
      }
      //this.onChange({value: this.chartSetting.type});
    }
    let ins = setInterval(()=>{
      let eleOverLay = Array.from(document.getElementsByClassName('e-dlg-overlay')).pop();
      if(eleOverLay){
        clearInterval(ins);
        (eleOverLay as HTMLElement).style.zIndex = '9998';
      }
    },100)
    this.dialog = dialog;
  }
  chartTypes: any = [
    { text: 'Line', value: 'Line' },
    { text: 'StepLine', value: 'StepLine' },
    { text: 'StackingLine', value: 'StackingLine' },
    { text: 'StackingLine100', value: 'StackingLine100' },
    { text: 'Spline', value: 'Spline' },
    { text: 'SplineArea', value: 'SplineArea' },
    { text: 'MultiColoredLine', value: 'MultiColoredLine' },
    { text: 'Area', value: 'Area' },
    { text: 'RangeArea', value: 'RangeArea' },
    { text: 'SplineRangeArea', value: 'SplineRangeArea' },
    { text: 'StackingArea', value: 'StackingArea' },
    { text: 'StackingArea100', value: 'StackingArea100' },
    { text: 'StepArea', value: 'StepArea' },
    { text: 'StackingStepArea', value: 'StackingStepArea' },
    //{ text: 'MultiColoredArea', value: 'MultiColoredArea' },
    { text: 'Column', value: 'Column' },
    { text: 'RangeColumn', value: 'RangeColumn' },
    { text: 'StackingColumn', value: 'StackingColumn' },
    { text: 'StackingColumn100', value: 'StackingColumn100' },
    { text: 'Bar', value: 'Bar' },
    { text: 'StackingBar', value: 'StackingBar' },
    { text: 'StackingBar100', value: 'StackingBar100' },
    { text: 'Scatter', value: 'Scatter' },
    { text: 'Bubble', value: 'Bubble' },
    { text: 'Polar', value: 'Polar' },
    { text: 'Radar', value: 'Radar' },
    { text: 'Hilo', value: 'Hilo' },
    { text: 'HiloOpenClose', value: 'HiloOpenClose' },
    { text: 'Candle', value: 'Candle' },
    { text: 'BoxAndWhisker', value: 'BoxAndWhisker' },
    { text: 'Waterfall', value: 'Waterfall' },
    { text: 'Histogram', value: 'Histogram' },
    { text: 'Pareto', value: 'Pareto' },
    { text: 'Pie', value: 'Pie' },
    { text: 'Pyramid', value: 'Pyramid' },
    { text: 'Funnel', value: 'Funnel' },
  ];

  ngOnInit(): void {
    let objSetting: any = {};
    objSetting.type = 'Line';
    objSetting.enableTooltip = true;
    objSetting.fill = '#00bdae';
    objSetting.name = '';
    //objSetting.opacity = 1;
    //objSetting.width = '2';
    objSetting.xName = '';
    objSetting.yName = '';
    if (!this.chartSetting) this.chartSetting = objSetting;
    else{
      if(this.chartSetting.type == 'Hilo') delete objSetting.yName;
      if(this.chartSetting.type == 'Histogram') delete objSetting.xName;
      let _settings = JSON.parse(JSON.stringify(this.chartSetting));
      if(_settings.marker) delete _settings.marker;
      if(_settings.tooltip) delete _settings.tooltip;
      if(_settings.border) delete _settings.border;
      if(_settings.crosshair) delete _settings.crosshair;

      for(let i in _settings){
        objSetting[i] = _settings[i];
      }
      objSetting = JSON.parse(JSON.stringify(objSetting));
    }
    let propSetting = Object.getOwnPropertyDescriptors(objSetting);
    this.chartFields = [];
    for (let prop in propSetting) {
      (propSetting[prop] as any).type = typeof (propSetting[prop] as any).value;
      (propSetting[prop] as any).name = prop;
      this.chartFields.push(propSetting[prop]);
    }

    this.onChange({ value: this.chartSetting.type });
  }

  valueChange(evt: any) {
    debugger
    this.chartSetting[evt.field] = evt.data;
    if (evt.data==undefined || evt.data == '') {
      delete this.chartSetting[evt.field];
    }
  }

  legendChange(evt: any) {
    this.legendSetting[evt.field] = evt.data;
    if (evt.data == undefined) {
      delete this.legendSetting[evt.field];
    }
  }

  _tmpXAxis!: any ;
  _tmpYAxis!: any ;
  axisChange(evt: any, type: string) {
    if(!this._tmpXAxis) this._tmpXAxis= {...this.axisXmodel};
    if(!this._tmpYAxis) this._tmpYAxis = {...this.axisYmodel};
    if (type) {
      if (type == 'X') {
        if (evt.field == 'majorTickLines' || evt.field == 'majorGridLines') {
          this._tmpXAxis[evt.field].width = evt.data;
          if (evt.field == 'majorTickLines')
            this.majorTickLineWidthX = evt.data;
          else this.majorGridLineWidthX = evt.data;
          if (evt.data == undefined) {
            delete this._tmpXAxis[evt.field].width;
            if (evt.field == 'majorTickLines')
              this.majorTickLineWidthX = undefined;
            else this.majorGridLineWidthX = undefined;
          }
        } else {
          this._tmpXAxis[evt.field] = evt.data;
          if (evt.data == undefined) delete this._tmpXAxis[evt.field];
        }
      } else {
        if (
          evt.field == 'majorTickLines' ||
          evt.field == 'majorGridLines' ||
          evt.field == 'lineStyle'
        ) {
          this._tmpYAxis[evt.field].width = evt.data;
          if (evt.field == 'majorTickLines')
            this.majorTickLineWidthY = evt.data;
          if (evt.field == 'majorGridLines')
            this.majorGridLineWidthY = evt.data;
          if (evt.field == 'lineStyle') this.lineStyleWidthY = evt.data;
          if (evt.data == undefined) {
            delete this._tmpYAxis[evt.field].width;
            if (evt.field == 'majorTickLines')
              this.majorTickLineWidthY = undefined;
            if (evt.field == 'majorGridLines')
              this.majorGridLineWidthY = undefined;
            if (evt.field == 'lineStyle') this.lineStyleWidthY = undefined;
          }
        } else {
          this._tmpYAxis[evt.field] = evt.data;
          if (!evt.data) delete this._tmpYAxis[evt.field];
        }
      }
    }
  }

  axisVllChange(evt: any, field: any, type: string) {
    if (type && field) {
      if (type == 'X') {
        if(!this._tmpXAxis)  this._tmpXAxis = {...this.axisXmodel}
        this._tmpXAxis[field] = evt.value;
        if (!evt.value) delete this._tmpXAxis[field];
        if(field == 'valueType'){
          if(evt.value == 'DateTime'){
            this._tmpXAxis['minimum'] = new Date('12-31-'+(new Date().getFullYear()-1));
            this._tmpXAxis['maximum'] = new Date('12-31-'+new Date().getFullYear());
            this.axisXmodel['minimum'] = new Date('12-31-'+(new Date().getFullYear()-1));
            this.axisXmodel['maximum'] = new Date('12-31-'+new Date().getFullYear());
            this._tmpXAxis['labelFormat'] = "yyyy";
            this.axisXmodel['labelFormat'] = "yyyy";
            this._tmpXAxis['intervalType'] = 'Years';
            this.axisXmodel['intervalType'] = 'Years';
            //this._tmpXAxis[field] = evt.value;
            this.axisXmodel[field] =evt.value;
            this.axisXmodel = JSON.parse(JSON.stringify(this.axisXmodel));
          }
          else{
            this._tmpXAxis[field] = evt.value;
            this.axisXmodel[field] = evt.value;
            delete this._tmpXAxis['minimum'];
            delete this.axisXmodel['minimum']
            delete this._tmpXAxis['maximum'];
            delete this.axisXmodel['maximum'];
            delete this._tmpXAxis['intervalType'];
            delete this.axisXmodel['intervalType'];
            delete this._tmpXAxis['labelFormat'];
            delete this.axisXmodel['labelFormat'];
          }
        }
        if(field == 'intervalType'){
          this.axisXmodel[field] =evt.value;
          switch(evt.value){
            case 'Auto':
              this._tmpXAxis['labelFormat'] = 'yMd';
              this.axisXmodel['labelFormat'] = 'yMd';
            break;
            case 'Years':
              this._tmpXAxis['labelFormat'] = 'yyyy';
              this.axisXmodel['labelFormat'] = 'yyyy';
            break;
            case 'Months':
              this._tmpXAxis['labelFormat'] = 'MMMM';
              this.axisXmodel['labelFormat'] = 'MMMM';
            break;
            case 'Days':
              this._tmpXAxis['labelFormat'] = 'MMMd';
              this.axisXmodel['labelFormat'] = 'MMMd';
            break;
            case 'Hours':
              this._tmpXAxis['labelFormat'] = 'hms';
              this.axisXmodel['labelFormat'] = 'hms';
            break;
            case 'Minutes':
            case 'Seconds':
              this._tmpXAxis['labelFormat'] = 'ms';
              this.axisXmodel['labelFormat'] = 'ms';
            break;
          }

        }
      } else {
        if(!this._tmpYAxis)  this._tmpYAxis = {...this.axisYmodel}
        this._tmpYAxis[field] = evt.value;
        if (!evt.value) delete this._tmpYAxis[field];
      }
    }
  }

  crosshairXEnable!:any;
  crosshairXFill!:any;
  crosshairYEnable!:any;
  crosshairYFill!:any;
  axisChildChange(evt:any, type:any){
    if(type == 'X'){
      if(!this._tmpXAxis)  this._tmpXAxis = {...this.axisXmodel}
      this._tmpXAxis.crosshairTooltip[evt.field] = evt.value;
      if(evt.field == 'fill'){
        this.crosshairXFill = evt.value;
      }
      else{
        this.crosshairXEnable = evt.value;
      }
    }
    else{
      if(!this._tmpYAxis)  this._tmpYAxis = {...this.axisYmodel}
      this._tmpYAxis.crosshairTooltip[evt.field] = evt.value;
      if(evt.field == 'fill'){
        this.crosshairYFill = evt.value;
      }
      else{
        this.crosshairYEnable = evt.value;
      }
    }
  }

  markerChange(evt: any) {
    this.marker[evt.field] = evt.data;
    if (evt.data != undefined && evt.data == 0) {
      delete this.marker[evt.field];
    }
  }

  markerShapeChange(evt:any){
    if(evt.value){
      this.marker['shape'] = evt.value;
    }
  }

  borderChange(evt:any){
    if(!this.border) this.border = {};
    this.border[evt.field] == evt.data;
  }

  tooltipChange(evt:any){
    if(!this.border) this.border = {};
    this.border[evt.field] == evt.data;
  }

  crosshairLineWidth!:any;
  crosshairLineColor!:any;
  crosshairChange(evt:any, childChange: boolean = false){
    if(!this.crosshair) this.crosshair = {};
    if(childChange){
      this.crosshair.line[evt.field] = evt.value;
      if(evt.field == 'width') this.crosshairLineWidth = evt.value;
      if(evt.field == 'color') this.crosshairLineColor = evt.value;
    }
    else{
      this.crosshair[evt.field] = evt.value
    }
  }

  crosshairTypeChange(evt:any,key:any){
    if(!this.crosshair) this.crosshair = {};
    this.crosshair[key] = evt.value;
  }

  onChange(evt: any) {
    if (!evt.value) return;
    //let setting = new SeriesSetting();
    // let setting: any = {};
    // let xAxis: any = {};
    // let yAxis: any = {};

    // this.chartSetting.type = evt.value;
    // setting.xName = '';
    // setting.yName = '';
    // setting.name = '';

    // if (evt.value.includes('ine') || evt.value.includes('Area')) {
    //   setting.dashArray = '';
    //   setting.opacity = 1;
    //   setting.width ='2';
    //   //setting.low = '';
    //   //setting.high = '';
    //   setting.type = evt.value;
    //   setting.fill = '00bdae';
    //   if (evt.value == 'SpLine') setting.splineType = 'Natural';

    //   xAxis = {
    //     valueType: 'Category',
    //     majorTickLines: { width: 0 },
    //   };
    //   yAxis = {
    //     title: '',
    //     minimum: 0,
    //     maximum: 20,
    //     interval: 4,
    //     lineStyle: { width: 0 },
    //     majorTickLines: { width: 0 },
    //   };
    //   if (!this.axisXmodel || Object.keys(this.axisXmodel).length == 0)
    //     this.axisXmodel = xAxis;
    //   if (!this.axisYmodel || Object.keys(this.axisYmodel).length == 0)
    //     this.axisYmodel = yAxis;
    // } else if (
    //   evt.value == 'Funnel' ||
    //   evt.value == 'Pie' ||
    //   evt.value == 'Pyramid'
    // ) {
    //   setting.startAngle = 0;
    //   setting.endAngle = 360;
    //   setting.innerRadius = '40%';
    //   setting.radius = '70%';
    //   setting.explode = true;
    //   setting.explodeIndex = 0;
    //   setting.explodeOffset = '20%';
    //   setting.explodeAll = false;
    //   if (evt.value == 'Pyramid') setting.pyramidMode = 'Surface';
    // } else {
    //   setting.width = 0;
    //   setting.height = 0;
    //   setting.drawType = 'Line';
    //   setting.opacity = 1;
    //   setting.columnWidth = 1;
    //   setting.dashArray = '';
    //   setting.columnSpacing = 0.5;
    //   //setting.high = '';
    //   //setting.low = '';
    //   setting.neckHeight = '15%';
    //   setting.neckWidth = '10%';
    //   setting.volume = '';
    //   setting.fill = '00bdae';
    // }
    // this.chartFields = [];

    // let propSetting = Object.getOwnPropertyDescriptors(setting);
    // for (let prop in propSetting) {
    //   (propSetting[prop] as any).type = typeof (propSetting[prop] as any).value;
    //   (propSetting[prop] as any).name = prop;
    //   this.chartFields.push(propSetting[prop]);
    // }
    // this.chartFields = JSON.parse(JSON.stringify(this.chartFields));
  }

  saveForm() {
    if(this._tmpXAxis && Object.keys(this._tmpXAxis).length >0) this.axisXmodel = {...this._tmpXAxis};
    if(this._tmpYAxis && Object.keys(this._tmpYAxis).length >0) this.axisYmodel = {...this._tmpYAxis};
    this.chartSetting.marker = this.marker;
    if(this.border && Object.keys(this.border).length >0){
      this.chartSetting.border = this.border;
    }
    if(this.tooltip && Object.keys(this.tooltip).length >0){
      this.chartSetting.tooltip = this.tooltip;
    }
    for (let prop in this.chartSetting) {
      if (!this.chartSetting[prop] || this.chartSetting[prop] == '') {
        delete this.chartSetting[prop];
      }
    }
    let chartSettings:any = {
      serieSetting: this.chartSetting,
      axisX: this.axisXmodel,
      axisY: this.axisYmodel,
      legendSetting: this.legendSetting,
    };
    if(this.crosshair) chartSettings.crosshair = {...this.crosshair};
    this.dialog && this.dialog.close(chartSettings);
  }

  getTypeOfValue(evt:any){

   if(typeof evt == 'string' &&  Date.parse(evt) ){
    return 'datetime';
   }
   else if(evt instanceof Date && !isNaN(evt.getTime())){
    return 'datetime'
   }
    return typeof evt;
  }

  formatString(str:any){
    return str.split(/(?=[A-Z])/).join(' ').toLowerCase();
  }

  isObject(evt:any){
    return typeof evt === 'object';
  }
}
