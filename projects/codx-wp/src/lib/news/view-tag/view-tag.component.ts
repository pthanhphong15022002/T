import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, CodxListviewComponent, UIComponent, DialogModel } from 'codx-core';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';

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
  userPermission:any = null;

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
    this.detectorRef.detectChanges();
  }

  onInit() {
    this.funcID = this.router.snapshot.params["funcID"];
    this.tagName = this.router.snapshot.params["tagName"];
    this.dataValues = this.tagName;
    this.loadDataAsync();
    this.getUserPermission(this.funcID);
  }
  getUserPermission(funcID:string){
    if(funcID){
      let funcIDPermission  = funcID + "P";
      this.api.execSv("SYS","ERM.Business.SYS","CommonBusiness","GetUserPermissionsAsync",[funcIDPermission])
      .subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
    }
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

  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  clickShowPopupCreate(newsType: string) {
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupAddComponent, '', 0, 0, '', { type: newsType }, '', option);
  }

  clickShowPopupSearch() {
    let option = new DialogModel();
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", { funcID: this.funcID }, "", option);
  }
}
