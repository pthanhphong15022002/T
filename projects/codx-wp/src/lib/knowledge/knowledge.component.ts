import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { AuthStore, DialogModel, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { Post } from '@shared/models/post';
import { PopupAddKnowledgeComponent } from './popup/popup-add-knowledge/popup-add-knowledge.component';
import { NEWSTYPE } from './models/Knowledge.model';

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
  }

  onInit(): void {
    if(this.funcID)
    {
      this.cache.functionList(this.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((func:any) => {
        if(func)
        {
          this.cache.gridViewSetup(func.formName,func.gridViewName)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
        }
      });
    }
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
    if (data){
      this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'UpdateViewAsync', [data.recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
      this.codxService.navigate('',`${this.view.function.url}/${data.category}/${data.recID}`);
    }
  }

  openPopupSearch() {
    
  }


  openPopupAdd(newType:string){
    this.api.execSv("WP","Core","DataBusiness","GetDefaultAsync",["WPT02","WP_News"])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:any) => {
      if(res?.data)
      {
        let dialogModel = new DialogModel();
        dialogModel.DataService = this.view.dataService;
        dialogModel.FormModel = this.view.formModel;
        dialogModel.IsFull = true;
        let post = res.data;
        if(this.category) post.category = this.category;
        post.newsType = newType;
        post.shareControl = "9";
        post.createdBy = this.user.userID;
        post.createdName = this.user.userName;
        let data = {
          actionType: "add",
          data: post
        };
        let popup = this.callfc.openForm(PopupAddKnowledgeComponent,"",0,0,"",data,"",dialogModel)
        popup.closed
        .pipe(takeUntil(this.destroy$))
        .subscribe((res:any) => {
          if(res?.event)
          {
            let data = res.event;
            if (data.newsType == NEWSTYPE.POST) 
            {
              if(!this.posts) this.posts = [];
              this.posts.unshift(data);
              if(this.posts.length > 4) this.posts.pop();
            }
            else if (data.newsType == NEWSTYPE.VIDEO) 
            {
              if(!this.videos) this.videos = [];
              this.videos.unshift(data);
              if(this.videos.length > 3)
                this.slidesShowNavigation = true;
              let slideIndex = 0;
              for (let idx = 0; idx < this.videos.length; idx += 3) 
              {
                this.slides[slideIndex] = [];
                this.slides[slideIndex] = this.videos.slice(idx, idx + 3);
                slideIndex++;
              }
            }
            this.detectorRef.detectChanges();
          }
        });
      }
    });
    
  }
}
