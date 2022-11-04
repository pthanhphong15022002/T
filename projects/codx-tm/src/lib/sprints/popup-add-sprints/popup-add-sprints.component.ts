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
  CRUDService,
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
  title = '';
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
  isUploadImg = true;
  gridViewSetup: any;
  imageUpload: UploadFile = new UploadFile();
  showLabelAttachment = false;
  isHaveFile = false;
  titleAction = '';
  customName = '';

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
    this.titleAction = dt?.data[2];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.funcID = this.dialog.formModel.funcID;

    if (this.funcID == 'TMT0301') this.master.iterationType == '1';
    else if (this.funcID == 'TMT0302') this.master.iterationType == '0';
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
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.customName = f?.customName;
        this.title =
          this.titleAction +
          ' ' +
          this.customName.charAt(0).toLocaleLowerCase() +
          this.customName.slice(1);
      }
    });

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
  async saveData(id) {
    if (
      this.master.iterationType == '1' &&
      (this.master.projectID == null || this.master.projectID.trim() == '')
    )
      return this.notiService.notify('Tên dự án không được để trống !'); ///Nhờ Hảo, cho câu messCode
    if (
      this.master.iterationType == '0' &&
      (this.master.iterationName == null ||
        this.master.iterationName.trim() == '')
    )
      return this.notiService.notifyCode('TM035');
    if (this.master.projectID && Array.isArray(this.master.projectID))
      this.master.projectID = this.master.projectID[0];
    if (!this.master.isShared) this.master.resources = null;
    if (this.resources == '') this.master.resources = null;
    else this.master.resources = this.resources;
    var isAdd = this.action == 'edit' ? false : true;
    
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.master.attachments = Array.isArray(res) ? res.length : 1;
          this.saveMaster(isAdd);
        }
      });
    else {
      this.saveMaster(isAdd);
    }  
  }

  saveMaster(isAdd: boolean) {
    //comnet tạm
    // this.imageAvatar
    //   .updateFileDirectReload(this.master.iterationID)
    //   .subscribe((up) => {
      // !isAdd ? null : this.master.iterationType == '1' ? 0 : 1
    this.dialog.dataService
      .save(
        (option: any) => this.beforeSave(option, isAdd),
        !isAdd ? null : 0 
      )
      .subscribe((res) => {
        if (res) {
          this.attachment?.clearData();
          var dt = isAdd ? res.save : res.update;
          if (this.imageAvatar) {
            this.imageAvatar
              .updateFileDirectReload(this.master.iterationID)
              .subscribe((up) => {
                (this.dialog.dataService as CRUDService).update(dt).subscribe();
                this.dialog.close();
              });
          } else this.dialog.close();
        }
      });
    // });
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

    this.tmSv.getSprints(iterationID).subscribe((res) => {
      if (res) {
        this.master = res;
        this.showLabelAttachment = this.master.attachments > 0? true : false ;
        if (this.master.resources) this.getListUser(this.master.resources);
        else this.listUserDetail = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getSprintsCoppied(interationID) {
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
  }

  changeData(e) {
    if (e?.field) this.master[e.field] = e?.data;
  }
  changeProject(e) {
    if (e.field == 'projectID' && e?.data && e?.data.trim() != '') {
      this.master[e.field] = e?.data;
      var service = e.component?.service;

      this.api
        .exec<any>(service, 'ProjectsBusiness', 'GetProjectByIDAsync', e?.data)
        .subscribe((res) => {
          if (res) this.master.iterationName = res?.projectName;
        });
    }
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
