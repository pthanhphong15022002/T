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
import { BP_ProcessOwners, BP_ProcessSteps } from '../../models/BP_Processes.model';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { PopupAddEmailTemplateComponent } from 'projects/codx-es/src/lib/setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';

@Component({
  selector: 'lib-popup-add-process-steps',
  templateUrl: './popup-add-process-steps.component.html',
  styleUrls: ['./popup-add-process-steps.component.css'],
})
export class PopupAddProcessStepsComponent extends UIComponent implements OnInit {
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
  vllShare = 'TM003';
  readOnly = false;
  isHaveFile = false;
  isNewEmails = true;
  showLabelAttachment = false;
  listUser = [];
  listOwnerID = [];
  listOwnerIDClone = [];
  referenceText = [];
  listOwnerDetails = [];
  popover: any;
  formModelMenu: FormModel;
  crrIndex = 0;

  constructor(
    private inject: Injector,
    private bpService: CodxBpService,
    // private api: ApiHttpService,
    private authStore: AuthStore,
    // private cache: CacheService,
    private changeDef: ChangeDetectorRef,
    private notifySvr: NotificationsService,
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

    if (this.stepType) this.processSteps.stepType = this.stepType;
    this.owners = this.processSteps.owners ? this.processSteps.owners : [];
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;

    this.title = this.titleActon;
    if (this.action == 'edit') {
      this.showLabelAttachment = this.processSteps.attachments > 0 ? true : false;
      this.processSteps!.owners
      this.processSteps.owners
      if (this.stepType === "A") {
        this.getOwnerByParentID(this.processSteps["recID"]);
      } else {
        this.listOwnerID = this.processSteps.owners.map((item) => {
          return item?.objectID ? item.objectID : null;
        })
      }
      if (this.stepType === "E" && this.processSteps.reference) {
        this.isNewEmails = false;
        this.recIdEmail = this.processSteps.reference;
      }
    }
  }

  onInit(): void {
    this.loadData();
    if (this.listOwnerID.length > 0) {
      this.getListUser();
    }
    if (this.action == 'edit') {
      this.ownersClone = JSON.parse(JSON.stringify(this.owners));
      this.listOwnerIDClone = JSON.parse(JSON.stringify(this.listOwnerID));
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
      formGroup: true,
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
        this.processSteps["reference"] = res.event?.recID;
        // this.processSteps["reference"] = "8a37d9b8-a5bc-489e-8b5b-f325d59c8cb4";
      }
    });
  }


  viewDetailSurveys(e) {
    let url = 'sv/surveys/SVT01';
    this.codxService.navigate('', url);
  }

  async saveData() {
    this.processSteps.owners = this.owners;
    this.convertReference();
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.processSteps.attachments = Array.isArray(res) ? res.length : 1;
          if (this.action == 'edit') this.updateProcessStep();
          else this.addProcessStep();
        }
      });
    else {
      if (this.action == 'edit') this.updateProcessStep();
      else this.addProcessStep();
    }
  }

  beforeSave(op) {
    var data = [];
    if (this.action == 'edit') {
      op.method = 'UpdateProcessStepAsync';
      data = [this.processSteps, this.owners];
    } else {
      op.method = 'AddProcessStepAsync';
      data = [this.processSteps, this.owners];
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
    // }
  }

  updateProcessStep() {
    //đang lỗi
    // this.dialog.dataService
    //   .save((option: any) => this.beforeSave(option))
    //   .subscribe((res) => {
    //     this.attachment?.clearData();
    //     if (res) {
    //       this.dialog.close(res.update);
    //     } else this.dialog.close();
    //   });
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
    if (this.stepType !== "A" && this.stepType !== "P") {
      this.getOwnerByParentID(parentID, true);
    }
  }
  valueChangeRefrence(e) {
    if (e?.data && e?.data.trim() != '') {
      this.textChange = e?.data;
      this.changeDef.detectChanges();
    }
  }
  enterRefrence() {
    if (this.textChange && this.textChange.trim() != '') {
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
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
  }
  valueChangeAlert(e) {
    this.processSteps[e?.field] = e.data;
  }

  //endregion
  convertReference() {
    switch (this.processSteps.stepType) {
      case 'C':
        if (this.referenceText.length > 0) {
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

  // get list user by userID
  getListUser() {
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(this.listOwnerID)
      )
      .subscribe((res) => {
        this.listOwnerDetails = res.map(user => {
          return { id: user.userID, name: user.userName }
        })
      });
  }
  getOwnerByParentID(id, isChange = false) {
    this.bpService
      .getOwnersByParentID([id])
      .subscribe((data) => {
        let ownerIDs = [];
        let owenrs = [];
        data.forEach((item) => {
          if (item.objectID) {
            ownerIDs.push(item.objectID);
            var owner = new BP_ProcessOwners();
            owner.objectType = item.objectType;
            owner.objectID = item.objectID;
            owner.rAIC = item.raic;
            owenrs.push(owner);
          }
        })

        if (this.action == 'edit' && isChange) {
          this.owners = [...owenrs, ...this.ownersClone].filter((item, pos, self) => {
            return self.findIndex(i => i['objectID'] == item['objectID']) == pos;
          })
          this.listOwnerID = this.owners.map(item => {return item['objectID']})
        } else {
          this.listOwnerID = [...ownerIDs];
          this.owners = [...owenrs];
        }
        this.getListUser();
      });
  }
}
