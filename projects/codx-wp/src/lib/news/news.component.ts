import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ViewModel, ViewsComponent, CodxListviewComponent, ApiHttpService, CodxService, CallFuncService, CacheService, DataRequest, ViewType, SidebarModel, DialogRef, DialogModel } from 'codx-core';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],

})


export class NewsComponent implements OnInit {

  @HostBinding('class') get class() {
    return "bg-white"; 
   }
  dialogRef: any;
  funcID = "WPT02P";
  entityName = 'WP_News';
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness"
  method = "GetListNewsAsync";
  predicate = "";
  dataValue = "5;null;2;";
  sortColumns = 'CreatedOn';
  sortDirections = 'desc';
  listNews = [];
  listSlider = [];
  lstHotNew:any[] = [];
  lstVideo:any[] = [];
  lstGroup:any[] = [];
  userPermission: any;
  isAllowNavigationArrows = false;
  views: Array<ViewModel> = [];
  silderNumber = 3;
  category:string = "home";
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  CATEGORY = {
    HOME: "home",
    COMPANYINFO:"0",
    EVENTS: "1",
    INTERNAL: "2",
    POLICY: "3",
    ORTHERS: "4"
  }
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('codxViews') codxView: ViewsComponent;
  @ViewChild('carousel', { static: true }) carousel: NgbCarousel;
  @ViewChild('listView') listViewNews: any;
  @ViewChild('listCategory') listCategory: CodxListviewComponent;
  @ViewChild('itemTemplate') itemTemplate:TemplateRef<any>;

  constructor(
    private api: ApiHttpService,
    public codxService: CodxService,
    private route: ActivatedRoute,
    private changedt: ChangeDetectorRef,
    private callfc: CallFuncService,
  ) { }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        active: true,
        sameData: true,
        type: ViewType.content,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      }
    ];
    this.changedt.detectChanges();

  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.funcID = this.route.snapshot.params["funcID"];
      this.category = params["category"];
      this.loadDataAync(this.funcID,this.category);
      this.changedt.detectChanges();
    })
  }


  loadDataAync(funcID:string,category:string){
    this.api.execSv(this.service,this.assemblyName,this.className,"GetDatasNewsAsync",[funcID,category])
    .subscribe((res:any[]) => 
    {
      if(res && res[0] && res[1] && res[2])
      {
        this.lstHotNew = res[0]; // tin mới nhất
        this.lstVideo = res[1]; // video
        this.lstGroup = res[2]; // tin cũ hơn
        // if (res[1].length <= this.silderNumber) {
        //   this.carousel?.pause();
        // }
        // else
        // {
        //   this.isAllowNavigationArrows = true;
        //   this.carousel?.cycle();
        // }
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
    this.codxService.navigate('','/wp/news/'+this.funcID + '/' + data.category +'/' + data.recID);
  }
  clickShowPopupCreate(newsType:string) {
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    let modal =  this.callfc.openForm(PopupAddComponent,'',0,0,'',newsType,'',option);
    modal.closed.subscribe((res:any) => {
      if(res?.event){
        let data = res.event;
        if(data.newsType == this.NEWSTYPE.POST){
          this.lstHotNew.pop();
          this.lstHotNew.unshift(data);
          this.changedt.detectChanges();
        }
        // else
        // {
        //   this.lstVideo.unshift(data);
        //   this.changedt.detectChanges();
        // }
      }
      })
  }

  clickShowPopupSearch() {
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupSearchComponent,"",0,0,"", this.funcID,"",option);
  }



 
}
