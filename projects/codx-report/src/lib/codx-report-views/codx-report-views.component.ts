
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Route } from '@angular/router';
import { AuthStore, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'codx-report-views',
  templateUrl: './codx-report-views.component.html',
  styleUrls: ['./codx-report-views.component.scss']
})
export class CodxReportViewsComponent   extends UIComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('templateListCard') templateListCard!:TemplateRef<any>;
  onInit(): void {
  }

  views: ViewModel[];
  viewType = ViewType;
  funcID:any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.report,
        sameData: false,
        active: true,
        reportView: true,
        reportType:'R',
        model: {
          //template:this.templateListCard
        },
      },
      // {
      //   type: ViewType.list,
      //   sameData: true,
      //   active: false,

      //   // model: {
      //   //   template: ,
      //   // },
      // },
    ];
    this.changeDetectorRef.detectChanges();
  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
  }
  onActions(e:any){
    if(e.type == 'detail'){
      this.codxService.navigate("","/report/detail/"+e.data.reportID)
    }
  }
  cardClick(e:any){
    this.codxService.navigate("","/report/detail/"+e.reportID)
  }
}
