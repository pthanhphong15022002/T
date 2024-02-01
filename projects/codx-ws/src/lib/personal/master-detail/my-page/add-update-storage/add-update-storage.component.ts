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
  FormModel,
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
import { Storages } from 'projects/codx-mwp/src/lib/model/Storages.model';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'app-add-update-storage',
  templateUrl: './add-update-storage.component.html',
  styleUrls: ['./add-update-storage.component.scss'],
})
export class AddUpdateStorageComponent implements OnInit {
  readOnly = false;
  formType = '';
  funcID = 'WS00626';

  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  };
  formModel: FormModel = null;
  dialogData: any;
  dialogRef: DialogRef;
  function: any = null;
  storage: Storages = new Storages();
  data: any = null;
  action: 'add' | 'edit' = 'add';
  headerText: string = '';
  isChangeFile = false;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;

  linkAvatar = '';
  constructor(
    private authStore: AuthStore,
    private detectorRef: ChangeDetectorRef,
    private notifySV: NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogRef = dialogRef;
    this.action = dialogData?.data?.action;
    this.data = JSON.parse(JSON.stringify(dialogData?.data?.data));
    this.headerText = dialogData?.data?.text;
  }

  ngOnInit(): void {
    this.cache.functionList(this.funcID).subscribe((func: any) => {
      if (func) {
        this.function = func;
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grv) => {
            if (grv) {
              this.gridViewSetup = grv;
            }
          });
      }
    });

    if (this.action == 'edit') {
      this.getAvatar(this.data.recID, this.data.title);
    }
  }

  valueChange(e) {
    let value = e.data;
    let field = e.field;
    this.data[field] = value;
  }

  //btn save click
  async submit() {
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((img) => {
        // save file
        this.action == 'add' ? this.addStorage() : this.editStorage();
      });
    } else {
      this.action == 'add' ? this.addStorage() : this.editStorage();
    }
  }

  //insert storage
  addStorage() {
    if (this.data) {
      this.api
        .execSv('WP', 'ERM.Business.WP', 'StoragesBusiness', 'InsertAsync', [
          this.data,
        ])
        .subscribe(async (res: any) => {
          if (res) {
            this.notifySV.notifyCode(res ? 'SYS006' : 'SYS023');
            this.dialogRef.close(res);
          }
        });
    }
  }
  //edit storage
  editStorage() {
    if (this.data) {
      this.api
        .execSv('WP', 'ERM.Business.WP', 'StoragesBusiness', 'UpdateAsync', [
          this.data,
        ])
        .subscribe(async (res: boolean) => {
          if (res) {
            this.dialogRef.close(res ? this.data : null);
            this.notifySV.notifyCode(res ? 'SYS007' : 'SYS021');
          }
        });
    }
  }

  beforeSave(op: RequestOption) {
    op.service = 'WP';
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'StoragesBusiness';
    op.methodName = this.action == 'add' ? 'InsertAsync' : 'UpdateStorageAsync';
    op.data = this.data;
    return true;
  }

  addAvatar() {
    this.imageAvatar.referType = 'image';
    this.imageAvatar.uploadFile();
  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      // this.changeDetectorRef.detectChanges();
      this.detectorRef.markForCheck();
    }
  }
  getAvatar(objectID, name) {
    let avatar = [
      '',
      this.funcID,
      objectID,
      'WP_Storages',
      'inline',
      1000,
      name,
      'image',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          // this.changeDetectorRef.detectChanges();
          this.detectorRef.markForCheck();
        }
      });
  }
}
