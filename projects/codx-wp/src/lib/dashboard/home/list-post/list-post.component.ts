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
  DialogModel,
  CRUDService,
  RequestOption,
  CodxService,
  Util,
  FormModel,
  SortModel,
  AuthStore,
} from 'codx-core';
import { WP_Comments } from '../../../models/WP_Comments.model';
import { PopupAddPostComponent } from './popup-add/popup-add-post.component';
import { PopupDetailComponent } from './popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './popup-save/popup-save.component';


const SHARECONTROLS = {
  OWNER: '1',
  MYGROUP: '2',
  MYTEAM: '3',
  MYDEPARMENTS: '4',
  MYDIVISION: '5',
  MYCOMPANY: '6',
  EVERYONE: '9',
  OGRHIERACHY: 'O',
  DEPARMENTS: 'D',
  POSITIONS: 'P',
  ROLES: 'R',
  GROUPS: 'G',
  USER: 'U',
};
const MEMBERTYPE = {
  CREATED: '1',
  SHARE: '2',
  TAGS: '3',
};
@Component({
  selector: 'app-list-post',
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPostComponent implements OnInit, AfterViewInit {

  @Input() funcID: string = '';
  @Input() objectID: string = '';
  @Input() method: string = '';
  @Input() predicate: any;
  @Input() dataValue: any;
  @Input() predicates: any;
  @Input() dataValues: any;
  @Input() isShowCreate = true;
  @Input() moreFuncTmp: TemplateRef<any> = null;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild("tmpCBBShare") CBBShare:TemplateRef<any>;

  user: any;
  dataService: CRUDService = null;
  function:any = null;
  sysMoreFunc:any = null;
  formModel:FormModel = null;
  gridViewSetup: any = null;
  mssgPlaceHolder: string = '';
  mssgWP035: string = '';
  mssgWP038: string = '';

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
    private route:ActivatedRoute

  ) 
  {
    this.dataService = new CRUDService(this.injector);
    this.user = this.authStore.get();
  }
  ngAfterViewInit() {}

  ngOnInit(): void {
    // get queryParam từ URL set predicates
    this.route.queryParamMap.subscribe((res:any) => {
      if(res?.params?.predicate && res?.params?.dataValue)
      {
        this.dataService.setPredicates([res.params.predicate],[res.params.dataValue]);
      }
    });
    // set dataService
    this.dataService.service = "WP";
    this.dataService.assemblyName = "ERM.Business.WP";
    this.dataService.className = "CommentsBusiness";
    this.dataService.method = this.method || "GetListPostAsync";
    this.dataService.predicate = this.predicate;
    this.dataService.dataValue = this.dataValue;
    let arrSort:SortModel[] = [{ field : "CreatedOn",dir:"desc"}];
    this.dataService.setSort(arrSort);
    this.dataService.pageSize = 20;
    this.getSetting();
  }

  //get thiết lập
  getSetting() {
    // placeholder {0} bạn đang nghĩ gì
    this.cache.message('WP011').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgPlaceHolder = Util.stringFormat(mssg.customName, this.user.userName);
    });
    // mesage không có dữ liệu
    this.cache.message('WP035').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgWP035 = mssg.customName;
    });
    // message bài viết đang được xét duyệt
    this.cache.message('WP038').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgWP038 = mssg.customName;
    });
    // get function - formModel - gridviewSetup
    this.cache.functionList('WP')
    .subscribe((func) => {
      if (func) 
      {
        this.function = func;
        this.formModel = new FormModel();
        this.formModel.funcID = func.functionID;
        this.formModel.formName = func.formName;
        this.formModel.gridViewName = func.gridViewName;
        this.formModel.entityName = func.entityName;
        this.cache.gridViewSetup(func.formName, func.gridViewName)
        .subscribe((grd: any) => {
          this.gridViewSetup = grd;
        });
        // get more funtion hệ thống
        this.cache.moreFunction(func.formName,func.gridViewName)
        .subscribe((mFuc:any) => {
          this.sysMoreFunc = mFuc;
        });
      }
    });

    
  }
  // click moreFC
  clickMF(event: any, post: any) {
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

  // tạo bài viết
  addPost() {
    let moreFuc = this.sysMoreFunc.find(x => x.functionID === "WP000");
    var obj = {
      status: 'create',
      headerText: `${moreFuc.customName} ${this.function.customName}`,
      data: new Post()
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    option.zIndex = 100;
    let popup = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      650,
      '',
      obj,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if(!res || res.closedBy=="escape" || !res.event) return;
      (this.listview.dataService as CRUDService).add(res.event).subscribe();
    });
  }

  // xóa bài viết
  deletePost(data: any) {
    if (data?.recID) {
      (this.listview.dataService as CRUDService)
        .delete([data],true,(op: any) => this.beforDelete(op, data.recID),'','WP022','','WP023')
        .subscribe();
    }
  }
  
  beforDelete(option: RequestOption, id: string) {
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'CommentsBusiness';
    option.methodName = 'DeletePostAsync';
    option.data = id;
    return true;
  }

  // edit bài viết
  editPost(post: any) {
    let moreFuc = this.sysMoreFunc.find(x => x.functionID === "WP001");
    let obj = {
      status: 'edit',
      headerText: `${moreFuc.customName} ${this.function.customName}`,
      data: JSON.parse(JSON.stringify(post))
    };
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.formModel;
    option.zIndex = 100;

    let popup = this.callFC.openForm(
      PopupAddPostComponent,
      '',
      700,
      650,
      '',
      obj,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if(!res || res.closedBy=="escape" || !res.event) return;
      (this.listview.dataService as CRUDService).update(res.event).subscribe();
    });
  }
  
  // share bài viết
  sharePost(post: any) {
    debugger
    if (post) 
    {
      let data = new WP_Comments();
      let moreFuc = this.sysMoreFunc.find(x => x.functionID === "WP003");
      let obj = {
        status: "share",
        headerText: `${moreFuc.customName} ${this.function.customName}`,
        refType:"",
        data : null
      };
      if(post.category == this.CATEGORY.POST)
      {
        data.refID = post.recID;
        obj.refType = 'WP_Comments';
      }
      else
      {
        data.refID = post.refID;
        obj.refType = post.refType;
      }
      obj.data = data;
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      option.zIndex = 100;
      let popup = this.callFC.openForm(
        PopupAddPostComponent,
        '',
        700,
        650,
        '',
        obj,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if(!res || res.closedBy=="escape" || !res.event) return;
        (this.listview.dataService as CRUDService).add(res.event).subscribe();
      });
    }
  }

  // lưu trữ bài viết
  savePost(post: any) {
    if (post) {
      let data = JSON.parse(JSON.stringify(post));
      let moreFuc = this.sysMoreFunc.find(x => x.functionID === "WP003");
      let headerText = `${moreFuc.customName}`;
      var obj = {
        data: data,
        headerText: headerText,
      };
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      option.zIndex = 100;

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
      'UpdateViewAsync',
      [data.recID])
      .subscribe();
      // naviagte qua WP_News
      this.cache.functionList("WP2")
      .subscribe((func:any) => {
        let url = `${func.url}/${data.category}/${data.recID}`;
        this.codxService.navigate('',url);
      });
      
    }
  }

  //xem chi tiết bài viết
  clickViewDetail(file: any){
    if(file){
      let option = new DialogModel();
      option.DataService = this.listview.dataService as CRUDService;
      option.FormModel = this.formModel;
      option.IsFull = true;
      option.zIndex = 100;
      this.callFC.openForm(
        PopupDetailComponent,
        '',
        0,
        0,
        '',
        file,
        '',
        option
      );
    }
  }

  //click xem thêm 
  clickReadMore(item){
    item.isShortContent = false;
    this.api.execSv("WP","ERM.Business.WP","CommentsBusiness","GetContentAsync",[item.recID])
    .subscribe((res:string) => {
      item.shortContent = "";
      item.contents = res;
      this.dt.detectChanges();
    }); 
  }
  

  // xóa bài viết trên client
  removePost(data:any){
    (this.listview.dataService as CRUDService).remove(data).subscribe();
  }

  dataSelected:any = null;
  
  // open cbb share
  openCBBShare(data){
    if(data.write){
      this.dataSelected = JSON.parse(JSON.stringify(data));
      if (this.CBBShare){
        this.callFC.openForm(this.CBBShare, '', 420, window.innerHeight);
      }
    }
  }

  //change mode share
  changePermission(event:any){
    if(event)
    {
      let arrPermisison = Array.from<any>(event);
      let fisrtPermission = arrPermisison[0];
      this.dataSelected.shareControl = fisrtPermission.objectType;
      if (!Array.isArray(this.dataSelected.permissions)) this.dataSelected.permissions = [];
      else
        this.dataSelected.permissions = this.dataSelected.permissions.filter((e: any) => e.memberType != MEMBERTYPE.SHARE);
      switch(this.dataSelected.shareControl) {
        case SHARECONTROLS.OWNER:
          break;
        case SHARECONTROLS.EVERYONE:
        case SHARECONTROLS.MYGROUP:
        case SHARECONTROLS.MYTEAM:
        case SHARECONTROLS.MYDEPARMENTS:
        case SHARECONTROLS.MYDIVISION:
        case SHARECONTROLS.MYCOMPANY:
          let permission = {
            memberType: MEMBERTYPE.SHARE,
            objectID: '',
            objectName: '',
            objectType: this.dataSelected.shareControl,
          };
          this.dataSelected.permissions.push(permission);
          this.dataSelected.shareName = '';
          break;
        case SHARECONTROLS.OGRHIERACHY:
        case SHARECONTROLS.DEPARMENTS:
        case SHARECONTROLS.POSITIONS:
        case SHARECONTROLS.ROLES:
        case SHARECONTROLS.GROUPS:
        case SHARECONTROLS.USER:
          arrPermisison.forEach((x) => {
            let permission = {
              memberType: MEMBERTYPE.SHARE,
              objectID: x.id,
              objectName: x.text,
              objectType: x.objectType,
            };
            this.dataSelected.permissions.push(permission);
          });
          // WP001 chia sẻ 1 - WP002 chia sẻ nhiều người
          let mssgCodeShare = arrPermisison.length == 1 ? 'WP001' : 'WP002';
          this.cache.message(mssgCodeShare).subscribe((mssg: any) => {
            if (mssg) {
              if (arrPermisison.length == 1) {
                // chia sẻ 1 người
                this.dataSelected.shareName = Util.stringFormat(
                  mssg.customName,
                  `<b>${fisrtPermission.text}</b>`
                );
              } else {
                // chia sẻ nhiều người
                let count = arrPermisison.length - 1;
                let type = fisrtPermission.objectName;
                this.dataSelected.shareName = Util.stringFormat(
                  mssg.customName,
                  `<b>${fisrtPermission.text}</b>`,
                  count,
                  type
                );
              }
            }
          });
          break;
        default:
          break;
      }
      (this.listview.dataService as CRUDService).update(this.dataSelected).subscribe();
      this.dt.detectChanges();
    }
  }


  //
  onAction(e:any){
    if(this.listview?.dataService?.predicates)
    {
      let post = this.listview.dataService.data[0];
      if(post?.category == "9")
      {
        this.api
          .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          [this.listview.dataService.dataValues])
          .subscribe((res:any[]) => {
            this.clickViewDetail(res);
          });
      }
    }
  }

}


