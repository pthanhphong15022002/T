import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ViewModel, ViewsComponent, CodxListviewComponent, ApiHttpService, CodxService, CallFuncService, CacheService, DataRequest, ViewType, SidebarModel, DialogRef, DialogModel } from 'codx-core';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  dialogRef: any;
  functionID = 'WPT02';
  entityName = 'WP_News';
  gridViewName = 'grvNews';
  fromName = 'News';
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness"
  method = "GetListNewsAsync";
  predicate = "";
  dataValue = "5;null;2;";
  sortColumns = 'CreatedOn';
  sortDirections = 'desc';
  newsItem: any;
  listNews = [];
  listSlider = [];
  isHome = true;
  userPermission: any;
  isAllowNavigationArrows = true;
  views: Array<ViewModel> = [];
  funcID = "";
  countCarousel = 3;
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  CATEGORY = {
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

  constructor(
    private api: ApiHttpService,
    public codxService: CodxService,
    private route: ActivatedRoute,
    private changedt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private cache: CacheService
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
      var category = params["category"];
      this.funcID = this.route.snapshot.params["funcID"];
      switch (category) {
        case "home":
          this.dataValue ="0;1;5;2;comanyinfo";
          this.predicate = "(ApproveControl=@0 || (ApproveControl=@1 && ApproveStatus =@2 )) && Status =@3 && Category !=@4";
          break;
        default:
          this.isHome = false;
          this.dataValue ="0;1;5;2;"+category;
          this.predicate = "(ApproveControl=@0 || (ApproveControl=@1 && ApproveStatus = @2)) && Status =@3 && Category =@4";
          break
      }
      this.loadData();
    })
  }


  loadData() {
    var model1 = new DataRequest();
    model1.funcID = this.functionID;
    model1.predicate = this.predicate;
    model1.dataValue = this.dataValue;
    model1.predicates = 'NewsType = @0';
    model1.dataValues = '1';
    model1.pageLoading = true;
    model1.page = 1;
    model1.pageSize = 4;
    model1.formName = this.fromName;
    model1.gridViewName = this.gridViewName;
    model1.entityName = this.entityName;
    model1.srtColumns = this.sortColumns;
    model1.srtDirections = this.sortDirections;
    model1.dataObj = 'list';
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetListNewsAsync',
        model1
      )
      .subscribe((res1:any[]) => {
        if (res1) {
          this.listNews = res1[0];
          this.changedt.detectChanges();
        }

      });
    var model2 = new DataRequest();
    model2.funcID = this.functionID;
    model2.predicate = this.predicate;
    model2.dataValue = this.dataValue;
    model2.predicates = 'NewsType = @0';
    model2.dataValues = '2';
    model2.pageLoading = true;
    model2.page = 1;
    model2.pageSize = 6;
    model2.formName = this.fromName;
    model2.gridViewName = this.gridViewName;
    model2.entityName = this.entityName;
    model2.srtColumns = this.sortColumns;
    model2.srtDirections = this.sortDirections;
    model2.dataObj = 'list';
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetListNewsAsync',
        model2
      )
      .subscribe((res2) => {
        if (res2) {
          if (res2[0].length <= this.countCarousel) {
            this.isAllowNavigationArrows = false;
            this.carousel?.pause();
          }
          this.listSlider.push(res2[0].splice(0, 3));
          this.listSlider.push(res2[0]);
          this.changedt.detectChanges();
        }
      });

  }
  searchEvent(event: any) { }

  clickViewDeital(data: any) {
    this.api
    .execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'UpdateViewNewsAsync',
      data.recID
    )
    .subscribe((res:any) => {
      if(res){
        this.codxService.navigate('','/wp/news/'+this.funcID + '/' + data.category +'/' + data.recID);
      }
    });
  }
  clickShowPopupCreate(newsType:string) {
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupAddComponent,'',0,0,'',newsType,'',option);
  }

  clickShowPopupSearch() {
    this.dialogRef = this.callfc.openForm(PopupSearchComponent, "Tìm kiếm", 900, 700);
  }

  clickClosePopup() {
    this.loadData();
  }


 
}
