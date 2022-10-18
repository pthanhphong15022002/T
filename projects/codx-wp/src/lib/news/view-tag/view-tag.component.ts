import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, CodxListviewComponent, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-view-tag',
  templateUrl: './view-tag.component.html',
  styleUrls: ['./view-tag.component.scss']
})
export class ViewTagComponent extends UIComponent {
  funcID: string = "";
  entityName: string = "WP_News";
  predicate: string = "Category != @0 && (ApproveStatus==@1 or ApproveStatus==null) && Status==@2 && Stop==false ";
  dataValue: string = "companyinfo;5;2";
  predicates: string = "Tags.Contains(@0)"
  dataValues: string = "";
  listViews: any = [];
  listTag: any = [];
  views: Array<ViewModel> = [];
  tagName: string = "";
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listview') listview: CodxListviewComponent;

  constructor
    (
      private injector: Injector
    ) {
    super(injector);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelContent,
        }
      },
    ];
    this.listview.dataService.setPredicates([this.predicates], [this.dataValues]).subscribe();

    this.detectorRef.detectChanges();
  }

  onInit() {
    this.funcID = this.router.snapshot.params["funcID"];
    this.tagName = this.router.snapshot.params["tagName"];
    this.dataValues = this.tagName;
    this.loadDataAsync();

    // this.router.params.subscribe((param:any) => {
    //   if(param){
    //     this.funcID = param['funcID'];
    //     this.tagName = param['tagName'];
    //     this.dataValues = this.tagName;
    //     if(this.view){
    //       this.view.dataService.setPredicates([this.predicates],[this.dataValues]);
    //       this.view.load();
    //     }
    //   }
    // })
  }

  loadDataAsync() {
    this.loadDataViews();
    this.loadDataTags();
  }
  loadDataViews() {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetNewOderByViewAsync")
      .subscribe((res: any) => {
        if (res) {
          this.listViews = res;
        }
        else { this.listViews = []; }
        this.detectorRef.detectChanges();
      });
  }
  loadDataTags() {
    this.api
      .execSv('BS', 'ERM.Business.BS', 'TagsBusiness', 'GetModelDataAsync', this.entityName)
      .subscribe((res: any) => {
        if (res) {
          this.listTag = res.datas;
        }
        else {
          this.listTag = [];
        }
        this.detectorRef.detectChanges();
      });
  }
  clickViewDeital(data: any) {
    this.api.execSv
      (
        "WP",
        "ERM.Business.WP",
        "NewsBusiness",
        "UpdateViewNewsAsync",
        data.recID).subscribe(
          (res) => {
            if (res) {
              this.codxService.navigate("", '/wp/news/' + this.funcID + '/' + data.category + '/' + data.recID);
            }
          });
  }
  clickTag(tag: any) {
    if (tag && tag.text) {
      this.dataValues = tag.text;
      this.codxService.navigate('', '/wp/news/' + this.funcID + '/tag/' + this.dataValues)
      this.listview.dataService.setPredicates([this.predicates], [this.dataValues]).subscribe();
    }
  }
  clickShowPopupCreate() {
  }

}
