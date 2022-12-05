import { map } from 'rxjs';
import {
  OnInit,
  Optional,
  ViewChild,
  Component,
  ChangeDetectorRef,
  Injector,
} from '@angular/core';
import {
  AuthStore,
  DialogRef,
  FormModel,
  DialogData,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FormControlName } from '@angular/forms';
import { CodxBpService } from '../../codx-bp.service';
import {
  BP_ProcessOwners,
  BP_ProcessSteps,
} from '../../models/BP_Processes.model';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
//import { PopupAddEmailTemplateComponent } from 'projects/codx-es/src/lib/setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';

@Component({
  selector: 'lib-popup-add-process-steps',
  templateUrl: './popup-add-process-steps.component.html',
  styleUrls: ['./popup-add-process-steps.component.css'],
})
export class PopupAddProcessStepsComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('form') form: FormControlName;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialog!: DialogRef;
  formModel: FormModel;
  processSteps: BP_ProcessSteps;
  owners: Array<BP_ProcessOwners> = [];
  ownersClone: any = [];

  user: any;
  data: any;
  funcID: any;
  title = '';
  action = '';
  recIdEmail = '';
  textChange = '';
  titleActon = '';
  stepType = 'C';
  vllShare = 'BP021';
  readOnly = false;
  isHaveFile = false;
  isNewEmails = true;
  showLabelAttachment = false;
  listUser = [];
  referenceText = [];
  listOwnerDetails = [];
  popover: any;
  formModelMenu: FormModel;
  crrIndex = 0;
  gridViewSetup: any;
  recIDCopied: any;

  constructor(
    private inject: Injector,
    private bpService: CodxBpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private changeDef: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.processSteps = JSON.parse(
      JSON.stringify(dialog.dataService!.dataSelected)
    );

    this.action = dt?.data[0];
    this.titleActon = dt?.data[1];
    this.stepType = dt?.data[2];
    this.formModelMenu = dt?.data[3];
    this.recIDCopied = dt?.data[4]
    if (this.stepType) this.processSteps.stepType = this.stepType;
    this.owners = this.processSteps.owners ? this.processSteps.owners : [];
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;

    this.title = this.titleActon;
    if (
      this.processSteps.parentID &&
      this.stepType != 'A' &&
      this.stepType != 'P'
    ) {
      this.getOwnerByParentID(this.processSteps.parentID);
    }

    if (this.action == 'edit') {
      this.showLabelAttachment =
        this.processSteps.attachments > 0 ? true : false;
      this.processSteps!.owners;
      this.processSteps.owners;
      if (this.stepType === 'A') {
        this.getOwnerByParentID(this.processSteps['recID']);
      }
      if (this.stepType === 'E' && this.processSteps.reference) {
        this.isNewEmails = false;
        this.recIdEmail = this.processSteps.reference;
      }
    }
    this.cache
      .gridViewSetup(
        this.formModelMenu.formName,
        this.formModelMenu.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;          
        }
      });
  }

  onInit(): void {
    this.loadData();
    this.getListUser();

    if (this.action == 'edit') {
      this.ownersClone = JSON.parse(JSON.stringify(this.owners));
    }
  }

  loadData() {
    if (this.processSteps.stepType == 'C') {
      this.referenceText = this.processSteps?.reference?.split(';');
    }
  }

  handelMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: this.recIdEmail,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: this.isNewEmails,
    };

    let popEmail = this.callfunc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );

    popEmail.closed.subscribe((res) => {
      if (res && res.event) {
        this.processSteps['reference'] = res.event?.recID;
        this.recIdEmail = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }

  viewDetailSurveys(e) {
    let url = 'sv/surveys/SVT01';
    this.codxService.navigate('', url);
  }

  checkValidate() {
    let headerText = [];
    if (
      this.stepType != 'P' &&
      (this.processSteps.parentID == '' || this.processSteps.parentID == null)
    ) {
      headerText.push(this.gridViewSetup['ParentID']?.headerText ?? 'ParentID');
    }
    if (!this.processSteps.stepName?.trim()) {
      headerText.push(this.gridViewSetup['StepName']?.headerText ?? 'StepName');
    }
    if (this.processSteps.duration <= 0) {
      headerText.push(this.gridViewSetup['Duration']?.headerText ?? 'Duration');
    }
    if (this.owners.length === 0) {
      headerText.push(this.gridViewSetup['Owners']?.headerText ?? 'Owners');
    }
    return headerText;
  }

  async saveData() {
    let headerText = this.checkValidate();
    if (headerText.length > 0) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + headerText.join(', ') + '"'
      );
      return;
    }

    this.processSteps.owners = this.owners;
    this.convertReference();
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var attachments = Array.isArray(res) ? res.length : 1;
          if (this.action == 'edit') {
            this.processSteps.attachments += attachments;
            this.updateProcessStep();
          } else if (this.action == 'add') {
            this.processSteps.attachments = attachments;
            this.addProcessStep();
          } else {
            this.processSteps.attachments = attachments;
            this.copyProcessStep();
          }
        }
      });
    else {
      if (this.action == 'edit') this.updateProcessStep();
      else if (this.action == 'add') this.addProcessStep();
      else this.copyProcessStep();
    }
  }

  beforeSave(op) {
    var data = [];
    if (this.action == 'edit') {
      op.method = 'UpdateProcessStepAsync';
      data = [this.processSteps, this.owners];
    } else if (this.action == 'add') {
      op.method = 'AddProcessStepAsync';
      data = [this.processSteps, this.owners];
    } else {
      op.method = 'CopyProcessStepAsync';
      data = [
        this.processSteps,
        this.owners,
        this.recIDCopied,
        this.formModelMenu.formName,
        this.formModelMenu.gridViewName,
      ];
    }
    op.data = data;
    return true;
  }

  addProcessStep() {
    this.bpService
      .addProcessStep([this.processSteps, this.owners])
      .subscribe((data) => {
        if (data) {
          this.dialog.close(data);
        } else this.dialog.close();
      });
  }
  copyProcessStep() {
    this.bpService
      .copyProcessStep([
        this.processSteps,
        this.owners,
        this.recIDCopied,
        this.formModelMenu.formName,
        this.formModelMenu.gridViewName,
      ])
      .subscribe((data) => {
        if (data) {
          this.dialog.close(data);
        } else this.dialog.close();
      });
  }

  updateProcessStep() {
    this.bpService
      .updateProcessStep([this.processSteps, this.owners])
      .subscribe((data) => {
        if (data) {
          this.attachment?.clearData();
          this.dialog.close(data);
        } else this.dialog.close();
      });
  }
  //#endregion
  //#region

  //#region Function addFile
  valueChange(e) {
    this.processSteps[e?.field] = e?.data;
  }

  valueChangeCbx(e) {
    this.processSteps.parentID = e?.data;
    let parentID = e?.data;
    // Get owners
    if (this.stepType !== 'A' && this.stepType !== 'P') {
      this.getOwnerByParentID(parentID, true);
    }
  }
  valueChangeRefrence(e) {
    let value = e.target.value;
    if (value && value.trim() != '') {
      this.textChange = value;
      this.enterRefrence();
    }
  }
  enterRefrence() {
    if (this.textChange && this.textChange.trim() != '') {
      if (!this.referenceText) this.referenceText = [];
      this.referenceText.push(this.textChange);
      this.textChange = '';
      this.changeDef.detectChanges();
    }
  }

  showPoppoverDeleteRef(p, i) {
    if (i == null) return;
    if (this.popover) this.popover.close();
    this.crrIndex = i;
    p.open();
    this.popover = p;
  }

  clickDelete(i) {
    if (this.referenceText[i]) this.referenceText.splice(i, 1);
    this.changeDef.detectChanges();
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (
      this.action != 'edit' ||
      (this.action == 'edit' && !this.showLabelAttachment)
    )
      this.showLabelAttachment = this.isHaveFile;
  }
  valueChangeAlert(e) {
    this.processSteps[e?.field] = e.data;
  }

  //endregion
  convertReference() {
    switch (this.processSteps.stepType) {
      case 'C':
        if (this.referenceText?.length > 0) {
          this.processSteps.reference = this.referenceText.join(';');
        }
        break;
    }
  }

  eventApply(e) {
    if (!e || e?.data.length == 0) return;
    var dataSelected = e?.data;
    var listUser = [];
    dataSelected.forEach((dt) => {
      var index = -1;
      if (this.owners.length > 0)
        index = this.owners.findIndex(
          (obj) => obj.objectID == dt.id && obj.objectType == dt.objectType
        );
      if (index == -1) {
        var owner = new BP_ProcessOwners();
        owner.objectType = dt.objectType;
        owner.objectID = dt.id;
        owner.objectName = dt.text;
        owner.rAIC = 'R';
        this.owners.push(owner);
        this.listOwnerDetails.push({
          id: dt.id,
          name: dt.text,
        });
      }
    });
  }
  onDeleteOwner(objectID, index) {
    this.listOwnerDetails.splice(index, 1);
    var i = this.owners.findIndex((x) => x.objectID == objectID);
    if (i != -1) this.owners.splice(i, 1);
  }

  // get list user
  getListUser() {
    this.listOwnerDetails = this.owners.map((user) => {
      return { id: user.objectID, name: user.objectName };
    });
  }
  getOwnerByParentID(id, isChange = false) {
    this.bpService.getOwnersByParentID([id]).subscribe((data) => {
      let ownerIDs = [];
      let owenrs = [];
      data.forEach((item) => {
        if (item.objectID) {
          ownerIDs.push(item.objectID);
          var owner = new BP_ProcessOwners();
          owner.objectType = item.objectType;
          owner.objectID = item.objectID;
          owner.objectName = item.objectName;
          owner.rAIC = item.raic;
          owenrs.push(owner);
        }
      });
      // thêm owners mới của cha cho con khi sửa
      if (this.action == 'edit' && isChange) {
        this.owners = [...owenrs, ...this.ownersClone].filter(
          (item, pos, self) => {
            return (
              self.findIndex((i) => i['objectID'] == item['objectID']) == pos
            );
          }
        );
      } else {
        this.owners = [...owenrs];
      }
      this.getListUser();
    });
  }
}
