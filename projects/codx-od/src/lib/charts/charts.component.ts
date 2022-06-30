import { ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
//import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import {
    AccumulationChart, AccumulationChartComponent, IAccAnimationCompleteEventArgs, AccPoints,
    IAccTextRenderEventArgs, IAccLoadedEventArgs, ILoadedEventArgs, AccumulationTheme, Selection, ChartTheme, IPointRenderEventArgs, ChartComponent, IMouseEventArgs
} from '@syncfusion/ej2-angular-charts';
import { eventMarkersChild } from '@syncfusion/ej2-gantt/src/gantt/base/css-constants';
import { ShowData } from '../models/dispatch.model';
import { AgencyService } from '../services/agency.service';
import { DispatchService } from '../services/dispatch.service';

//import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
//import { IPointRenderEventArgs, ChartComponent, ILoadedEventArgs, ChartTheme } from '@syncfusion/ej2-angular-charts';
/**
 * Sample for doughnut 
 */ 
@Component({
    selector: 'od-charts',
    templateUrl: 'charts.component.html',    
    encapsulation: ViewEncapsulation.None
})  
export class ChartsComponent {   
    @Input() type: any;    
    @Input() center_title: string;   
    @Input() item: any;
    @ViewChild('pie') pieChart;
    //public data: any;  
    public pie: AccumulationChartComponent | AccumulationChart;
    public execute = false;
    public count = 0;
    public total = 0;
   // public data: any;    
    public palettes = [];
    constructor(private odService: DispatchService, private changeDetectRef: ChangeDetectorRef) { }
    public data = [];
    // public data: ShowData[] = [
    //     { x: 'Chrome', y: 37, text: '37%' }, { 'x': 'UC Browser', y: 17, text: '17%' },
    //     { x: 'iPhone', y: 19, text: '19%' },
    //     { x: 'Others', y: 4, text: '4%' }, { 'x': 'Opera', y: 11, text: '11%' },
    //     { x: 'Android', y: 12, text: '12%' }
    // ];

    ngOnInit(): void {       
      // this.changeDetectRef.detectChanges();          
       var that = this;   
       this.data = this.item;//JSON.parse(this.item);
       this.odService.FillDataChartAgency.subscribe(res => {               
            let centerTitle: HTMLDivElement = document.getElementById(that.center_title) as HTMLDivElement;
           
            this.data = this.item;//JSON.parse(this.item);       
            this.palettes = [];                    
            this.total = 0;                          
            if (this.data != null) {
                var len =  this.data.length;//Object.keys(this.data).length
            
                for(let i=0; i<len; i++) {
                    this.total = this.total + parseInt(this.data[i].y);                       
                }                                  
                
                if (len == 0 || (len == 1 && this.data[0].text == "No data")) {
                    this.palettes = ["#7F8487"];                    
                    this.data = [
                        { x: 'No data', y: 1, text: "No data" }
                    ];  
                }                    
            }     
            if (centerTitle != null)             
            {
                if (this.data != null && this.data[0] != null && this.data[0].text != "No data")                     
                    centerTitle.innerHTML = this.total.toString() + " tasks";                    
                else
                    centerTitle.innerHTML = "";                     
            }               
                
            this.changeDetectRef.detectChanges();
        });   
    }

    showChartData() {

    }

    ngAfterViewInit(): void { 
       
    }

    showChart() {
        return this.total > 0;
    }

    public onAnimationComplete(args: IAccAnimationCompleteEventArgs): void {      
        let centerTitle: HTMLDivElement = document.getElementById(this.center_title) as HTMLDivElement;
        centerTitle.style.fontSize = this.getFontSize(args.accumulation.initialClipRect.width);
        let rect: ClientRect = centerTitle.getBoundingClientRect();
        centerTitle.style.top = (args.accumulation.origin.y + args.accumulation.element.offsetTop - (rect.height / 2)) + 'px';
        centerTitle.style.left = (args.accumulation.origin.x + args.accumulation.element.offsetLeft - (rect.width / 2)) + 'px';
        centerTitle.style.top = '77px';
        centerTitle.style.left = '110px';
        centerTitle.style.visibility = 'visible';
        if (this.data != null && this.data[0] != null && this.data[0].text != "No data")    
            centerTitle.innerHTML = this.total.toString() + " tasks";
        else
            centerTitle.innerHTML = "";
        let points: AccPoints[] = args.accumulation.visibleSeries[0].points;
        for (let point of points) {
            if (point.labelPosition === 'Outside' && point.labelVisible) {
                let label: Element = document.getElementById('donut-container_datalabel_Series_0_text_' + point.index);
                label.setAttribute('fill', 'black');
            }
        }
    };

    public onPointClick(event) {
      //  console.log(event);
        var data = this.odService.DataChartOld;
        //event.point.x
        this.odService.IgnoreChart = this.type;
        switch(this.type) {
            case "8":                                
                data = data.filter(x => x.statusName == event.point.x);
                break;

            case "9":
                data = data.filter(x => x.deptName == event.point.x);
                break;

            case "10":
                data = data.filter(x => x.categoryName == event.point.x);
                break;

            case "11":
                data = data.filter(x => x.sourceName == event.point.x);
                break;
        }
        this.odService.DataChart = data;
        this.odService.ChangeData.next(true);
    }

    public onChartMouseClick(args: IMouseEventArgs): void { 
        console.log(args);
    }
    
    public getFontSize(width: number): string {
        if (width > 300) {
            return '13px';
        } else if (width > 250) {
            return '12px';
        } else {
            return '11px';
        }
    };

    public onTextRender(args: IAccTextRenderEventArgs): void {
        args.series.dataLabel.font.size = this.getFontSize(this.pie.initialClipRect.width);
        args.text = args.text + '%';
    }

    //Initializing Legend
    public legendSettings: Object = {
        visible: true,
        toggleVisibility: false,
      //  reverse: true,
        //position: 'Right',
      //  position: 'Top' ,
        position: 'Custom',
        location: { x: 190, y: 40 },
        alignment: 'Near',        
        height: '80%',
        width: '30%',
        textWrap:'Wrap',
        fontSize:'10px',
        maximumLabelWidth: 100,
    };

    //Initializing Datalabel
    public dataLabel: Object = {
        visible: false, position: 'Inside',
        name: '${point.y}',
        font: {
            color: 'white',
            fontWeight: 'Bold',
            size: '14px'
        }
    };

    // public load(args: ILoadedEventArgs): void {
    //     let selectedTheme: string = location.hash.split('/')[1];
    //     selectedTheme = selectedTheme ? selectedTheme : 'Material';
    //     args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
    // };

    // custom code start
    public load(args: IAccLoadedEventArgs): void {
        let selectedTheme: string = location.hash.split('/')[1];
        selectedTheme = selectedTheme ? selectedTheme : 'Material';
       // args.accumulation.theme = <AccumulationTheme>(selectedTheme.charAt(2).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
        args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
    }

    // custom code end
    public loaded(args: IAccLoadedEventArgs): void {
        if (this.execute) {
            return;
        }
        let pieinterval = window.setInterval(
            () => {
                if (document.getElementById('donut-container')) {
                    if (this.count === 0) {
                        this.pie.series[0].dataSource = [{ 'x': 'Net-tution and Fees', y: 10 },
                        { 'x': 'Self-supporting Operations', y: 10 },
                        { 'x': 'Private Gifts', y: 13 }, { 'x': 'All Other', y: 14 },
                        { 'x': 'Local Revenue', y: 9 }, { 'x': 'State Revenue', y: 13 },
                        { 'x': 'Federal Revenue', y: 8 }
                        ];
                        this.execute = true;
                        this.pie.animate();
                        this.count++;
                    } else if (this.count === 1) {
                        this.pie.series[0].dataSource = [
                            { 'x': 'Net-tution and Fees', y: 120 }, { 'x': 'Self-supporting Operations', y: 31 },
                            { 'x': 'Private Gifts', y: 6 }, { 'x': 'All Other', y: 12 },
                            { 'x': 'Local Revenue', y: 25 }, { 'x': 'State Revenue', y: 11 },
                            { 'x': 'Federal Revenue', y: 12 }
                        ];
                        this.execute = true;
                        this.pie.animate();
                        this.count++;
                    } else if (this.count === 2) {
                        this.pie.series[0].dataSource = [
                            { 'x': 'Net-tution and Fees', y: 6 }, { 'x': 'Self-supporting Operations', y: 22 },
                            { 'x': 'Private Gifts', y: 11 }, { 'x': 'All Other', y: 15 },
                            { 'x': 'Local Revenue', y: 13 }, { 'x': 'State Revenue', y: 10 },
                            { 'x': 'Federal Revenue', y: 8 }
                        ];
                        this.execute = true;
                        this.pie.animate();
                        this.count++;
                    } else if (this.count === 3) {
                        this.pie.series[0].dataSource = [
                            { 'x': 'Net-tution and Fees', y: 15 }, { 'x': 'Self-supporting Operations', y: 10 },
                            { 'x': 'Private Gifts', y: 18 }, { 'x': 'All Other', y: 20 },
                            { 'x': 'Local Revenue', y: 30 }, { 'x': 'State Revenue', y: 20 },
                            { 'x': 'Federal Revenue', y: 25 }
                        ];
                        this.execute = true;
                        this.pie.animate();
                        this.count++;
                    } else if (this.count === 4) {
                        this.pie.series[0].dataSource = [
                            { 'x': 'Net-tution and Fees', y: 21 }, { 'x': 'Self-supporting Operations', y: 10 },
                            { 'x': 'Private Gifts', y: 17 }, { 'x': 'All Other', y: 15 },
                            { 'x': 'Local Revenue', y: 11 }, { 'x': 'State Revenue', y: 20 },
                            { 'x': 'Federal Revenue', y: 60 }
                        ];
                        this.execute = true;
                        this.pie.animate();
                        this.count = 0;
                    }
                } else {
                    clearInterval(pieinterval);
                }
            },
            3000);
    }
  
    public piecenterx(e: Event): void {
        let x: string = (document.getElementById('x') as HTMLInputElement).value;
        this.pie.center.x = x + '%';
        document.getElementById('xvalue').innerHTML = x + '%';
        this.pie.series[0].animation.enable = false;
        this.pie.removeSvg();
        this.pie.refreshSeries();
        this.pie.refreshChart();
    }
    public piecentery(e: Event): void {
        let y: string = (document.getElementById('y') as HTMLInputElement).value;
        this.pie.center.y = y + '%';
        document.getElementById('yvalue').innerHTML = y + '%';
        this.pie.series[0].animation.enable = false;
        this.pie.removeSvg();
        this.pie.refreshSeries();
        this.pie.refreshChart();
    }

    public center: Object = {x: '50%', y: '50%'};
    public startAngle: number = 0;
    public endAngle: number = 360;
    public tooltip: Object = {
        enable: false
    };
    //public title: string = 'Education Institutional Revenue';
   

}