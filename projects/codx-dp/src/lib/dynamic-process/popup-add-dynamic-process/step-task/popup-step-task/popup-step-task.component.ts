import {
  OnInit,
  Optional,
  Component,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  Util,
  DialogRef,
  AuthStore,
  DialogData,
  CacheService,
  CallFuncService,
  NotificationsService,
} from 'codx-core';
import {
  DP_Steps,
  DP_Steps_Tasks,
  DP_Steps_Tasks_Roles,
} from '../../../../models/models';
import { ComboBoxComponent, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-job',
  templateUrl: './popup-step-task.component.html',
  styleUrls: ['./popup-step-task.component.scss'],
})
export class PopupJobComponent implements OnInit {
  @ViewChild('sample') comboBoxObj: ComboBoxComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  REQUIRE = ['taskName', 'roles', 'dependRule'];
  
  step: DP_Steps;
  dialog!: DialogRef;
  stepsTasks: DP_Steps_Tasks;
  listTask: DP_Steps_Tasks[] = [];
  roles: DP_Steps_Tasks_Roles[] = [];
  owner: DP_Steps_Tasks_Roles[] = [];
  participant: DP_Steps_Tasks_Roles[] = [];

  fieldsGroup = { text: 'taskGroupName', value: 'recID' };
  fieldsTask = { text: 'taskName', value: 'recID' };
  fieldsFields= { text: 'title', value: 'recID' };

  typeTask;
  action = 'add';
  vllShare = 'DP0331';
  linkQuesiton = 'http://';

  view = [];
  listFields = [];
  listFieldID = [];
  listParentID = [];
  listTaskLink = [];
  listGroupTask = [];
  listGroupTaskCombobox = [];
  listFileTask: string[] = [];

  stepID = '';
  stepName = '';
  recIdEmail = '';
  taskGroupID = '';
  isNewEmails = true;
  isHaveFile = false;
  showLabelAttachment = false;
  user: any;
  isBoughtTM = false;

  listCombobox = {
    U: 'Share_Users_Sgl',
    O: 'Share_OrgUnits_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
  };

  constructor(
    private cache: CacheService,
    private authStore: AuthStore,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.step = dt?.data?.step;
    this.action = dt?.data?.action;
    this.typeTask = dt?.data?.typeTask;
    this.isBoughtTM = dt?.data?.isBoughtTM;
    this.stepID = this.step?.recID;
    this.stepName = this.step?.stepName;
    if (dt?.data?.listGroup) { // remove group task recID null
      this.listGroupTask = dt?.data?.listGroup || [];
      this.listGroupTaskCombobox = JSON.parse(JSON.stringify(this.listGroupTask));
      let index = this.listGroupTaskCombobox?.findIndex((group) => !group.recID);
      if (index >= 0) {
        this.listGroupTaskCombobox?.splice(index, 1);
      }
    }

    if (this.action == 'add') {
      this.stepsTasks = new DP_Steps_Tasks();
      this.stepsTasks['durationDay'] = 1;
      this.stepsTasks['stepID'] = this.stepID;
      this.stepsTasks['taskType'] = this.typeTask?.value;
      this.stepsTasks['taskGroupID'] = dt?.data?.groupTaskID;
      this.stepsTasks['createTask'] = this.isBoughtTM;
    } else if (this.action == 'copy') {
      this.stepsTasks = dt?.data?.taskInput || new DP_Steps_Tasks();
      this.stepsTasks['recID'] = Util.uid();
      this.showLabelAttachment = true;
    } else {
      this.stepsTasks = dt?.data?.taskInput || new DP_Steps_Tasks();
      this.showLabelAttachment = true;
    }

    this.listTask = dt?.data?.listTask;
    this.taskGroupID = dt?.data?.groupTaskID;
    this.listFileTask = dt?.data?.listFileTask;
    this.user = this.authStore.get();
  }
  async ngOnInit() {
    this.getFormModel();

    this.roles = this.stepsTasks['roles'];
    this.owner = this.roles?.filter((role) => role.objectID == this.stepsTasks?.owner) || [];
    this.participant = this.roles?.filter((role) => role.objectID != this.stepsTasks?.owner) || [];

    let group = this.listGroupTask?.find((x) => x.recID === this.stepsTasks?.taskGroupID);
    let listTaskConvert = group?.recID ? JSON.parse(JSON.stringify(group?.task)) : JSON.parse(JSON.stringify(this.listTask));
    await this.getTasksWithoutLoop(this.stepsTasks, listTaskConvert);
    this.listTaskLink = listTaskConvert;
    this.listParentID = this.stepsTasks?.parentID ? this.stepsTasks?.parentID?.split(';') : [];

    this.listFieldID = this.stepsTasks?.fieldID ? this.stepsTasks?.fieldID?.split(';') : [];
    this.listFields = this.step?.fields || [];

    let listField = [];
    if (this.step?.tasks?.length > 0) {
      this.step.tasks.forEach(task => {
        if (task?.fieldID && task.recID != this.stepsTasks?.recID) {
          listField.push(...task.fieldID.split(';'));
        }
      });
    }
    this.listFields = this.step?.fields.filter(field => !listField.includes(field.recID));
  }

  ngAfterViewInit(){
  }
  getFormModel() {
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]['isRequire']) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }
  //Email
  handelMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: this.stepsTasks['reference'] || '',
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
        this.stepsTasks['reference'] = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }
  //  khảo sát
  changeQuestion(e) {
    if (e?.data) {
      this.stepsTasks['reference'] = e?.data;
    }
  }

  viewDetailSurveys() {
    if (this.linkQuesiton) {
      this.setLink();
      window.open(this.linkQuesiton);
    }
  }

  setLink() {
    let url = window.location.href;
    let index = url.indexOf('/dp/');
    if (index != -1) {
      this.linkQuesiton =
        url.substring(0, index) +
        Util.stringFormat(
          '/sv/add-survey?funcID={0}&title={1}&recID={2}',
          'SVT01',
          '',
          this.stepsTasks['reference']
        );
    }
  }
  // file
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
  //#region save
  async saveData() {
    this.stepsTasks['roles'] = [...this.owner, ...this.participant];
    this.stepsTasks['parentID'] = this.listParentID.join(';');
    this.stepsTasks['fieldID'] = this.listFieldID.join(';');
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
    } else {
      if (this.attachment && this.attachment.fileUploadList.length) {
        (await this.attachment.saveFilesObservable()).subscribe((res) => {
          if (res) {
            if (res?.length >= 0) {
              res.forEach((item) => {
                if (item['data']['recID']) {
                  this.listFileTask.push(item['data']['recID']);
                }
              });
            } else {
              this.listFileTask.push(res['data']['recID']);
            }
            this.handelSave();
          }
        });
      } else {
        this.handelSave();
      }
    }
  }

  handelSave() {
    let task = this.stepsTasks;
    // if task thuộc group thì kiểm tra trong group nếu không thuộc group kiểm tra với step
    if (task['taskGroupID']) {
      let groupTask = this.listGroupTask?.find(
        (x) => x.recID == task?.taskGroupID
      );
      if (
        task?.dependRule != '1' ||
        !task?.parentID.trim() ||
        groupTask?.task?.length === 0
      ) {
        //No parentID
        this.checkSave(groupTask);
      } else {
        // tính thời gian lớn nhất của group
        let timeMax = this.getTimeMaxGroupTask(
          groupTask?.task,
          this.stepsTasks
        );
        this.checkSave(groupTask, timeMax);
      }
    } else {
      if (!task['parentID'].trim() || task['dependRule'] != '1') {
        //if ko có parentID thì so sánh trực tiếp với step
        if (this.getHour(this.stepsTasks) > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = this.stepsTasks['durationDay'] || 0;
              this.step['durationHour'] = this.stepsTasks['durationHour'] || 0;
              this.dialog?.close({
                data: this.stepsTasks,
                status: this.action,
              });
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.action });
        }
      } else {
        // tính thời gian dựa vào công việc liên quan rồi mới so sánh
        let listIdTask = this.stepsTasks['parentID'].split(';');
        let maxtime = 0;
        listIdTask?.forEach((id) => {
          let time = this.getSumTimeTask(this.listTask, id, false);
          maxtime = Math.max(time, maxtime);
        });
        maxtime += this.getHour(this.stepsTasks);
        if (maxtime > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = Math.floor(maxtime / 24 || 0);
              this.step['durationHour'] = maxtime % 24 || 0;
              this.dialog.close({ data: this.stepsTasks, status: this.action });
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.action });
        }
      }
    }
  }

  checkSave(groupTask, timeInput?: number) {
    let time = timeInput ? timeInput : this.getHour(this.stepsTasks);
    if (this.getHour(groupTask) >= time) {
      // nếu thời gian ko vượt quá thời gian cho phép lưu => không ảnh hưởng đến step
      this.dialog.close({ data: this.stepsTasks, status: this.action });
    } else {
      // nếu vượt quá thì hỏi ý kiến
      this.notiService.alertCode('DP010').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          if (timeInput) {
            groupTask['durationDay'] = Math.floor(time / 24);
            groupTask['durationHour'] = time % 24;
          } else {
            groupTask['durationDay'] = this.stepsTasks['durationDay'];
            groupTask['durationHour'] = this.stepsTasks['durationHour'];
          }
          let sumGroup = this.sumHourGroupTask();
          let timeStep = this.getHour(this.step);
          if (sumGroup > timeStep) {
            this.step['durationDay'] = Math.floor(sumGroup / 24);
            this.step['durationHour'] = sumGroup % 24;
          }
          this.dialog.close({ data: this.stepsTasks, status: this.action });
        }
      });
    }
  }
  //#endregion

  //#region handle time
  getHour(data) {
    let hour =
      Number(data['durationDay'] || 0) * 24 + Number(data['durationHour'] || 0);
    return hour || 0;
  }

  sumHourGroupTask(index?: number) {
    let sum = 0;
    if (this.listGroupTask?.length > 0) {
      if (index >= 0) {
        for (let group of this.listGroupTask) {
          if (Number(group['indexNo']) < index) {
            sum += this.getHour(group);
          }
        }
      } else {
        sum = this.listGroupTask.reduce((sumHour, group) => {
          return (sumHour += this.getHour(group));
        }, 0);
      }
    }
    return sum;
  }

  getTimeMaxGroupTask(tasks, task) {
    if (!task) return 0;
    if (!tasks || tasks?.length <= 0) return this.getHour(task);
    let listTask = JSON.parse(JSON.stringify(tasks));
    let maxTime = 0;
    if (this.action === 'edit') {
      let index = listTask?.findIndex((t) => t.recID == task.recID);
      if (index >= 0) {
        listTask?.splice(index, 1, task);
      }
      listTask?.forEach((itemTask) => {
        let time = this.getSumTimeTask(listTask, itemTask['recID']);
        maxTime = Math.max(maxTime, time);
      });
    } else {
      listTask?.push(task);
      maxTime = this.getSumTimeTask(listTask, task['recID']);
    }
    return maxTime;
  }

  getSumTimeTask(taskList: any[], taskId: string, isGroup = true) {
    let task = taskList?.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      let maxTime = this.getHour(task);
      if (task.taskGroupID && !isGroup) {
        let groupFind = this.listGroupTask?.find(
          (group) => group['recID'] == task.taskGroupID
        );
        if (groupFind) {
          let time = this.sumHourGroupTask(groupFind?.indexNo) || 0;
          maxTime += time;
        }
      }
      return maxTime;
    } else {
      const parentIds = task?.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.getSumTimeTask(taskList, parentId, isGroup);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }
  //#endregion

  //#region change value
  parentIDChange(event) {
    this.listParentID = event;
  }
  fieldIDChange(event) {
    this.listFieldID = event;
  }

  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  changeRoler(e, roleType) {
    if (!e || e?.length == 0) return;
    let listUser = e || [];
    let listRole = [];
    for (let role of listUser) {
      if (
        roleType == 'P' &&
        this.owner.some((ownerFind) => ownerFind.objectID == role.objectID)
      ) {
        continue;
      }
      listRole.push({
        objectID: role?.objectID,
        objectName: role?.objectName,
        objectType: role?.objectType,
        roleType: role?.roleType,
        taskID: this.stepsTasks?.recID,
      });
    }
    if (roleType == 'O') {
      this.owner = listRole;
      this.stepsTasks.owner = this.owner[0]?.objectID;
    }
    if (roleType == 'P') {
      this.participant = listRole;
    }
  }
  //#endregion

  //#region prarentID
  async changeCombobox(value, key) {
    let data = this.comboBoxObj?.value;
    this.stepsTasks[key] = data;
    let group = this.listGroupTask.find((x) => x.recID === data);
    this.listTaskLink = group?.recID
      ? JSON.parse(JSON.stringify(group?.task))
      : JSON.parse(JSON.stringify(this.listTask));
    await this.getTasksWithoutLoop(this.stepsTasks, this.listTaskLink);
    this.stepsTasks['parentID'] = '';
  }

  async getTasksWithoutLoop(task, tasks) {
    this.listParentID;
    let indexTask = tasks?.findIndex((item) => item.recID === task.recID);
    if (indexTask >= 0) {
      tasks.splice(indexTask, 1);
    }
    let listTask = tasks.filter((item) =>
      item?.parentID?.includes(task?.recID)
    );
    if (listTask?.length == 0) return;

    listTask?.forEach(async (element) => {
      await this.getTasksWithoutLoop(element, tasks);
    });
  }
  //#endregion
  
}
