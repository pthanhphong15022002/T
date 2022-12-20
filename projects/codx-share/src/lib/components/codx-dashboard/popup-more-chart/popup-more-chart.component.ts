import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'popup-more-chart',
  templateUrl: './popup-more-chart.component.html',
  styleUrls: ['./popup-more-chart.component.scss'],
})
export class PopupMoreChartComponent implements OnInit {
  @Input() chartFields: any = [];
  chartTypes: any = [
    { text: 'Line', value: 'Line' },
    { text: 'StepLine', value: 'StepLine' },
    { text: 'StackingLine', value: 'StackingLine' },
    { text: 'StackingLine100', value: 'StackingLine100' },
    { text: 'Spline', value: 'Spline' },
    { text: 'SplineArea', value: 'SplineArea' },
    //{ text: 'MultiColoredLine', value: 'MultiColoredLine' },
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
    //{ text: 'Scatter', value: 'Scatter' },
    //{ text: 'Bubble', value: 'Bubble' },
    //{ text: 'Polar', value: 'Polar' },
    //{ text: 'Radar', value: 'Radar' },
    //{ text: 'Hilo', value: 'Hilo' },
    //{ text: 'HiloOpenClose', value: 'HiloOpenClose' },
    //{ text: 'Candle', value: 'Candle' },
    //{ text: 'BoxAndWhisker', value: 'BoxAndWhisker' },
    //{ text: 'Waterfall', value: 'Waterfall' },
    { text: 'Histogram', value: 'Histogram' },
    //{ text: 'Pareto', value: 'Pareto' },
    //{ text: 'Pie', value: 'Pie' },
    //{ text: 'Pyramid', value: 'Pyramid' },
    //{ text: 'Funnel', value: 'Funnel' },
  ];
  markerShape: any = [
    'Circle',
    'Rectangle',
    'Triangle',
    'Diamond',
    'HorizontalLine',
    'VerticalLine',
    'Pentagon',
    'InvertedTriangle',
  ];
  marker: any = {
    visible: true,
    width: 10,
    height: 10,
    position: 'Top',
    shape: 'Circle',
    isFilled: false,
    fill: '#fff',
  };
  drawTypes: any = [
    'Line',
    'Spline',
    'Area',
    'StackingArea',
    'Scatter',
    'Column',
    'StackingColumn',
    'RangeColumn',
  ];
  border!: any;
  chartSetting!: any;
  dialog!: any;
  orgSetting!: any;
  tooltip!:any;
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
      this.orgSetting = {...dt.data['serieSetting']};
      if (
        this.chartSetting?.marker &&
        Object.keys(this.chartSetting.marker).length > 0
      ) {
        for (let i in this.chartSetting.marker) {
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
        for (let i in this.chartSetting.border) {
          this.border[i] = this.chartSetting.border[i];
        }
        this.border = JSON.parse(JSON.stringify(this.border));
      }
      delete this.chartSetting.marker;
      delete this.chartSetting.border;
    }
    let ins = setInterval(() => {
      let eleOverLay = Array.from(
        document.getElementsByClassName('e-dlg-overlay')
      ).pop();
      if (eleOverLay) {
        clearInterval(ins);
        (eleOverLay as HTMLElement).style.zIndex = '9998';
      }
    }, 100);
    this.dialog = dialog;
    this.dialog.dialog.zIndex = 10000;
  }

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
    else {
      if (this.chartSetting.type == 'Hilo') delete objSetting.yName;
      if (this.chartSetting.type == 'Histogram') delete objSetting.xName;
      let _settings = JSON.parse(JSON.stringify(this.chartSetting));
      if (_settings.marker) delete _settings.marker;
      if (_settings.tooltip) delete _settings.tooltip;
      if (_settings.border) delete _settings.border;
      if (_settings.crosshair) delete _settings.crosshair;

      for (let i in _settings) {
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

  onChange(evt: any) {
    if (!evt.value) return;
    let setting: any = {};
    if(!this.chartSetting.yName) this.chartSetting.yName = this.orgSetting.yName ? this.orgSetting.yName : " " ;
    if(!this.chartSetting.xName) this.chartSetting.xName = this.orgSetting.xName ? this.orgSetting.xName : " ";
    if(!this.chartSetting.name) this.chartSetting.name = this.orgSetting.name ? this.orgSetting.name : " ";
    //setting.fill ='#00bdae';
    switch (evt.value) {
      case 'Line':
      case 'StepLine':
      case 'StackingLine100':
      case 'Spline':
        setting.opacity = 1;
        setting.width = '2';
        break;
      case 'StackingLine':
        setting.opacity = 1;
        setting.width = '2';
        setting.dashArray="5,1";
        break;
      case 'SplineArea':
        this.border = {
          width: 2,
        };
        setting.opacity = 1;
        setting.width = '2';
        break;
      case 'Area':
        this.border ={
          width: 1.5,
          color: '#fff'
        };
        this.marker.visible = false;
        this.marker = {...this.marker};
        break;
      case 'SplineRangeArea':
      case 'RangeArea':
        delete this.chartSetting.yName;
        setting.opacity =1;
        setting.low =" ";
        setting.high = " ";
        this.border ={ width: 0};
        break;
      case 'StackingArea':
      case 'StackingArea100':
        this.border ={
          width: 1.5,
          color: '#fff'
        };
        break;
      case 'StepArea':
        this.border = {
          width: 2,
        };
        setting.opacity = 1;
        setting.width = '2';
        break;
      case 'StackingStepArea':
        this.border = {
          width: 2,
        };
        setting.opacity = 1;
        break;
      case 'Column':
        setting.columnSpacing = 0.1;
        setting.width = '2';
        setting.tooltipMappingName=" "
        break;
      case 'RangeColumn':
        delete this.chartSetting.yName;
        setting.columnSpacing = 0.1;
        setting.low =" ";
        setting.high = " ";
        break;
      case 'StackingColumn':
      case 'StackingColumn100':
        setting.columnWidth="0.5";
        setting.width = '2';
        this.border = {
          width: 1.5,
          color: '#fff'
        };
        break;
      case 'Bar':
        setting.columnSpacing = 0.1;
        break;
      case 'StackingBar':
      case 'StackingBar100':
        setting.columnWidth="0.6";
        setting.width = '2';
        this.border = {
          width: 1.5,
          color: '#fff'
        };
        break;
      case 'Histogram':
        delete this.chartSetting.xName;
        setting.bitInterval =20;
        setting.columnWidth="0.6";
        setting.width = '2';
        setting.showNormalDistribution = true
        break;


    }
    this.chartSetting.type = evt.value;
    //setting.xName = '';
    //setting.yName = '';
    //setting.name = '';

    // if (evt.value.includes('ine') || evt.value.includes('Area')) {
    //   setting.dashArray = '';
    //   setting.opacity = 1;
    //   setting.width = '2';
    //   //setting.low = '';
    //   //setting.high = '';
    //   setting.type = evt.value;
    //   setting.fill = '00bdae';
    //   if (evt.value == 'SpLine') setting.splineType = 'Natural';
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
    this.chartFields = [];
    for (let i in setting) {
      this.chartSetting[i] = setting[i];
    }
    let propSetting = Object.getOwnPropertyDescriptors(this.chartSetting);
    for (let prop in propSetting) {
      (propSetting[prop] as any).type = typeof (propSetting[prop] as any).value;
      (propSetting[prop] as any).name = prop;
      this.chartFields.push(propSetting[prop]);
    }
    this.chartFields = JSON.parse(JSON.stringify(this.chartFields));
  }

  valueChange(evt: any) {
    this.chartSetting[evt.field] = evt.data;
  }

  saveForm() {
    let serieSetting:any={
      ...this.chartSetting
    };
    if(this.marker && Object.keys(this.marker).length > 0) serieSetting.marker = this.marker;
    if(this.border && Object.keys(this.border).length > 0) serieSetting.border = this.border;

    this.dialog.close({
      serieSetting: serieSetting
    });
  }

  borderChange(evt:any){
    if(!this.border) this.border = {};
    this.border[evt.field] == evt.data;
  }

  tooltipChange(evt:any){
    if(!this.tooltip) this.tooltip = {};
    this.tooltip[evt.field] == evt.data;
  }
  markerChange(evt: any) {
    this.marker[evt.field] = evt.data;
    if (evt.data != undefined && evt.data == 0) {
      delete this.marker[evt.field];
    }
  }

  markerShapeChange(evt: any) {
    if (evt.value) {
      this.marker['shape'] = evt.value;
    }
  }


  formatString(str: any) {
    return str
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase();
  }
}
