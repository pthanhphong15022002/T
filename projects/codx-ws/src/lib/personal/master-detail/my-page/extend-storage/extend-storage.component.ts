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
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewType,
} from 'codx-core';
import { DetailStorageComponent } from '../detail-storage/detail-storage.component';
import { AddUpdateStorageComponent } from '../add-update-storage/add-update-storage.component';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';
import { CodxViewWsComponent } from 'projects/codx-ws/src/lib/codx-view-ws/codx-view-ws.component';
import { CodxWsService } from 'projects/codx-ws/src/public-api';

@Component({
  selector: 'lib-extend-storage',
  templateUrl: './extend-storage.component.html',
  styleUrls: ['./extend-storage.component.scss'],
})
export class ExtendStorageComponent implements OnInit {
  @ViewChild('codxview') codxview: CodxViewWsComponent;

  dialog: any;
  user: any;
  formModel: FormModel = {
    formName: 'Storages',
    gridViewName: 'grvStorages',
    entityName: 'WP_Storages',
    funcID: 'WS00626',
  };
  viewList: Array<ViewModel> = [];
  dataSelected: any;
  constructor(
    private callfc: CallFuncService,
    private auth: AuthStore,
    private codxService: CodxService,
    private notification: NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,
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
  }

  close() {
    this.dialog.close();
    // this.codxService.navigate('', '/ws/personal/WS006');
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

  addClick(e: any) {
    this.api
      .execSv<any>('WP', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'WS00626',
        'WP_Storages',
      ])
      .subscribe((def) => {
        let option = new SidebarModel();
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
            this.codxview.addDataSource(res.event);
            this.dataSelected = res.event;
            this.wsSv.loadDataList.next({
              data: res.event,
              type: 'storage',
              action: 'add',
            });
            this.detectorRef.detectChanges();
          }
        });
      });
  }
  clickMF(e) {
    this.clickMFStorage(e?.e, e?.data);
  }

  selectChange(e) {
    this.dataSelected = e?.data;
  }
  clickMFStorage(e: any, data: any) {
    this.dataSelected = data;
    switch (e?.functionID) {
      //Chỉnh sửa
      case 'SYS03': {
        let option = new SidebarModel();
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
            res.event.modifiedBy = this.user?.userID;
            res.event.modifiedOn = new Date()
            this.dataSelected = res.event;
            this.codxview.updateDataSource(res.event);
            this.wsSv.loadDataList.next({
              data: res.event,
              type: 'storage',
              action: 'update',
            });
            this.detectorRef.detectChanges();
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
                'StoragesBusiness',
                'DeleteStorageAsync',
                data?.recID
              )
              .subscribe((item) => {
                if (item){
                  this.codxview.deleteDataSource(this.dataSelected);
                  this.wsSv.loadDataList.next({data:this.dataSelected, type: 'storage', action: 'delete'});
                }
                this.detectorRef.detectChanges();
              });
          }
        });
        break;
      }
    }
  }
}
