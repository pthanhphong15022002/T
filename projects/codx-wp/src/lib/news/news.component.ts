import { ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
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
  arrPost: any[] = [];
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
    private injector: Injector,
    private notifySV:NotificationsService
  ) 
  { 
    super(injector)
  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param) {
        this.funcID = param["funcID"];
        this.category = param["category"];
        this.loadDataAsync(this.funcID, this.category);
        this.getUserPermission(this.funcID);
      }
    });

    this.getMessageDefault();
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        active: true,
        type: ViewType.content,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      }
    ];
    this.detectorRef.detectChanges();
  }
  
  getUserPermission(funcID:string){
    if(funcID){
      funcID  = funcID + "P";
      this.api.execSv("SYS","ERM.Business.SYS","CommonBusiness","GetUserPermissionsAsync",[funcID])
      .subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  
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
  loadDataAsync(funcID: string, category: string) {
    if(funcID && category){
      this.api.execSv(
        this.service,
        this.assemblyName,
        this.className,
        "GetDatasNewsAsync",
        [funcID, category])
        .subscribe((res: any[]) => {
          if (res.length > 0 && res[0] && res[1] && res[2]) 
          {
            this.arrPost = res[0]; 
            this.videos = res[1]; 
            this.lstGroup = res[2]; 
            if(this.videos.length > 3)
            {
              let page = Math.floor(this.videos.length/3);
              for (let index = 1; index <= page; index++) 
              {
                this.pageSlider.push(index);
              }; 
              this.isAllowNavigationArrows = true;
              
            }
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  clickViewDetail(data: any) {
    if(data && data.recID)
    {
      this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewNewsAsync',
        data.recID
      )
      .subscribe();
      this.codxService.navigate('', '/wp/news/' + this.funcID + '/' + data.category + '/' + data.recID);
    }
  }
  clickShowPopupCreate(newsType: string) {
    if(this.view && newsType){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let modal = this.callfc.openForm(PopupAddComponent, '', 0, 0, '', newsType, '', option);
      modal.closed.subscribe((res: any) => {
        if (res && res.event) {
          let data = res.event;
          switch(data.newsType)
          {
            case this.NEWSTYPE.POST:
              let arrPostNew = [];
              if(this.arrPost.length > 0)
              {
                arrPostNew = [...this.arrPost];
              }
              arrPostNew.unshift(data);
              if(arrPostNew.length > 4){
                arrPostNew.pop();
              }
              this.arrPost = [...arrPostNew];
              
              break;
            case this.NEWSTYPE.VIDEO:
              let arrVideoNew = [];
              if(this.videos.length > 0)
              {
                arrVideoNew = [...this.videos];
              }
              arrVideoNew.unshift(data);
              this.videos = [...arrVideoNew];
              
              break;
            default:
              break;
          }
          this.notifySV.notifyCode('SYS006');
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  clickShowPopupSearch() {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", this.funcID, "", option);
    } 
  }




}
