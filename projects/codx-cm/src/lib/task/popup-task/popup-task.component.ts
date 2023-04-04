import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
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
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-task',
  templateUrl: './popup-task.component.html',
  styleUrls: ['./popup-task.component.scss'],
})
export class PopupTaskComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  REQUIRE = ['taskName', 'endDate', 'startDate'];
  title = '';
  typeTask = '';
  dialog!: DialogRef;
  frmModel: FormModel;
  task = {};
  parentID = '';
  action = '';

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
  groupTaskID = '';
  view = [];
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.frmModel = this.dialog?.formModel;
    this.title = dt?.data?.taskType?.text;
    this.typeTask = dt?.data?.taskType?.value;
    this.parentID = dt?.data?.parentID;
    this.action = dt?.data?.action;
  }

  ngOnInit(): void {
    this.getFormModel();
  }
  // common
  valueChangeText(event) {
    this.task[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.task[event?.field] = event?.data;
  }

  filterText(value, key) {
    if (value) {
      this.task[key] = value;
      this.taskGroupName = this.groupTackList.find((x) => x.recID === value)[
        'taskGroupName'
      ];
    }
  }

  valueChangeAlert(event) {
    this.task[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.task[event?.field] = event?.data?.fromDate;
  }
  // end common

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

  //  khảo sát
  changeQuestion(e) {
    if (e?.data) {
      this.task['reference'] = e?.data;
      let url = window.location.href;
      let index = url.indexOf('/bp/');
      if (index != -1)
        this.linkQuesiton =
          url.substring(0, index) +
          Util.stringFormat(
            '/sv/add-survey?funcID={0}&title={1}&recID={2}',
            'SVT01',
            '',
            e?.data
          );
      this.changeDef.detectChanges();
    }
  }

  viewDetailSurveys() {
    if (this.linkQuesiton) window.open(this.linkQuesiton);
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.objectID == objectID);
    if (index != -1) data.splice(index, 1);
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

  async handlSaveTask() {
    if (this.checkRequire()) {
      await this.saveFile();
      if (this.action == 'edit' || this.action == 'add') {
        this.task['recID'] = Util.uid();
        this.AddTaskAsync('CM_Customers').subscribe((res) => {
          console.log(res);
        });
      } else {
        this.editTaskAsync('CM_Customers');
      }
    }
  }

  AddTaskAsync(mode: string) {
    let dataRequest = [this.task, this.parentID, mode];
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'AddTaskAsync',
      dataRequest
    );
  }

  editTaskAsync(mode: string) {
    let dataRequest = [this.task, this.parentID, mode];
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'AddTaskAsync',
      dataRequest
    );
  }

  async saveFile() {
    if (this.attachment && this.attachment.fileUploadList.length) {
      const res = await firstValueFrom(
        await this.attachment.saveFilesObservable()
      );
    }
  }

  checkRequire(): boolean {
    let message = [];
    for (let key of this.REQUIRE) {
      if (!this.task[key] || this.task[key]?.length === 0) {
        message.push(this.view[key]);
      }
    }
    if (!this.task['durationDay'] && !this.task['durationHour']) {
      message.push(this.view['durationDay']);
    }

    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
      return false;
    } else {
      return true;
    }
  }
}
