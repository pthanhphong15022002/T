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
import { Permission } from '@shared/models/file.model';
import { Post } from '@shared/models/post';

import {
  CodxListviewComponent,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogRef,
  DialogModel,
  CRUDService,
  RequestOption,
  CodxService,
  Util,
  FormModel,
  AuthService,
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
  service = 'WP';
  assemblyName = 'ERM.Business.WP';
  className = 'CommentsBusiness';
  method = 'GetListPostAsync';
  user: any;
  showEmojiPicker = false;
  dataVll = [];
  title: string = '';
  strEmtyData: string = '';
  function: any = null;
  defaultMoreFC: any[] = [];
  gridViewSetup: any = null;
  predicateWP: string = '';
  dataValueWP: string = '';
  predicateFD: string = 'Category =@0 && Stop=false';
  dataValueFD: string = '3';
  lstData: any;
  lstUserShare: any[] = [];
  lstUserTag: any = [];
  CARDTYPE_EMNUM = {
    Commendation: '1',
    Thankyou: '2',
    CommentForChange: '3',
    SuggestionImprovement: '4',
    Share: '5',
    Congratulation: '6',
    Radio: '7',
  };
  CATEGORY = {
    POST: '1',
    COMMENTS: '2',
    FEEDBACK: '3',
    SHARE: '4',
  };

  @Input() funcID: string = '';
  @Input() dataService: CRUDService = null;
  @Input() objectID: string = '';
  @Input() predicates: any;
  @Input() dataValues: any;
  @Input() isShowCreate = true;
  @Input() module: 'WP' | 'FD' = 'WP';
  @Input() formModel: FormModel = null;
  @Input() formName: string = '';
  @Input() gridViewName: string = '';
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
    private codxShareSV: CodxShareService
  ) {}
  ngAfterViewInit() {}

  ngOnInit(): void {
    this.user = this.authStore.userValue;
    this.getSetUp('WP');
    this.getValueList();
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
  getSetUp(funcID: string) {
    if (funcID) {
      // get function
      this.cache.functionList(funcID).subscribe((func) => {
        if (func) {
          this.function = func;
          this.formModel = new FormModel();
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
  }
  changeMoreFunction(arrMoreFc) {
    // set moreFucntion
    if (arrMoreFc) {
      arrMoreFc.forEach((x: any) => {
        if (
          x.functionID == 'WP000' ||
          !this.defaultMoreFC.some((e) => e.functionID == x.functionID)
        ) {
          x.disabled = true;
        }
      });
    }
  }
  clickMF(event: any, post: any) {
    if (event && post) {
      switch (event.functionID) {
        case 'WP001': // cập nhật
          this.openPopupEdit(post);
          break;
        case 'WP002': // xóa
          this.removePost(post);
          break;
        case 'WP003': // chia sẻ
          this.openPopupShare(post);
          break;
        case 'WP004': // lưu vào sổ tay
          this.openPopupSave(post);
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
  removePost(data: any) {
    // xóa bài viết
    if (data) {
      (this.listview.dataService as CRUDService)
        .delete(
          [data],
          true,
          (op: any) => this.beforDelete(op, data),
          '',
          'WP022',
          '',
          'WP023'
        )
        .subscribe((res) => {
          if (res) {
            if (data.files) {
              //xóa files
              this.api
                .execSv(
                  'DM',
                  'ERM.Business.DM',
                  'FileBussiness',
                  'DeleteByObjectIDAsync',
                  [data.recID, 'WP_Comments', true]
                )
                .subscribe();
            }
          }
        });
    }
  }
  //tạo bài viết
  openPopupAdd() {
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
      if (res?.event?.recID) {
        (this.listview.dataService as CRUDService).add(res.event).subscribe();
        this.notifySvr.notifyCode('WP024');
      }
    });
  }
  // edit bài viết
  openPopupEdit(post: any) {
    let headerText = 'Chỉnh sửa bài viết';
    let data = JSON.parse(JSON.stringify(post));
    let obj = {
      data: data,
      status: 'edit',
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
      if (res?.event?.recID) {
        (this.listview.dataService as CRUDService)
        .update(res.event).subscribe();
        this.notifySvr.notifyCode('WP021');
      }
    });
  }
  // share bài viết
  openPopupShare(post: any) {
    if (post) 
    {
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
        if (res?.event?.recID) {
          (this.listview.dataService as CRUDService).add(res.event).subscribe();
          this.notifySvr.notifyCode('WP020');
        }
      });
    }
  }
  // lưu trữ bài viết
  openPopupSave(post: any) {
    if (post) {
      let data = JSON.parse(JSON.stringify(post));
      let headerText = 'Thêm vào kho lưu trữ';
      var obj = {
        data: data,
        headerText: headerText,
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.listview.formModel;
      this.callFC.openForm(PopupSavePostComponent, '', 500, 400, '', obj, '');
    }
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
          this.codxService.navigate(
            '',
            'wp/news/WPT02/' + data.category + '/' + data.recID
          );
        }
      });
  }
  getFiles(event: any, data: any) {
    if (!event || !data) return;
    data.files = event;
  }
  clickViewDetail(file: any){
    if (file) {
      let _data = {
        postID:file.objectID,
        fileID:file.recID,
        fileReferType:file.referType
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.listview.formModel;
      option.IsFull = true;
      this.callFC.openForm(
        PopupDetailComponent,
        '',
        0,
        0,
        '',
        _data,
        '',
        option
      );
    }
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
