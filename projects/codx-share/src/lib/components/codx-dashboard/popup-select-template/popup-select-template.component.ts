import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ApiHttpService, CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, SidebarModel } from "codx-core";
import { of } from "rxjs";
import { PopupAddChartComponent } from "../popup-add-chart/popup-add-chart.component";

@Component({
  selector: 'select-template',
  templateUrl: 'popup-select-template.component.html',
  styleUrls: ['popup-select-template.component.scss']
})
export class PopupSelectTemplateComponent implements OnInit,AfterViewInit,OnChanges {

  dialog: any;
  @Input() queryList!: any;
  @Input() listTemplate: any = [];
  @Input() isPopupMode: boolean = true;
  value!:any;
  @Input() panelID!: any;
  @Input() chartType!: any;
  @Output() add = new EventEmitter<any>();
  @ViewChild('body') body! : TemplateRef<any>;
 fields: Object = { text: 'text', value: 'value' };
 chartTypes: any = [
  { text: 'Line', value: 'Line', iconCss:'icon-timeline' },
  { text: 'StepLine', value: 'StepLine', iconCss:'icon-stairs'  },
  { text: 'StackingLine', value: 'StackingLine', iconCss:'icon-stacked_line_chart' },
  { text: 'StackingLine100', value: 'StackingLine100', iconCss:'icon-stacked_line_chart' },
  { text: 'Spline', value: 'Spline', iconCss:'icon-insights' },
  { text: 'SplineArea', value: 'SplineArea', iconCss:'icon-insights' },
  //{ text: 'MultiColoredLine', value: 'MultiColoredLine' },
  { text: 'Area', value: 'Area', iconCss:'icon-signal_cellular_4_bar' },
  { text: 'RangeArea', value: 'RangeArea', iconCss:'icon-signal_cellular_4_bar' },
  { text: 'SplineRangeArea', value: 'SplineRangeArea', iconCss:'icon-broken_image' },
  { text: 'StackingArea', value: 'StackingArea', iconCss:'icon-broken_image'  },
  { text: 'StackingArea100', value: 'StackingArea100', iconCss:'icon-broken_image'  },
  { text: 'StepArea', value: 'StepArea', iconCss:'icon-broken_image'  },
  { text: 'StackingStepArea', value: 'StackingStepArea',iconCss:'icon-escalator' },
  //{ text: 'MultiColoredArea', value: 'MultiColoredArea' },
  { text: 'Column', value: 'Column',iconCss:'icon-i-bar-chart-fill' },
  { text: 'RangeColumn', value: 'RangeColumn',iconCss:'icon-i-bar-chart-line-fill' },
  { text: 'StackingColumn', value: 'StackingColumn',iconCss:'icon-i-bar-chart-line' },
  { text: 'StackingColumn100', value: 'StackingColumn100',iconCss:'icon-i-bar-chart-line' },
  { text: 'Bar', value: 'Bar',iconCss:'icon-i-filter-left' },
  { text: 'StackingBar', value: 'StackingBar',iconCss:'icon-i-filter' },
  { text: 'StackingBar100', value: 'StackingBar100' ,iconCss:'icon-i-filter-right'},
  { text: 'Scatter', value: 'Scatter',iconCss:'icon-scatter_plot' },
  // { text: 'Bubble', value: 'Bubble' },
  { text: 'Polar', value: 'Polar',iconCss:'icon-i-pie-chart' },
  { text: 'Radar', value: 'Radar',iconCss:'icon-i-pie-chart' },
  //{ text: 'Hilo', value: 'Hilo' },
  //{ text: 'HiloOpenClose', value: 'HiloOpenClose' },
  //{ text: 'Candle', value: 'Candle' },
  //{ text: 'BoxAndWhisker', value: 'BoxAndWhisker' },
  //{ text: 'Waterfall', value: 'Waterfall' },
  { text: 'Histogram', value: 'Histogram',iconCss:'icon-i-bar-chart-line' },
  { text: 'Pareto', value: 'Pareto',iconCss:'icon-escalator' },
  { text: 'Pie', value: 'Pie',iconCss:'icon-i-pie-chart-fill' },
  { text: 'Pyramid', value: 'Pyramid',iconCss:'icon-i-exclamation-triangle-fill' },
  { text: 'Funnel', value: 'Funnel' ,iconCss:'icon-i-funnel-fill'},
];
parentScope!: any;
randomKey!: any;
dragPosition:any= {x: 0, y: 0};
  constructor(
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    if(dt?.data && dt?.data.length >2){
      this.queryList = dt?.data[0];
      this.panelID = dt?.data[1];
      this.parentScope = dt?.data[2];
      if(this.queryList && this.queryList._results){
        let i=0;
        this.queryList?.forEach((item:any)=>{
          let ele = item.createEmbeddedView();
          let obj = {value: i, text: ''}
          obj.text = ele.rootNodes[0].title ? ele.rootNodes[0].title : ele.rootNodes[0].id;
          this.listTemplate.push(obj);
          i++;
        });
        this.listTemplate = JSON.parse(JSON.stringify(this.listTemplate));
      }
    }
    let ins = setInterval(()=>{
      let eleOverLay = Array.from(document.getElementsByClassName('e-dlg-overlay')).pop();
      if(eleOverLay && this.isPopupMode){
        clearInterval(ins);
        (eleOverLay as HTMLElement).style.zIndex = '9998';
      }
      else if(!this.isPopupMode) clearInterval(ins);
    },100)
    this.dialog = dialog;
    this.randomKey = Math.random();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['queryList']){
      if(this.queryList){
        let i=0;
        this.queryList?.forEach((item:any)=>{
          let ele = item.createEmbeddedView();
          let obj = {value: i, text: ''}
          obj.text = ele.rootNodes[0].title ? ele.rootNodes[0].title : ele.rootNodes[0].id;
          this.listTemplate.push(obj);
          i++;
        });
        this.listTemplate = JSON.parse(JSON.stringify(this.listTemplate));
      }
    }
  }
  ngAfterViewInit(): void {
    if(!this.isPopupMode){
      let ele = document.getElementById('selectTemplate'+this.randomKey);
      if(ele){
        ele.getElementsByClassName('icon-close')[0].parentElement?.classList.add('d-none');
        (ele.firstChild as HTMLElement).setAttribute('style','border: 5px solid #ddd !important')
      }
    }
  }
  ngOnInit(): void {

   }


  saveForm(){
    if(this.isPopupMode){
      if(this.value){
        this.dialog.close({data:this.value, type:'template'});
      }
      else{
        this.dialog.close({data: undefined, type:this.chartType});
      }
    }
    else{
      this.add.emit({data: undefined, type:this.chartType});
    }


  }
  addChart(){
    let option = new DialogModel();
    let dialogChart = this.callfunc.openForm(
      PopupAddChartComponent,
      '',
      600,
      800,
      '',
      undefined,
      '',
      option
    );
    dialogChart.closed.subscribe((res:any)=>{
      if(res.event){
        this.dialog.close({data:res.event,type:'chart'})
      }
    })
  }

  onChange(evt:any){
   this.chartType = evt.value;
   this.value = undefined;
  }

  valueChange(evt:any){
    if(evt.value != undefined){
      this.chartType = undefined;
      this.value = Array.from(this.queryList)[evt.value];

      if(this.parentScope && this.isPopupMode){
        this.parentScope.addPanel(true,'template',this.value);
        }
        else{
          this.add.emit({isAuto:true, chartType:'template',data: this.value})
        }
    }
  }

  cellClick(ele: any, data:any){
    ele.currentTarget.parentElement.childNodes.forEach((e:any)=>{
      if(e.id && e.id != data.value){
        if(e.classList.contains('active-cell')){
          e.classList.remove('active-cell');
        }
      }
    })
    !ele.currentTarget.classList.contains('active-cell') && ele.currentTarget.classList.add('active-cell');
    this.chartType = data.value;
    this.value = undefined;
  }
  dragEnd(evt:any, data:any){
    evt.source._dragRef.reset();
    let eleParent = evt.source.element.nativeElement.parentElement;
    let parentPos = eleParent.getBoundingClientRect();
    if(( evt.distance.x < 0 && evt.dropPoint.x < parentPos.left ) || (evt.dropPoint.x >= parentPos.right -20 && evt.distance.x > 0)){
      if(this.parentScope && this.isPopupMode){
      this.parentScope.addPanel(true,data.value,undefined);
      }
      else{
        this.add.emit({isAuto:true,chartType: undefined,data: data.value})
      }
    }

  }
  dragStart(evt:any, data: any){
    evt.source.element.nativeElement.parentElement.childNodes.forEach((e:any)=>{
      if(e.id && e.id != data.value){
        if(e.classList.contains('active-cell')){
          e.classList.remove('active-cell');
        }
      }
    })
    evt.source.element.nativeElement.classList.add('active-cell')
    //evt.source.element.nativeElement.parentElement.childNodes.forEach((e:any)=>{
    //   if(e.id && e.id != data.value){
    //     if(e.classList.contains('active-cell')){
    //       e.classList.remove('active-cell');
    //     }
    //   }
    // })
    // evt.source.element.nativeElement.classList.contains('active-cell') && evt.source.element.nativeElement.classList.add('active-cell');
    // this.chartType = data.value;
    // this.value = undefined;
  }
}
