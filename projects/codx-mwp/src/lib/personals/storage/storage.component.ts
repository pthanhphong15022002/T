import {
  AuthStore,
  CodxCardCenterComponent,
  ResourceModel,
  ViewsComponent,
  ButtonModel,
  SidebarModel,
  DialogRef,
  UIComponent,
  CodxListviewComponent,
  CRUDService,
  ScrollComponent,
  NotificationsService,
  FormModel,
} from 'codx-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  Input,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { AddUpdateStorageComponent } from './add-update-storage/add-update-storage.component';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss'],
})
export class StorageComponent extends UIComponent implements OnInit, AfterViewInit{
  
  @Input() formModel : FormModel = null;
  @Input() storageID : string = "";
  
  user: any;
  dataValue = '';
  predicate = 'CreatedBy = @0';
  data: any;
  recID: any;
  checkFormComment = false;
  dataSort: any = [];
  checkDetail = false;
  funcID = '';
  views = [];
  modelResource: ResourceModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  listStorage = [];
  checkDESC = false;
  gridViewSetup: any = [];
  dataService: CRUDService;
  predicatePost = "RecID.Contains(@0)";
  dataValuePost = "";

  function:any = null;
  sysMoreFc:any = null;
  @ViewChild('lstCardStorage') lstCardStorage: CodxCardCenterComponent;
  @ViewChild('lstStorage') lstStorage: AddUpdateStorageComponent;
  @ViewChild('detail', { read: ViewContainerRef }) detail!: ViewContainerRef;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('moreFC') moreFC: TemplateRef<any>;

  @ViewChild("listPost") listPost : ListPostComponent;
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataService = new CRUDService(inject);
  }

  onInit(): void {
    this.route.params.subscribe((params) => {
      if(params){
        this.funcID = params['funcID'];
      }
    });
    this.dataValue = this.user?.userID;
    this.cache.gridViewSetup('Storages', 'grvStorages')
    .subscribe((res) => {
      this.gridViewSetup = res;
    });
    this.cache.moreFunction("CoDXSystem","").subscribe((moreFC:any) => {
      this.sysMoreFc = moreFC;
    });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }


  openFormMoreFunc(e) {
    if (e) {
      this.data = e;
      // this.storageDetail.data = e;
    }
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data,e.text);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }

  onSearch(e) {
    this.listView.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  //open slidebar add
  openPopupAdd() {
    let moreFC = Array.from<any>(this.sysMoreFc).find(x => x.functionID == "SYS01");
    (this.listView.dataService as CRUDService)
      .addNew()
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.listView.dataService as CRUDService;
        option.FormModel = this.listView?.formModel;
        option.Width = '550px';
        res.storageType = 'WP_Comments';
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          {data:res,action:'add',text:moreFC.defaultName},
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event){
            (this.listView.dataService as CRUDService)
              .add(res.event)
              .subscribe();
          }
        });
      });
  }

  // edit kho lưu trữ
  edit(data: any, text:string) {
    if (data){
      this.listView.dataService.dataSelected = data;
      this.dataSort = [];
      let option = new SidebarModel();
      option.DataService = this.listView.dataService;
      option.FormModel = this.listView.formModel;
      option.Width = '550px';
      var dialog = this.callfc.openSide(
        AddUpdateStorageComponent,
        {data:data,action:'edit',text:text},
        option
      );
      dialog.closed.subscribe((res) => {
        if (res.event) {
          (this.listView.dataService as CRUDService)
            .update(res.event)
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  formUpdateStorage(e) {
    this.dataSort = [];
  }

  openFormUpdateBackground(content, data) {
    this.dataSort = [];
    this.modalService.open(content, { centered: true });
  }

  delete(data) {
    (this.listView.dataService as CRUDService)
      .delete([data], true, (opt) => {
        opt.service = 'WP';
        opt.assemblyName = 'ERM.Business.WP';
        opt.className = 'StoragesBusiness';
        opt.methodName = 'DeleteStorageAsync';
        opt.data = data?.recID;
        return true;
      })
      .subscribe((res: any) => {
        if (res) {
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteByObjectIDAsync',
              [res.recID, 'WP_Storages', true]
            )
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  storageSelected: any = [];
  openStorageDetail(data:any) {
    debugger;
    this.storageSelected = data;
    this.dataSort = [];
    this.checkFormComment = true;
    this.detail = null;
    this.dataValuePost = data.recID;
    this.detectorRef.detectChanges();
  }
  onUpdateBackground(e) {}

  back() {
    this.checkFormComment = false;
  }

  sortByDESC() {
    this.listView.dataService.data = this.listView.dataService.data.sort(
      (a, b) => b.title.localeCompare(a.title)
    );
    this.detectorRef.detectChanges();
    this.checkDESC = true;
  }

  sortByASC() {
    this.listView.dataService.data = this.listView.dataService.data.sort(
      (a, b) => a.title.localeCompare(b.title)
    );
    this.detectorRef.detectChanges();
    this.checkDESC = false;
  }

  // xóa bài viết ra khỏi kho lưu trữ
  removePost(data) {
    if(data){
      let index = Array.from<any>(this.storageSelected.details).findIndex(x => x.refID == data.recID);
      if(index != -1){
        this.storageSelected.details.splice(index, 1);
      } 
      this.api.exec(
        'ERM.Business.WP',
        'StoragesBusiness',
        'UpdateStorageAsync',
        [this.storageSelected])
        .subscribe((res:boolean) => {
        if(res){
          //remove post
          if(this.listPost)
          {
            this.listPost.removePost(data);
          }
        }
      });
    }
  }
}
