import {
  OnInit,
  Optional,
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import {
  Util,
  FormModel,
  DialogRef,
  DialogData,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
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
  templateUrl: './popup-step-task.component.html',
  styleUrls: ['./popup-step-task.component.scss'],
})
export class PopupJobComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  REQUIRE = ['taskName', 'roles', 'dependRule'];
  title = '';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  taskType = '';
  vllShare = 'DP0331';
  stepName = '';
  taskGroupName = '';
  linkQuesiton = 'http://';
  roles: DP_Steps_Tasks_Roles[] = [];
  participant: DP_Steps_Tasks_Roles[] = [];
  owner: DP_Steps_Tasks_Roles[] = [];
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
  taskGroupID = '';
  isHaveFile = false;
  showLabelAttachment = false;
  folderID = '';
  frmModel: FormModel;
  view = [];
  step: DP_Steps;
  listFileTask: string[] = [];
  listCombobox = {
    U: 'Share_Users_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
    O: 'Share_OrgUnits_Sgl',
  };
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDef: ChangeDetectorRef,
    private api: ApiHttpService,
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
    this.listFileTask = dt?.data[7];
  }
  async ngOnInit() {
    this.getTypeTask();
    this.getFormModel();
    this.roles = this.stepsTasks['roles'];
    this.owner = this.roles?.filter((role) => role.roleType === 'O');
    this.participant = this.roles?.filter((role) => role.roleType === 'P');
    this.litsParentID = this.stepsTasks['parentID']
      ? this.stepsTasks['parentID']?.split(';')
      : [];
    let group = this.taskGroupList?.find(
      (x) => x.recID === this.stepsTasks?.taskGroupID
    );
    let listTaskConvert = group?.recID
      ? JSON.parse(JSON.stringify(group['task']))
      : JSON.parse(JSON.stringify(this.taskList));
    await this.getTasksWithoutLoop(this.stepsTasks, listTaskConvert);
    this.dataCombobox = this.mapDataTask(listTaskConvert, this.litsParentID);
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

  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  changeOwner(e) {
    let owner = e?.map((x) => {
      return {
        ...x,
        roleType: 'O',
      };
    });
    this.owner = owner;
  }

  changeRoler(e, datas, type) {    
    if (!e || e?.length == 0) return;
    let listUser = e || [];
    let listRole = [];
    listUser.forEach((element) => {
        listRole.push({
          objectID: element.objectID,
          objectName: element.objectName,
          objectType: element.objectType,
          roleType: type,
          taskID: this.stepsTasks['recID'],
        });
    });
    this.participant = listRole;
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.objectID == objectID);
    if (index != -1) data.splice(index, 1);
  }

  async changeCombobox(value, key) {
    this.stepsTasks[key] = value;
    let group = this.taskGroupList.find((x) => x.recID === value);
    this.taskGroupName = group['taskGroupName'];
    let taskLink = group?.recID
      ? JSON.parse(JSON.stringify(group['task']))
      : JSON.parse(JSON.stringify(this.taskList));
    this.dataCombobox = this.mapDataTask(taskLink);
    await this.getTasksWithoutLoop(this.stepsTasks, this.dataCombobox);
    this.stepsTasks['parentID'] = '';
  }

  async getTasksWithoutLoop(task, tasks) {
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

  showCombobox() {
    this.show = !this.show;
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
  fileAdded(e) {
    console.log(e);
  }

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
    this.stepsTasks['roles'] = [...this.owner, ...this.participant];
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    let message = [];
    for (let key of this.REQUIRE) {
      if((typeof this.stepsTasks[key] === 'string' && !this.stepsTasks[key].trim()) || !this.stepsTasks[key] || this.stepsTasks[key]?.length === 0) {
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
      let groupTask = this.taskGroupList.find((x) => x.recID == task['taskGroupID']);
      if (task['dependRule'] != '1' || !task['parentID'].trim() || groupTask['task'].length === 0) {
        //No parentID
        this.checkSave(groupTask);
      } else {
        let timeMax = this.getTimeMaxGroupTask(groupTask['task'], this.stepsTasks);
        this.checkSave(groupTask, timeMax);
      }
    } else {
      if (!task['parentID'].trim() || task['dependRule'] != '1') {
        //if ko có parentID thì so sánh trực tiếp với step
        if (this.getHour(this.stepsTasks) > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = this.stepsTasks['durationDay'];
              this.step['durationHour'] = this.stepsTasks['durationHour'];
              this.dialog.close({ data: this.stepsTasks, status: this.status });
            } 
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.status });
        }
      } else {
        // tính thời gian dựa vào công việc liên quan rồi mới so sánh
        let listIdTask = this.stepsTasks['parentID'].split(';');
        let maxtime = 0;
        listIdTask?.forEach((id) => {
          let time = this.getSumTimeTask(this.taskList,id);
          maxtime = Math.max(time, maxtime);
        });
        maxtime += this.getHour(this.stepsTasks);
        if (maxtime > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = Math.floor(maxtime / 24);
              this.step['durationHour'] = maxtime % 24;
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

  getTimeMaxGroupTask(tasks, task) {
    if(!task) return 0;
    if(!tasks || tasks?.length <= 0) return this.getHour(task);
    let listTask = JSON.parse(JSON.stringify(tasks));
    let maxTime = 0;
    if(this.status === 'edit'){
      let index = listTask?.findIndex(t => t.recID == task.recID);
      if(index >=0){
        listTask?.splice(index,1,task);
      }
      listTask?.forEach((itemTask) => {
        let time = this.getSumTimeTask(listTask,itemTask['recID']);
        maxTime = Math.max(maxTime, time);
      });
    }else{
      listTask?.push(task);
      maxTime = this.getSumTimeTask(listTask,task['recID']);
    }
    return maxTime;
  }

  getSumTimeTask(taskList: any[], taskId: string) {
    let task = taskList?.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      return this.getHour(task);
    } else {
      const parentIds = task?.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.getSumTimeTask(taskList, parentId);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }

}
