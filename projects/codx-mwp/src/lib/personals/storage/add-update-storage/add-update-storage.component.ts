import { Storages } from './../../../model/Storages.model';
import { ImageViewerComponent, AuthStore, CodxService, ApiHttpService, DialogRef, DialogData, NotificationsService, DataService, CRUDService, CacheService } from 'codx-core';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef, Optional } from '@angular/core';
import { StorageServices } from '../../../services/storage.services';

@Component({
  selector: 'app-add-update-storage',
  templateUrl: './add-update-storage.component.html',
  styleUrls: ['./add-update-storage.component.scss']
})
export class AddUpdateStorageComponent implements OnInit {

  dialog: DialogRef;
  readOnly = false;
  formType = '';
  data: any = [];
  funcID = '';
  header = 'Thêm mới kho lưu trữ'
  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  }
  formModel: any;

  storage: Storages = new Storages();

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private api: ApiHttpService,
    private storageService: StorageServices,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.funcID = dialog?.formModel?.funcID;
    this.formModel = dialog?.formModel;
    this.dialog = dialog;
    this.formType = dt?.data[1];
    if (this.formType == 'edit') {
      this.header = 'Cập nhật kho lưu trữ';
      this.storage = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    }
    this.cache.gridViewSetup('Storages', 'grvStorages').subscribe((res) => {
      if(res) {
        this.gridViewSetup.title = res?.Title?.headerText;
        this.gridViewSetup.memo = res?.Memo?.headerText;
      }
    })
  }

  ngOnInit(): void {
  }

  valueChange(e) {
    if (e) {
      var dt = e.data;
      var field = e.field;
      this.storage[field] = dt?.value ? dt?.value : dt;
    }
  }

  saveStorage() {
    if (this.formType == 'add') {
      this.addStorage();
    } else this.editStorage();
  }

  addStorage() {
    this.storage.storageType = "WP_Comments";

    this.storage.details = [{ recID: null, refID: 'd5b77791-0118-4c45-baeb-9446e4ca03db', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    { recID: null, refID: '1cff3577-4847-48f8-8daf-4bf7df8a58f6', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    { recID: null, refID: '9689247a-8265-44a8-8c50-82a89706a7ef', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },];

    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'CreateStorageAsync',
      this.storage
    ).subscribe((res) => {
      if (res) {
        if (this.imageUpload) {
          this.imageUpload
            .updateFileDirectReload(res.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
                this.dialog.dataService.add(res).subscribe();
              }
            });
        } else
          this.dialog.dataService.add(res).subscribe();
        this.dialog.close(res);
      }
    })
  }

  editStorage() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'UpdateStorageAsync',
      [this.storage?.recID, this.storage]
    ).subscribe((res) => {
      if (res) {
        if (this.imageUpload) {
          this.imageUpload
            .updateFileDirectReload(this.data?.recID)
            .subscribe((result) => {
              this.loadData.emit();
              (this.dialog.dataService as CRUDService).update(res).subscribe();
            });
        } else
          (this.dialog.dataService as CRUDService).update(res).subscribe();
        this.dialog.close();
      }
    })
  }
}
