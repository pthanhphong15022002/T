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
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { environment } from 'src/environments/environment';
import { tmpUser } from '../../models/BP_UserPermission.model';
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
  nameOld: any;
  avatarProcess: any;
  entity: any;
  ownerOld: String = '';
  isTurnPermiss: boolean = false;
  isExitUserPermiss: boolean = false;
  tmpPermission = new BP_ProcessPermissions();
  emp: tmpUser;
  onwerRole: string = 'onwer';
  userRole: string = 'user';
  folderID: string =''; // Id of versionNo
  folderName: string =''; // versionNo
  parentID: string =''; // Id of proccess
  moreFunctionCopy: string = 'copy';
  moreFunctionAdd: string = 'add';
  moreFunctionEdit: string = 'edit';
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
    this.entity = this.dialog.formModel.entityName;

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
    this.isAddPermission(this.process.owner);
    this.ownerOld = this.process.owner;
    this.processOldCopy = dt?.data[2];
    this.idSetValueOld = this.processOldCopy?.idOld;
    this.phasesOld = this.processOldCopy?.phasesOld;
    this.ActivitiesOld = this.processOldCopy?.actiOld;
    this.AttachmentsOld = this.processOldCopy?.attachOld;
    this.nameOld = this.process.processName;
    if (this.action != this.moreFunctionAdd) this.getAvatar(this.process);
    //test gán cứng
    if(this.action ===this.moreFunctionAdd || this.action===this.moreFunctionCopy) {
      this.folderName ='V0.0';
      // this.folderID ='5d6a0978-86f4-4c2d-a95c-6c5050b6fca3';
      // this.parentID ='bcd22997-982c-47eb-871c-745448fba08e';
    }
  }

  ngOnInit(): void {
    this.acceptEdit();
    this.isDisable = true;
    if (this.action === this.moreFunctionEdit) {
      this.showLabelAttachment = this.process?.attachments > 0 ? true : false;
    }
  }

  //#region method
  beforeSave(op) {
    var data = [];
    if (this.action == this.moreFunctionAdd || this.action == this.moreFunctionCopy) {
      op.method = 'AddProcessesAsync';
      op.className = 'ProcessesBusiness';

      var versions = new BP_ProcessRevisions();
      this.process.versionNo = this.folderName;
      versions.versionNo = this.process.versionNo;
      versions.createdOn = new Date();
      versions.createdBy = this.user.userID;
      versions.activedOn = this.process.activedOn;
      this.process.phases = this.action == this.moreFunctionCopy ? this.phasesOld : 0;
      this.process.activities = this.action == this.moreFunctionCopy ? this.ActivitiesOld : 0;
      if (this.action == this.moreFunctionCopy) {
        this.process.attachments = this.isCoppyFile
          ? this.process.attachments > 0
            ? this.process.attachments + this.AttachmentsOld
            : this.AttachmentsOld
          : this.process.attachments;
        this.isCoppyKeyValue = this.isCoppyFile ? 'copyFile' : 'copyDefault';
      }
      this.revisions.push(versions);
      this.process.versions = this.revisions;
      // if(this.action ===this.moreFunctionAdd){
      //   this.process.recID = this.parentID;
      //   this.process.versions[0].recID = this.folderID;
      // }
      data = [
        this.process,
        this.isCoppyKeyValue ?? '',
        this.idSetValueOld,
        this.funcID,
        this.entity,
      ];
    } else if (this.action == this.moreFunctionEdit) {
      op.method = 'UpdateProcessesAsync';
      op.className = 'ProcessesBusiness';
      data = [this.process, this.funcID, this.entity, this.ownerOld];
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
    if (this.process?.activedOn && this.process?.expiredOn) {
      if (this.process?.activedOn >= this.process?.expiredOn) {
        this.notiService.notifyCode('BP003');
        return;
      }
    }
    if (this.ownerOld === this.process?.owner && this.action === this.moreFunctionEdit) {
      this.callActionSave();
    } else {
      this.updateOrCreatProccess(this.emp);
    }
  }
  async actionSave() {
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
        this.actionSaveBeforeSaveAttachment();
      });
    } else {
      this.actionSaveBeforeSaveAttachment();
    }
  }

  async actionSaveBeforeSaveAttachment() {
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttack = 0;
          countAttack = Array.isArray(res) ? res.length : 1;
          this.process.attachments =
            this.action === this.moreFunctionEdit
              ? this.process.attachments + countAttack
              : countAttack;
          this.selectedAction();
        }
      });
    } else {
      this.selectedAction();
    }
  }
  selectedAction() {
    switch (this.action) {
      case this.moreFunctionCopy: {
        this.notiService.alertCode('BP007').subscribe((x) => {
          if (x.event.status == 'N') {
            this.isCoppyFile = false;
            this.isUpdateCreateProcess();
          } else {
            this.isCoppyFile = true;
            this.isUpdateCreateProcess();
          }
        });
        break;
      }
      case this.moreFunctionAdd: {
        this.isUpdateCreateProcess();
        break;
      }
      case this.moreFunctionEdit: {
        this.isUpdateCreateProcess();
        break;
      }
      default: {
        this.isAction = false;
        break;
      }
    }
  }

  CheckAllExistNameProccess(id: string) {
    this.bpService
      .isCheckExitName(this.process.processName, id)
      .subscribe((res) => {
        if (res) {
          this.CheckExistNameProccess();
        } else {
          this.actionSave();
        }
      });
  }
  CheckExistNameProccess() {
    this.notiService.alertCode('BP008').subscribe((x) => {
      if (x.event?.status == 'N') {
        return;
      } else if (x.event?.status == 'Y') {
        this.actionSave();
      }
    });
  }
  //#endregion method
  isUpdateCreateProcess() {
    if (this.action === this.moreFunctionAdd || this.action === this.moreFunctionCopy) {
      this.onAdd();
    } else {
      this.onUpdate();
    }
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

  addFile(e) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e?.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  fileAdded(e) { }

  valueCbx(e) { }
  //#endregion event

  valueChangeUser(e) {
    this.process.owner = e?.data;
    this.isAddPermission(this.process.owner);
  }
  isAddPermission(id) {
    this.api
      .execSv<any>('SYS', 'ERM.Business.AD', 'UsersBusiness', 'GetAsync', id)
      .subscribe((res) => {
        if (res) {
          this.perms = [];
          this.emp = res;
          this.updatePermission(this.emp, this.tmpPermission, this.onwerRole);
        }
      });
  }
  updateOrCreatProccess(emp: tmpUser) {
    if (
      this.process?.permissions != null &&
      this.process?.permissions.length > 0
    ) {
      this.process.permissions.filter(x=>x.objectID===this.tmpPermission.objectID).forEach((element) => {
          this.updatePermission(emp, element, this.onwerRole);
          this.isExitUserPermiss = true;
      });
      if (!this.isExitUserPermiss) {
        this.process.permissions.push(this.tmpPermission);
      }
    }
    else {
      this.perms.push(this.tmpPermission);
      this.process.permissions = this.perms;
    }
    this.callActionSave();
  }

  updatePermission(
    emp: tmpUser,
    tmpPermission: BP_ProcessPermissions,
    role: string
  ) {
    if (role === this.onwerRole) {
      tmpPermission.objectID = emp?.userID;
      tmpPermission.objectName = emp?.userName;
      if (emp.administrator) {
        tmpPermission.objectType = '7';
      } else if (this.checkAdminOfBP(emp.userID)) {
        tmpPermission.objectType = '7';
      }
    }
    // BE handle update onwer
    tmpPermission.objectType = '1'
    tmpPermission.memberType = '0';
    tmpPermission.autoCreate = true;

    tmpPermission.edit = true;
    tmpPermission.create = true;
    tmpPermission.publish = true;
    tmpPermission.read = true;
    tmpPermission.share = true;
    tmpPermission.full = true;
    tmpPermission.delete = true;
    tmpPermission.assign = true;
    tmpPermission.download = true;
  }
  callActionSave() {
    if (
      this.process?.processName.trim() === this.nameOld?.trim() &&
      this.action == this.moreFunctionEdit
    ) {
      this.actionSave();
    } else if (
      this.process?.processName.trim().toLocaleLowerCase() ===
      this.nameOld?.trim().toLocaleLowerCase()
    ) {
      this.CheckExistNameProccess();
    } else {
      this.CheckAllExistNameProccess(this.process.recID);
    }
  }
  checkAdminOfBP(userid: any) {
    let check: boolean;
    this.bpService.checkAdminOfBP(userid).subscribe((res) => (check = res));
    return check;
  }

  acceptEdit() {
    if (this.user.administrator) {
      this.isAcceptEdit = true;
    } else if (this.checkAdminOfBP(this.user.userId)) {
      this.isAcceptEdit = true;
    } else {
      this.isAcceptEdit = false;
    }
  }

  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile-1].avatar;
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
