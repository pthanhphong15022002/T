import { Storages } from './../../../model/Storages.model';
import {
  ImageViewerComponent,
  AuthStore,
  CodxService,
  ApiHttpService,
  DialogRef,
  DialogData,
  NotificationsService,
  DataService,
  CRUDService,
  CacheService,
  RequestOption,
} from 'codx-core';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import { StorageServices } from '../../../services/storage.services';

@Component({
  selector: 'app-add-update-storage',
  templateUrl: './add-update-storage.component.html',
  styleUrls: ['./add-update-storage.component.scss'],
})
export class AddUpdateStorageComponent implements OnInit {
  dialog: DialogRef;
  readOnly = false;
  formType = '';
  data: any = [];
  funcID = '';
  header = 'Thêm mới kho lưu trữ';
  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  };
  formModel: any;

  storage: Storages = new Storages();

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private api: ApiHttpService,
    private storageService: StorageServices,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.funcID = dialog?.formModel?.funcID;
    this.formModel = dialog?.formModel;
    this.dialog = dialog;
    this.formType = dt?.data[1];
    if (this.formType == 'edit') {
      this.header = 'Cập nhật kho lưu trữ';
      this.storage = JSON.parse(
        JSON.stringify(dialog.dataService.dataSelected)
      );
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    }
    this.cache.gridViewSetup('Storages', 'grvStorages').subscribe((res) => {
      if (res) {
        this.gridViewSetup.title = res?.Title?.headerText;
        this.gridViewSetup.memo = res?.Memo?.headerText;
      }
    });
  }

  ngOnInit(): void {}

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
    this.storage.storageType = 'WP_Comments';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          if (this.imageUpload) {
            this.imageUpload
              .updateFileDirectReload(res.save.recID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
              });
            this.dialog.close(res.save);
          }
        }
      });
  }

  editStorage() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          if (this.imageUpload) {
            this.imageUpload
              .updateFileDirectReload(res.update.recID)
              .subscribe((result) => {
                this.loadData.emit();
              });
          }
          this.dialog.close(res.update);
        }
      });
  }

  beforeSave(op: RequestOption) {
    var data = [];
    op.service = 'WP';
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'StoragesBusiness';
    if (this.formType == 'add') {
      op.methodName = 'CreateStorageAsync';
      data = [this.storage];
    }
    if (this.formType == 'edit') {
      op.methodName = 'UpdateStorageAsync';
      data = [this.storage?.recID, this.storage];
    }
    op.data = data;
    return true;
  }
}
