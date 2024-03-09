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
  CallFuncService,
  LayoutService,
  NotificationsService,
  PageTitleService,
  UIComponent,
  UserModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxReportService } from 'projects/codx-report/src/public-api';
import { CodxShareService } from '../../../codx-share.service';
import { isObservable } from 'rxjs';
import { CodxWsService } from 'projects/codx-ws/src/public-api';
import { BookmarkComponent } from 'projects/codx-ws/src/lib/bookmark/bookmark.component';

@Component({
  selector: 'dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class CodxDashboardViewsComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('templateListCard') templateListCard!: TemplateRef<any>;
  @ViewChild('empty') empty!: TemplateRef<any>;

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
  imgDefault = "assets/themes/ws/default/img/Dashboard_Empty.svg";
  listGroupReport = [];
  selectedToolBar = "All";
  listDashboard = [];
  listDashboards = [];
  listBookMarks=[];
  countBookMarks = 0;
  viewID = "1";
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private cacheSv: CacheService,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg: Router,
    private reportService: CodxReportService,
    private auth: AuthStore,
    private shareService: CodxShareService,
    private notifySvr: NotificationsService,
    private codxWsService: CodxWsService,
    private callFunc: CallFuncService
  ) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.getCountBookMark();
    this.formatListGroupReport();
    this.router.params.subscribe((param: any) => {
      if (param) {
        this.funcID = param['funcID'];
        this.cacheSv.functionList(this.funcID)
        .subscribe((res: any) => {
          if (res) {
            this.funcItem = res;
            this.module = res.module ? res.module.toUpperCase() : '';
            this.dataValues = res.module;
            this.pageTitle.setSubTitle('');
            this.pageTitle.setChildren([]);
          }
        });
      }
    });
  }

  getCountBookMark()
  {
    let widthBody = document.body.offsetWidth - 40;
    this.countBookMarks = Math.ceil(widthBody / 260);
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewInit(): void {
    this.codxService.setStyleToolbarLayout(this.view.elementRef.nativeElement, 'toolbar1');
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
    this.changeDetectorRef.detectChanges();
  }

  formatListGroupReport()
  {
    var obj =
    {
      functionID : "All",
      customName : "Tất cả"
    }
    this.listGroupReport.push(obj);
  }

  viewChanged(e: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.pageTitle.setSubTitle('');
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

      this.codxService.navigate('', this.module.toLowerCase() + '/dashboard/' + e.recID);
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

  setBookMark(recID:any)
  {
    this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportBusiness","BookmarkAsync",recID).subscribe(item=>{
      if(item)
      {
        var className = "opacity-100";
        var messCode = "OD002";
        var index = this.listDashboard.findIndex(x=>x.recID == recID);
        var index2 = this.listDashboards.findIndex(x=>x.recID == recID);
        if(index2 >= 0)  this.listDashboards[index2].isBookMark = !this.listDashboards[index2].isBookMark;
        if(index >= 0) {

          this.listDashboard[index].isBookMark = !this.listDashboard[index].isBookMark;

          if(!this.listDashboard[index].isBookMark)
          {
            className = "opacity-25";
            messCode = "OD003";
            this.listBookMarks = this.listBookMarks.filter(x=>x.recID != this.listDashboards[index].recID);
            if(this.listDashboards[index2].bookmarks &&  this.listDashboards[index2].bookmarks.length > 0)
            this.listDashboards[index2].bookmarks = this.listDashboards[index2].bookmarks.filter(x=>x.objectID != this.user.userID);
          }
          else  {
            this.listBookMarks.unshift(this.listDashboard[index]);
            if(!this.listDashboards[index2].bookmarks) this.listDashboards[index2].bookmarks = [];
              this.listDashboards[index2].bookmarks.push({objectID:this.user.userID});
          }

          //Bookmark report
          document.getElementById("ws-report-bookmark" + this.listDashboard[index].recID).classList.add(className);

          //Noti
          this.notifySvr.notifyCode(messCode,0,this.user?.userName);

          //Update cache
          let paras = ["D",this.module];
          let keyRoot = "WSDR" + "D" + this.module;
          let key = JSON.stringify(paras).toLowerCase();
          this.codxWsService.updateCache(keyRoot,key,this.listDashboards);
        }
      }
    });
  }

  formatBookMark(data:any)
  {
    data.forEach(element => {
      element.isBookMark = false;
      if(element.bookmarks && element.bookmarks.length > 0)
      {
        var dt = element.bookmarks.filter(x=>x.objectID == this.user?.userID);
        if(dt && dt.length > 0) {
          this.listBookMarks.push(element);
          element.isBookMark = true;
        }
      }
    });

    return data
  }

  selectedChangeToolBar(data:any)
  {
    this.selectedToolBar = data?.functionID;
    if(this.selectedToolBar == "All") this.listDashboard = JSON.parse(JSON.stringify(this.listDashboard));
    else if(this.funcID.includes("WS")) this.listDashboard = JSON.parse(JSON.stringify(this.listDashboard.filter(x=>x.moduleID == this.selectedToolBar)));
    else this.listDashboard = JSON.parse(JSON.stringify(this.listDashboards.filter(x=>x.category == this.selectedToolBar)));
  }

  dataChange(data:any)
  {
    var results = this.formatBookMark(data);
    this.listDashboard = results;
    this.listDashboards = JSON.parse(JSON.stringify(results));
    this.formatData(this.listDashboard);
  }

  formatData(data:any)
  {
    let vll = this.shareService.loadValueList("RP001") as any;

    if(isObservable(vll))
    {
      vll.subscribe((item:any)=>{
        this.formatVll(data,item.datas);
      })
    }
    else this.formatVll(data,vll.datas);
  }

  formatVll(data:any,vll:any)
  {
    var listCategory = [];
    data.forEach(elm => {
      var text = vll.filter(x=>x.value == elm.category);
      if(text.length > 0)
      {
        var name = text[0].text;
        if(!listCategory.some(x=>x.customName == name))
        {
          listCategory.push(
            {
              functionID: elm.category,
              customName: name
            }
          )
        }
      }
    });
    this.formatData2(listCategory);
  }

  formatData2(data:any)
  {
    this.listGroupReport = this.listGroupReport.concat(data);
  }

  selectMoreBookmark()
  {
    this.callFunc.openForm(BookmarkComponent,"",900,700,"",{listGroup:this.listGroupReport,listBookMarks:this.listBookMarks,type:'D'});
  }
  viewChange(e:any)
  {
    this.viewID = e;
  }
}
