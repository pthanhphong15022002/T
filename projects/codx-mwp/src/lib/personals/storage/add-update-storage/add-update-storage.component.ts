import { Storages } from './../../../model/Storages.model';
import { ImageViewerComponent, AuthStore, CodxService, ApiHttpService, DialogRef, DialogData, NotificationsService, DataService, CRUDService } from 'codx-core';
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

  storage: Storages = new Storages();

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private api: ApiHttpService,
    private storageService: StorageServices,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.funcID = dialog?.formModel?.funcID;
    this.dialog = dialog;
    this.formType = dt?.data[1];
    if (this.formType == 'edit') {
      this.header = 'Cập nhật kho lưu trữ';
      this.storage = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    }
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

    // this.storage.details = [{ recID: null, refID: 'ee558a9b-6428-4543-9029-2643966ed72f', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    // { recID: null, refID: 'a079e8d2-3d01-47a6-939e-106413fc5482', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    // { recID: null, refID: '447e3040-a56e-40b4-8dfe-5c1a50808eb6', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },];

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
        this.dialog.close();
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
