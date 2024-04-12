import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { AuthStore, DialogModel, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { Post } from '@shared/models/post';
import { PopupAddKnowledgeComponent } from './popup/popup-add-knowledge/popup-add-knowledge.component';
export const NEWSTYPE = 
{
  POST: '1',
  VIDEO: '2',
};
export const CATEGORY = 
{
  HOME: 'home',
  COMPANYINFO: '0',
  EVENTS: '1',
  INTERNAL: '2',
  POLICY: '3',
  ORTHERS: '4',
};
@Component({
  selector: 'wp4-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KnowledgeComponent extends UIComponent implements AfterViewInit,OnDestroy {

  views:ViewModel[];
  user:UserModel;
  userPermission:any;
  category:string;
  loaded:boolean = false;
  NEWSTYPE_POST = NEWSTYPE.POST;
  NEWSTYPE_VIDEO = NEWSTYPE.VIDEO;
  posts:any[] = [];
  videos:any[] = [];
  mssgNoData:string = "SYS011";
  private destroy$ = new Subject<void>();

  @ViewChild('tmpContent') tmpContent: TemplateRef<any>;
  @ViewChild('carousel') carousel: NgbCarousel;
  constructor
  (
    private injector: Injector,
    private auth: AuthStore
  ) 
  {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params
    .subscribe((params:any) => {
      if(params) {
        this.funcID = params['funcID'];
        this.category = params['category'];
        this.getUserPermission(this.funcID);
        this.getPosts(this.category);
        this.getVideos(this.category);
      }
    });
    this.router.queryParams.subscribe((params:any) => {
      debugger
    })
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        showFilter: false,
        sameData: false,
        model: {
          panelLeftRef: this.tmpContent,
        },
      },
    ];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserPermission(funcID: string) {
    if(funcID) 
    {
      funcID = funcID + 'P';
      this.api
      .execSv(
      'SYS',
      'ERM.Business.SYS',
      'CommonBusiness',
      'GetUserPermissionsAsync',
      [funcID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) 
        {
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  getPosts(category: string) {
    this.api
    .execSv(
    'WP',
    'ERM.Business.WP',
    'NewsBusiness',
    'GetTop4PostAsync',
    [category])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => { 
      if(res)
      {
        this.posts = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  slides:any[] = [];
  slidesPage:number = 0;
  slidesIsFull:boolean = false;
  slidesShowNavigation:boolean = false;
  slidesIsScrolled:boolean = false;
  getVideos(category: string) {
    if(this.slidesIsFull) return;
    this.slidesPage = this.slidesPage + 1;
    this.api
    .execSv(
    'WP',
    'ERM.Business.WP', 
    'NewsBusiness', 
    'GetVideoAsync', 
    [category,this.slidesPage])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any[]) => {
      if(res)
      {
        let videos = res[0];
        let totalPage = Math.ceil(res[1]/6);
        this.slidesIsFull = this.slidesPage == totalPage;
        if (videos.length > 0)
        {
          let slideIndex = 0;
          if (this.slidesIsScrolled) 
          {
            this.videos = this.videos.concat(videos);
            slideIndex = this.slides.length;
          } 
          else 
          {
            this.videos = videos;
            slideIndex = 0;
          }
          if(!this.slides) this.slides = [];
          for (let index = 0; index < videos.length; index += 3) 
          {
            this.slides[slideIndex] = videos.slice(index, index + 3);
            slideIndex++;
          }
          this.slidesShowNavigation = this.videos.length > 3 ? true : false;
        }        
        this.detectorRef.detectChanges();
      }
    });
  }

  slideChange(slideEvent: NgbSlideEvent) {
    if(slideEvent?.source === NgbSlideEventSource.ARROW_RIGHT) 
    {
      this.slidesIsScrolled = true;
      this.getVideos(this.category);
    }
  }

  clickViewDetail(data: any) {
    if (data?.recID) 
    {
      this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'UpdateViewAsync', [data.recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
      this.codxService.navigate('',`wp2/news/${this.funcID}/${data.category}/${data.recID}`);
    }
  }

  openPopupAdd(newType:string) {
    let option = new DialogModel();
    let action = "Thêm";
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    option.zIndex = 100;
    let post = new Post();
    if(this.category && this.category != "home")
      post.category = this.category;
    post.newsType = newType;
    let data = {
      action: action,
      isAdd: true,
      data: post,
    };
    let popup = this.callfc.openForm(
      PopupAddKnowledgeComponent,
      '',
      0,
      0,
      '',
      data,
      '',
      option)
    popup.closed
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.event) {
        let data = res.event;
        if (data.newsType == NEWSTYPE.POST) 
        {
          this.posts.unshift(data);
          if (this.posts.length > 4) this.posts.pop();
        }
        else if (data.newsType == NEWSTYPE.VIDEO) 
        {
          if (this.videos.length == 0) 
            this.videos.push(data);
          else 
            this.videos.unshift(data);
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

  openPopupSearch() {
    
  }

}
