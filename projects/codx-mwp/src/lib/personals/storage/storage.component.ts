import { detach } from '@syncfusion/ej2-base';
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
  ScrollComponent,
  NotificationsService,
  RequestOption,
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
  predicate = '';
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

  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NotificationsService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.route.params.subscribe((params) => {
      this.funcID = params['funcID'];
    });
    this.cache.gridViewSetup('Storages', 'grvStorages').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    this.dataService = new CRUDService(inject);
  }

  onInit(): void {}

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

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
    this.listView.dataService.search(e).subscribe();
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
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          [this.listView.dataService.data, 'add'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            (this.listView.dataService as CRUDService)
              .update(res.event)
              .subscribe();
            this.detectorRef.detectChanges();
          }
        });
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
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          [this.listView.dataService.dataSelected, 'edit'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            (this.listView.dataService as CRUDService)
              .update(res.event)
              .subscribe();
            this.detectorRef.detectChanges();
          }
        });
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

  dataUpdate: any = [];
  a: any;
  openStorageDetail(e) {
    this.dataUpdate = e;
    this.dataSort = [];
    this.checkFormComment = true;
    this.detail = null;
    this.detectorRef.detectChanges();

    var arr: any = new Array();
    if (e?.details) {
      for (let i = 0; i < e?.details?.length; i++) {
        arr.push(e?.details[i]?.refID);
      }
    }
    var formModel = {
      entityName: 'WP_Comments',
      entityPermission: 'WP_Comments',
      gridViewName: 'grvWPComments',
      formName: 'WPComments',
      funcID: 'WP',
    };
    this.a = this.detail.createComponent(ListPostComponent);
    this.a.instance.dataService = null;
    this.a.instance.isShowCreate = false;
    this.a.instance.formModel = formModel;
    this.a.instance.moreFunc = true;
    this.a.instance.moreFuncTmp = this.moreFC;
    if (arr?.length == 0) {
      this.generateGuid();
      this.dataService.predicate = `(RecID="${this.guidID}")`;
      this.a.instance.dataService = this.dataService;
      let myInterval = setInterval(() => {
        if (this.a.instance.listview) {
          clearInterval(myInterval);
          (this.a.instance.listview?.dataService as CRUDService).data = null;
          (this.a.instance.listview?.dataService as CRUDService).predicate =
            this.dataService.predicate;
          (this.a.instance.listview?.dataService as CRUDService).dataValue =
            null;
          this.a.instance.listview?.dataService
            .setPredicate(this.dataService.predicate, [null])
            .subscribe((res) => {
              this.detectorRef.detectChanges();
            });
        }
      }, 200);
    } else {
      this.dataService.predicates = `(@0.Contains(RecID))`;
      this.dataService.dataValues = `[${arr.join(';')}]`;
      this.a.instance.dataService = this.dataService;
      let myInterval = setInterval(() => {
        if (this.a.instance.listview) {
          clearInterval(myInterval);
          (this.a.instance.listview?.dataService as CRUDService).data = null;
          (this.a.instance.listview?.dataService as CRUDService).predicates =
            this.dataService.predicates;
          (this.a.instance.listview?.dataService as CRUDService).dataValues =
            this.dataService.dataValues;
          this.a.instance.listview?.dataService
            .setPredicate(this.predicate, [this.dataValue])
            .subscribe((res) => {
              this.detectorRef.detectChanges();
            });
        }
      }, 200);
    }
  }

  guidID: any;
  generateGuid() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    this.guidID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
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

  removePost(data) {
    if (data) {
      for (let i = 0; i < this.dataUpdate?.details.length; i++) {
        if (this.dataUpdate?.details[i].refID == data.recID) {
          this.dataUpdate?.details.splice(i, 1);
        }
      }
      this.api
        .exec('ERM.Business.WP', 'StoragesBusiness', 'UpdateStorageAsync', [
          this.dataUpdate.recID,
          this.dataUpdate,
        ])
        .subscribe((res) => {
          if (res) {
            var dataSelected =
              this.a.instance?.listview?.dataService?.dataSelected;
            if (this.a.instance?.listview?.dataService?.data && dataSelected) {
              (this.a.instance.listview.dataService as CRUDService)
                .remove(dataSelected)
                .subscribe();
              this.detectorRef.detectChanges();
            }
          }
        });
    }
  }
}
