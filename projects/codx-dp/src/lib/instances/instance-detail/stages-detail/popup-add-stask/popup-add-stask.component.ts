import {
  Component,
  ElementRef,
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
  NotificationsService,
  Util,
} from 'codx-core';
import {
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';

@Component({
  selector: 'lib-popup-add-stask',
  templateUrl: './popup-add-stask.component.html',
  styleUrls: ['./popup-add-stask.component.scss'],
})
export class PopupAddStaskComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  REQUIRE = ['taskName', 'endDate', 'startDate'];
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
  fieldsGroup = { text: 'taskGroupName', value: 'refID' };
  fieldsTask = { text: 'taskName', value: 'refID' };
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
  groupTaskID = '';
  view = [];
  isSaveTimeTask = true;
  isSaveTimeGroup = true;
  groupTask;
  leadtimeControl = false;
  isLoadDate = false;
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.status = dt?.data?.status;
    this.title = dt?.data['taskType']['text'];
    this.stepType = dt?.data['taskType']['value'];
    this.stepID = dt?.data['stepID'];
    this.groupTackList = dt?.data['listGroup'];
    this.dialog = dialog;

    if (this.status == 'add') {
      this.stepsTasks = new DP_Instances_Steps_Tasks();
      this.stepsTasks['taskType'] = this.stepType;
      this.stepsTasks['stepID'] = this.stepID;
      this.stepsTasks['progress'] = 0;
      this.stepsTasks['taskGroupID'] = dt?.data['groupTaskID'];
      this.stepsTasks['refID'] = Util.uid();
      this.stepsTasks['isTaskDefault'] = false;
    } else {
      this.showLabelAttachment = true;
      this.stepsTasks = dt?.data['stepTaskData'] || new DP_Instances_Steps_Tasks();
      this.stepType = this.stepsTasks.taskType;
    }
    this.taskList = dt?.data['taskList'];
    this.taskName = dt?.data['stepName'];
    this.groupTaskID = dt?.data['groupTaskID'];
    this.leadtimeControl = dt?.data['leadtimeControl'];
  }

  ngOnInit(): void {
    this.listOwner = this.stepsTasks['roles'];
    this.getFormModel();
    if (this.stepsTasks['parentID']) {
      this.litsParentID = this.stepsTasks['parentID'].split(';');
    }
    if (this.taskList.length > 0) {
      this.dataCombobox = this.taskList.map((data) => {
        if (this.litsParentID.some((x) => x == data.refID)) {
          return {
            key: data.refID,
            value: data.taskName,
            checked: true,
          };
        } else {
          return {
            key: data.refID,
            value: data.taskName,
            checked: false,
          };
        }
      });
      if (this.status == 'edit') {
        let index = this.dataCombobox?.findIndex(
          (x) => x.key === this.stepsTasks.refID
        );
        this.dataCombobox.splice(index, 1);
        this.taskGroupName =
          this.groupTackList?.find(
            (x) => x.refID === this.stepsTasks.taskGroupID
          )?.taskGroupName || null;
      }
      this.valueInput = this.dataCombobox
        .filter((x) => x.checked)
        .map((y) => y.value)
        .join('; ');
    }
  }

  getFormModel() {
    this.cache
      .gridViewSetup('DPInstancesStepsTasks', 'grvDPInstancesStepsTasks')
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]['isRequire']) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
        console.log(this.view);
      });
  }

  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  filterText(value, key) {
    this.stepsTasks[key] = value;
    this.groupTask = this.groupTackList.find((x) => x.refID === value);
    this.taskGroupName = this.groupTask['taskGroupName'] || '';
    this.stepsTasks['startDate'] = this.groupTask['startDate'] || new Date();
  }
  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  changeValueDate(event) {
    if(this.isLoadDate){
      this.isLoadDate = !this.isLoadDate;
      return;
    }
    this.isLoadDate = !this.isLoadDate;
    this.stepsTasks[event?.field] = event?.data?.fromDate;
    const startDate =  new Date(this.stepsTasks['startDate']);
    const endDate = new Date(this.stepsTasks['endDate']);

    if (endDate && startDate > endDate){
      this.isSaveTimeTask = false;
      this.notiService.notifyCode('DP019');
      return;
    } else {
      this.isSaveTimeTask = true;
    }

    if (endDate > new Date(this.groupTask?.endDate)) {
      this.isSaveTimeGroup = false;
      this.notiService.notifyCode('DP020');
    }else{
      this.isSaveTimeGroup = true;
    }

    if (startDate < new Date(this.groupTask['startDate'])) {
      this.isSaveTimeGroup = false;
      this.notiService.notifyCode('DP020');
    }else{
      this.isSaveTimeGroup = true;
    }
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
    this.stepsTasks['roles'] = this.listOwner;
    this.stepsTasks['parentID'] = this.litsParentID.join(';');

    let message = [];
    for (let key of this.REQUIRE) {
      if (
        (typeof this.stepsTasks[key] === 'string' &&
          !this.stepsTasks[key].trim()) ||
        !this.stepsTasks[key] ||
        this.stepsTasks[key]?.length === 0
      ) {
        message.push(this.view[key]);
      }
    }
    if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
      message.push(this.view['durationDay']);
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
      return;
    } 
    if(!this.isSaveTimeTask){
      this.notiService.notifyCode('DP019');
      return;
    }
    if(!this.isSaveTimeGroup){
      this.notiService.notifyCode('DP020');
      return;
    }

    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          if (this.status === 'copy') {
            this.stepsTasks['recID'] = Util.uid();
            this.stepsTasks['refID'] = Util.uid();
            this.stepsTasks['isTaskDefault'] = false;
          }
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      });
    } else {
      if (this.status === 'copy') {
        this.stepsTasks['recID'] = Util.uid();
      }
      this.dialog.close({ data: this.stepsTasks, status: this.status });
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
