import {
  BP_Processes,
  BP_ProcessPermissions,
  BP_ProcessRevisions,
} from './../../models/BP_Processes.model';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  CacheService,
  CallFuncService,
  AuthStore,
  NotificationsService,
  ApiHttpService,
  ImageViewerComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-popup-add-processes',
  templateUrl: './popup-add-processes.component.html',
  styleUrls: ['./popup-add-processes.component.css'],
})
export class PopupAddProcessesComponent implements OnInit {
  @Input() process = new BP_Processes();
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;

  data: any;
  dialog: any;
  title = '';
  titleAction = '';
  action: any;
  gridViewSetup: any;
  listCombobox = {};
  listName = '';
  fieldValue = '';
  funcID: any;
  showLabelAttachment = false;
  isHaveFile = false;
  revisions: BP_ProcessRevisions[] = [];
  perms: BP_ProcessPermissions[] = [];
  user: any;
  isCoppyFile: any;
  isAction: boolean = false;
  idSetValueOld: any;
  isDisable: any;
  phasesOld: any;
  ActivitiesOld: any;
  AttachmentsOld: any;
  processOldCopy: any;
  flowChart: any;
  isCoppyKeyValue: any = '';
  isAcceptEdit: any;
  linkAvatar = '';
  isCheckNameProcess: any;
  nameOld:any;
  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private bpService: CodxBpService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.process = this.data;
    this.titleAction = dt.data[1];
    this.action = dt.data[0];
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.title =
          this.titleAction +
          ' ' +
          res.customName.charAt(0).toLocaleLowerCase() +
          res.customName.slice(1);
      }
    });
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
    if (this.action === 'add' || this.action === 'copy')
      this.isAddPermission(this.process.owner);
    this.processOldCopy = dt?.data[2];
    this.idSetValueOld = this.processOldCopy?.idOld;
    this.phasesOld = this.processOldCopy?.phasesOld;
    this.ActivitiesOld = this.processOldCopy?.actiOld;
    this.AttachmentsOld = this.processOldCopy?.attachOld;
    this.nameOld = this.process.processName;
    if (this.action != 'add') this.getAvatar(this.process);
  }

  ngOnInit(): void {
    this.acceptEdit();
    if (this.action === 'add' || this.action === 'copy') {
      this.isDisable = true;
    }
    if (this.action === 'edit') {
      this.showLabelAttachment = this.process?.attachments > 0 ? true : false;
    }
  }

  //#region method
  beforeSave(op) {
    var data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.method = 'AddProcessesAsync';
      op.className = 'ProcessesBusiness';

      var versions = new BP_ProcessRevisions();
      this.process.versionNo = 'V0.0';
      versions.versionNo = this.process.versionNo;
      versions.createdOn = new Date();
      versions.createdBy = this.user.userID;
      versions.activedOn = this.process.activedOn;
      this.process.phases = this.action == 'copy' ? this.phasesOld : 0;
      this.process.activities = this.action == 'copy' ? this.ActivitiesOld : 0;
      if (this.action == 'copy') {
        this.process.attachments = this.isCoppyFile ? this.AttachmentsOld : 0;
        this.isCoppyKeyValue = this.isCoppyFile ? 'copyFile' : 'copyDefault';
      }
      this.revisions.push(versions);
      this.process.versions = this.revisions;

      data = [this.process, this.isCoppyKeyValue ?? '', this.idSetValueOld];
    } else if (this.action == 'edit') {
      op.method = 'UpdateProcessesAsync';
      op.className = 'ProcessesBusiness';
      data = [this.process];
    }

    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.attachment?.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.attachment?.clearData();
          this.dialog.close(res.update);
        }
      });
  }
  async onSave() {
    if (
      this.process.processName == null ||
      this.process.processName.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessName']?.headerText + '"'
      );
      return;
    }
    if (this.process.owner == null || this.process.owner.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }
    // if (!this.process.activedOn) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['ActivedOn']?.headerText + '"'
    //   );
    //   return;
    // }
    // if (!this.process.expiredOn) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['ExpiredOn']?.headerText + '"'
    //   );
    //   return;
    // }
    if (this.process.activedOn && this.process.expiredOn) {
      if (this.process.activedOn >= this.process.expiredOn) {
        this.notiService.notifyCode('BP003');
        return;
      }
    }

    // if (this.process.activedOn && this.process.expiredOn) {
    //   // if (this.isCheckFromToDate(this.process.activedOn)) {
    //   //   this.notiService.notify(
    //   //     'Vui lòng chọn ngày hiệu lực lớn hơn ngày hiện tại!'
    //   //   );
    //   //   return;
    //   // }
    // }
    if (this.process.processName.trim() === this.nameOld?.trim()) {
      this.bpService
        .isCheckExitName(this.process.processName)
        .subscribe((res) => {
          if (res) {
            this.notiService.alertCode('Tên quy trình đã tồn tại, bạn có muốn tiếp tục lưu trùng tên không?').subscribe((x) => {
              if (x.event?.status == 'N') {
                return;
              } else if (x.event?.status == 'Y') {
                this.actionSave();
              }
            });
          }
        });
    }
    else {
      this.actionSave();
    }
  }
 async actionSave(){
    if (this.attachment?.fileUploadList?.length)
    (await this.attachment.saveFilesObservable()).subscribe((res) => {
      if (res) {
        var countAttack = 0;
        countAttack = Array.isArray(res) ? res.length : 1;
        if (this.action === 'edit') {
          this.process.attachments += countAttack;
        } else {
          this.process.attachments = countAttack;
        }
      }
    });
  switch (this.action) {
    case 'copy': {
      this.notiService.alertCode('Tên quy trình đã tồn tại, bạn có muốn tiếp tục lưu trùng tên không?').subscribe((x) => {
        if (x.event?.status == 'N') {
          this.isCoppyFile = false;
          this.isUpdateCreateProcess();
          this.isAddPermission(this.process.owner);
        } else if (x.event?.status == 'Y') {
          this.isCoppyFile = true;
          this.isUpdateCreateProcess();
          this.isAddPermission(this.process.owner);
        } else {
          return;
        }
      });
      break;
    }
    case 'add': {
      this.isUpdateCreateProcess();
      this.isAddPermission(this.process.owner);
      break;
    }
    case 'edit': {
      this.isUpdateCreateProcess();
      this.isAddPermission(this.process.owner);
      break;
    }
    default: {
      this.isAction = false;
      break;
    }
  }
  }
  //#endregion method
  isUpdateCreateProcess() {
    if (this.action === 'add' || this.action === 'copy') {
      this.onAdd();
    } else this.onUpdate();
  }
  //#region check date
  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to <= new Date()) return true;
    else return false;
  }
  ////#endregion

  //#region event
  valueChange(e) {
    this.process[e.field] = e.data;
  }

  valueChangeTag(e) {
    this.process.tags = e.data;
  }

  valueDateChange(e) {
    this.process[e.field] = e.data.fromDate;
  }

  // eventApply(e) {
  //   var data = e.data[0];
  //   var id = '';
  //   switch (data.objectType) {
  //     case 'U':
  //       this.process.owner = data.id;
  //       break;
  //   }
  //   if (this.process.owner) {
  //     this.addPermission(this.process.owner);
  //   }
  // }

  addPermission(id) {
    if (id != null) {
      this.isAddPermission(id);
    }
  }

  // valueOwner(id) {
  //   this.api
  //     .execSv<any>('SYS', 'ERM.Business.AD', 'UsersBusiness', 'GetAsync', id)
  //     .subscribe((res) => {
  //       if (res) {
  //         this.perms = [];
  //         let emp = res;
  //         var tmpPermission = new BP_ProcessPermissions();
  //         tmpPermission.objectID = emp?.userID;
  //         tmpPermission.objectName = emp?.userName;
  //         tmpPermission.objectType = '1';
  //         tmpPermission.read = true;
  //         tmpPermission.share = true;
  //         tmpPermission.full = true;
  //         tmpPermission.delete = true;
  //         tmpPermission.update = true;
  //         tmpPermission.upload = true;
  //         tmpPermission.assign = true;
  //         tmpPermission.download = true;
  //         tmpPermission.memberType = '0';
  //         tmpPermission.autoCreate = true;
  //         this.perms.push(tmpPermission);

  //         this.process.permissions = this.perms;
  //       }
  //     });
  // }

  addFile(e) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
  }
  fileAdded(e) {}

  valueCbx(e) {}
  //#endregion event

  valueChangeUser(e) {
    this.process.owner = e?.data;

  }
  isAddPermission(id) {
    this.api
      .execSv<any>('SYS', 'ERM.Business.AD', 'UsersBusiness', 'GetAsync', id)
      .subscribe((res) => {
        if (res) {
          this.perms = [];
          let emp = res;
          var tmpPermission = new BP_ProcessPermissions();

          tmpPermission.objectID = emp?.userID;
          tmpPermission.objectName = emp?.userName;
          tmpPermission.objectType = '1';
          tmpPermission.memberType = '0';
          tmpPermission.autoCreate = true;
          if (emp.administrator) {
            tmpPermission.objectType = '7';
          } else if (this.checkAdminOfBP(emp.id)) {
            tmpPermission.objectType = '7';
          }

          tmpPermission.read = true;
          tmpPermission.share = true;
          tmpPermission.full = true;
          tmpPermission.delete = true;
          tmpPermission.update = true;
          tmpPermission.upload = true;
          tmpPermission.assign = true;
          tmpPermission.download = true;
          tmpPermission.memberType = '0';
          tmpPermission.autoCreate = true;
          this.perms.push(tmpPermission);

          this.process.permissions = this.perms;
        }
      });
  }
  checkAdminOfBP(userid: any) {
    let check: boolean;
    this.bpService.checkAdminOfBP(userid).subscribe((res) => (check = res));
    return check;
  }
  // checkValiName(nameVersion: string){
  //   let check=true;
  //   this.revisions.forEach(element => {
  //     if(element.versionName == nameVersion.trim()) {
  //       check= false;
  //     }
  //   });
  // }

  acceptEdit() {
    if (this.user.administrator) {
      this.isAcceptEdit = true;
    } else if (this.checkAdminOfBP(this.user.userId)) {
      this.isAcceptEdit = true;
    } else {
      this.isAcceptEdit = false;
    }
  }

  //add Avtarar
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileSaveAvatar(e) {
    if (e && typeof e === 'object') {
      this.linkAvatar = environment.urlUpload + '/' + e?.pathDisk;
      this.changeDetectorRef.detectChanges();
    }
  }
  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    let flowChart = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'Flowchart',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        } else {
          this.api
            .execSv<any>(
              'DM',
              'DM',
              'FileBussiness',
              'GetAvatarAsync',
              flowChart
            )
            .subscribe((res) => {
              if (res && res?.url) {
                this.linkAvatar = environment.urlUpload + '/' + res?.url;
                this.changeDetectorRef.detectChanges();
              }
            });
        }
      });
  }
}
