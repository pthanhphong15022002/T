import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
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
  grvSetup: any;

  constructor(
    private bpService: CodxBpService,
    private authStore: AuthStore,
    private cache: CacheService,
    private changeDef: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.processSteps = JSON.parse(
      JSON.stringify(dialog.dataService!.dataSelected)
    );
    this.action = dt?.data[0];
    this.titleActon = dt?.data[1];
    this.stepType = dt?.data[2];
    if (this.stepType) this.processSteps.stepType = this.stepType;
    // this.stepType = 'T'; //thêm để test
    this.dialog = dialog;

    this.funcID = this.dialog.formModel.funcID;
    this.title = this.titleActon;

    // this.cache.gridViewSetup("BPTasks","grvBPTasks").subscribe(res=>{
    //   this.grvSetup =res
    // })
  }

  ngOnInit(): void {}

  //#region

  //endregio

  //#region method

  async saveData() {
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
    } else {
      op.method = 'AddProcessStepAsync';
      data = [this.processSteps];
    }

    op.data = data;
    return true;
  }

  addProcessStep() {
    // if (this.stepType == 'P') {
    //   var index = this.dialog.dataService?.data.length - 1;
    //   this.dialog.dataService
    //     .save((option: any) => this.beforeSave(option),)
    //     .subscribe((res) => {
    //       // this.attachment?.clearData();
    //       if (res) {
    //         this.dialog.close(res.save);
    //       } else this.dialog.close();
    //     });
    // } else {
    this.bpService.addProcessStep(this.processSteps).subscribe((data) => {
      if (data) {
        this.dialog.close(data);
      } else this.dialog.close();
    });
    // }
  }

  updateProcessStep() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.attachment?.clearData();
        if (res) {
          this.dialog.close(res.update);
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
    dataSelected.forEach((dt) => {
      var index = this.owners.findIndex((obj) => obj.objectID == dt.objectID);
      if (index == -1) {
        var owner = new BP_ProcessOwners();
        owner.objectType = dt.objectType;
        owner.objectID = dt.objectID;
        owner.processID = this.processSteps.processID;
        owner.stepID = this.processSteps.recID;
        this.owners.push(owner);
      }
    });
  }
}
