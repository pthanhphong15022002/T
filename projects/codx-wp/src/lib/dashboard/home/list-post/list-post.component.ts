import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
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
import { Subscription } from 'rxjs';
import { subscribe } from 'diagnostics_channel';

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
export class ListPostComponent implements OnInit, AfterViewInit,OnChanges, OnDestroy {

  @Input() funcID: string = 'WP';
  @Input() favoriteID: string;
  @Input() objectID: string = '';
  @Input() service: string = '';
  @Input() assemblyName: string = '';
  @Input() className: string = '';
  @Input() method: string = '';
  @Input() entityName: string = 'WP_Comments';
  @Input() predicate: any;
  @Input() dataValue: any;
  @Input() predicates: any;
  @Input() dataValues: any;
  @Input() isShowCreate = true;
  @Input() moreFuncTmp: TemplateRef<any> = null;
  @Input() formModel: FormModel = null;

  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild("tmpCBBShare") CBBShare:TemplateRef<any>;

  subscritions = new Subscription();
  user: any;
  dataService: CRUDService = null;
  function:any = null;
  sysMoreFunc:any = null;
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

  
  ngAfterViewInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // sài cho FD
    if(!changes.favoriteID?.firstChange && changes.favoriteID?.previousValue != changes.favoriteID?.currentValue)
    {
      this.dataService.favoriteID = changes.favoriteID?.currentValue;
      this.dataService.page = 0;
      this.dataService.setPredicates([this.predicates],[this.dataValues]);
    }
    if((!changes.predicate?.firstChange && changes.predicate?.previousValue !=  changes.predicate?.currentValue) || (!changes.dataValue?.firstChange && changes.dataValue?.previousValue !=  changes.dataValue?.currentValue))
    {
      this.dataService.page = 0;
      this.dataService.setPredicate(changes.predicate?.currentValue || this.predicate, [changes.dataValue?.currentValue || this.dataValue]);
    }
    if((!changes.predicates?.firstChange && changes.predicates?.previousValue !=  changes.predicates?.currentValue) || (!changes.dataValues?.firstChange && changes.dataValues?.previousValue !=  changes.dataValues?.currentValue))
    {
      this.dataService.page = 0;
      this.dataService.setPredicates([changes.predicates?.currentValue || this.predicates],[changes.dataValues?.currentValue || this.dataValues]);
    }
  }

  ngOnInit(): void {
    this.dataService.service = this.service || "WP";
    this.dataService.assemblyName = this.assemblyName || "ERM.Business.WP";
    this.dataService.className = this.className || "CommentsBusiness";
    this.dataService.method = this.method || "GetListPostAsync";
    this.dataService.favoriteID = this.favoriteID;
    this.dataService.predicate = this.predicate;
    this.dataService.dataValue = this.dataValue;
    this.dataService.predicates = this.predicates || this.route.snapshot.queryParamMap.get("predicate");
    this.dataService.dataValues = this.dataValues || this.route.snapshot.queryParamMap.get("dataValue");
    let arrSort:SortModel[] = [{ field : "CreatedOn",dir:"desc"}];
    this.dataService.setSort(arrSort);
    this.dataService.pageSize = 10;
    this.getSetting();
  }

  ngOnDestroy(): void {
    this.subscritions.unsubscribe();
  }
  getSetting() {
    let subscribe1 = this.cache.message('WP011').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgPlaceHolder = Util.stringFormat(mssg.customName, this.user.userName);
    });
    let subscribe2 = this.cache.message('WP035').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgWP035 = mssg.customName;
    });
    let subscribe3 = this.cache.message('WP038').subscribe((mssg: any) => {
      if (mssg?.customName) this.mssgWP038 = mssg.customName;
    });
    let subscribe4 = this.cache.functionList("WP").subscribe((func) => {
        if (func)
        {
          this.function = func;
          this.formModel = new FormModel();
          if(this.formModel == null){
            this.formModel.funcID = func.functionID;
            this.formModel.formName = func.formName;
            this.formModel.gridViewName = func.gridViewName;
            this.formModel.entityName = func.entityName;
          }
          this.cache.gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            this.gridViewSetup = grd;
          });
          this.cache.moreFunction(func.formName,func.gridViewName)
          .subscribe((mFuc:any) => {
            this.sysMoreFunc = mFuc;
          });
          this.dt.detectChanges();
        }
    });
    this.subscritions.add(subscribe1);
    this.subscritions.add(subscribe2);
    this.subscritions.add(subscribe3);
    this.subscritions.add(subscribe4);
  }

  clickMF(event: any, post: any) {
    if (event && post) {
      switch (event.functionID) {
        case 'WP001': 
          this.editPost(post);
          break;
        case 'WP002':
          this.deletePost(post);
          break;
        case 'WP003': 
          this.sharePost(post);
          break;
        case 'WP004': 
          this.savePost(post);
          break;
        default:
          break;
      }
    }
  }

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
    let subscribe = popup.closed.subscribe((res: any) => {
      if(!res || res.closedBy=="escape" || !res.event) return;
      (this.listview.dataService as CRUDService).add(res.event).subscribe();
    });
    this.subscritions.add(subscribe);
  }

  // xóa bài viết
  deletePost(data: any) {
    if (data?.recID) 
    {
      let subscribe = (this.listview.dataService as CRUDService)
        .delete([data],true,(op: any) => this.beforDelete(op, data.recID),'','WP022','','WP023')
        .subscribe();
      this.subscritions.add(subscribe);
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
    let subscribe = popup.closed.subscribe((res: any) => {
      if(!res || res.closedBy=="escape" || !res.event) return;
      (this.listview.dataService as CRUDService).update(res.event).subscribe();
    });
    this.subscritions.add(subscribe);
  }
  
  sharePost(post: any) {
    if (post){
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
      let subscribe = popup.closed.subscribe((res: any) => {
        if(!res || res.closedBy=="escape" || !res.event) return;
        (this.listview.dataService as CRUDService).add(res.event).subscribe();
      });
      this.subscritions.add(subscribe);

    }
  }

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

  naviagteWPNew(data: any) {
    if (data)
    {
      let subscribe1 = this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'UpdateViewAsync',
      [data.recID])
      .subscribe();

      let subscribe2 = this.cache.functionList("WP2")
      .subscribe((func:any) => {
        let url = `${func.url}/${data.category}/${data.recID}`;
        this.codxService.navigate('',url);
      });
      this.subscritions.add(subscribe1);
      this.subscritions.add(subscribe2);
    }
  }

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

  clickReadMore(item){
    item.isShortContent = false;
    let subscribe = this.api.execSv("WP","ERM.Business.WP","CommentsBusiness","GetContentAsync",[item.recID])
    .subscribe((res:string) => {
      item.shortContent = "";
      item.contents = res;
      this.dt.detectChanges();
    }); 
    this.subscritions.add(subscribe);
  }
  

  removePost(data:any){
    (this.listview.dataService as CRUDService).remove(data).subscribe();
  }

  dataSelected:any = null;
  openCBBShare(data){
    if(data.write){
      this.dataSelected = JSON.parse(JSON.stringify(data));
      if (this.CBBShare){
        this.callFC.openForm(this.CBBShare, '', 420, window.innerHeight);
      }
    }
  }

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

  onAction(e:any){
    if(this.listview?.dataService?.predicates){
      let post = this.listview.dataService.data[0];
      if(post?.category == "9" || post?.category == "10")
      {
        
        this.subscritions.add(this.api
          .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          [this.listview.dataService.dataValues])
          .subscribe((res:any[]) => {
            this.clickViewDetail(res);
          }));
      }
    }
  }

}


