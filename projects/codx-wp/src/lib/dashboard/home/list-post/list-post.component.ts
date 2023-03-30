import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '@shared/models/post';

import {
  CodxListviewComponent,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogModel,
  CRUDService,
  RequestOption,
  CodxService,
  Util,
  FormModel,
  AuthService,
  SortModel,
  AuthStore,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { WP_Comments } from '../../../models/WP_Comments.model';
import { PopupAddPostComponent } from './popup-add/popup-add-post.component';
import { PopupDetailComponent } from './popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './popup-save/popup-save.component';

@Component({
  selector: 'app-list-post',
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPostComponent implements OnInit, AfterViewInit {

  @Input() funcID: string = '';
  @Input() objectID: string = '';
  @Input() predicate: any;
  @Input() dataValue: any;
  @Input() predicates: any;
  @Input() dataValues: any;
  @Input() isShowCreate = true;
  @Input() moreFuncTmp: TemplateRef<any> = null;
  @ViewChild('listview') listview: CodxListviewComponent;


  user: any;
  dataService: CRUDService = null;
  formModel:FormModel = null;
  gridViewSetup: any = null;
  mssgPlaceHolder: string = '';
  strEmtyData: string = '';
  CATEGORY = {
    POST: '1',
    COMMENTS: '2',
    FEEDBACK: '3',
    SHARE: '4',
  };
  constructor(
    private injector: Injector,
    private api: ApiHttpService,
    private cache: CacheService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private codxService: CodxService,
    private codxShareSV: CodxShareService,
    private route:ActivatedRoute

  ) 
  {
    this.dataService = new CRUDService(this.injector);
    this.formModel = new FormModel();
    this.user = this.authStore.get();
  }
  ngAfterViewInit() {}

  ngOnInit(): void {
    // get queryParam từ URL set predicates
    this.route.queryParamMap.subscribe((res:any) => {
      if(res.params.predicate && res.params.dataValue)
      {
        this.dataService.predicates = res.params.predicate;
        this.dataService.dataValues = res.params.dataValue;
      }
    });
    // set predicate - sort
    this.dataService.predicate = this.predicate;
    this.dataService.dataValue = this.dataValue;
    let arrSort:SortModel[] = [{ field : "CreatedOn",dir:"desc"}];
    this.dataService.setSort(arrSort);
    this.dataService.pageSize = 20;
    this.getSetting();
    this.refreshAvatar();
  }

  refreshAvatar() {
    //Nguyên thêm để refresh avatar khi change
    this.codxShareSV.dataRefreshImage.subscribe((res) => {
      if (res) {
        this.user['modifiedOn'] = res?.modifiedOn;
        this.dt.detectChanges();
      }
    });
  }

  //get thiết lập
  getSetting() {
    this.cache.message('WP011').subscribe((mssg: any) => {
      if (mssg){
        this.mssgPlaceHolder = Util.stringFormat(mssg.defaultName, this.user.userName);
      }
    });
    this.cache.message('WP035').subscribe((mssg: any) => {
      if (mssg) {
        this.strEmtyData = mssg.defaultName;
      }
    });
    // get function - formModel 
    this.cache.functionList('WP')
    .subscribe((func) => {
      if (func) {
        this.formModel.funcID = func.functionID;
        this.formModel.formName = func.formName;
        this.formModel.gridViewName = func.gridViewName;
        this.formModel.entityName = func.entityName;
        // get gridviewSetup
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            if (grd) {
              this.gridViewSetup = grd;
            }
          });
      }
    });
  }
  // click moreFC
  clickMF(event: any, post: any) {
    debugger
    if (event && post) {
      switch (event.functionID) {
        case 'WP001': // cập nhật
          this.editPost(post);
          break;
        case 'WP002': // xóa
          this.deletePost(post);
          break;
        case 'WP003': // chia sẻ
          this.sharePost(post);
          break;
        case 'WP004': // lưu vào sổ tay
          this.savePost(post);
          break;
        default:
          break;
      }
    }
  }

  beforDelete(option: RequestOption, data: any) {
    if (!option || !data) return false;
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'CommentsBusiness';
    option.methodName = 'DeletePostAsync';
    option.data = data;
    return true;
  }
  // xóa bài viết
  deletePost(data: any) {
    if (data) {
      (this.listview.dataService as CRUDService)
        .delete([data],true,(op: any) => this.beforDelete(op, data),'','WP022','','WP023')
        .subscribe();
    }
  }

  // tạo bài viết
  addPost() {
    let data = new Post();
    let headerText = 'Tạo bài viết'; 
    var obj = {
      data: data,
      status: 'create',
      headerText: headerText,
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    let popup = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      550,
      '',
      obj,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if (res?.event) {
        (this.listview.dataService as CRUDService).add(res.event).subscribe();
      }
    });
  }

  // edit bài viết
  editPost(post: any) {
    let headerText = 'Chỉnh sửa bài viết';
    let data = JSON.parse(JSON.stringify(post));
    let obj = {
      data: data,
      status: 'edit',
      headerText: headerText,
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.formModel;
    let popup = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      550,
      '',
      obj,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if (res?.event) {
        (this.listview.dataService as CRUDService)
        .update(res.event).subscribe();
      }
    });
  }
  
  // share bài viết
  sharePost(post: any) {
    if (post) {
      let data = new WP_Comments();
      data.refID = post.recID;
      data.shares = JSON.parse(JSON.stringify(post));
      let headerText = 'Chia sẻ bài viết';
      var obj = {
        data: data,
        status: 'share',
        refType:'WP_Comments',
        headerText: headerText,
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      let popup = this.callFC.openForm(
        PopupAddPostComponent,
        '',
        700,
        550,
        '',
        obj,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res?.event) {
          (this.listview.dataService as CRUDService).add(res.event).subscribe();
        }
      });
    }
  }
  // lưu trữ bài viết
  savePost(post: any) {
    if (post) {
      let data = JSON.parse(JSON.stringify(post));
      let headerText = 'Thêm vào kho lưu trữ';
      var obj = {
        data: data,
        headerText: headerText,
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      this.callFC.openForm(PopupSavePostComponent, '', 500, 400, '', obj, '');
    }
  }

  // xem chi tiết bài viết
  naviagteWPNew(data: any) {
    if (data){
      //cập nhật số lượng view
      this.api
      .execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'UpdateViewNewsAsync',
      [data.recID])
      .subscribe();
      // naviagte qua WP_News
      let url = `wp2/news/WPT02/${data.category}/${data.recID}`;
      this.codxService.navigate('',url);
    }
  }

  //xem chi tiết bài viết
  clickViewDetail(file: any){
    if (file){
      let data = {
        objectID:file.objectID,
        recID:file.recID,
        referType:file.referType
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      option.IsFull = true;
      option.zIndex = 999;
      this.callFC.openForm(
        PopupDetailComponent,
        '',
        0,
        0,
        '',
        data,
        '',
        option
      );
    }
  }
  //click xem thêm 
  viewMore(item){
    item.isShowShortContent = !item.isShowShortContent; 
  }
  
}
