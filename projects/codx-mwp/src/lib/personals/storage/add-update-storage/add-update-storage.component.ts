import { Storages } from './../../../model/Storages.model';
import { ImageViewerComponent, AuthStore, CodxService, ApiHttpService, DialogRef, DialogData, NotificationsService, DataService } from 'codx-core';
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
      this.storage = dialog.dataService.dataSelected;
      this.data = dialog.dataService.dataSelected;
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

    // this.details = [{ recID: null, refID: '62ac2c92bb0da65669b5f476', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    // { recID: null, refID: '62ac2cb1bb0da65669b5f47e', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    // { recID: null, refID: '62b179566b658d72b11b4f31', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },];
    // this.dataAdd.details = this.details;

    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'CreateStorageAsync',
      this.storage
    ).subscribe((res) => {
      if (res) {
        this.imageUpload
          .updateFileDirectReload(res.recID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              this.dialog.dataService.add(res).subscribe();
              this.dialog.close();
            }
          });
        this.dialog.dataService.add(res).subscribe();
        this.dialog.close();
        this.changedt.detectChanges();
      }
    })
  }

  editStorage() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'UpdateStorageAsync',
      [this.data?.recID, this.storage]
    ).subscribe((res) => {
      if (res) {
        this.imageUpload
          .updateFileDirectReload(this.data?.recID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              this.dialog.close();
              this.dialog.dataService.data = this.dialog.dataService.data.map(p =>
                p.recID == this.data?.recID
                  ? (p = this.storage)
                  : p
              );
            }
          });
        this.changedt.detectChanges();
      }
    })
  }
}
