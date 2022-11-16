import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Post } from '@shared/models/post';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { UploadFile, CodxListviewComponent, AuthStore, TenantStore, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogRef, DialogModel, CRUDService, ViewModel, ViewType, ViewsComponent, RequestOption, CodxService } from 'codx-core';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
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
  className = "CommentsBusiness"
  // method = "GetListPostAsync";
  totalPage: number = 0;
  pageIndex = 0;
  user: any;
  dataDetail: any;
  showEmojiPicker = false;
  // lstType = this.env.jsonType;
  dataVll = [];
  title:string = "";
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
  @ViewChild('codxFile') codxFile:ImageGridComponent;
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
    this.user = this.authStore.get();
    this.cache.valueList('L1901').subscribe((res:any) => {
      if (res) {
        this.dataVll = res.datas;
        this.dt.detectChanges();
      }
    });
    this.cache.message('WP011').subscribe((mssg:any)=>{
      this.title = this.user.userName + mssg.defaultName;
      this.dt.detectChanges();
    })
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.content,
      active: true,
      sameData:false,
      model: {
        panelLeftRef: this.panelLeftRef
      }
    }]
    this.getGridViewSetUp();
    this.codxViews.dataService.methodSave = "PublishPostAsync";
    this.codxViews.dataService.methodDelete = "DeletePostAsync";
    console.log(this.codxViews.dataService);
  }


  ngOnDestroy() {
  }
  getGridViewSetUp() {
    this.cache.functionList(this.codxViews.formModel.funcID).subscribe((func) => {
      this.cache.gridViewSetup(func.formName, func.gridViewName)
        .subscribe((grd: any) => {
          this.headerText = grd['Comments']['headerText'];
          this.dt.detectChanges();
        })
    })

  }

  beforDelete(option: RequestOption): RequestOption {
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "CommentsBusiness";
    option.methodName = "DeletePostAsync";
    return option;
  }
  removePost(data: any) {
    (this.codxViews.dataService as CRUDService).delete([data]).subscribe((res) => {
      if (res) {
          this.api.execSv("DM",
          "ERM.Business.DM",
          "FileBussiness",
          "DeleteByObjectIDAsync",
          [data.recID, 'WP_Comments', true]
        ).subscribe();
      }
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

  openCreateModal() {
    var obj = {
      status: "create",
      headerText: "Tạo bài viết",
      title: this.title,
      lstView: this.listview
    }
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 700, 550, "", obj, '', option);
    this.modal.closed.subscribe(res=>{

    })
  }
  openEditModal(data: any) {
    let dataEdit = { ...data }; 
    let obj = {
      post: dataEdit,
      status: "edit",
      headerText: "Chỉnh sửa bài viết",
      title: this.title,
    }
    console.log(this.codxFile);
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 650, 550, "", obj, '', option);

  }

  openModalShare(data: any) {
    var obj = {
      post: data,
      status: "share",
      headerText: "Chia sẻ bài viết",
      title: this.title,
    }
    this.dt.detectChanges()
    let option = new DialogModel();
    option.DataService = this.listview.dataService as CRUDService;
    option.FormModel = this.listview.formModel;
    this.modal = this.callfc.openForm(AddPostComponent, "", 650, 550, "", obj, '', option);
  }
  pushComment(data: any) {
    this.listview.dataService.data.map((p) => {
      if (p.recID == data.refID) {
        p.listComment.push(data);
        return;
      }
    })
  }


  getTagUser(id) {
    this.api
      .execSv("WP","ERM.Business.WP", "CommentsBusiness", "GetTagUserListAsync", id)
      .subscribe((res) => {
        if (res) this.tagUsers = res;
      });
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
          console.log('CHECK TAG USER LIST', this.tagUsers.orgUnitName);
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
  getFiles(event:any,data:any){
    data.files = event;
  }
}
