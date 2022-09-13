import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UploadFile,
  ViewsComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { Observable } from 'rxjs';
import { CodxTMService } from '../../codx-tm.service';
import { TM_Sprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'lib-popup-add-sprints',
  templateUrl: './popup-add-sprints.component.html',
  styleUrls: ['./popup-add-sprints.component.css'],
})
export class PopupAddSprintsComponent implements OnInit {
  master: any;
  title = 'Thêm Task Board';
  readOnly = false;
  listUserDetail = [];
  resources = '';
  action: string = '';
  dialog: DialogRef;
  user: any;
  funcID: string = '';
  sprintDefaut = new TM_Sprints();
  dataDefault = [];
  dataOnLoad = [];
  vllShare = 'TM003';
  isUploadImg = false;
  gridViewSetup: any;
  imageUpload: UploadFile = new UploadFile();
  showLabelAttachment = false;
  isHaveFile = false;
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    public atSV: AttachmentService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.master = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.action = dt?.data[1];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.funcID = this.dialog.formModel.funcID;
    this.sprintDefaut = this.dialog.dataService.data[0];
    this.dataDefault.push(this.sprintDefaut);
    this.dataOnLoad = this.dialog.dataService.data;
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  //#region init
  ngOnInit(): void {
    if (this.action == 'add') {
      this.master.viewMode = '1';
      if (this.funcID == 'TMT0301') this.master.iterationType = '1';
      if (this.funcID == 'TMT0302') this.master.iterationType = '0';
    } else if (this.action == 'copy')
      this.getSprintsCoppied(this.master.iterationID);
    else this.openInfo(this.master.iterationID, this.action);
  }
  //#endregion

  //#region CRUD
  saveData(id) {
    if (
      this.master.iterationName == null ||
      this.master.iterationName.trim() == ''
    )
      return this.notiService.notifyCode('TM035');
    if (this.master.projectID && Array.isArray(this.master.projectID))
      this.master.projectID = this.master.projectID[0];
    if (!this.master.isShared) this.master.resources = null;
    if (this.resources == '') this.master.resources = null;
    else this.master.resources = this.resources;
    var isAdd = this.action == 'edit' ? false : true;
    if (this.attachment.fileUploadList.length) this.attachment.saveFiles();
    this.saveMaster(isAdd);
  }

  saveMaster(isAdd: boolean) {
    this.imageAvatar
      .updateFileDirectReload(this.master.iterationID)
      .subscribe((up) => {
        this.dialog.dataService
          .save(
            (option: any) => this.beforeSave(option, isAdd),
            isAdd ? 0 : null
          )
          .subscribe((res) => {
            if (res) {
              if (isAdd && res.iterationType == '0') {
                var dataNew = this.dialog.dataService.data[0];
                this.dialog.dataService.data[0] =
                  this.dialog.dataService.data[1];
                this.dialog.dataService.data[1] = dataNew;
              }
              this.attachment.clearData();
              this.dialog.close();
            }
          });
      });
  }

  //#endregion

  //#region Event Method
  beforeSave(op: any, isAdd) {
    op.method = 'AddEditSprintAsync';
    op.data = [this.master, isAdd];
    return true;
  }

  closeTaskBoard() {
    this.listUserDetail = [];
    this.master = {};
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    if (this.resources == '') this.resources = listUser;
    else this.resources += ';' + listUser;
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(listUser.split(';'))
      )
      .subscribe((res) => {
        this.listUserDetail = this.listUserDetail.concat(res);
      });
  }

  onDeleteUser(userID) {
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
    }
    this.listUserDetail = listUserDetail;
    var resources = '';
    if (listUserDetail.length > 0) {
      listUserDetail.forEach((user) => {
        resources += user.userID + ';';
      });
      resources = resources.slice(0, -1);
      this.resources = resources;
    } else this.resources = '';
  }

  openInfo(iterationID, action) {
    this.readOnly = false;
    this.title = 'Chỉnh sửa task board';
    this.tmSv.getSprints(iterationID).subscribe((res) => {
      if (res) {
        this.master = res;
        this.api
          .execSv<any[]>(
            'DM',
            'DM',
            'FileBussiness',
            'GetFilesByObjectIDAsync',
            [iterationID]
          )
          .subscribe((res) => {
            if (res && res.length > 0) this.showLabelAttachment = true;
            else this.showLabelAttachment = false;
          });
        if (this.master.resources) this.getListUser(this.master.resources);
        else this.listUserDetail = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getSprintsCoppied(interationID) {
    this.title = 'Copy task boads';
    this.readOnly = false;
    this.listUserDetail = [];
    this.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        this.master.projectID = res.projectID;
        this.master.iterationName = res.iterationName;
        this.master.viewMode = res.viewMode;
        this.master.memo = res.memo;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  valueChangeSharedResource(e) {
    this.master.isShared = e.data;
    //bỏ luôn
    // if (!this.master.isShared) {
    //   this.master.resources = null;
    //   this.listUserDetail = [];
    // }
  }

  // changText(e) {
  //   this.master.iterationName = e?.data;
  // }
  // changeMemo(e) {
  //   this.master.memo = e?.data;
  // }
  // changeViewMode(e) {
  //   this.master.viewMode = e?.data;
  // }
  changeData(e) {
    if (e?.field) this.master[e.field] = e?.data;
  }

  changeUser(e) {
    if (e?.data?.value.length > 0) {
      var arrResources = e?.data?.value;
      this.valueSelectUserCombobox(arrResources);
    }
  }

  valueSelectUserCombobox(arrResources: any[]) {
    var resources = '';
    if (arrResources.length > 0) {
      if (this.master.resources != null && this.master.resources != '') {
        var arrNew = [];
        arrResources.forEach((e) => {
          if (!this.master.resources.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          resources = arrNew.join(';');
          this.master.resources += ';' + resources;
          this.getListUser(resources);
        }
      } else {
        resources = arrResources.join(';');
        this.master.resources = resources;
        this.getListUser(resources);
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
  }
}
