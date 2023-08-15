import {
  Component,
  HostBinding,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewModel, ViewType, DialogModel, UIComponent } from 'codx-core';
import { WP_Comments } from '../../models/WP_Comments.model';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';
import { PopupAddCommentComponent } from '../popup/popup-add-comment/popup-add-comment.component';
import { Post } from '@shared/models/post';

@Component({
  selector: 'wp-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsDetailComponent extends UIComponent {
  @HostBinding('class') get class() {
    return 'bg-body h-100 news-main card-body scroll-y news-detail';
  }
  NEWSTYPE = {
    POST: '1',
    VIDEO: '2',
  };
  entityName: string = 'WP_News';
  category: string = '';
  recID: string = '';
  funcID: string = '';
  data: any;
  listViews = [];
  listTag = [];
  listNews = [];
  views: Array<ViewModel> = [];
  userPermission: any = null;
  moreFunction: any = null;

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(private injector: Injector) {
    super(injector);
  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      this.recID = param['recID'];
      this.category = param['category'];
      this.funcID = param['funcID'];
      this.loadData(this.recID, this.category);
      this.getUserPermission(this.funcID);
      this.getDataTagAsync('WP_News');
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) this.moreFunction = mFuc;
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
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

 
  //load data
  loadData(recID: string, category: string) {
    this.getData(recID);
    this.getSubData(recID,category);
  }
  getData(recID: string) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetPostByIDAsync', [
        recID,
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res;
          this.detectorRef.detectChanges();
        }
      });
  }
  //get data order view + created
  getSubData(recID:string,category: string) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetSubDataAsync', [recID,category])
      .subscribe((res: any) => {
        if (res) {
          this.listViews = res[0];
          this.listNews = res[1];
          this.detectorRef.detectChanges();
        }
      });
  }
  // get permisison
  getUserPermission(funcID: string) {
    if (funcID) {
      let funcIDPermission = funcID + 'P';
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'CommonBusiness',
          'GetUserPermissionsAsync',
          [funcIDPermission]
        )
        .subscribe((res: any) => {
          if (res) {
            this.userPermission = res;
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  // get data tags
  getDataTagAsync(entityName: string) {
    if (entityName) {
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
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          this.codxService.navigate(
            '',
            `wp2/news/${this.funcID}/${data.category}/${data.recID}`
          );
          this.loadData(data.recID, this.category);
        }
      });
  }
  // navigate view post by tag
  clickTag(tag: any) {
    this.codxService.navigate('', `wp2/news/${this.funcID}/tag/${tag.value}`);
  }
  // add
  openPopupAdd(type: string) {
    if (this.view) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let mfc = Array.from<any>(this.moreFunction)?.find(
        (x: any) => x.functionID === 'SYS01'
      );
      let post = new Post();
      if(this.category && this.category != "home")
      {
        post.category = this.category;
      }
      post.newsType = type;
      let data = {
        action: mfc?.defaultName,
        type: type,
        data : post
      };
      this.callfc.openForm(PopupAddComponent, '', 0, 0, '', data, '', option);
    }
  }
  clickShowPopupSearch() {
    if (this.view) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(
        PopupSearchComponent,
        '',
        0,
        0,
        '',
        this.view.funcID,
        '',
        option
      );
    }
  }
  // open popup share
  openPopupShare(data: any) {
    if (data) {
      let mfc = Array.from<any>(this.moreFunction).find(
        (x: any) => x.functionID === 'SYS01'
      );
      let post = new WP_Comments();
      post.shares = JSON.parse(JSON.stringify(data));
      post.refID = data.recID;
      let obj = {
        data: post,
        refType: 'WP_News',
        status: 'share',
        headerText: mfc.defaultName,
      };
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.zIndex = 100;
      this.callfc.openForm(
        PopupAddCommentComponent,
        '',
        700,
        650,
        '',
        obj,
        '',
        option
      );
    }
  }
}
