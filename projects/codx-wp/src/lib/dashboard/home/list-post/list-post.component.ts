import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
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

import {
  UploadFile,
  CodxListviewComponent,
  AuthStore,
  TenantStore,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogRef,
  DialogModel,
  CRUDService,
  ViewModel,
  ViewType,
  ViewsComponent,
  RequestOption,
  CodxService,
  Util,
  FormModel,
  UIComponent,
  AuthService,
} from 'codx-core';
import { PopupAddPostComponent } from './popup-add/popup-add.component';
import { PopupDetailComponent } from './popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './popup-save/popup-save.component';

@Component({
  selector: 'app-list-post',
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPostComponent implements OnInit, AfterViewInit {

  service = "WP";
  assemblyName = "ERM.Business.WP"
  className = "CommentsBusiness"
  method = "GetListPostAsync";
  totalPage: number = 0;
  pageIndex = 0;
  user: any;
  dataDetail: any;
  showEmojiPicker = false;
  dataVll = [];
  title: string = '';
  strEmtyData: string = '';

  searchField = '';
  checkFormAddPost = false;
  predicateWP: string = '';
  dataValueWP: string = '';
  predicateFD: string = "Category =@0 && Stop=false";
  dataValueFD: string = "3";
  modal: DialogRef;
  headerText = '';
  lstData: any;
  lstUserShare: any[] = [];
  lstUserTag: any = [];
  CARDTYPE_EMNUM = {
    Commendation: "1",
    Thankyou: "2",
    CommentForChange: "3",
    SuggestionImprovement: "4",
    Share: "5",
    Congratulation: "6",
    Radio: "7"
  };
  CATEGORY = {
    POST: "1",
    COMMENTS: "2",
    FEEDBACK: "3",
    SHARE: "4",
  }
  @Input() funcID: string = "";
  @Input() dataService: CRUDService = null;
  @Input() objectID: string = "";
  @Input() predicates: any;
  @Input() dataValues: any;
  @Input() isShowCreate = true;
  @Input() module: "WP" | "FD" = "WP";
  @Input() formModel: FormModel = null;
  @Input() formName: string = "";
  @Input() gridViewName: string = "";
  @Input() moreFunc: any = null;
  @Input() moreFuncTmp: TemplateRef<any> = null;
  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private authStore: AuthService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private notifySvr: NotificationsService,
    private route: ActivatedRoute,
    private codxService: CodxService,

  ) {
  }
  ngAfterViewInit() {

  }

  ngOnInit(): void {
    this.user = this.authStore.userValue;
    this.getGridViewSetUp("WP");
    this.getValueList();
  }
  getValueList() {
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
        this.dt.detectChanges();
      }
    });
    this.cache.valueList('L1901').subscribe((res: any) => {
      if (res) {
        this.dataVll = res.datas;
        this.dt.detectChanges();
      }
    });
    this.cache.message('WP011').subscribe((mssg1: any) => {
      if (mssg1) {
        this.title = Util.stringFormat(mssg1.defaultName, this.user.userName);
        this.dt.detectChanges();
      }
    });
    this.cache.message('WP035').subscribe((mssg2: any) => {
      if (mssg2) {
        this.strEmtyData = mssg2.defaultName;
        this.dt.detectChanges();
      }
    });
  }
  getGridViewSetUp(funcID: string) {
    if (!funcID) return;
    this.cache
      .functionList(funcID)
      .subscribe((func) => {
        if (func) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.headerText = grd['Comments'] ? grd['Comments']['headerText'] : "";
              }
            });
          this.formModel = new FormModel();
          this.formModel.funcID = funcID;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.formModel.entityName = func.entityName;
        }
      });
  }

  beforDelete(option: RequestOption, data: any) {
    if (!option || !data) return false;
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "CommentsBusiness";
    option.methodName = "DeletePostAsync";
    option.data = data;
    return true;
  }
  removePost(data: any) {
    if (!data) return;
    (this.listview.dataService as CRUDService).
      delete([data], true, (op: any) => this.beforDelete(op, data), '', 'WP022', '', 'WP023').
      subscribe((res) => {
        if (res) {
          if (data.files) {
            this.api.execSv("DM",
              "ERM.Business.DM",
              "FileBussiness",
              "DeleteByObjectIDAsync",
              [data.recID, 'WP_Comments', true]
            ).subscribe();
          }
        }
      });

  }

  openCreateModal() {
    var obj = {
      status: 'create',
      headerText: 'Tạo bài viết',
      lstView: this.listview,
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      550,
      '',
      obj,
      '',
      option
    );

  }
  openEditModal(data: any) {
    if (!data) return;
    let dataEdit = { ...data };
    let obj = {
      post: dataEdit,
      status: 'edit',
      headerText: 'Chỉnh sửa bài viết',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      550,
      '',
      obj,
      '',
      option
    );
  }

  openModalShare(data: any) {
    if (!data) return;
    var obj = {
      post: data,
      status: 'share',
      headerText: 'Chia sẻ bài viết',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      650,
      550,
      '',
      obj,
      '',
      option
    );
  }
  openModalDownload(data: any) {
    if (!data) return;
    var obj = {
      post: data,
      headerText: 'Thêm vào kho lưu trữ',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.callFC.openForm(PopupSavePostComponent, '', 500, 400, '', obj, '');
  }
  pushComment(data: any) {
    if (!data) return;
    this.listview.dataService.data.map((p) => {
      if (p.recID == data.refID) {
        p.listComment.push(data);
        return;
      }
    });
  }

  showListTag(item: any) {
    if (!item || !item.listTag) return;
    item.isShowTag = true;
    this.lstUserTag = item.listTag;
    this.dt.detectChanges();
  }
  showListShare(item: any) {
    if (!item || !item.listShare) return;
    if (item.shareControl == 'U' ||
      item.shareControl == 'G' || item.shareControl == 'R' ||
      item.shareControl == 'P' || item.shareControl == 'D' ||
      item.shareControl == 'O') {
      item.isShowShare = !item.isShowShare;
      this.lstUserShare = item.listShare;
      this.dt.detectChanges();
    }
  }
  closeListShare(item: any) {
    if (!item) return;
    if (item.isShowShare) {
      item.isShowShare = false;
      this.dt.detectChanges();
    }
  }
  closeListTag(item: any) {
    if (!item) return;
    if (item.isShowTag) {
      item.isShowTag = false;
      this.dt.detectChanges();
    }
  }
  naviagteWPNew(data: any) {
    if (!data || !data.recID || !data.category) return;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewNewsAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          this.codxService.navigate('', "wp/news/WPT02/" + data.category + '/' + data.recID);
        }
      });
  }
  getFiles(event: any, data: any) {
    if (!event || !data) return;
    data.files = event;
  }
  clickViewDetail(file: any) 
  {
    if (!file) return;
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    option.IsFull = true;
    this.callFC.openForm(PopupDetailComponent, '', 0, 0, '', file, '', option);
  }
  clickShowComment(data: any) {
    data.isShowComment = !data.isShowComment;
    this.dt.detectChanges();
  }
  replyTo(data: any) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }
}
