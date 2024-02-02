import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AddUpdateNoteBookComponent } from '../add-update-note-book/add-update-note-book.component';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';
import { CodxViewWsComponent } from 'projects/codx-ws/src/lib/codx-view-ws/codx-view-ws.component';
import { CodxWsService } from 'projects/codx-ws/src/public-api';

@Component({
  selector: 'lib-extend-note-book',
  templateUrl: './extend-note-book.component.html',
  styleUrls: ['./extend-note-book.component.scss'],
})
export class ExtendNoteBookComponent implements OnInit {
  @ViewChild('codxview') codxview: CodxViewWsComponent;

  dialog: any;
  user: any;
  urlDetailNoteBook: any;
  formModel: FormModel = {
    formName: 'NoteBooks',
    gridViewName: 'grvNoteBooks',
    entityName: 'WP_NoteBooks',
    funcID: 'WS00625',
  };
  viewList: Array<ViewModel> = [];
  dataSelected: any;
  constructor(
    private callfc: CallFuncService,
    private auth: AuthStore,
    private codxService: CodxService,
    private cache: CacheService,
    private notification: NotificationsService,
    private api: ApiHttpService,
    private ref: ChangeDetectorRef,
    private wsSv: CodxWsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.viewList = [
      {
        type: ViewType.list,
        active: true,
      },
      {
        type: ViewType.grid,
        active: false,
      },
    ];
    this.getCache();
  }

  getCache() {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.urlDetailNoteBook = res?.url;
      }
    });
  }

  close() {
    this.dialog.close();
    // this.codxService.navigate("","/ws/personal/WS006");
  }

  detailStorage(recID: any) {
    // var option = new DialogModel();
    // option.IsFull = true;
    // this.callfc.openForm(DetailStorageComponent,"",null,null,"",recID,"",option);
  }

  addClick(e: any) {
    this.api
      .execSv<any>('WP', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'WS00625',
        'WP_NoteBooks',
      ])
      .subscribe((def) => {
        let option = new SidebarModel();
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
            this.codxview.addDataSource(res.event);
            this.wsSv.loadDataList.next({data: res.event, type: 'notebook', action: 'add'});
            this.ref.detectChanges();
          }
        });
      });
  }

  clickMF(e) {
    this.clickMFNoteBook(e?.e, e?.data);
  }

  selectChange(e) {
    this.dataSelected = e?.data;
  }

  openDetailPage(recID: any) {
    this.codxService.navigate('', this.urlDetailNoteBook, {
      recID: recID,
    });
  }

  clickMFNoteBook(e: any, data: any) {
    switch (e?.functionID) {
      //Chỉnh sửa
      case 'SYS03': {
        let option = new SidebarModel();
        let formModel = new FormModel();
        formModel.formName = 'NoteBooks';
        formModel.gridViewName = 'grvNoteBooks';
        formModel.entityName = 'WP_NoteBooks';
        formModel.funcID = 'WS00625';
        option.FormModel = formModel;
        option.Width = '550px';
        option.zIndex = 2001;
        var dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [data, 'edit'],
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            res.event['modifiedOn'] = new Date();
            this.codxview.updateDataSource(res.event);
            this.wsSv.loadDataList.next({data: res.event, type: 'notebook', action: 'update'});
            this.ref.detectChanges();

          }
        });
        break;
      }
      //Xóa
      case 'SYS02': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notification.alertCode('SYS030').subscribe((x) => {
          if (x.event.status == 'Y') {
            this.api
              .execSv(
                'WP',
                'WP',
                'NoteBooksBusiness',
                'DeleteNoteBookAsync',
                data?.recID
              )
              .subscribe((item) => {
                if (item){
                  this.codxview.deleteDataSource(this.dataSelected);
                  this.wsSv.loadDataList.next({data:item, type: 'notebook', action: 'delete'});
                }
                this.ref.detectChanges();

              });
          }
        });
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
}
