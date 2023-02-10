import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import {
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
  DP_Steps_Tasks_Roles,
} from '../../../models/models';

@Component({
  selector: 'lib-popup-add-stask',
  templateUrl: './popup-add-stask.component.html',
  styleUrls: ['./popup-add-stask.component.scss'],
})
export class PopupAddStaskComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  title = '';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  stepType = '';
  vllShare = 'BP021';
  taskName = '';
  taskGroupName = '';
  linkQuesiton = 'http://';
  listOwner: DP_Instances_Steps_Tasks_Roles[] = [];
  listChair = [];
  recIdEmail = '';
  isNewEmails = true;
  groupTackList = [];
  stepsTasks: DP_Instances_Steps_Tasks;
  fieldsGroup = { text: 'taskGroupName', value: 'recID' };
  fieldsTask = { text: 'taskName', value: 'recID' };
  tasksItem = '';
  stepID = '';
  status = 'add';
  taskList: DP_Instances_Steps_Tasks[] = [];
  show = false;
  dataCombobox = [];
  valueInput = '';
  litsParentID = [];
  showLabelAttachment = false;
  isHaveFile = false;
  funcIDparent: any;
  folderID = '';
  groupTaskID = ''
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

    if (this.status == 'add') {
      this.stepsTasks = new DP_Instances_Steps_Tasks();
      this.stepsTasks['taskType'] = this.stepType;
      this.stepsTasks['stepID'] = this.stepID;
      this.stepsTasks['progress'] = 0;
      this.stepsTasks['taskGroupID'] = dt?.data[7];
    }else {
      this.showLabelAttachment = true;
      this.stepsTasks = dt?.data[4] || new DP_Instances_Steps_Tasks();
      this.stepType = this.stepsTasks.taskType;
    }
    this.taskList = dt?.data[5];
    this.taskName = dt?.data[6];
    this.groupTaskID = dt?.data[7];
  }

  ngOnInit(): void {
    this.listOwner = this.stepsTasks['roles'];
    console.log(this.taskList);
    if (this.stepsTasks['parentID']) {
      this.litsParentID = this.stepsTasks['parentID'].split(';');
    }
    if (this.taskList.length > 0) {
      this.dataCombobox = this.taskList.map((data) => {
        if (this.litsParentID.some((x) => x == data.recID)) {
          return {
            key: data.recID,
            value: data.taskName,
            checked: true,
          };
        } else {
          return {
            key: data.recID,
            value: data.taskName,
            checked: false,
          };
        }
      });
      if (this.status == 'edit') {
        let index = this.dataCombobox.findIndex(
          (x) => x.key === this.stepsTasks.recID
        );
        this.dataCombobox.splice(index, 1);
        this.taskGroupName = this.groupTackList.find(
          (x) => x.recID === this.stepsTasks.taskGroupID
        )['taskGroupName'];
      }
      this.valueInput = this.dataCombobox
        .filter((x) => x.checked)
        .map((y) => y.value)
        .join('; ');
    }
  }
  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  filterText(value, key) {
    if (value) {
      this.stepsTasks[key] = value;
      this.taskGroupName = this.groupTackList.find((x) => x.recID === value)[
        'taskGroupName'
      ];
    }
  }
  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  changeValueDate(event) {
    this.stepsTasks[event?.field] = event?.data?.fromDate;
  }
  applyOwner(e, datas) {
    if (!e || e?.data.length == 0) return;
    let listUser = e?.data;
    listUser.forEach((element) => {
      if (!datas.some((item) => item.id == element.id)) {
        datas.push({
          objectID: element.id,
          objectName: element.text,
          objectType: element.objectType,
          roleType: element.objectName,
        });
      }
    });
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.objectID == objectID);
    if (index != -1) data.splice(index, 1);
  }

  async saveData() {
    debugger
    this.stepsTasks['roles'] = this.listOwner;
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    if (this.attachment && this.attachment.fileUploadList.length){
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          if(this.status === 'copy'){
            this.stepsTasks['recID'] = Util.uid();
          }
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      });
    } else {
      if(this.status === 'copy'){
        this.stepsTasks['recID'] = Util.uid();
      }
      this.dialog.close({ data: this.stepsTasks, status: this.status });
    } 
    

    // let headerText = await this.checkValidate();
    // if (headerText.length > 0) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + headerText.join(', ') + '"'
    //   );
    //   return;
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
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  getfileDelete(event) {
    event.data.length;
  }
}
