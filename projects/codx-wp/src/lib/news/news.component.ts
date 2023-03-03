import { ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { load } from '@syncfusion/ej2-angular-charts';
import { ListViewComponent } from '@syncfusion/ej2-angular-lists';
import { ViewModel, ViewsComponent, CodxListviewComponent, ApiHttpService, CodxService, CallFuncService, CacheService, ViewType, DialogModel, UIComponent, NotificationsService, CRUDService } from 'codx-core';
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
  posts: any[] = [];
  videos: any[] = [];
  views: Array<ViewModel> = [];
  category: string = "";
  mssgWP025:string = "";
  mssgWP026:string = "";
  mssgWP027:string = "";
  loaded:boolean = false;
  userPermission:any = null;
  scrolled:boolean = false;
  slides:any[] = [];
  showNavigation:boolean = false;
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
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('carousel', { static: true }) carousel: NgbCarousel;
  constructor
  (
    private injector: Injector
  ) 
  { 
    super(injector)
  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param["category"] !== "home")
        this.category = param["category"];
      else
        this.category = "";
      this.loadDataAsync(this.category);
      if(param["funcID"]){
        this.funcID = param["funcID"];
        if(!this.userPermission){
          this.getUserPermission(this.funcID);
        }
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
    this.getPostAsync(category);
    this.getVideoAsync(category);
  }
  // get post
  getPostAsync(category:string){
    this.loaded = false;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetTop4PostAsync',
        [category]).subscribe((res:any) => {
          if(res)
          {
            this.posts = res;
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
          let data = res[0];
          if(this.scrolled)
            this.videos = this.videos.concat(data);
          else
            this.videos = res[0];
          let j = 0;
          for (let index = 0; index < this.videos.length; index += 3) {
            this.slides[j] = [];
            this.slides[j] = this.videos.slice(index,index+3);
            j ++;
          }
          if(j>1){
            this.showNavigation = j > 1 ? true : false; 
            this.carousel.pause();
          }
          this.detectorRef.detectChanges();
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
      this.codxService.navigate('', `wp2/news/${this.funcID}/${data.category}/${data.recID}`);
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


  // navigate slider
  navigate($event){
    debugger
  }

}
