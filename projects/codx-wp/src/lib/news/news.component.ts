import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgbCarousel,
  NgbSlideEvent,
  NgbSlideEventSource,
} from '@ng-bootstrap/ng-bootstrap';
import { load } from '@syncfusion/ej2-angular-charts';
import { ListViewComponent } from '@syncfusion/ej2-angular-lists';
import {
  ViewModel,
  ViewsComponent,
  CodxListviewComponent,
  ApiHttpService,
  CodxService,
  CallFuncService,
  CacheService,
  ViewType,
  DialogModel,
  UIComponent,
  NotificationsService,
  CRUDService,
  AuthStore,
} from 'codx-core';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';
import { WP_News } from '../models/WP_News.model';
import { Post } from '@shared/models/post';

@Component({
  selector: 'lib-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsComponent extends UIComponent {
  @HostBinding('class') get class() {
    return 'bg-body h-100 news-main card-body scroll-y';
  }
  user: any = null;
  funcID: string = '';
  posts: any[] = [];
  videos: any[] = [];
  views: Array<ViewModel> = [];
  category: string = '';
  mssgNodata: string = '';
  loaded: boolean = false;
  userPermission: any = null;
  scrolled: boolean = false;
  slides: any[] = [];
  showNavigation: boolean = false;
  page: number = 0;
  pageIndex: number = 0;
  sysMoreFunction: any = null;

  NEWSTYPE = {
    POST: '1',
    VIDEO: '2',
  };
  CATEGORY = {
    HOME: 'home',
    COMPANYINFO: '0',
    EVENTS: '1',
    INTERNAL: '2',
    POLICY: '3',
    ORTHERS: '4',
  };
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('carousel') carousel: NgbCarousel;
  constructor(private injector: Injector, private auth: AuthStore) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params.subscribe((param) => {
      this.category = param['category'];
      this.loadDataAsync(this.category);
      if (param['funcID'] && !this.userPermission) {
        this.funcID = param['funcID'];
        this.getUserPermission(this.funcID);
      }
    });
    this.getMessageDefault();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        active: true,
        sameData: false,
        type: ViewType.content,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
  }

  // get user permission
  getUserPermission(funcID: string) {
    funcID = funcID + 'P';
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'CommonBusiness',
        'GetUserPermissionsAsync',
        [funcID]
      )
      .subscribe((res: any) => {
        if (res) {
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
  }
  // get message default
  getMessageDefault() {
    this.cache.message('SYS011').subscribe((mssg: any) => {
      if (mssg && mssg?.defaultName) this.mssgNodata = mssg.defaultName;
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) this.sysMoreFunction = mFuc;
    });
  }
  // get data async
  loadDataAsync(category: string) {
    this.page = 0;
    this.pageIndex = 0;
    this.posts = [];
    this.videos = [];
    this.slides = [];
    this.getPostAsync(category);
    this.getVideoAsync(category, this.pageIndex);
  }
  // get post
  getPostAsync(category: string) {
    this.loaded = false;
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetTop4PostAsync', [
        category,
      ])
      .subscribe((res: any) => {
        this.posts = JSON.parse(JSON.stringify(res));
        this.loaded = true;
        this.detectorRef.detectChanges();
      });
  }

  // get videos
  getVideoAsync(category: string, pageIndex = 0) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetVideoAsync', [
        category,
        pageIndex,
      ])
      .subscribe((res: any[]) => {
        let data = res[0];
        let total = res[1];
        if (data.length > 0) {
          this.page = Math.ceil(total / 6);
          if (this.scrolled) {
            this.videos = this.videos.concat(data);
            this.scrolled = false;
            this.carousel.pause();
            let slideIndex = this.slides.length;
            for (let index = 0; index < data.length; index += 3) {
              this.slides[slideIndex] = [];
              this.slides[slideIndex] = data.slice(index, index + 3);
              slideIndex++;
            }
            this.scrolled = false;
            this.detectorRef.detectChanges();
          } else {
            this.videos = JSON.parse(JSON.stringify(data));
            let slide = 0;
            for (let index = 0; index < this.videos.length; index += 3) {
              this.slides[slide] = [];
              this.slides[slide] = this.videos.slice(index, index + 3);
              slide++;
            }
            let ins = setInterval(() => {
              if (this.carousel) {
                this.showNavigation = this.page >= 1 ? true : false;
                this.carousel.pause();
                this.detectorRef.detectChanges();
                clearInterval(ins);
              }
            }, 100);
          }
          this.pageIndex += 1;
        } else {
          this.videos = [];
          this.slides = [];
          this.page = 0;
          this.pageIndex = 0;
          this.showNavigation = false;
          this.detectorRef.detectChanges();
        }
      });
  }
  // slideChange
  slideChange(slideEvent: NgbSlideEvent) {
    if (
      slideEvent.source === NgbSlideEventSource.ARROW_RIGHT &&
      this.pageIndex < this.page
    ) {
      this.scrolled = true;
      this.getVideoAsync(this.category, this.pageIndex);
    }
  }
  // click view detail news
  clickViewDetail(data: any) {
    if (data?.recID) {
      this.api
        .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'UpdateViewAsync', [
          data.recID,
        ])
        .subscribe();
      this.codxService.navigate(
        '',
        `wp2/news/${this.funcID}/${data.category}/${data.recID}`
      );
    }
  }
  // open popup create
  openPopupAdd(type: string) {
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    option.zIndex = 100;
    let mfc = Array.from<any>(this.sysMoreFunction).find(
      (x: any) => x.functionID === 'SYS01'
    );
    let post = new Post();
    post.newsType = type;
    let data = {
      action: mfc.defaultName,
      isAdd: true,
      data: post,
    };
    let popup = this.callfc.openForm(
      PopupAddComponent,
      '',
      0,
      0,
      '',
      data,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      debugger;
      if (res?.event) {
        let data = res.event;
        //post
        if (data.newsType == this.NEWSTYPE.POST) {
          this.posts.unshift(data);
          if (this.posts.length > 4) this.posts.pop();
        }
        //video
        else if (data.newsType == this.NEWSTYPE.VIDEO) {
          if (this.videos.length > 0) this.videos.unshift(data);
          let slideIndex = 0;
          for (let idx = 0; idx < this.videos.length; idx += 3) {
            this.slides[slideIndex] = [];
            this.slides[slideIndex] = this.videos.slice(idx, idx + 3);
            slideIndex++;
          }
          let ins = setInterval(() => {
            if (this.carousel) {
              this.carousel.pause();
              this.detectorRef.detectChanges();
              clearInterval(ins);
            }
          }, 100);
        }
        this.detectorRef.detectChanges();
      }
    });
  }
  // open popup search
  openPopupSearch() {
    if (this.view) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(
        PopupSearchComponent,
        '',
        0,
        0,
        '',
        this.funcID,
        '',
        option
      );
    }
  }
}
