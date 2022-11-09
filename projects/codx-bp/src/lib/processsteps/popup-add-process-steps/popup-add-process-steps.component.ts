import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormControlName } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { PopupAddEmailTemplateComponent } from 'projects/codx-es/src/lib/setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import {
  BP_ProcessOwners,
  BP_ProcessSteps,
} from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-add-process-steps',
  templateUrl: './popup-add-process-steps.component.html',
  styleUrls: ['./popup-add-process-steps.component.css'],
})
export class PopupAddProcessStepsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: FormControlName;

  dialog!: DialogRef;
  formModel: FormModel;
  processSteps: BP_ProcessSteps;
  owners: Array<BP_ProcessOwners> = [];

  user: any;
  data: any;
  funcID: any;
  showLabelAttachment = false;
  title = '';
  stepType = 'C';
  readOnly = false;
  titleActon = '';
  action = '';
  vllShare = 'TM003';
  listUser = [];
  isAlert = true;
  isEmail = true;
  isHaveFile = false;
  referenceText = [];
  textChange = '';
  popover: any;
  crrIndex = 0;

  listOwnerID = [];
  listOwnerDetails = [];

  formModelMenu :FormModel ;

  constructor(
    private bpService: CodxBpService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private cache: CacheService,
    private changeDef: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
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
    if (this.action == 'edit')
      this.showLabelAttachment =
        this.processSteps.attachments > 0 ? true : false;
  
  }

  ngOnInit(): void {
    this.loadData();   
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
      templateID: '5860917c-af36-4803-b90d-ed9f364985c6',
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
    };
        
    this.callfunc.openForm(
      PopupAddEmailTemplateComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    }
  //#region

  //endregio

  //#region method

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
  valueChangeSwitch(e) {}

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
    if (i != -1) this.owners.slice(i, 1);
  }
}
