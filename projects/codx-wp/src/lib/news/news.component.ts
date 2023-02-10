import { ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { load } from '@syncfusion/ej2-angular-charts';
import { ViewModel, ViewsComponent, CodxListviewComponent, ApiHttpService, CodxService, CallFuncService, CacheService, ViewType, DialogModel, UIComponent, NotificationsService } from 'codx-core';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  encapsulation: ViewEncapsulation.None, 
})


export class NewsComponent extends UIComponent {

  @HostBinding('class') get class() {
    return "bg-body h-100 news-main card-body hover-scroll-overlay-y";
  }
  funcID: string = "";
  entityName: string = 'WP_News';
  service: string = "WP";
  assemblyName: string = "ERM.Business.WP";
  className: string = "NewsBusiness"
  predicate: string = "";
  dataValue: string = "5;null;2;";
  posts: any[] = [];
  videos: any[] = [];
  lstGroup: any[] = [];
  isAllowNavigationArrows = false;
  views: Array<ViewModel> = [];
  category: string = "home";
  mssgWP025:string = "";
  mssgWP026:string = "";
  mssgWP027:string = "";
  pageSlider:any[] = [];
  newDate:any = new Date();
  loaded:boolean = false;
  userPermission:any = null;
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  CATEGORY = {
    HOME: "home",
    COMPANYINFO: "0",
    EVENTS: "1",
    INTERNAL: "2",
    POLICY: "3",
    ORTHERS: "4"
  }
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  constructor
  (
    private injector: Injector
  ) 
  { 
    super(injector)
  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param) {
        this.funcID = param["funcID"];
        this.category = param["category"];
        this.loadDataAsync(this.category);
        this.getUserPermission(this.funcID);
      }
    });
    this.getMessageDefault();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        active: true,
        sameData:false,
        type: ViewType.content,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      }
    ];
  }
  
  // get user permission
  getUserPermission(funcID:string){
    if(funcID)
    {
      funcID  = funcID + "P";
      this.api.execSv(
        "SYS",
        "ERM.Business.SYS",
        "CommonBusiness",
        "GetUserPermissionsAsync",
        [funcID]).subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  // get message default
  getMessageDefault() {
    this.cache.message("WP025").subscribe((mssg: any) => {
      if (mssg && mssg?.defaultName) {
        this.mssgWP025 = mssg.defaultName;
      }
    });
    this.cache.message("WP026").subscribe((mssg: any) => {
      if (mssg && mssg?.defaultName) {
        this.mssgWP026 = mssg.defaultName;
      }
    });
    this.cache.message("WP027").subscribe((mssg: any) => {
      if (mssg && mssg?.defaultName) {
        this.mssgWP027 = mssg.defaultName;
      }
    });
  }
  // get data async
  loadDataAsync(category: string) {
    this.loaded = false;
    this.getPostAsync(category);
    this.getVideoAsync(category);
  }
  // get post
  getPostAsync(category:string){
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetPostAsync',
        [category]).subscribe((res:any) => {
          if(res)
          {
            this.posts = res[0];
            this.lstGroup = res[1]
            this.detectorRef.detectChanges();
          }
          this.loaded = true;
        });
  }
  // get videos
  getVideoAsync(category:string,pageIndex = 0){
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetVideoAsync',
        [category,pageIndex])
        .subscribe((res:any[]) => {
          if(res[1] > 0)
          {
            let data = res[0];
            let total = res[1]
            this.videos = this.videos.concat(data);
            this.isAllowNavigationArrows = total > 3 ? true : false;
          }
          else
          {
            this.videos = [];
          }
          this.loaded = true;
          this.detectorRef.detectChanges();
        });
  }
  // get list post by category
  getPostByCategory(category:string){
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetPostByCategoryAsync',
        [])
        .subscribe((res:any[]) => {
          if(Array.isArray(res) && res.length > 0)
          {
            this.lstGroup = res;
            this.detectorRef.detectChanges();
          }
        });
  }
  // click view detail news
  clickViewDetail(data: any) {
    if(data?.recID)
    {
      this.api
      .execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'UpdateViewNewsAsync',
      [data.recID]).subscribe();
      this.codxService.navigate('', '/news/' + this.funcID + '/' + data.category + '/' + data.recID);
    }
  }
  // open popup create
  openPopupAdd(newsType: string) {
    if(this.view && newsType){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let modal = this.callfc.openForm(PopupAddComponent, '', 0, 0, '', newsType, '', option);
      modal.closed.subscribe((res: any) => {
        if (res?.event) {
          let data = res.event;
          if(data.newsType == this.NEWSTYPE.POST){
            this.posts.unshift(data);
            if(this.posts.length > 4){
              this.posts.splice(-1);
            }
          }
          else
          {
            this.videos.unshift(data);
          }
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  // open popup search
  openPopupSearch() {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", this.funcID, "", option);
    } 
  }


}
