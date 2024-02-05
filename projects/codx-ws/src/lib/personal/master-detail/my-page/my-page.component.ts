import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxListviewComponent,
  CodxService,
  DataRequest,
  DialogModel,
  FormModel,
  RequestOption,
  SidebarModel,
} from 'codx-core';
import { AddUpdateNoteBookComponent } from './add-update-note-book/add-update-note-book.component';
import { AddUpdateStorageComponent } from './add-update-storage/add-update-storage.component';
import { DetailStorageComponent } from './detail-storage/detail-storage.component';
import { ExtendStorageComponent } from './extend-storage/extend-storage.component';
import { ExtendNoteBookComponent } from './extend-note-book/extend-note-book.component';
import { CodxWsService } from '../../../codx-ws.service';
import { Observable } from 'rxjs';
import { DetailNotebookComponent } from './detail-notebook/detail-notebook.component';

@Component({
  selector: 'lib-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MyPageComponent implements OnInit {
  @ViewChild('listViewNoteBooks') listViewNoteBooks: CodxListviewComponent;
  @ViewChild('listViewStorages') listViewStorages: CodxListviewComponent;

  predicatePortal =
    'CreatedBy=@0 && (Category="1" || Category="3" || Category="4") && Stop=false';
  dataValuePortal = '';
  predicateNoteBook = 'CreatedBy=@0';
  dataValueNoteBook = '';
  urlDetailNoteBook: any;
  user: any;
  listNoteBooks = [];
  listStorages = [];
  isLoadNB: boolean;
  isLoadStorages: boolean;
  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private wsSv: CodxWsService,
    private detectorRef: ChangeDetectorRef
  ) {
    this.user = this.authStore.get();
    this.dataValuePortal = this.user?.userID;
    this.dataValueNoteBook = this.user?.userID;
  }
  ngOnInit(): void {
    this.getCache();
    this.wsSv.loadDataList.subscribe((res) => {
      if (res) {
        const data = res?.data;
        const type = res.type;
        const action = res.action;
        let listView =
          type == 'notebook'
            ? (this.listViewNoteBooks?.dataService as CRUDService)
            : (this.listViewStorages?.dataService as CRUDService);
        if (listView) {
          switch (action) {
            case 'add':
              listView.add(data).subscribe();
              break;
            case 'update':
              listView.update(data).subscribe();
              break;
            case 'delete':
              listView.onAction.next({
                type: 'delete',
                data: data,
              });
              break;
          }
          if (type == 'notebook') {
            (this.listViewNoteBooks.dataService as CRUDService) = listView;
          } else {
            (this.listViewStorages.dataService as CRUDService) = listView;
          }
        }
        this.updateList(data, type, action);
        this.wsSv.loadDataList.next(null);
      }
    });
    this.loadDataNoteBooks();
    this.loadDataStorage();
  }

  ngAfterViewInit(): void {}

  loadDataNoteBooks() {
    this.isLoadNB = false;
    let request = new DataRequest();
    request.predicate = this.predicateNoteBook;
    request.dataValue = this.dataValueNoteBook;
    request.pageLoading = false;
    request.entityName = 'WP_NoteBooks';
    request.gridViewName = 'grvNoteBooks';
    request.formName = 'NoteBooks';
    this.fetch(
      'WP',
      'WP',
      'NoteBooksBusiness',
      'GetListNoteBookAsync',
      request
    ).subscribe((item: any) => {
      if (item && item.length > 0) {
        this.listNoteBooks = item[0] ?? [];
      }
      this.isLoadNB = true;
    });
  }

  loadDataStorage(){
    this.isLoadStorages = false;
    let request = new DataRequest();
    request.predicate = this.predicateNoteBook;
    request.dataValue = this.dataValueNoteBook;
    request.pageLoading = false;
    request.entityName = 'WP_Storages';
    request.gridViewName = 'grvStorages';
    request.formName = 'Storages';
    this.fetch(
      'WP',
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataAsync',
      request
    ).subscribe((item: any) => {
      if (item && item.length > 0) {
        this.listStorages = item[0] ?? [];
      }
      this.isLoadStorages = true;
    });
  }

  updateList(data, type, action) {
    let index =
      type == 'notebook'
        ? this.listNoteBooks.findIndex((x) => x.recID == data.recID)
        : this.listStorages.findIndex((x) => x.recID == data.recID);
    if (index != -1) {
      switch (action) {
        case 'update':
          if (type == 'notebook') this.listNoteBooks[index] = data;
          else this.listStorages[index] = data;
          break;
        case 'delete':
          if (type == 'notebook') this.listNoteBooks.splice(index, 1);
          else this.listStorages.splice(index, 1);
          break;
      }
    } else {
      if (action == 'add')
        if (type == 'notebook') this.listNoteBooks.push(data);
        else this.listStorages.push(data);
    }
  }

  fetch(service, assemblyName, className, method, request): Observable<any> {
    return this.api.execSv(service, assemblyName, className, method, request);
  }

  getCache() {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.urlDetailNoteBook = res?.url;
      }
    });
  }

  openDetailNoteBook(data: any) {
    var option = new DialogModel();
    option.zIndex = 100;
    let formModel = new FormModel();
    formModel.formName = 'NoteBooks';
    formModel.gridViewName = 'grvNoteBooks';
    formModel.entityName = 'WP_NoteBooks';
    formModel.funcID = 'WS00625';
    option.FormModel = formModel;
    this.callfc.openForm(
      DetailNotebookComponent,
      '',
      900,
      900,
      '',
      data,
      '',
      option
    );
  }

  setTimeOunt(settimeout = 200, data) {
    let myInterval = setInterval(() => {
      if (this.listViewNoteBooks?.dataService) {
        (this.listViewNoteBooks?.dataService as CRUDService)
          .add(data)
          .subscribe();
        clearInterval(myInterval);
      } else {
        this.setTimeOunt(200, data);
      }
    }, settimeout);
  }

  addNoteBook() {
    this.api
      .execSv<any>('WP', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'WS00625',
        'WP_NoteBooks',
      ])
      .subscribe((def) => {
        let option = new SidebarModel();
        option.DataService = this.listViewNoteBooks?.dataService;
        let formModel = new FormModel();
        formModel.formName = 'NoteBooks';
        formModel.gridViewName = 'grvNoteBooks';
        formModel.entityName = 'WP_NoteBooks';
        formModel.funcID = 'WS00625';
        option.FormModel = formModel;
        option.Width = '550px';
        option.zIndex = 1010;
        var dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [def?.data, 'add'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            this.updateList(res.event, 'notebook', 'add');

            if (this.listViewNoteBooks?.dataService) {
              (this.listViewNoteBooks?.dataService as CRUDService)
                .add(res.event)
                .subscribe();
            } else {
              this.setTimeOunt(200, res.event);
            }

            this.detectorRef.detectChanges();
          }
        });
      });
  }

  addStorage() {
    this.api
      .execSv<any>('WP', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'WS00626',
        'WP_Storages',
      ])
      .subscribe((def) => {
        let option = new SidebarModel();
        option.DataService = this.listViewStorages?.dataService as CRUDService;
        let formModel = new FormModel();
        formModel.formName = 'Storages';
        formModel.gridViewName = 'grvStorages';
        formModel.entityName = 'WP_Storages';
        formModel.funcID = 'WS00626';
        option.FormModel = formModel;
        option.Width = '550px';
        def.storageType = 'WP_Comments';
        option.zIndex = 1010;
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          { data: def?.data, action: 'add', text: 'Thêm' },
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            this.updateList(res.event, 'storage', 'add');
            (this.listViewStorages?.dataService as CRUDService)
              .add(res.event)
              .subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
  }

  detailStorage(data: any) {
    var option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 100;
    this.callfc.openForm(
      DetailStorageComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
  }

  extendStorage() {
    var option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 100;
    this.callfc.openForm(
      ExtendStorageComponent,
      '',
      null,
      null,
      '',
      '',
      '',
      option
    );
    // this.codxService.navigate('', '/ws/storage');
  }

  extendNoteBook() {
    var option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 100;
    this.callfc.openForm(
      ExtendNoteBookComponent,
      '',
      null,
      null,
      '',
      '',
      '',
      option
    );
    // this.codxService.navigate('', '/ws/notebook');
  }

  clickMFStorage(e: any, data: any) {
    switch (e?.functionID) {
      //Chỉnh sửa
      case 'SYS03': {
        let option = new SidebarModel();
        option.DataService = this.listViewStorages.dataService as CRUDService;
        let formModel = new FormModel();
        formModel.formName = 'Storages';
        formModel.gridViewName = 'grvStorages';
        formModel.entityName = 'WP_Storages';
        formModel.funcID = 'WS00626';
        option.FormModel = formModel;
        option.Width = '550px';
        option.zIndex = 1010;
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          { data: data, action: 'edit', text: e?.text },
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            this.updateList(res.event, 'storage', 'edit');
            (this.listViewStorages.dataService as CRUDService)
              .update(res.event)
              .subscribe();
            this.detectorRef.detectChanges();
          }
        });
        break;
      }
      //Xóa
      case 'SYS02': {
        this.deleteStorage(data);
        break;
      }
    }
  }

  clickMFNoteBook(e: any, data: any) {
    switch (e?.functionID) {
      //Chỉnh sửa
      case 'SYS03': {
        let option = new SidebarModel();
        option.DataService = this.listViewNoteBooks?.dataService;
        let formModel = new FormModel();
        formModel.formName = 'NoteBooks';
        formModel.gridViewName = 'grvNoteBooks';
        formModel.entityName = 'WP_NoteBooks';
        formModel.funcID = 'WS00625';
        option.FormModel = formModel;
        option.Width = '550px';
        option.zIndex = 1010;
        var dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [data, 'edit'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            this.updateList(res.event, 'notebook', 'edit');
            (this.listViewNoteBooks.dataService as CRUDService)
              .update(res.event)
              .subscribe();
            this.detectorRef.detectChanges();
          }
        });
        break;
      }
      //Xóa
      case 'SYS02': {
        this.deleteMFNoteBook(data);
        break;
      }
      //Chi tiết sổ tay
      case 'MWP00941': {
        this.codxService.navigate('', this.urlDetailNoteBook, {
          recID: data?.recID,
        });
        break;
      }
    }
  }

  deleteMFNoteBook(data) {
    this.listViewNoteBooks.dataService.dataSelected = data;
    (this.listViewNoteBooks.dataService as CRUDService)
      .delete([this.listViewNoteBooks.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.updateList(data, 'notebook', 'delete');

          this.listViewNoteBooks.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.detectorRef.detectChanges();
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.assemblyName = 'WP';
    opt.className = 'NoteBooksBusiness';
    opt.methodName = 'DeleteNoteBookAsync';
    opt.data = [itemSelected.recID, true];
    // opt.methodName = 'DeleteProcessesAsync';
    // opt.data = [itemSelected.recID];
    return true;
  }

  deleteStorage(data) {
    this.listViewStorages.dataService.dataSelected = data;
    (this.listViewStorages.dataService as CRUDService)
      .delete([this.listViewStorages.dataService.dataSelected], true, (opt) =>
        this.beforeDelStorage(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.updateList(data, 'storage', 'delete');
          this.listViewStorages.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.detectorRef.detectChanges();
        }
      });
  }

  beforeDelStorage(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.assemblyName = 'WP';
    opt.className = 'StoragesBusiness';
    opt.methodName = 'DeleteStorageAsync';
    opt.data = itemSelected?.recID;
    // opt.methodName = 'DeleteProcessesAsync';
    // opt.data = [itemSelected.recID];
    return true;
  }
}
