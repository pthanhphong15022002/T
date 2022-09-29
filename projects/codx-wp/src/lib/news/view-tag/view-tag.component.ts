import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, CodxListviewComponent } from 'codx-core';

@Component({
  selector: 'lib-view-tag',
  templateUrl: './view-tag.component.html',
  styleUrls: ['./view-tag.component.scss']
})
export class ViewTagComponent implements OnInit {
  funcID = "";
  entityName = "WP_News";
  predicate = "Category != @0 && (ApproveStatus==@1 or ApproveStatus==null) && Status==@2 && Stop==false";
  dataValue = "companyinfo;5;2";
  predicates:any = ["Tags.Contains(@0)"];
  dataValues:any;
  sortColumns = "CreatedOn";
  sortDirections = "desc";
  listViews = [];
  listTag = [];
  views: Array<ViewModel> = [];
  tagName:string = "";
  @ViewChild('listview') codxListView: any;
  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;

  constructor(private api:ApiHttpService,
    private codxService:CodxService,
    private route:ActivatedRoute,
    private callfc:CallFuncService,
    private changedt: ChangeDetectorRef) { }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeft,
        }
      },
    ];
    // this.codxListView.dataService.setPredicates(this.predicates,this.dataValues).subscribe();
    this.changedt.detectChanges();
  }

  ngOnInit(): void {
    this.route.params.subscribe((param:any) => {
      if(param){
        this.funcID = param['funcID'];
        this.tagName = param['tagName'];
        this.dataValues = [this.tagName];
        if(this.codxListView){
          this.codxListView.dataService.setPredicates(this.predicates,this.dataValues).subscribe();
        }
        this.loadData();
      }
      
    })
  }

  loadData(){
    this.loadDataViews();
    this.loadDataTags();
  }
  loadDataViews(){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetNewOderByViewAsync")
    .subscribe((res:any) => {
      if(res) { this.listViews = res; }
      else { this.listViews = []; }
      this.changedt.detectChanges();
    });
  }
  loadDataTags(){
    this.api
      .exec<any[]>('BS', 'TagsBusiness', 'GetModelDataAsync', this.entityName)
      .subscribe((res: any) => {
        if (res) {
          this.listTag = res.datas;
        }
        else{
          this.listTag = [];
        }
        this.changedt.detectChanges();
      });
  }
  clickViewDeital(data:any){
    this.api.execSv("WP", 
    "ERM.Business.WP",
    "NewsBusiness",
    "UpdateViewNewsAsync",
    data.recID).subscribe(
      (res) => {
        if (res) {
          this.codxService.navigate('', '/wp/news/'+this.funcID+'/'+data.category+'/'+data.recID);
        }
      });
  }
  clickTag(tag:any){
    this.codxService.navigate('', '/wp/news/' + this.funcID + '/tag/' + tag.value);
  }
  clickShowPopupCreate(){
  }

}
