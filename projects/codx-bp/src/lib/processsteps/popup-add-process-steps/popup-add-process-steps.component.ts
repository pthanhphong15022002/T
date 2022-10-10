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

@Component({
  selector: 'lib-popup-add-process-steps',
  templateUrl: './popup-add-process-steps.component.html',
  styleUrls: ['./popup-add-process-steps.component.css'],
})
export class PopupAddProcessStepsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialog!: DialogRef;
  formModel: FormModel;
  user: any;
  data: any;
  funcID: any;
  showLabelAttachment = false;
  title = '';
  processSteps: any;
  idForm = '';
  readOnly=false ;
  titleActon='' ;
  action =''
 

  constructor(
    private bpService: CodxBpService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.processSteps = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.titleActon = dt?.data[2] ;
    this.action =dt?.data[1];
    this.idForm =dt?.data[3]
    this.dialog = dialog ;
    
    this.funcID = this.dialog.formModel.funcID;
    this.title = this.titleActon ;
  }

  ngOnInit(): void {}

  //#region

  //endregio

  //#region method
  beforeSave(op) {
    var data = [];
    op.method = 'AddProcessStepAsync';
    op.className = 'ProcessStepsBusiness';
    this.processSteps.stepType = this.idForm;
    data = [this.processSteps];

    op.data = data;
    return true;
  }
  saveData() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }
  //#endregion
  //#region

  //#region Function addFile
  valueChange(e) {
    this.processSteps[e?.field] = e?.data;
  }
  addFile(e) {}
  fileAdded(e) {}
  getfileCount(e) {}
  //endregion
}
