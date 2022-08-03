import {
  ApiHttpService,
  AuthStore,
  CodxCardCenterComponent,
  CodxService,
  ResourceModel,
  ViewsComponent,
  ViewType,
  FormModel,
  ButtonModel,
  SidebarModel,
  DialogRef,
  CallFuncService,
  UIComponent,
  CodxListviewComponent,
  CRUDService,
  CacheService,
} from 'codx-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  Input,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { AddUpdateStorageComponent } from './add-update-storage/add-update-storage.component';
import { StorageServices } from '../../services/storage.services';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss'],
})
export class StorageComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  user: any;
  dataValue = '';
  predicate = 'CreatedBy=@0';
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

  @ViewChild('lstCardStorage') lstCardStorage: CodxCardCenterComponent;
  @ViewChild('lstStorage') lstStorage: AddUpdateStorageComponent;
  @ViewChild('detail', { read: ViewContainerRef }) detail!: ViewContainerRef;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.route.params.subscribe((params) => {
      this.funcID = params['funcID'];
    });
  }

  onInit(): void {
    // this.storageService.data.subscribe((res) => {
    //   if (res) {
    //     var data = res[0]?.data;
    //     var type = res[0]?.type;
    //     if (type == 'add') {
    //       debugger;
    //       this.view.dataService.add(data).subscribe();
    //     }
    //   }
    // })
  }

  ngAfterViewInit() {}

  testdate(dr) {}

  openFormMoreFunc(e) {
    if (e) {
      this.data = e;
      // this.storageDetail.data = e;
    }
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }

  onSearch(e) {
    // this.lstCardNoteBooks.onSearch(e);
    this.listView.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  formAddNoteBook() {
    this.dataSort = [];
    (this.listView.dataService as CRUDService)
      .addNew()
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.listView.dataService as CRUDService;
        option.FormModel = this.listView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          [this.listView.dataService.data, 'add'],
          option
        );
      });
  }

  edit(data: any) {
    if (data) {
      this.listView.dataService.dataSelected = data;
    }
    this.dataSort = [];
    (this.listView.dataService as CRUDService)
      .edit(this.listView.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.listView?.dataService as CRUDService;
        option.FormModel = this.listView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          [this.listView.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  formUpdateStorage(e) {
    this.dataSort = [];
  }

  openFormUpdateBackground(content, data) {
    this.dataSort = [];
    this.modalService.open(content, { centered: true });
  }

  delete(data) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'StoragesBusiness',
        'DeleteStorageAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          (this.listView.dataService as CRUDService).remove(data).subscribe();
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

  openStorageDetail(e) {
    this.dataSort = [];
    this.checkFormComment = true;
    this.detectorRef.detectChanges();

    var arr = [];
    if (e?.details) {
      for (let i = 0; i < e?.details?.length; i++) {
        arr.push(e?.details[i].refID);
      }
      var a = this.detail.createComponent(ListPostComponent);
      a.instance.predicate = `(CreatedBy="${this.user?.userID}") and (@0.Contains(outerIt.RecID))`;
      a.instance.dataValue = `[${arr.join(';')}]`;
      a.instance.isShowCreate = false;
      this.detectorRef.detectChanges();
    }
  }

  onUpdateBackground(e) {}

  back() {
    this.checkFormComment = false;
  }

  sortStorage() {
    this.listView.dataService.data = this.listView.dataService.data.sort(
      function (a, b) {
        var dateA = new Date(a.createdOn).toLocaleDateString();
        var dateB = new Date(b.createdOn).toLocaleDateString();
        return dateA < dateB ? 1 : -1; // ? -1 : 1 for ascending/increasing order
      }
    );
    this.detectorRef.detectChanges();
  }
}
