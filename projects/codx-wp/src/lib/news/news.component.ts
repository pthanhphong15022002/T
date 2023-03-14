import { AfterContentInit, ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
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


export class NewsComponent extends UIComponent implements AfterContentInit {

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
  page:number = 0;
  pageIndex:number = 0;
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
  @ViewChild('carousel') carousel: NgbCarousel;
  constructor
  (
    private injector: Injector
  ) 
  { 
    super(injector)
  }
  ngAfterContentInit(): void {
    
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
    this.getVideoAsync(category,this.pageIndex);
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
          let total = res[1];
          this.page = Math.ceil(total/6);
          if(this.scrolled)
          {
            this.videos = this.videos.concat(data);
            this.scrolled = false;
            this.carousel.pause();
            let slideIndex = this.slides.length;
            for (let index = 0; index < data.length; index+=3) {
              this.slides[slideIndex] = [];
              this.slides[slideIndex] = data.slice(index,index+3);
              slideIndex++;
            }
          }
          else
          {
            this.videos = JSON.parse(JSON.stringify(data));
            let slide = 0;
            for (let index = 0; index < this.videos.length; index += 3) {
              this.slides[slide] = [];
              this.slides[slide] = this.videos.slice(index,index+3);
              slide ++;
            }
            let ins = setInterval(()=>{
              if(this.carousel){
                this.showNavigation = this.page >= 1 ? true : false;
                this.carousel.pause();
                this.detectorRef.detectChanges();
                clearInterval(ins);
              }
            },100)
          }
          this.pageIndex += 1;
        });
  }

  //

  // slideChange
  slideChange(slideEvent:NgbSlideEvent){
    // if(slideEvent.paused){
    //   this.carousel.cycle();
    // }
    if(slideEvent.source === NgbSlideEventSource.ARROW_RIGHT && this.pageIndex < this.page){
      this.scrolled = true;
      this.getVideoAsync(this.category,this.pageIndex);
    }
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
    if(newsType){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let modal = this.callfc.openForm(PopupAddComponent, '', 0, 0, '', newsType, '', option);
      modal.closed.subscribe((res: any) => {
        debugger
        if (res?.event) {
          let data = res.event;
          if(data.newsType == this.NEWSTYPE.POST){
            this.posts.unshift(data);
            if(this.posts.length > 4){
              this.posts.splice(-1);
            }
          }
          else if(data.newsType == this.NEWSTYPE.VIDEO)
          {
            this.videos.unshift(data);
            if(this.videos.length > 3){
              this.showNavigation = true;
            }
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
