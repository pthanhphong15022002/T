import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Post } from '@shared/models/post';
import { UploadFile, CodxListviewComponent, AuthStore, TenantStore, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogRef, DialogModel, CRUDService, ViewModel, ViewType, ViewsComponent, RequestOption, CodxService } from 'codx-core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddPostComponent } from './popup-add/addpost/addpost.component';

@Component({
  selector: 'app-list-post',
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss'],
})
export class ListPostComponent implements OnInit,AfterViewInit {
  service = "WP";
  assemblyName = "ERM.Business.WP"
  className = "CommentBusiness"
  method = "GetListPostAsync";
  arrCbx = ['HRDepartments', 'Positions', 'UserRoles', 'UserGroups', 'Users'];
  totalPage: number = 0;
  pageIndex = 0;
  users = [];
  user: any;
  tenant: string;
  dataRef: any;
  dataDetail: any;
  closeResult: any;
  previewFiles = [];
  errorMessage = [];
  employTag: any = [];
  employees: any = [];
  fileUpload: UploadFile[] = [];
  imgExt = environment.IMGEXTENSION;
  showEmojiPicker = false;
  isFileReady: boolean = false;
  tags: Array<any> = [];
  shareWith: any[] = [];
  shareType: string = '9';
  displayShare: string = 'Everyone';
  // lstType = this.env.jsonType;
  count = 0;
  isLoading = true;
  crrId = '';
  onlyDepartment = false;
  orgchartServiceSub: Subscription;
  OrgUnitID = '';
  tagUsers: any = [];
  searchField = '';
  checkFormAddPost = false;
  predicate = "ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)";
  dataValue = "0;1;5";
  modal: DialogRef;
  views:Array<ViewModel> | any = [];
  @Input() predicates = "";
  @Input() dataValues = "";
  @ViewChild('codxViews') codxViews : ViewsComponent;
  @ViewChild('listview') listview : CodxListviewComponent;
  @ViewChild('panelLeftRef') panelLeftRef : TemplateRef<any>;
  @ViewChild('player') player;
  @ViewChild('modalpost') modalpost: AddPostComponent;
  @ViewChild('modalShare') modalShare;
  @ViewChild('detail') detail;
  @Input() isShowCreate = true;

  constructor(
    private authStore: AuthStore,
    private tenantStore: TenantStore,
    private cache: CacheService,
    private api: ApiHttpService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    private notifySvr: NotificationsService,
    private codxService:CodxService
  ) {
    this.tenant = this.tenantStore.getName();
    this.user = this.authStore.get();
    this.cache.valueList('L1901').subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
        this.dt.detectChanges();
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.content,
      active: true,
      model: {
        panelLeftRef: this.panelLeftRef
      }
    }]
    this.codxViews.dataService.methodDelete = "DeletePostAsync";
  }

  dataVll = [];

  ngOnDestroy() {
  }

  // beforeDeleted(opt: RequestOption){
  //   opt.service = 'WP';
  //   opt.assemblyName = 'WP';
  //   opt.className = 'CommentBusiness';
  //   opt.methodName = 'DeletePostAsync';
  //   return true;
  // }
  removePost(data:any) {
    this.codxViews.dataService.delete([data]).subscribe();
    // this.notifySvr.alertCode('E0327').subscribe((e:any)=>{
    //   if(e.event.status == "Y"){
    //     this.api
    //       .exec<any>(
    //         'ERM.Business.WP',
    //         'CommentBusiness',
    //         'DeletePostAsync',
    //         data.recID
    //       )
    //       .subscribe((res) => {
    //         if(res)
    //         {
    //           this.notifySvr.notifyCode('E0026');
    //           this.dt.detectChanges();
    //         }
    //       });
    //   }
    // })
  
    }

  // closeAlert(e, data, t: ListPostComponent){
  //     if(e.status == "Y"){
  //       t.api
  //         .exec<any>(
  //           'ERM.Business.WP',
  //           'CommentBusiness',
  //           'DeletePostAsync',
  //           data.recID
  //         )
  //         .subscribe((res) => {
  //           if(res)
  //           {
  //            // this.listview.dataService
  //             this.notifySvr.notifyCode('E0026');
  //             this.dt.detectChanges();
  //           }
  //         });
  //     }
  // }

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

  editPost(data) {
    // this.listview.addHandler(data, false, 'recID');
  }
  createPost(data) {
    // this.listview.dataService.add(data, true, 'recID');
  }
  createShare(data) {
    // this.listview.addHandler(data, false, 'id');  
  }
  gotoImageDetail(data) {
    this.player?.video?.nativeElement.pause();
    // this.router.navigate([this.tenant + '/modules/wp/image'], { queryParams: { id: data.id } });
  }

  openModal() {
    var data = new Post();
    var obj = {
      post: data,
      status: "create"
    }
    this.dt.detectChanges()
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "Tạo bài viết", 600, 0, "", obj, '', option);
    this.modal.closed.subscribe();
  }
  openEditModal(data: any) {
    var obj = {
      post: data,
      status: "edit"
    }
    this.modal = this.callfc.openForm(AddPostComponent, "Chỉnh sửa bài viết", 600, 0, "", obj);

  }

  openModalShare(data: any) {
    var obj = {
      post: data,
      status: "share"
    }
    this.dt.detectChanges()
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "Chia sẽ bài viết", 600, 0, "", obj, '', option);
    this.modal.closed.subscribe();
  }





  openDetail(index, id) {
    this.detail.setData(index, id);
  }


  pushComment(data: any) {
    this.listview.dataService.data.map((p) => {
      if (p.recID == data.refID) {
        p.listComment.push(data);
        return;
      }
    })
  }
  changed($e) {
    // this.listview.updateOneField('id', $e.id, 'content', $e.content);
  }

  getTagUser(id) {
    this.api
      .exec<any>('ERM.Business.WP', 'CommentBusiness', 'GetTagUserListAsync', [
        id,
      ])
      .subscribe((res) => {
        if (res) this.tagUsers = res;
      });
  }

  getShareUser(shareControl, commentID) {
    if (shareControl == '1') {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentBusiness',
          'GetShareOwnerListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) this.tagUsers = res;
          console.log('CHECK TAG USER LIST', this.tagUsers.orgUnitName);
        });
    } else {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentBusiness',
          'GetShareUserListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) {
            this.tagUsers = res;
            console.log('CHECK TAG USER LIST', this.tagUsers);
          }
        });
    }
  }

  clickClose() {
    var modal = this.callfc.openForm(AddPostComponent, "")
  }
  clickShowItem(data: any) {
    console.log('clickShowItem: ', data);
  }


  naviagte(data: any) {
    let funcID = "WPT02"
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewNewsAsync',
        data.recID
      )
      .subscribe(res => {
        if(res){
          this.codxService.navigate('', "wp/"+data.category+"/view-detail/"+data.recID + "/"+funcID);
        }
      });
   
  }
}
