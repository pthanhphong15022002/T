import { Component, HostBinding, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewModel, ViewType, DialogModel, UIComponent } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { WP_Comments } from '../../models/WP_Comments.model';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';

@Component({
  selector: 'wp-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewsDetailComponent extends UIComponent {
  @HostBinding('class') get class() {
    return "bg-body h-100 news-main card-body hover-scroll-overlay-y news-detail";
  }
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  entityName: string = "WP_News";
  category: string = "";
  recID: string = "";
  funcID: string = "";
  data: any;
  listViews = [];
  listTag = [];
  listNews = [];
  views: Array<ViewModel> = [];
  userPermission:any = null;
  isShowTemplateShare = false;

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(
    private injector:Injector,
    private sanitizer: DomSanitizer
  ) {
    super(injector);
  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      this.recID = param["recID"];
      this.category = param["category"];
      this.funcID = param["funcID"];
      this.loadData(this.recID);
      this.getUserPermission(this.funcID);
      this.getDataTagAsync("WP_News");
    });
    
    
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      },
    ];
    this.detectorRef.detectChanges();
  }
  loadData(recID: string) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetNewsInforAsync", recID)
    .subscribe(
      (res) => {
        if (res) {
          this.data = res[0];
          this.data.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
          this.listViews = res[1];
          this.listNews = res[2];
        }
      }
    );
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
  getDataTagAsync(entityName:string){
    if(entityName){
      this.api
      .exec<any[]>('BS', 'TagsBusiness', 'GetModelDataAsync', [entityName])
      .subscribe((res: any) => {
        if (res) {
          this.listTag = res.datas;
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  //click view detail post
  clickViewDeital(data: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "UpdateViewNewsAsync", data.recID)
    .subscribe(
      (res) => {
        if (res) {
          this.codxService.navigate('', `wp2/news/${this.funcID}/${data.category}/${data.recID}`);
          this.loadData(data.recID);
        }
      });
  }
  // navigate view post by tag
  clickTag(tag: any) {
    this.codxService.navigate('', `wp2/news/${this.funcID}/tag/${tag.value}`);
  }
  // add
  openPopupAdd(newsType: string) {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupAddComponent, '', 0, 0, '', newsType , '', option);
    }
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
  // open popup share
  openPopupShare(post: any) {
    if (post)
    {
      let _data = new WP_Comments();
      _data.news = JSON.parse(JSON.stringify(post));
      _data.refID = post.recID;
      let _obj = {
        data: _data,
        refType: "WP_News",
        status: 'share',
        headerText: 'Chia sẻ bài viết',
      };
      let _option = new DialogModel();
      _option.FormModel = this.view.formModel;
      this.callfc.openForm(PopupAddPostComponent, '', 650, 550, '', _obj, '', _option);
    }
    
  }
  showListShare(){
    this.isShowTemplateShare = !this.isShowTemplateShare;
  }
  closeListShare(){
    this.isShowTemplateShare = false;
  }
}
