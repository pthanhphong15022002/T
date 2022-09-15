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
  // lstType = this.env.jsonType;
  dataVll = [];
  title: string = '';
  tagUsers: any = [];
  searchField = '';
  checkFormAddPost = false;
  predicate ='(ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)) && Stop =false && Category !=@3';
  dataValue: any = '0;1;5;2';

  modal: DialogRef;
  headerText = '';
  views: Array<ViewModel> | any = [];

  @Input() objectID:string = "";
  @Input() predicates = '';
  @Input() dataValues = '';
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @Input() isShowCreate = true;

  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notifySvr: NotificationsService,
    private codxService: CodxService
  ) {
    
  }
  lstData:any;
  ngOnInit() {
    this.user = this.authStore.get();
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
    this.cache.valueList('L1901').subscribe((res: any) => {
      if (res) {
        this.dataVll = res.datas;
      }
    });
    this.cache.message('WP011').subscribe((mssg: any) => {
      this.title =  Util.stringFormat(mssg.defaultName,this.user.userName);
    });

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.getGridViewSetUp();
  }

  getGridViewSetUp() {
    this.cache
      .functionList(this.codxViews.formModel.funcID)
      .subscribe((func) => {
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            this.headerText = grd['Comments']?grd['Comments']['headerText']: "";
            this.dt.detectChanges();
          });
      });
  }

  beforDelete(option:RequestOption,data:any){
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "CommentsBusiness";
    option.methodName = "DeletePostAsync";
    option.data = data;
    return true;
  }
  removePost(data: any) {
    (this.listview.dataService as CRUDService).
    delete([data],true,(op:any)=>this.beforDelete(op,data)).
    subscribe((res) => {
      if (res) {
        if(data.files){
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

  openCreateModal() {
    var obj = {
      status: 'create',
      headerText: 'Tạo bài viết',
      lstView: this.listview,
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(
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
    let dataEdit = { ...data };
    let obj = {
      post: dataEdit,
      status: 'edit',
      headerText: 'Chỉnh sửa bài viết',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(
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
    var obj = {
      post: data,
      status: 'share',
      headerText: 'Chia sẻ bài viết',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(
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
  openModalDownload(data: any){
    var obj = {
      post: data,
      headerText: 'Thêm vào kho lưu trữ',
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.callfc.openForm(PopupSavePostComponent, '', 300, 200, '', obj, '');
  }
  pushComment(data: any) {
    this.listview.dataService.data.map((p) => {
      if (p.recID == data.refID) {
        p.listComment.push(data);
        return;
      }
    });
  }

  getTagUser(item:any) {
    this.tagUsers = item.listTag;
    this.dt.detectChanges();
  }
  lstUserShare:any[] = [];
  getShareUser(item:any) {
    if(item.shareControl=='U' ||
      item.shareControl=='G' || item.shareControl=='R' ||
      item.shareControl=='P' || item.shareControl=='D' ||
      item.shareControl=='O')
      {
        item.isShowShare = !item.isShowShare;
        this.lstUserShare = item.listShare;
        this.dt.detectChanges();
    }
  }


  closeListShare(item:any){
    if(item.isShowShare){
      item.isShowShare = false;
    }
  }
  naviagte(data: any) {
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
    data.files = event;
  }
  clickViewDetail(file:any){
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupDetailComponent,'',0,0,'',file,'',option);
  }
  clickShowComment(data:any){
    data.isShowComment = !data.isShowComment;
    this.dt.detectChanges();
  }
  replyTo(data:any) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }
  replyComment(data:any) {
    
  }
  sendComment(data:any){
    
  }
}
