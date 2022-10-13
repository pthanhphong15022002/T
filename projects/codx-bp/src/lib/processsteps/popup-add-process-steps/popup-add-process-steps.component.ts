import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { BP_ProcessSteps } from '../../models/BP_Processes.model';

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

  constructor(
    private bpService: CodxBpService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.processSteps = JSON.parse(
      JSON.stringify(dialog.dataService!.dataSelected)
    );
    this.action = dt?.data[1];
    this.titleActon = dt?.data[2];
    this.stepType = dt?.data[3];
    if (this.stepType) this.processSteps.stepType = this.stepType;
    // this.stepType = 'T'; //thêm để test
    this.dialog = dialog;

    this.funcID = this.dialog.formModel.funcID;
    this.title = this.titleActon;
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

  valueChangeDuration(e) {
    // if (this.processSteps.stepType == 'P') {
    //   this.processSteps.duration = e?.data * 24;
    // } else 
    this.processSteps.duration = e?.data;
  }

  addFile(e) {
    this.attachment.uploadFile();
  }

  valueChangeSwitch(e) {}

  fileAdded(e) {}
  getfileCount(e) {}

  eventApply(e) {}
  //endregion
}
