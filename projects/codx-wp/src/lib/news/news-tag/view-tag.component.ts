import { Component, Injector,TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, ViewType, CodxListviewComponent, UIComponent, DialogModel } from 'codx-core';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';

@Component({
  selector: 'wp-news-tag',
  templateUrl: './news-tag.component.html',
  styleUrls: ['./news-tag.component.scss']
})
export class NewsTagComponent extends UIComponent {
  funcID: string = "";
  entityName: string = "WP_News";
  predicate: string = "Category != @0 && (ApproveStatus==@1 ||  ApproveStatus==@2 || ApproveStatus==null) && Status==@3 && Stop==false ";
  dataValue: string = "companyinfo;1;5;2";
  predicates: string = "Tags.Contains(@0)"
  dataValues: string = "";
  listViews: any = [];
  listTag: any = [];
  views: Array<ViewModel> = [];
  tagName: string = "";
  userPermission:any = null;
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }

  moreFunction:any = null;
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listview') listview: CodxListviewComponent;

  constructor
  (
    private injector: Injector
  ) 
  {
    super(injector);
  }
  onInit() {
    this.router.params.subscribe((param:any) => {
      this.funcID = param["funcID"];
      this.tagName = param["tagName"];
      this.dataValues = this.tagName;
      this.getUserPermission(this.funcID);
      this.loadDataAsync();
    })
    this.cache.moreFunction("CoDXSystem","")
    .subscribe((mFuc:any) => {
      if(mFuc)
      {
        this.moreFunction = mFuc;
      }
    });
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

  
  //
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
  //
  loadDataAsync() {
    this.loadDataViews();
    this.loadDataTags();
  }
  //
  loadDataViews() {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetPostOderByViewAsync")
      .subscribe((res: any) => {
        if (res) {
          this.listViews = res;
        }
        else { this.listViews = []; }
        this.detectorRef.detectChanges();
      });
  }
  //
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
  clickViewDetail(data: any) {
    this.api.execSv(
    "WP",
    "ERM.Business.WP",
    "NewsBusiness",
    "UpdateViewNewsAsync",
    [data.recID])
    .subscribe(
      (res) => {
        if (res) {
          this.codxService.navigate("", `wp2/news/${this.funcID}/${data.category}/${data.recID}`);
        }
      });
  }
  clickTag(tag: any) {
    if (tag && tag.text) {
      this.dataValues = tag.text;
      this.codxService.navigate('', `wp2/news/${this.funcID}/tag/${this.dataValues}`)
      this.listview.dataService.setPredicates([this.predicates], [this.dataValues]).subscribe();
    }
  }

  

  clickShowPopupCreate(type: string) {
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    let mfc = Array.from<any>(this.moreFunction).find((x:any) => x.functionID === "SYS01");
    let data = {
      action: mfc.defaultName,
      type:type
    }
    this.callfc.openForm(PopupAddComponent, '', 0, 0, '', data, '', option);
  }

  clickShowPopupSearch() {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", this.view.funcID, "", option);
    } 
  }
}
