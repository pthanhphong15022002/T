import { Component, OnInit, Optional } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { DP_Steps_Tasks } from '../../../models/models';

@Component({
  selector: 'lib-popup-job',
  templateUrl: './popup-job.component.html',
  styleUrls: ['./popup-job.component.scss'],
})
export class PopupJobComponent implements OnInit {
  title = 'thuan';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  stepType = '';
  vllShare = 'BP021';
  taskName = 'Giới thiệu sản phẩm';
  jobName = 'Thu thập thông tin khách hàng';
  linkQuesiton = 'http://';
  listOwner = [];
  listChair = [];
  recIdEmail = '';
  isNewEmails = true;
  groupTackList = [];
  stepsTasks:  DP_Steps_Tasks;
  fields = { text: 'recID', value: 'taskGroupName' };
  tasksItem = '';
  stepID = '';
  status = 'add';


  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.status = dt?.data[0];
    this.title = dt?.data[1]['text'];
    this.stepType = dt?.data[1]['id'];
    this.stepID = dt?.data[2];
    this.groupTackList = dt?.data[3];
    this.dialog = dialog;
    if(this.status == 'add'){
      this.stepsTasks = new DP_Steps_Tasks();
      this.stepsTasks['taskType'] = this.stepType;
      this.stepsTasks['stepID'] = this.stepID;
    }else{
      this.stepsTasks = dt?.data[4] || new DP_Steps_Tasks();
      this.tasksItem = this.groupTackList.find(group => group.recID == this.stepsTasks.taskGroupID)?.taskGroupName || '';
      this.stepType = this.stepsTasks.taskType;
    }
  }
  ngOnInit(): void {
   
  }
  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  filterText(value) {
    if (value.itemData) {
      this.stepsTasks['taskGroupID'] = value['itemData']['recID'];
    }
  }
  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  addFile(evt: any) {
    // this.attachment.uploadFile();
  }
  eventApply(e, datas) {
    if (!e || e?.data.length == 0) return;
    let listUser = e?.data;
    listUser.forEach((element) => {
      if (!datas.some((item) => item.id == element.id)) {
        datas.push({
          id: element.id,
          name: element.text,
          type: element.objectType,
        });
      }
    });
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.id == objectID);
    if (index != -1) data.splice(index, 1);
  }

  saveData() {
    this.dialog.close({data:this.stepsTasks, status: this.status});

    // let headerText = await this.checkValidate();
    // if (headerText.length > 0) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + headerText.join(', ') + '"'
    //   );
    //   return;
    // }
    // this.processSteps.owners = this.owners;
    // this.convertReference();
    // if (this.attachment && this.attachment.fileUploadList.length)
    //   (await this.attachment.saveFilesObservable()).subscribe((res) => {
    //     if (res) {
    //       var attachments = Array.isArray(res) ? res.length : 1;
    //       if (this.action == 'edit') {
    //         this.processSteps.attachments += attachments;
    //         this.updateProcessStep();
    //       } else if (this.action == 'add') {
    //         this.processSteps.attachments = attachments;
    //         this.addProcessStep();
    //       } else {
    //         this.processSteps.attachments = attachments;
    //         this.copyProcessStep();
    //       }
    //     }
    //   });
    // else {
    //   if (this.action == 'edit') this.updateProcessStep();
    //   else if (this.action == 'add') this.addProcessStep();
    //   else this.copyProcessStep();
    // }
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
        // this.processSteps['reference'] = res.event?.recID;
        this.recIdEmail = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }
}
