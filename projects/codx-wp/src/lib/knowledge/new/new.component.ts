import { AfterViewInit, Component, HostBinding, Injector, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { Post } from '@shared/models/post';
import { UIComponent, ViewModel, CodxListviewComponent, AuthStore, ViewType, DialogModel, UserModel } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

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
  selector: 'wp4-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})

export class NewComponent extends UIComponent implements AfterViewInit,OnDestroy {

  views:ViewModel[];
  user:UserModel;
  userPermission:any;
  category:string;
  loaded:boolean = false;
  NEWSTYPE_POST = NEWSTYPE.POST;
  NEWSTYPE_VIDEO = NEWSTYPE.VIDEO;
  posts:any[] = [];
  videos:any[] = [];
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
    .subscribe((params) => 
    {
      if(params)
      {
        this.funcID = params['funcID'];
        this.category = params['category'];
        this.getUserPermission(this.funcID);
        this.getPosts(this.category);
        // this.getVideos(this.category);
      }
    });
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

  slides:any[];
  slidesPage:number = 0;
  slidesIsFull:boolean = false;
  slidesShowNavigation:boolean = false;
  slidesIsScrolled:boolean = false;
  getVideos(category: string) {
    if(this.slidesIsFull) return;
    this.slidesPage = this.slidesPage += 1;
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

  }

  openPopupAdd(newType:string) {
    
  }

  openPopupSearch() {
    
  }
}
