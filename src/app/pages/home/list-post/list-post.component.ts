import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Post } from '@shared/models/post';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { UploadFile, CodxListviewComponent, AuthStore, TenantStore, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogRef, DialogModel, CRUDService, ViewModel, ViewType, ViewsComponent, RequestOption, CodxService } from 'codx-core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddPostComponent } from './popup-add/addpost/addpost.component';

@Component({
  selector: 'app-list-post',
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPostComponent implements OnInit, AfterViewInit {
  service = "WP";
  assemblyName = "ERM.Business.WP"
  className = "CommentBusiness"
  method = "GetListPostAsync";
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
  dataVll = [];

  tagUsers: any = [];
  searchField = '';
  checkFormAddPost = false;
  predicate = "  (ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)) && Stop =@3 ";
  dataValue: any = "0;1;5;false";

  modal: DialogRef;
  headerText = "";
  views: Array<ViewModel> | any = [];

  @Input() predicates = "";
  @Input() dataValues = "";
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
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
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notifySvr: NotificationsService,
    private fileService: FileService,
    private codxService: CodxService
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
    this.getGridViewSetUp();
    this.codxViews.dataService.methodDelete = "DeletePostAsync";
    console.log(this.codxViews.dataService);
  }


  ngOnDestroy() {
  }
  getGridViewSetUp() {
    this.cache.functionList(this.codxViews.formModel.funcID).subscribe((func) => {
      this.cache.gridViewSetup(func.formName, func.gridViewName)
        .subscribe((grd: any) => {
          console.log(grd);
          this.headerText = grd['Comments']['headerText'];
          this.dt.detectChanges();
        })
    })

  }

  beforDelete(option: RequestOption): RequestOption {
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "CommentBusiness";
    option.methodName = "DeletePostAsync";
    return option;
  }
  removePost(data: any) {
    this.codxViews.dataService.delete([data]).subscribe((res) => {
      if (res) {
        if (data.lstFile) {
          this.api.execSv("DM",
            "ERM.Business.DM",
            "FileBussiness",
            "DeleteByObjectIDAsync",
            [data.recID, 'WP_Comments', true]
          ).subscribe();
        }
      }
      this.notifySvr.notifyCode('E0026');
      this.dt.detectChanges();
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


  gotoImageDetail(data) {
    this.player?.video?.nativeElement.pause();
  }

  openCreateModal() {
    var obj = {
      status: "create",
      title: "Tạo bài viết",
    }
    this.dt.detectChanges()
    let option = new DialogModel();
    option.DataService = this.codxViews.dataService as CRUDService;
    option.FormModel = this.codxViews.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 700, 550, "", obj, '', option);
    this.modal.closed.subscribe();
  }
  openEditModal(data: any) {
    var obj = {
      post: data,
      status: "edit",
      title: "Chỉnh sửa bài viết"
    }
    let option = new DialogModel();
    option.DataService = this.codxViews.dataService as CRUDService;
    option.FormModel = this.codxViews.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 650, 550, "", obj, '', option);

  }

  openModalShare(data: any) {
    var obj = {
      post: data,
      status: "share",
      title: "Chia sẻ bài viết"
    }
    this.dt.detectChanges()
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 650, 550, "", obj, '', option);
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
        if (res) {
          this.codxService.navigate('', "wp/" + data.category + "/view-detail/" + data.recID + "/" + funcID);
        }
      });

  }
}
