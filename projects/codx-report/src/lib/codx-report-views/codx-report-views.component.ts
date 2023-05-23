
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { AuthStore, ButtonModel, CacheService, LayoutService, PageTitleService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';

@Component({
  selector: 'codx-report-views',
  templateUrl: './codx-report-views.component.html',
  styleUrls: ['./codx-report-views.component.scss']
})
export class CodxReportViewsComponent   extends UIComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('templateListCard') templateListCard!:TemplateRef<any>;
  @ViewChild('view') viewBase:ViewsComponent;
  onInit(): void {

  }

  views: ViewModel[];
  viewType = ViewType;
  funcID:any;
  button: ButtonModel = {
    id:'btnAdd'
  }
  module:any='';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private cacheSv:CacheService,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg:Router,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cacheSv.functionList(this.funcID).subscribe((res:any)=>{
      if(res){
        this.module = res.module ? res.module.toLowerCase() : '';
      }
    })
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
      //   sameData: false,
      //   reportView: true,
      //   reportType:'R',
      //   active: false,

      //   // model: {
      //   //   template: ,
      //   // },
      // },
    ];
    this.routerNg.events.subscribe((event: any)=>{
      if(event instanceof NavigationEnd){
        let arr = event.url.split('/');
        if(arr.findIndex((item:any)=> item == this.funcID) > -1){
          this.view.viewChanged.emit(this.view.currentView);
        }
        this.changeDetectorRef.detectChanges();
      }
    })
    this.changeDetectorRef.detectChanges();
  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
    this.pageTitle.calculateTitle();
    this.pageTitle.calculateBreadcrumbs();
  }
  onActions(e:any){
    if (e.type == 'detail') {
      this.codxService.navigate('', this.module+'/report/detail/' + e.data.reportID);
      this.detectorRef.reattach();
    }
  }
  cardClick(e:any){
    this.codxService.navigate("",this.module+"/report/detail/"+e.reportID)
  }
}
