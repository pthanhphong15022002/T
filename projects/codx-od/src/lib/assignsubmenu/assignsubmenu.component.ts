import { ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
//import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import {
    AccumulationChart, AccumulationChartComponent, IAccAnimationCompleteEventArgs, AccPoints,
    IAccTextRenderEventArgs, IAccLoadedEventArgs, ILoadedEventArgs, AccumulationTheme, Selection, ChartTheme, IPointRenderEventArgs, ChartComponent
} from '@syncfusion/ej2-angular-charts';
import { AgencyService } from '../services/agency.service';
import { DispatchService } from '../services/dispatch.service';

@Component({
    selector: 'od-assignSubMenu',
    templateUrl: 'assignsubmenu.component.html',   
    styleUrls: ['assignsubmenu.component.scss'], 
    encapsulation: ViewEncapsulation.None
})  
export class AssignSubMenuComponent {       
    @Input() data: string;
    @ViewChild('pie') pieChart;
    //public data: any;  
    public pie: AccumulationChartComponent | AccumulationChart;
    public execute = false;
    public count = 0;
    public total: any;    
    public palettes = [];
    public roles: any;
    constructor(private odService: DispatchService, private changeDetectRef: ChangeDetectorRef) { }
    ngOnInit(): void {    
        this.odService.isRoles.subscribe(item => {
            if (item) {
                this.roles = JSON.parse(item);
                this.changeDetectRef.detectChanges();
            }            
        });        
    }
    hover(ctrl) {
        ctrl.click();        
      }

    ngAfterViewInit(): void { 
       
    }

    
    
    showChart() {
     
    }
}