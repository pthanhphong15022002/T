import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ViewModel, ViewsComponent, CodxListviewComponent, ApiHttpService, CodxService, CallFuncService, CacheService,  ViewType,  DialogModel } from 'codx-core';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  encapsulation: ViewEncapsulation.None, // e gắn tạm để tạm thời kg mất css nha chị Vân
})


export class NewsComponent implements OnInit {

  @HostBinding('class') get class() {
    return "bg-white"; 
   }
  funcID:string = "";
  entityName:string = 'WP_News';
  service:string = "WP";
  assemblyName:string = "ERM.Business.WP";
  className:string = "NewsBusiness"
  predicate:string = "";
  dataValue:string = "5;null;2;";
  news:any[] = [];
  videos: any[] = [];
  lstGroup: any[] = [];
  isAllowNavigationArrows = false;
  views: Array<ViewModel> = [];
  category: string = "home";
  mssgWP025:string = "";
  mssgWP026:string = "";
  mssgWP027:string = "";


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
  @ViewChild('codxViews') codxView: ViewsComponent;

  constructor(
    private api: ApiHttpService,
    public codxService: CodxService,
    private route: ActivatedRoute,
    private changedt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private cache: CacheService,

  ) 
  { }
  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      if(param){
        this.funcID = param["funcID"];
        this.category = param["category"];
        this.loadDataAsync(this.funcID, this.category);
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
    this.changedt.detectChanges();
  }
  getMessageDefault(){
    this.cache.message("WP025").subscribe((mssg:any) => {
      if(mssg && mssg?.defaultName)
      {
        this.mssgWP025 = mssg.defaultName;
      }
    });
    this.cache.message("WP026").subscribe((mssg:any) => {
      if(mssg && mssg?.defaultName)
      {
        this.mssgWP026 = mssg.defaultName;
      }
    });
    this.cache.message("WP027").subscribe((mssg:any) => {
      if(mssg && mssg?.defaultName)
      {
        this.mssgWP027 = mssg.defaultName;
      }
    });
  }  
  loadDataAsync(funcID: string, category: string) {
    this.api.execSv(
      this.service, 
      this.assemblyName, 
      this.className, 
      "GetDatasNewsAsync",
      [funcID, category])
      .subscribe((res: any[]) => {
        if (res.length > 0 && res[0] && res[1] && res[2]) 
        {
          this.news = res[0]; 
          this.videos = res[1]; 
          this.lstGroup = res[2]; 
          if(this.videos.length > 3)
          {
            this.isAllowNavigationArrows = true;
          }
          this.changedt.detectChanges();
        }
      });
  }


  clickViewDetail(data: any) {
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
  clickShowPopupCreate(newsType: string) {
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    let modal = this.callfc.openForm(PopupAddComponent, '', 0, 0, '', newsType, '', option);
    modal.closed.subscribe((res: any) => {
      if (res?.event) {
        let data = res.event;
        if (data.newsType == this.NEWSTYPE.POST) {
          this.news.pop();
          this.news.unshift(data);
          this.changedt.detectChanges();
        }
      }
    })
  }

  clickShowPopupSearch() {
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", this.funcID, "", option);
  }




}
