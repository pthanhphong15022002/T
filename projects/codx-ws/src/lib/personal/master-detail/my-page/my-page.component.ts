import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxListviewComponent,
  CodxService,
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
  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    private api: ApiHttpService
  ) {
    this.user = this.authStore.get();
    this.dataValuePortal = this.user?.userID;
    this.dataValueNoteBook = this.user?.userID;
  }
  ngOnInit(): void {
    this.getCache();
  }

  getCache() {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.urlDetailNoteBook = res?.url;
      }
    });
  }

  openDetailPage(recID: any) {
    this.codxService.navigate('', this.urlDetailNoteBook, {
      recID: recID,
    });
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
        var dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [def?.data, 'add'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            (this.listViewNoteBooks.dataService as CRUDService)
              .add(res.event)
              .subscribe();
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
        option.DataService = this.listViewStorages.dataService as CRUDService;
        let formModel = new FormModel();
        formModel.formName = 'Storages';
        formModel.gridViewName = 'grvStorages';
        formModel.entityName = 'WP_Storages';
        formModel.funcID = 'WS00626';
        option.FormModel = formModel;
        option.Width = '550px';
        def.storageType = 'WP_Comments';
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          { data: def?.data, action: 'add', text: 'Thêm' },
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            (this.listViewStorages.dataService as CRUDService)
              .add(res.event)
              .subscribe();
          }
        });
      });
  }

  detailStorage(recID: any) {
    var option = new DialogModel();
    option.IsFull = true;
    this.callfc.openForm(
      DetailStorageComponent,
      '',
      null,
      null,
      '',
      recID,
      '',
      option
    );
  }

  extendStorage() {
    var option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    this.callfc.openForm(ExtendStorageComponent,"",null,null,"","","",option);
    // this.codxService.navigate('', '/ws/storage');
  }

  extendNoteBook() {
    // var option = new DialogModel();
    // option.IsFull = true;
    // option.zIndex = 1010;
    // this.callfc.openForm(ExtendNoteBookComponent,"",null,null,"","","",option);
    this.codxService.navigate('', '/ws/notebook');
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
        var dialog = this.callfc.openSide(
          AddUpdateStorageComponent,
          { data: data, action: 'edit', text: e?.text },
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            (this.listViewStorages.dataService as CRUDService)
              .update(res.event)
              .subscribe();
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
        var dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [data, 'edit'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            (this.listViewNoteBooks.dataService as CRUDService)
              .update(res.event)
              .subscribe();
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
          this.listViewNoteBooks.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
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
          this.listViewStorages.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
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
