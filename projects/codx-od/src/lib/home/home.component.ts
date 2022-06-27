import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { ChartComponent, ChartTheme, IAxisLabelRenderEventArgs, ILoadedEventArgs, IPointRenderEventArgs } from '@syncfusion/ej2-angular-charts';
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { AgencyService } from '../services/agency.service';
import { DispatchService } from '../services/dispatch.service';
import { getElement } from '@syncfusion/ej2-charts';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('viewBase') viewBaseCpn:ViewsComponent
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideAttachment') asideAttachment: TemplateRef<any>;
  @ViewChild('attachment') attachment:AttachmentComponent 
  @ViewChild('chartcontainer1') chartcontainer1: ChartComponent;
  @ViewChild('chartcontainer2') chartcontainer2: ChartComponent;

  public countDis: any;
  public countInternal = 0;
  public countIncomming = 0;
  public countNew = 0;
  public countAmergency = 0;
  public countOverDate = 0;
  public countDelay = 0;
  public countOutcoming = 0;
  public countDisDate = 0;
  public dispatchType: string;
  public fromDate = new Date();
  public toDate = new Date();
  public dataChartForAgency: any;
  public dataChartForCate: any;
  public type: any;
  public date: any;
  public view: any;
  private loadChart: boolean;
  public percent: string[];
  public chartText: string[];
  public title = '';
  // public lstDispatch = [{
  //   id: 1,
  //   name: "Công văn đến"
  // },
  // {
  //   id: 2,
  //   name: "Công văn đi"
  // },
  // {
  //   id: 3,
  //   name: "Công văn nội bộ"
  // }
  // ];

  // public dataTotal1: Object[] = [
  //   {
  //     data : [
  //       { x: '1', y: 111.1 },
  //       { x: '2', y: 127.3 },
  //       { x: '3', y: 143.4 },
  //       { x: '4', y: 159.9 },
  //     ],
  //     text: 'UK'
  //   },
  //   {
  //   data : [
  //     { x: '1', y: 76.9 },
  //     { x: '2', y: 99.5 },
  //     { x: '3', y: 121.7 },
  //     { x: '4', y: 142.5 },
  //   ],
  //   text:'Germany'
  // },
  // {
  //   data: [
  //     { x: '1', y: 66.1 },
  //     { x: '2', y: 79.3 },
  //     { x: '3', y: 91.3 },
  //     { x: '4', y: 102.4 },
  //   ],
  //   text:'France'
  // },
  // {
  //   data:[
  //     { x: '1', y: 34.1 },
  //     { x: '2', y: 38.2 },
  //     { x: '3', y: 44.0 },
  //     { x: '4', y: 51.6 },
  //   ],
  //   text: 'Italya'
  // }
  // ];

  // public dataTotal: Object[] = [
  //   {
  //     data : [
  //       { x: '2014', y: 111.1 },
  //       { x: '2015', y: 127.3 },
  //       { x: '2016', y: 143.4 },
  //       { x: '2017', y: 159.9 },
  //     ],
  //     text: 'UK'
  //   },
  //   {
  //     data : [
  //       { x: '2014', y: 76.9 },
  //       { x: '2015', y: 99.5 },
  //       { x: '2016', y: 121.7 },
  //       { x: '2017', y: 142.5 },
  //     ],
  //    text:'Germany'
  // },
  // {
  //   data: [
  //     { x: '2014', y: 66.1 },
  //     { x: '2015', y: 79.3 },
  //     { x: '2016', y: 91.3 },
  //     { x: '2017', y: 102.4 },
  //   ],
  //   text:'France'
  // },
  // {
  //   data:[
  //     { x: '2014', y: 34.1 },
  //     { x: '2015', y: 38.2 },
  //     { x: '2016', y: 44.0 },
  //     { x: '2017', y: 51.6 },
  //   ],
  //   text: 'Italy'
  // }
  // ];

  // public data9 = [];
  public data2 = [];
  // public data: Object[] = [
  //   { x: new Date(2005, 0, 1), y: 21 }, { x: new Date(2006, 0, 1), y: 24 },
  //   { x: new Date(2007, 0, 1), y: 36 }, { x: new Date(2008, 0, 1), y: 38 },
  //   { x: new Date(2009, 0, 1), y: 54 }, { x: new Date(2010, 0, 1), y: 57 },
  //   { x: new Date(2011, 0, 1), y: 70 }
  // ];
  
  // public data1: Object[] = [
  //     { x: new Date(2005, 0, 1), y: 28, name: 'test' }, { x: new Date(2006, 0, 1), y: 44, name: 'test' },
  //     { x: new Date(2007, 0, 1), y: 48, name: 'test' }, { x: new Date(2008, 0, 1), y: 50, name: 'test' },
  //     { x: new Date(2009, 0, 1), y: 66, name: 'test' }, { x: new Date(2010, 0, 1), y: 78, name: 'test' }, 
  //     { x: new Date(2011, 0, 1), y: 84, name: 'test' }
  // ];

  public tooltipMappingName: 'country';
  public marker1: Object = {
      visible: false,
      height: 10,
      width: 10
  };

  public marker2: Object = {
      dataLabel: {
          visible: true,
          position: 'Top', font: {
              fontWeight: '600',
              color: '#ffffff'
          }
      }
  }

  public primaryXAxis1: Object = {
    valueType: 'Category',//'DateTime',
    labelFormat: 'EEEE',  
    intervalType: '1',//'Years',
  
    edgeLabelPlacement: 'Shift',
    majorGridLines: { width: 0 }
};

//Initializing Primary Y Axis
public primaryYAxis1: Object = {
   // labelFormat: '{value}%',
   labelFormat: '{value}',
   rangePadding: 'None',
   minimum: 0,
   maximum: 100,
   interval: 20,
   visible: true,
   lineStyle: { visible: false, width: 0 },
   majorTickLines: { width: 0 },
   minorTickLines: { width: 0 }
};

  public TotalCVDen() {
    if (this.odService.DataChart != null && this.odService.DataChart.length > 0)
      return this.odService.DataChart[0].total1;
    else
      return 0;
  }

  public onChartLineClick(x: string) {
    let data = this.odService.DataChartOld; 
    this.odService.IgnoreChart = "11";
    // return arr.filter(function(el) {
    //   return el.toLowerCase().indexOf(query.toLowerCase()) !== -1
    // })

    data = data.filter(function(el) {
      return el.sourceName.toLowerCase().indexOf(x.toLowerCase()) !== -1
    });//filter(x => x.sourceName.toString() == x.toString());
    this.odService.DataChart = data;
    this.odService.ChangeData.next(true);
  }

  public onPointClick(event, type) { 
    //console.log(event);
    var data = this.odService.DataChartOld;    

    switch(type) {
      case "chart1":
        this.odService.IgnoreChart = "9";
        data = data.filter(x => x.statusName == event.point.x);
        break;

      case "chart2":
        this.odService.IgnoreChart = "11";
        data = data.filter(x => x.sourceName == event.point.x);
        break;
    }
    
    this.odService.DataChart = data;
    this.odService.ChangeData.next(true);
  }

  public TotalCVDi() {
    if (this.odService.DataChart != null && this.odService.DataChart.length > 0)
      return this.odService.DataChart[0].total2;
    else
      return 0;
  }

  ChangeData(status, overdate) {
    //var len = 0;
    var data = this.odService.DataChartOld;
    if (data != null && data.length > 0) { 
      if (overdate == '') {
        data = data.filter(x => x.status == status);
      }
      else if (overdate == 'overdate') {   
        var date = Date();        
        if (this.odService.DataChart != null)
          data  = this.odService.DataChartOld.filter(x => x.status == "1" && x.deadline < date);       
      }
      else if (overdate == 'urgency') {
        data  = this.odService.DataChartOld.filter(x => x.status == "1" && x.urgency == "5");              
      }
      this.odService.DataChart = data;    
      this.odService.ChangeData.next(true);
    }    
  }

  Tabclick(tab) {
    this.type = tab;
    this.LoadDataToLineChart();
    this.changeDetectRef.detectChanges();
  }

  GetTabSelected(tab) {
    if (tab ==  this.type)
      return "tm-box box-primary w-200px p-6 border-bottom cursor-pointer selectedTab";
    else
      return "tm-box box-primary w-200px p-6 border-bottom cursor-pointer";
  }

  public TotalCVNB() {
    if (this.odService.DataChart != null && this.odService.DataChart.length > 0)
      return this.odService.DataChart[0].total3;
    else
      return 0;
  }

    //Initializing Primary X Axis
    public primaryXAxis2: Object = {      
    //  labelStyle: const TextStyle(color: Colors.black),
      axisLine: { width: 0, height: 20  },
      lineStyle: { width: 0, height: 20  },
    //  labelPosition: 'inside',
      majorTickLines: { width: 0 },
      majorGridLines: { width: 0 },
      labelRotation: 270,
      width: 1,
      visible: false,    
      LabelRotationAngle: "-180",
      //LabelTemplate: "{StaticResource transform}",
      placeLabelsNearAxisLine: false,
      // labelIntersectAction: 'Rotate45',
       valueType: 'Category',//'DateTime',
      // labelFormat: 'y',
       opposedPosition: true,
      // intervalType: 'Years',
       edgeLabelPlacement: 'Shift',
      // majorGridLines: { width: 0 }
    };

  

  //Initializing Primary Y Axis
  public primaryYAxis2: Object = {
      visible: false,
      //labelFormat: '{x}{value}',
      labelFormat: '{value}',
      rangePadding: 'None',

     // opposedPosition: true,
      label: false,      
      minimum: 0,
      maximum: 100,
      interval: 0,
      lineStyle: { width: 1, height: 20 },
      majorTickLines: { width: 1 },
      minorTickLines: { width: 1 }
  };

  public chartArea1: Object = {
    border: {
        width: 0
    }
  };

  
  public chartArea2: Object = {
      border: {
          width: 0
      }
  };
  public height2: string = '60';
  public height: string = '70%';
  public width: string = '100%';
  // public marker: Object = {
  //     visible: true,
  //     height: 10,
  //     width: 10
  // };
  public tooltip1: Object = {
      enable: true
  };

  public tooltip2: Object = {
    enable: true
};
  
  public title1: string = 'Thống kê số lượng Booking theo phòng (đơn vị tính: lần)';
  public title2: string = 'Top 10 các đơn vị có công văn gởi/nhận';
  views: Array<ViewModel>|any = [];

  public legendSettings1: Object = {
    visible: true,
    toggleVisibility: true,
    position: 'Right',
    height: '80%',
    width: '15%',
    textWrap:'Wrap',
    fontSize:'10px',
    maximumLabelWidth: 100,
};
 i = [1,2];
  button: Array<ButtonModel> = [{
    id: '1',
    text: 'content',
  }];

  constructor(public odService: DispatchService, 
    private agService: AgencyService, 
    public atSV: AttachmentService,
    private changeDetectRef: ChangeDetectorRef) {

      
     }

  ngOnInit(): void {    
    var curr = new Date; // get current date   
    this.type = "1";    
    this.view = "Month";
    this.date = this.yyyymm(curr);    
    this.data2 = [];   
    this.percent = [];
    this.chartText = [];   
    this.marker2 = { dataLabel: { visible: true, position: 'Middle',
                      template: '<div>${point.x}</div>' } };
   
    this.odService.isChangeData.subscribe(item => {
      if (item == true) {
        this.FilterDataChart();
      }
    })
  }
   
  getJSONString(data) {
    return JSON.stringify(data);    
  }
  
  
  public axisLabelRender(args : IAxisLabelRenderEventArgs ): void {
      
  };

  GetChartLine() {
    this.percent = [];
    this.chartText = [];
    var max = 1; 
    // x x
    if (this.odService.DataChart7 != null && this.odService.DataChart7.length > 0) {
      for(var j = this.odService.DataChart7.length - 1; j>=0; j--) {
        if (j == this.odService.DataChart7.length - 1)   {          
          max = parseInt(this.odService.DataChart7[j].y);          
          this.percent.push("100%");
        }                
        else {
          var percent = (parseInt(this.odService.DataChart7[j].y) / max) * 100;
          percent = Math.round(percent);
          this.percent.push(percent.toString() + "%");
        } 
        this.chartText.push(this.odService.DataChart7[j].x);
     }
    }    
  } 

  FilterDataChart() {
    this.odService.SumDataForChart("9");     
    this.data2 = [];  
   
    if (this.odService.DataChart9 != null && this.odService.DataChart9.length > 0) {     
      for(var i=0; i<this.odService.DataChart9.length; i++) {
        var o = {
                  data: [],
                  name: ''
                }; // text
        o.data = this.LoadChartLine(this.odService.DataChart9[i]);
        o.name = this.odService.DataChart9[i].text;
        this.data2.push(Object.assign({}, o));                 
      } 

      if (this.chartcontainer1 != null) {   
        this.chartcontainer1.clearSeries();
        this.chartcontainer1.addSeries(this.data2);
        for(var i=0; i<this.data2.length; i++) { 
          this.chartcontainer1.series[i].type = 'Line';
          this.chartcontainer1.series[i].xName = 'x';
          this.chartcontainer1.series[i].yName = 'y';
          this.chartcontainer1.series[i].dataSource = this.data2[i].data;
          this.chartcontainer1.series[i].name = this.data2[i].name;
        }                 
        this.chartcontainer1.refresh();

        console.log(this.chartcontainer1);
      }
    }
    else {
      if (this.chartcontainer1 != null) {  
        this.chartcontainer1.clearSeries();
        this.chartcontainer1.refresh();
      }
    }
    this.odService.SumDataForChart("8");        
    this.odService.SumDataForChart("10");
    this.odService.SumDataForChart("11");    
    var height = 50;
    var chartHeight = height * this.odService.DataChart11.length;  
    this.height2 =  chartHeight.toString();
    this.GetChartLine();
    if (this.chartcontainer2 != null) {        
     
      if (chartHeight == 0)
        chartHeight  = 1;
      this.chartcontainer2.height = chartHeight.toString() + 'px';//.mode.model.size.height = chartBounds + (chartArea * parseInt(id)); 
      this.chartcontainer2.refresh();
    }      

    this.title2 = `Top ${this.odService.DataChart7.length} các đơn vị có công văn gởi/nhận`;   
    this.changeDetectRef.detectChanges();     
  } 

  dateChangeEvent(event) {
    this.fromDate = event.data.fromDate;  
    this.toDate = event.data.toDate;   
    this.view = event.data.mode;
    this.LoadDataToLineChart();    
  }

  SetWitdhChart(text: string) {
  //  if (text != 'Infinity%')
    return `width: ${text}; border-radius: 3px!important;`;
   // else
   //  return ``;
  }

  LoadDataToLineChart() {
    var that = this;
    this.odService.getDataForCharts(this.fromDate, this.toDate, this.view, this.type).subscribe(item => {      
      this.odService.DataChart = item;    
      this.odService.DataChartOld = item;    
      this.odService.IgnoreChart = "";
      this.odService.SumDataForChart("9");     
      this.data2 = [];  
     
      if (this.odService.DataChart9 != null && this.odService.DataChart9.length > 0) {     
        for(var i=0; i<this.odService.DataChart9.length; i++) {
          var o = {
                    data: [],
                    name: ''
                  }; // text
          o.data = this.LoadChartLine(this.odService.DataChart9[i]);
          o.name = this.odService.DataChart9[i].text;
          this.data2.push(Object.assign({}, o));                 
        } 

        if (this.chartcontainer1 != null) {   
          this.chartcontainer1.clearSeries();
          this.chartcontainer1.addSeries(this.data2);
          for(var i=0; i<this.data2.length; i++) { 
            this.chartcontainer1.series[i].type = 'Line';
            this.chartcontainer1.series[i].xName = 'x';
            this.chartcontainer1.series[i].yName = 'y';
            this.chartcontainer1.series[i].dataSource = this.data2[i].data;
            this.chartcontainer1.series[i].name = this.data2[i].name;
          }                 
          this.chartcontainer1.refresh();

          console.log(this.chartcontainer1);
        }
      }
      else {
        if (this.chartcontainer1 != null) {  
          this.chartcontainer1.clearSeries();
          this.chartcontainer1.refresh();
        }
      }
      this.odService.SumDataForChart("8");        
     // this.changeDetectRef.detectChanges();              
      this.odService.SumDataForChart("10");
     // this.changeDetectRef.detectChanges();              
      this.odService.SumDataForChart("11");      
     // this.changeDetectRef.detectChanges();              
      var height = 60;
      var chartHeight = height * this.odService.DataChart11.length;  
      this.height2 = chartHeight.toString(); 
      if (this.chartcontainer2 != null) {        
      
        if (chartHeight == 0)
          chartHeight  = 1;
        this.chartcontainer2.height = chartHeight.toString() + 'px';//.mode.model.size.height = chartBounds + (chartArea * parseInt(id)); 
        this.chartcontainer2.refresh();
      }      

      this.title2 = `Top ${this.odService.DataChart7.length} các đơn vị có công văn gởi/nhận`;   
      this.GetChartLine();
      this.changeDetectRef.detectChanges();              
    })
    console.log(this.data2);
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.content,
      active: true,      
      model: {
        panelLeftRef: this.panelLeftRef,
        sideBarRightRef: this.asideAttachment,
        widthAsideRight: '500px'
      }
    }];
    this.LoadDataToLineChart();
   // this.Tabclick('1');
    this.changeDetectRef.detectChanges();   
  }

  onLoadDate(args: any) {
  //  console.log(args);
    var today = args.date;   
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    this.date = yyyy + mm;        
    if (args.view.toString() != "Month") 
        this.date = yyyy;        
    this.view = args.view.toString();
    this.LoadDataToLineChart();        
  }

  // GetListChartLine() {  
  //     if (this.data9 != null && this.data9.length > 0)
  //       return this.data9;
  //     else
  //       return null;   
  // }

  CountByAmergency() {
    var len = 0;
    if (this.odService.DataChart != null)
      len = this.odService.DataChart.filter(x => x.status == "1" && x.urgency == "5").length;    
    return len;
  }

  CountByOverDate() {
    var len = 0;
    var date = Date();
    if (this.odService.DataChart != null)
      len =this.odService.DataChart.filter(x => x.status == "1" && x.deadline < date).length;
   
    return len;
  }

  CountByStatus(status: any) {
    var len = 0;    
    if (this.odService.DataChart != null)
      len = this.odService.DataChart.filter(x => x.status == status).length;    
    return len;
  }

  yyyymm(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm =  ("0" + (dateIn.getMonth() + 1).toString()).slice(-2); // getMonth() is zero-based    
    return String(yyyy.toString() +  mm); // Leading zeros for mm and dd
  }

  LoadChartLine(line) {  
 //   return line;
    if (line != null && this.odService.DataChart2 != null)
    {
      var list = this.odService.DataChart2.filter(x => x.name == line.text);      
      return list;
    }      
    else 
      return null;
  }

  yyyymmdd(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
    var dd = dateIn.getDate();
    return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
  }

  fileAdded(event) { 
    console.log(event);
  }

  ngOnDestroy() {
    //   this.atSV.openForm.unsubscribe();  
  }

  popup(evt: any){
    this.attachment.uploadFile();
   // var data = new DialogAttachmentType;    
    // data.objectType = "WP_Notes";
    // data.objectId = "628c326c590addf224627f42"; 
    // data.functionID = "WPT03941";    
    // this.callfc.openForm(AttachmentComponent, "Upload tài liệu", 500, 700, null, data).subscribe((dialog: any) => {
    //   // dialog.close = this.closeDept;
    // });  
  }

  getDataCount() {   
  }

  onChange(val: any) {
    this.countDispatchByType(val)
  }

  countDispatchByType(val: any) {    
  }

  changeValueDispatchType(event: any) {
    this.dispatchType = event   
  }

  countDispatchByDate(val: Date) {
    this.odService.countDispatchByDate(val).subscribe(item => {
      this.countDisDate = item
    })
  }

  setEventWeek() {
    var ele = document.querySelectorAll(".week-item[data-date]");
    for (var i = 0; i < ele.length; i++) {
      let htmlEle = ele[i] as HTMLElement;
      var date = htmlEle?.dataset?.date;
      let obj = { date: date };
      var eleEvent = htmlEle.querySelector(".week-item-event");
      eleEvent.innerHTML = "";      
    }
  }

  public legendSettings2: Object = {
    visible: false,
    toggleVisibility: false,
    position: 'Right',
    height: '80%',
    width: '40%',
    textWrap:'Wrap',
    fontSize:'10px',
    maximumLabelWidth: 100,
  }

  ChartClass(i) {
    return `float-end cursor-pointer lineChart text-end py-2 px-5 fs-5 text-white color${i}`;
  }

  public pointRender(args: IPointRenderEventArgs): void {
    let materialColors: string[] = ['#00bdae', '#404041', '#357cd2', '#e56590', '#f8b883', '#70ad47', '#dd8abd', '#7f84e8', '#7bb4eb',
        '#ea7a57', '#404041', '#00bdae'];
    let fabricColors: string[] = ['#4472c4', '#ed7d31', '#ffc000', '#70ad47', '#5b9bd5',
        '#c1c1c1', '#6f6fe2', '#e269ae', '#9e480e', '#997300', '#4472c4', '#70ad47', '#ffc000', '#ed7d31'];
    let bootstrapColors: string[] = ['#a16ee5', '#f7ce69', '#55a5c2', '#7ddf1e', '#ff6ea6',
        '#7953ac', '#b99b4f', '#407c92', '#5ea716', '#b91c52'];
    let highContrastColors: string[] = ['#79ECE4', '#E98272', '#DFE6B6', '#C6E773', '#BA98FF',
        '#FA83C3', '#00C27A', '#43ACEF', '#D681EF', '#D8BC6E'];
    let fluentColors: string[] = ['#614570', '#4C6FB1', '#CC6952', '#3F579A', '#4EA09B', '#6E7A89', '#D4515C', '#E6AF5D', '#639751',
        '#9D4D69'];
    let fluentDarkColors: string[] = ['#8AB113', '#2A72D5', '#43B786', '#584EC6', '#E85F9C', '#6E7A89', '#EA6266', '#EBA844', '#26BC7A', 
        '#BC4870'];     
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    if (selectedTheme && selectedTheme.indexOf('fabric') > -1) {
        args.fill = fabricColors[args.point.index % 10];
    } else if (selectedTheme === 'material') {
        args.fill = materialColors[args.point.index % 10];
    } else if (selectedTheme === 'highcontrast') {
        args.fill = highContrastColors[args.point.index % 10];
    }  else if (selectedTheme === 'fluent') {
        args.fill = fluentColors[args.point.index % 10];
    } else if (selectedTheme === 'fluent-dark') {
        args.fill = fluentDarkColors[args.point.index % 10];
    } else {
        args.fill = bootstrapColors[args.point.index % 10];
    }
  };

  public intervalId: any;
  public setTimeoutValue: number;

  public loaded(args: ILoadedEventArgs): void {
    this.setTimeoutValue = 100;
    this.intervalId = setInterval(
        () => {
            let i: number;
            if (getElement('chart-container') === null) {
                clearInterval(this.intervalId);
            } else {
              args.chart.refresh();
            }
        },
        this.setTimeoutValue);
}

  public load(args: ILoadedEventArgs): void {
      let selectedTheme: string = location.hash.split('/')[1];
      selectedTheme = selectedTheme ? selectedTheme : 'Material';
      args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
  };
}


