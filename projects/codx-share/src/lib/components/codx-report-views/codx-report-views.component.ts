
import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthStore, ViewType } from 'codx-core';

@Component({
  selector: 'codx-report-views',
  templateUrl: './codx-report-views.component.html',
  styleUrls: ['./codx-report-views.component.scss']
})
export class CodxReportViewsComponent implements OnInit, AfterViewInit, OnChanges {  
  
  views: any;  
  viewType = ViewType;
  constructor(
    private auth: AuthStore,    
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        // model: {
        //   template: ,
        // },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        // model: {
        //   template: ,
        // },
      },
    ];
    this.changeDetectorRef.detectChanges();
  } 
}
