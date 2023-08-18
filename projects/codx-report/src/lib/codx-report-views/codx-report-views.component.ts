import { T } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  LayoutService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'codx-report-views',
  templateUrl: './codx-report-views.component.html',
  styleUrls: ['./codx-report-views.component.scss'],
})
export class CodxReportViewsComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('templateListCard') templateListCard!: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;

  views: ViewModel[];
  viewType = ViewType;
  funcID: any;
  funcItem: any;
  button: ButtonModel = {
    id: 'btnAdd',
  };
  module: any = '';
  predicates:string = "ReportType = 'R' && Module=@0";
  dataValues:String = "";
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private cacheSv: CacheService,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg: Router
  ) {
    super(injector);
    
    
  }
  onInit(): void {
    this.router.params.subscribe((param:any) => {
      if(param)
      {
        this.funcID = param['funcID'];
        this.cacheSv.functionList(this.funcID)
        .subscribe((res: any) => {
          if (res) {
            this.funcItem = res;
            this.module = res.module ? res.module.toLowerCase() : '';
            this.dataValues = res.module;
            this.pageTitle.setSubTitle('');
            this.pageTitle.setChildren([]);
          }
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.report,
        sameData: false,
        active: true,
        reportView: true,
        reportType: 'R',
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
    // this.routerNg.events.subscribe((event: any) => {
    //   if (event instanceof NavigationEnd) {
    //     let arr = event.url.split('/');
    //     if (arr.findIndex((item: any) => item == this.funcID) > -1) {
    //       this.view.viewChanged.emit(this.view.currentView);
    //     }
    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
    this.changeDetectorRef.detectChanges();
  }
  viewChanged(e: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.pageTitle.setSubTitle('');
    //this.pageTitle.setTitle(this.funcItem.customName ? this.funcItem.customName : "" );
  }
  onActions(e: any) {
    if (e.type == 'detail') {
      this.codxService.navigate(
        '',
        this.module + '/report/detail/' + e.data.recID
      );
      this.detectorRef.reattach();
    }
  }
  cardClick(e: any) {
    if(e?.recID)
    {
      this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportListBusiness","UpdateViewAsync",[e.recID]).subscribe();
      this.codxService.navigate('', this.module + '/report/detail/' + e.recID);
    }
    
  }
}
