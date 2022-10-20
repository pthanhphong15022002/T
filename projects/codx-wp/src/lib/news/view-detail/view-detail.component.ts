import { Component, HostBinding, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewModel, ViewType, DialogModel, UIComponent } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewDetailComponent extends UIComponent {
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

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(
    private injector:Injector,
    private sanitizer: DomSanitizer
  ) {
    super(injector);
  }
  onInit(): void {
    this.recID = this.router.snapshot.params["recID"];
    this.category = this.router.snapshot.params["category"];
    this.funcID = this.router.snapshot.params["funcID"];
    this.loadData(this.recID);
    this.getUserPermission(this.funcID);
    this.getDataTagAsync("WP_News");
    this.detectorRef.detectChanges();
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
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetNewsInforAsync", recID).subscribe(
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
  clickViewDeital(data: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "UpdateViewNewsAsync", data.recID).subscribe(
      (res) => {
        if (res) {
          this.codxService.navigate('', '/wp/news/' + this.funcID + '/' + data.category + '/' + data.recID);
          this.loadData(data.recID);
        }
      });
  }
  clickTag(tag: any) {
    this.codxService.navigate('', '/wp/news/' + this.funcID + '/tag/' + tag.value);
  }

  

  searchField: string = "";
  tagUsers: any;
  show() {
    if (this.searchField == '' || this.searchField == null) return true;
    for (let index = 0; index < this.tagUsers.length; index++) {
      const element: any = this.tagUsers[index];
      if (
        element.objectName != null &&
        element.objectName
          .toLowerCase()
          .includes(this.searchField.toLowerCase())
      ) {
        return true;
      }
    }
    return false;
  }
  getShareUser(shareControl, commentID) {
    if (shareControl == '1') {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareOwnerListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) this.tagUsers = res;
        });
    } else {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareUserListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) {
            this.tagUsers = res;
          }
        });
    }
  }
  clickShowPopupCreate(newsType: string) {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupAddComponent, '', 0, 0, '', { type: newsType }, '', option);
    }
  }
  clickShowPopupSearch() {
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(PopupSearchComponent, "", 0, 0, "", { funcID: this.view.funcID }, "", option);
    }
  }
  clickPopupShare(data: any) {
    if (!data) return;
    var obj = {
      post: data,
      refType: "WP_News",
      status: 'share',
      headerText: 'Chia sẻ bài viết',
    };
    let option = new DialogModel();
    option.FormModel = this.view.formModel;
    this.callfc.openForm(PopupAddPostComponent, '', 650, 550, '', obj, '', option);
  }
}
