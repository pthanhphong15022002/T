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
  UserModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxReportService } from 'projects/codx-report/src/public-api';

@Component({
  selector: 'dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
})
export class CodxDashboardViewsComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('templateListCard') templateListCard!: TemplateRef<any>;
  @ViewChild('empty') empty!: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;

  views: ViewModel[];
  viewType = ViewType;
  funcItem: any;
  button: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  module: any = '';
  predicates: string = "ReportType = 'R' && Module=@0";
  dataValues: String = '';
  user: UserModel;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private cacheSv: CacheService,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg: Router,
    private reportService: CodxReportService,
    private auth: AuthStore
  ) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params.subscribe((param: any) => {
      if (param) {
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
        reportType: 'D',
        toolbarTemplate:this.empty,
        model: {
          template: this.templateListCard,

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
        this.module + '/dashboard/' + e.data.recID
      );
      this.detectorRef.reattach();
    }
  }

  cardClick(e: any) {
    if (e?.recID) {
      this.api
        .execSv(
          'rptrp',
          'Codx.RptBusiness.RP',
          'ReportListBusiness',
          'UpdateViewAsync',
          [e.recID]
        )
        .subscribe();
      this.codxService.navigate('', this.module + '/dashboard/' + e.recID);
    }
  }

  bookmark(recID: string) {
    this.reportService.bookmark(recID).subscribe();
  }

  hasBookmark(item) {
    if (item.bookmarks != null) {
      var list = item.bookmarks.filter((x) => x.objectID == this.user?.userID);
      if (list.length > 0) return true;
      else return false;
    }
    return false;
  }
}
