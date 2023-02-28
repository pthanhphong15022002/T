import { map } from 'rxjs';
import { group } from '@angular/animations';
import { async } from '@angular/core/testing';
import {
  ChangeDetectorRef,
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
  NotificationsService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import {
  DP_Steps,
  DP_Steps_Tasks,
  DP_Steps_Tasks_Roles,
} from '../../../../models/models';

@Component({
  selector: 'lib-popup-job',
  templateUrl: './popup-job.component.html',
  styleUrls: ['./popup-job.component.scss'],
})
export class PopupJobComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000';
  REQUIRE = ['taskName', 'roles', 'dependRule'];
  MESSAGETIME =
    'Thời hạn công việc lớn hơn nhóm công việc bạn có muốn lưu và thay đổi thời hạn nhóm công việc';
  title = '';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  taskType = '';
  vllShare = 'DP0331';
  stepName = '';
  taskGroupName = '';
  linkQuesiton = 'http://';
  listOwner: DP_Steps_Tasks_Roles[] = [];
  listChair = [];
  recIdEmail = '';
  isNewEmails = true;
  taskGroupList = [];
  stepsTasks: DP_Steps_Tasks;
  fieldsGroup = { text: 'taskGroupName', value: 'recID' };
  fieldsTask = { text: 'taskName', value: 'recID' };
  tasksItem = '';
  stepID = '';
  status = 'add';
  taskList: DP_Steps_Tasks[] = [];
  show = false;
  dataCombobox = [];
  valueInput = '';
  litsParentID = [];
  listJobType = [];
  taskGroupID = this.guidEmpty;
  isHaveFile = false;
  showLabelAttachment = false;
  folderID = '';
  frmModel: FormModel;
  view = [];
  step: DP_Steps;
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.status = dt?.data[0];
    this.taskType = dt?.data[1];
    this.step = dt?.data[2];
    this.taskGroupList = dt?.data[3];
    this.stepID = this.step?.recID;
    this.stepName = this.step?.stepName;
    this.dialog = dialog;
    if (this.status == 'add') {
      this.stepsTasks = new DP_Steps_Tasks();
      this.stepsTasks['taskType'] = this.taskType;
      this.stepsTasks['stepID'] = this.stepID;
      this.stepsTasks['taskGroupID'] = dt?.data[6];
    } else if (this.status == 'copy') {
      this.stepsTasks = dt?.data[4] || new DP_Steps_Tasks();
      this.taskType = this.stepsTasks.taskType;
      this.stepsTasks['recID'] = Util.uid();
      this.showLabelAttachment = true;
    } else {
      this.stepsTasks = dt?.data[4] || new DP_Steps_Tasks();
      this.taskType = this.stepsTasks.taskType;
      this.showLabelAttachment = true;
    }
    this.taskList = dt?.data[5];
    this.taskGroupID = dt?.data[6];
  }
  async ngOnInit() {
    this.getTypeTask();
    this.getFormModel();
    this.listOwner = this.stepsTasks['roles'];
    if (this.stepsTasks['parentID']) {
      this.litsParentID = this.stepsTasks['parentID'].split(';');
    }

    this.dataCombobox = await this.setTaskLink(this.stepsTasks?.taskGroupID);
    this.valueInput = this.dataCombobox
      .filter((x) => x.checked)
      .map((y) => y.value)
      .join('; ');
  }

  mapDataTask(liskTask, listID?) {
    let taskLinks = [];
    let data;
    if (liskTask?.length > 0) {
      liskTask.forEach((element) => {
        if (element['recID'] && element['taskName']) {
          taskLinks.push({
            key: element.recID,
            value: element.taskName,
            checked: false,
          });
        }
      });
    }

    if (listID && listID.length > 0 && taskLinks.length > 0) {
      data = taskLinks.map((task) => {
        return listID.some((x) => x == task.key)
          ? { ...task, checked: true }
          : { ...task };
      });
      taskLinks = data;
    }
    return taskLinks;
  }

  getTypeTask() {
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listJobType = res.datas;
        let type = this.listJobType.find((x) => x.value === this.taskType);
        this.title = type['text'];
      }
    });
  }

  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  async filterText(value, key) {
    this.stepsTasks[key] = value;
    this.taskGroupName = this.taskGroupList.find((x) => x.recID === value)[
      'taskGroupName'
    ];
    this.dataCombobox = await this.setTaskLink(value);
  }

  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
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

  showCombobox() {
    this.show = !this.show;
  }
  // xử lý công việc liên kêt
  async setTaskLink(groupTaskID?: string) {
    let taskLinks = [];
    if (groupTaskID) {
      if (this.status == 'add' || this.status == 'copy') {
        let groupTask = this.taskGroupList.find((x) => x.recID === groupTaskID);
        if (groupTask && groupTask['task']) {
          taskLinks = this.mapDataTask(groupTask['task']);
        }
      } else {
        let litsParentID = this.stepsTasks['parentID'].split(';');
        let groupTask = this.taskGroupList.find((x) => x.recID === groupTaskID);
        if (groupTask && groupTask['task']) {
          //lấy những task mà không có liên kết với task đang edit
          let tasks = groupTask['task'].filter(
            (task) => !task['parentID'].includes(this.stepsTasks?.recID)
          );
          taskLinks = this.mapDataTask(tasks, litsParentID);
        }
        let index = taskLinks.findIndex((x) => x.key === this.stepsTasks.recID);
        taskLinks.splice(index, 1);
      }
    } else {
      if (this.status == 'add' || this.status == 'copy') {
        if (this.taskList?.length > 0) {
          taskLinks = this.mapDataTask(this.taskList);
        }
      } else {
        let litsParentID = this.stepsTasks['parentID'].split(';');
        if (this.taskList?.length > 0) {
          //lấy những task mà không có liên kết với task đang edit
          let tasks = this.taskList.filter(
            (task) => !task['parentID'].includes(this.stepsTasks?.recID)
          );
          taskLinks = this.mapDataTask(tasks, litsParentID);
        }
        let index = taskLinks.findIndex((x) => x.key === this.stepsTasks.recID);
        taskLinks.splice(index, 1);
      }
    }
    return taskLinks;
  }

  // combobox chọn nhiều
  handelCheck(data) {
    data.checked = !data.checked;
    let dataCheck = this.dataCombobox
      .filter((x) => x.checked)
      .map((y) => y.value);
    this.litsParentID = this.dataCombobox
      .filter((x) => x.checked)
      .map((y) => y.key);
    this.valueInput = dataCheck.join('; ');
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    let a = this.inputContainer?.nativeElement.contains(event.target);
    if (!a) {
      this.show = false;
    }
  }

  getFormModel() {
    this.frmModel = {
      entityName: 'DP_Steps_Tasks',
      formName: 'DPStepsTasks',
      gridViewName: 'grvDPStepsTasks',
    };
    this.cache.gridView('grvDPStepsTasks').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsTasks', 'grvDPStepsTasks')
        .subscribe((res) => {
          for (let key in res) {
            if (res[key]['isRequire']) {
              let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
              this.view[keyConvert] = res[key]['headerText'];
            }
          }
          console.log(this.view);
        });
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

  // save
  async saveData() {
    this.stepsTasks['roles'] = this.listOwner;
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    let message = [];
    for (let key of this.REQUIRE) {
      if (!this.stepsTasks[key] || this.stepsTasks[key]?.length === 0) {
        message.push(this.view[key]);
      }
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else {
      if (this.attachment && this.attachment.fileUploadList.length) {
        (await this.attachment.saveFilesObservable()).subscribe((res) => {
          if (res) {
            this.handelSave();
          }
        });
      } else {
        this.handelSave();
      }
    }
  }

  handelSave() {
    if (this.stepsTasks['taskGroupID'] != this.guidEmpty) {
      let groupTask = this.taskGroupList.find(
        (x) => x.recID == this.stepsTasks['taskGroupID']
      );

      if (this.stepsTasks['dependRule'] != '1') {
        // nếu công việc được thực hiện sau khi tạo
        this.checkSave(groupTask);
      } else {
        // nếu công việc thực hiện sau những công việc khác thì tính tổng thời gian những công việc liên quan
        if (
          !this.stepsTasks['parentID'].trim() ||
          groupTask['task'].length === 0
        ) {
          // nếu chưa có công việc liên quan
          this.checkSave(groupTask);
        } else {
          let time = this.checkSaveDependRule(groupTask, this.stepsTasks);
          this.checkSave(groupTask, time);
        }
      }
    } else {
      // kiểm tra xem task có time lớn hơn step hay không if lớn thì hỏi ý kiến
      if (!this.stepsTasks['parentID'].trim()) {
        //if ko có parentID thì so sánh trực tiếp với step
        if (this.getHour(this.stepsTasks) > this.getHour(this.step)) {
          this.notiService.alertCode(this.MESSAGETIME).subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = this.stepsTasks['durationDay'];
              this.step['durationHour'] = this.stepsTasks['durationHour'];
              this.dialog.close({ data: this.stepsTasks, status: this.status });
            } else {
              this.dialog.close({ data: this.stepsTasks, status: this.status });
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      } else {
        // tính thời gian dựa vào công việc liên quan rồi mới so sánh
        let parentIDs = this.stepsTasks['parentID'].split(';');
        let maxtime = 0;
        parentIDs?.forEach((id) => {
          let time = this.calculateTimeTaskNoGroup(id);
          maxtime = Math.max(time, maxtime);
        });
        maxtime += this.getHour(this.stepsTasks);
        if (maxtime > this.getHour(this.step)) {
          this.notiService.alertCode(this.MESSAGETIME).subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = Math.floor(maxtime / 24);
              this.step['durationHour'] = maxtime % 24;
              this.dialog.close({ data: this.stepsTasks, status: this.status });
            } else {
              this.dialog.close({ data: this.stepsTasks, status: this.status });
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      }
    }
  }

  checkSave(groupTask, timeInput?: number) {
    let time = timeInput ? timeInput : this.getHour(this.stepsTasks);
    if (this.getHour(groupTask) >= time) {
      // nếu thời gian ko vượt quá thời gian cho phép lưu => không ảnh hưởng đến step
      this.dialog.close({ data: this.stepsTasks, status: this.status });
    } else {
      // nếu vượt quá thì hỏi ý kiến
      this.notiService.alertCode(this.MESSAGETIME).subscribe((x) => {
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
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      });
    }
  }

  // xử lý thời gian
  getHour(data) {
    let hour =
      Number(data['durationDay'] || 0) * 24 + Number(data['durationHour'] || 0);
    return hour || 0;
  }

  sumHourGroupTask(index?: number) {
    let sum = 0;
    if (this.taskGroupList?.length > 0) {
      if (index >= 0) {
        for (let group of this.taskGroupList) {
          if (Number(group['indexNo']) <= index) {
            sum += this.getHour(group);
          }
        }
      } else {
        sum = this.taskGroupList.reduce((sumHour, group) => {
          return (sumHour += this.getHour(group));
        }, 0);
      }
    }
    return sum;
  }

  calculateTimeTaskNoGroup(taskId) {
    let task = this.taskList.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      let groupFind = this.taskGroupList.find(
        (x) => x['recID'] === task['taskGroupID']
      );
      let hourGroup = this.sumHourGroupTask(groupFind['indexNo'] - 1);
      return hourGroup + this.getHour(task);
    } else {
      const parentIds = task.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.calculateTimeTaskNoGroup(parentId);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }

  checkSaveDependRule(groupTask, task) {
    let idTask = task['parentID'].trim() ? task['parentID'].split(';') : [];
    if (idTask.length > 0) {
      let taskMax = 0;
      let taskFindMax;
      idTask?.forEach((element) => {
        let taskFind = groupTask['task'].find((x) => x.recID == element);
        if (taskFind && this.getHour(taskFind) >= taskMax) {
          taskMax = this.getHour(taskFind) || 0;
          taskFindMax = taskFind;
        }
      });
      if (taskMax == 0) {
        return this.getHour(task);
      } else {
        return (
          this.getHour(task) + this.checkSaveDependRule(groupTask, taskFindMax)
        );
      }
    } else {
      return this.getHour(task);
    }
  }
}
