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
import { drillThroughClosed } from '@syncfusion/ej2-pivotview';
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
import { CodxTMService } from '../../codx-tm.service';
import { TM_Sprints } from '../../models/TM_Sprints.model';
import { AttachmentService } from 'projects/codx-common/src/lib/component/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

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
  isClickSave = false;
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Output() loadData = new EventEmitter();

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
    if (!this.master.iterationID) {
      //khong co cai nay thi ko add file dc
      this.tmSv
        .genAutoNumber(
          this.dialog.formModel.funcID,
          dialog.formModel.entityName,
          'IterationID'
        )
        .subscribe((res) => {
          if (res) this.master.iterationID = res;
        });
    }
    //đã bổ sung nên có thể xóa
    // if (this.funcID == 'TMT0301') this.master.iterationType == '1';
    // else if (this.funcID == 'TMT0302') this.master.iterationType == '0';
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
    ) {
      // return this.notiService.notifyCode('TM035');
      let headerText =
        this.gridViewSetup['ProjectID']?.headerText ?? 'ProjectID';
      return this.notiService.notifyCode('SYS009', 0, '"' + headerText + '"');
    }
    if (
      this.master.iterationName == null ||
      this.master.iterationName.trim() == ''
    ) {
      let headerText =
        this.gridViewSetup['IterationName']?.headerText ?? 'IterationName';
      return this.notiService.notifyCode('SYS009', 0, '"' + headerText + '"');
    }

    if (this.master.projectID && Array.isArray(this.master.projectID))
      this.master.projectID = this.master.projectID[0];
    if (!this.master.isShared) this.master.resources = null;
    if (this.resources == '') this.master.resources = null;
    else this.master.resources = this.resources;
    var isAdd = this.action == 'edit' ? false : true;
    if (this.isClickSave) return;
    this.isClickSave = true;
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          let attachments = Array.isArray(res) ? res.length : 1;
          if (isAdd) this.master.attachments = attachments;
          else this.master.attachments += attachments;
          this.saveMaster(isAdd);
        }
      });
    else {
      this.saveMaster(isAdd);
    }
  }

  saveMaster(isAdd: boolean) {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option, isAdd), !isAdd ? null : 0)
      .subscribe((res) => {
        if (res) {
          this.attachment?.clearData();
          var dt = isAdd ? res.save : res.update;
          (this.dialog.dataService as CRUDService).update(dt).subscribe();
          if (this.imageAvatar) {
            this.imageAvatar
              .updateFileDirectReload(this.master.iterationID)
              .subscribe((up) => {
                if (up) {
                  this.dialog.close(dt);
                } else this.dialog.close();
              });
          } else this.dialog.close();
        } else this.dialog.close();
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

    this.tmSv.getSprints(iterationID).subscribe((res) => {
      if (res) {
        this.master = res;
        this.showLabelAttachment = this.master.attachments > 0 ? true : false;
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
      let projectName = e.component?.itemsSelected[0]?.ProjectName;
      if (projectName) this.master.iterationName = projectName;
      //
      // var service = e.component?.service;
      // this.api
      //   .exec<any>(service, 'ProjectsBusiness', 'GetProjectByIDAsync', e?.data)
      //   .subscribe((res) => {
      //     if (res) this.master.iterationName = res?.projectName;
      //   });

      // this.form.formGroup.patchValue(this.master);
      this.changeDetectorRef.detectChanges();
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
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  // checkValidateForm(
  //   grvSetup,
  //   model,
  //   noValidCout,
  //   ignoredFields: string[] = []
  // ) {
  //   ignoredFields = ignoredFields.map((i) => i.toLowerCase()); ///1 so truogn hợp ko check bên ngoai là bỏ qua
  //   var keygrid = Object.keys(grvSetup);
  //   var keymodel = Object.keys(model);
  //   for (let index = 0; index < keygrid.length; index++) {
  //     if (grvSetup[keygrid[index]].isRequire == true) {
  //       if (ignoredFields.includes(keygrid[index].toLowerCase())) {
  //         continue;
  //       }
  //       for (let i = 0; i < keymodel.length; i++) {
  //         if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
  //           if (
  //             model[keymodel[i]] === null ||
  //             String(model[keymodel[i]]).match(/^ *$/) !== null ||
  //             model[keymodel[i]] == 0 ||
  //             model[keymodel[i]].trim() == ''
  //           ) {
  //             this.notiService.notifyCode(
  //               'SYS009',
  //               0,
  //               '"' + grvSetup[keygrid[index]].headerText + '"'
  //             );
  //             noValidCout++;
  //             return noValidCout;
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return noValidCout;
  // }
}
