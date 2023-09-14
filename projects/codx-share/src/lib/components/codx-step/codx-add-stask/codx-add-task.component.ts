import { group } from 'console';
import {
  OnInit,
  Optional,
  ViewChild,
  Component,
  ElementRef,
} from '@angular/core';
import {
  Util,
  AuthStore,
  DialogRef,
  DialogData,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
} from 'codx-core';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { StepService } from '../step.service';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { TN_OrderModule } from 'projects/codx-ad/src/lib/models/tmpModule.model';

@Component({
  selector: 'codx-add-stask',
  templateUrl: './codx-add-task.component.html',
  styleUrls: ['./codx-add-task.component.scss'],
})
export class CodxAddTaskComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  REQUIRE = ['taskName', 'endDate', 'startDate'];
  action = 'add';
  vllShare = 'BP021';
  linkQuesiton = 'http://';
  typeTask;
  listGroup = [];
  recIdEmail = '';
  isNewEmails = true;
  isEditTimeDefault = false;

  dialog!: DialogRef;
  endDateParent: Date;
  startDateParent: Date;
  step: DP_Instances_Steps;
  stepsTasks: DP_Instances_Steps_Tasks;
  listTask: DP_Instances_Steps_Tasks[] = [];

  fieldsTask = { text: 'taskName', value: 'refID' };
  fieldsGroup = { text: 'taskGroupName', value: 'refID' };

  folderID = '';
  titleName = '';
  valueInput = '';
  view = [];
  dataCombobox = [];
  litsParentID = [];
  user;
  ownerParent; //
  groupTask;
  isSave = true;
  groupTaskID = null;
  isLoadDate = false;
  isHaveFile = false;
  isSaveTimeTask = true;
  isTaskDefault = false;
  isSaveTimeGroup = true;
  showLabelAttachment = false;
  isStatusNew = true;
  isStart = false;
  isBoughtTM = false;

  listFieldCopy = [];
  listField = [];

  isShowDate = false;
  isShowTime = false;
  isAddTM = false;
  startDayOld;
  endDayOld;

  listCombobox = {
    U: 'Share_Users_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
    O: 'Share_OrgUnits_Sgl',
  };
  owner: DP_Instances_Steps_Tasks_Roles[] = [];
  roles: DP_Instances_Steps_Tasks_Roles[] = [];
  participant: DP_Instances_Steps_Tasks_Roles[] = [];

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private stepService: StepService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.step = dt?.data?.step;
    this.action = dt?.data?.action;
    // this.isStart = dt?.data?.isStart;
    this.typeTask = dt?.data?.taskType;
    this.ownerParent = dt?.data?.owner; // owner of Parent
    this.listTask = dt?.data?.listTask || this.step?.tasks;
    this.stepsTasks = dt?.data?.dataTask;
    this.isBoughtTM = dt?.data?.isBoughtTM;
    this.groupTaskID = dt?.data?.groupTaskID;
    this.titleName = dt?.data?.titleName || '';
    this.isEditTimeDefault = dt?.data?.isEditTimeDefault;
    this.isSave = dt?.data?.isSave == undefined ? this.isSave : dt?.data?.isSave;
    this.isStart = this.step || (this.step?.startDate && this.step?.startDate) ? true  : false;
    if (dt?.data?.listGroup) {
      // remove group task recID null
      this.listGroup = JSON.parse(JSON.stringify(dt?.data?.listGroup || []));
      let index = this.listGroup?.findIndex((group) => !group.recID);
      if (index >= 0) {
        this.listGroup?.splice(index, 1);
      }
    }else{
      this.listGroup = JSON.parse(JSON.stringify(this.step?.taskGroups || []));
    }
  }

  ngOnInit(): void {
    this.titleName = (this.titleName + ' ' + this.typeTask?.text).toUpperCase();
    this.roles = this.stepsTasks['roles'] || [];

    if (!this.stepsTasks?.taskGroupID) {
      this.startDateParent = new Date(this.step?.startDate || new Date());
      this.endDateParent = this.step?.endDate ? new Date(this.step?.endDate) : null;
    } else {
      this.groupTask = this.listGroup.find(
        (x) => x.refID === this.stepsTasks?.taskGroupID
      );
      this.startDateParent = new Date(this.groupTask['startDate']);
      this.endDateParent = new Date(this.groupTask['endDate']);
    }

    this.getFormModel();
    if (this.stepsTasks?.parentID) {
      this.litsParentID = this.stepsTasks?.parentID.split(';');
    }

    this.owner = this.roles?.filter(
      (role) => role.objectID == this.stepsTasks?.owner
    );
    this.participant = this.roles?.filter(
      (role) => role.objectID !== this.stepsTasks?.owner
    );
    if (this.action == 'add') {
      let role = new DP_Instances_Steps_Tasks_Roles();
      this.setRole(role);
      this.owner = [role];
      this.stepsTasks.owner = this.owner?.[0].objectID;
      this.stepsTasks.status = '1';
      this.stepsTasks.createTask = this.isBoughtTM;
      this.stepsTasks.taskName = this.typeTask?.text;
      this.stepsTasks.startDate = this.startDateParent;
      let startDays = new Date(this.startDateParent);
      startDays.setDate(startDays?.getDate() + 1);
      this.stepsTasks.endDate = startDays;
    }
    if (this.step?.fields?.length > 0 && this.stepsTasks?.fieldID) {
      let fieldID = this.stepsTasks?.fieldID;
      this.listFieldCopy = JSON.parse(JSON.stringify(this.step?.fields));
      this.listField = this.listFieldCopy?.filter((field) =>
        fieldID?.includes(field?.recID)
      );
    }
    this.checkStatusShowForm();
    if (this.isBoughtTM == undefined) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'UsersBusiness',
          'GetListBoughtModuleAsync',
          ''
        )
        .subscribe((res: Array<TN_OrderModule>) => {
          if (res) {
            let lstModule = res;
            this.isBoughtTM = lstModule?.some(
              (md) =>
                !md?.boughtModule?.refID &&
                md.bought &&
                md.boughtModule?.moduleID == 'TM1'
            );
            this.stepsTasks.createTask = this.isBoughtTM;
          }
        });
    }
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    role['roleType'] = 'O';
    role['objectType'] = this.user?.objectType;
    return role;
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
      });
  }

  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  filterText(event, key) {
    let data = event?.value;
    this.stepsTasks[key] = data;
    if (data) {
      this.groupTask = this.listGroup.find((x) => x.refID === data);
      this.startDateParent = new Date(this.groupTask['startDate']);
      this.endDateParent = new Date(this.groupTask['endDate']);
      this.stepsTasks['startDate'] = this.startDateParent || new Date();
      this.stepsTasks['indexNo'] = this.groupTask?.task?.length + 1 || 1;
    } else {
      this.groupTask = this.listGroup.find((x) => x.recID === null);
      this.startDateParent = new Date(this.step['startDate']);
      this.endDateParent = new Date(this.step['endDate']);
      this.stepsTasks['startDate'] = this.startDateParent || new Date();
      this.stepsTasks['indexNo'] = this.groupTask?.task?.length + 1 || 1;
    }
  }

  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
  }

  changeValueDateExpected(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
    if (this.step) {
      if (this.isLoadDate) {
        this.isLoadDate = !this.isLoadDate;
        return;
      }
      const startDate = new Date(this.stepsTasks['startDate']);
      const endDate = new Date(this.stepsTasks['endDate']);

      if (endDate && startDate > endDate) {
        this.isSaveTimeTask = false;
        this.isLoadDate = !this.isLoadDate;
        this.notiService.notifyCode('DP019');
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeTask = true;
      }
      if (this.endDateParent && this.stepService.compareDates(this.endDateParent, endDate) < 0) {
        this.isSaveTimeGroup = false;
        this.isLoadDate = !this.isLoadDate;
        let start =
          ' ' +
          this.stepService.formatDate(
            this.startDateParent,
            'dd/MM/yyyy HH:mm'
          ) +
          ' ';
        let end =
          ' ' +
          this.stepService.formatDate(this.endDateParent, 'dd/MM/yyyy HH:mm') +
          ' ';
        this.notiService.notifyCode('DP020', 0, start, end);
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeGroup = true;
      }

      if (this.stepService.compareDates(startDate, this.startDateParent) < 0) {
        this.isSaveTimeGroup = false;
        this.isLoadDate = !this.isLoadDate;
        let start =
          ' ' +
          this.stepService.formatDate(
            this.startDateParent,
            'dd/MM/yyyy HH:mm'
          ) +
          ' ';
        let end =
          ' ' +
          this.stepService.formatDate(this.endDateParent, 'dd/MM/yyyy HH:mm') +
          ' ';
        this.notiService.notifyCode('DP020', 0, start, end);
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeGroup = true;
      }
      this.isLoadDate = !this.isLoadDate;
    }
    if (this.stepsTasks['startDate'] && this.stepsTasks['endDate']) {
      const endDate = new Date(this.stepsTasks['endDate']);
      const startDate = new Date(this.stepsTasks['startDate']);
      if (endDate >= startDate) {
        const duration = endDate.getTime() - startDate.getTime();
        const time = Number((duration / 60 / 1000 / 60).toFixed(1));
        let days = 0;
        let hours = 0;
        if (time < 1) {
          hours = time;
        } else {
          hours = Number((time % 24).toFixed(1));
          days = Math.floor(time / 24);
        }
        this.stepsTasks['durationHour'] = hours;
        this.stepsTasks['durationDay'] = days;
      }
    } else {
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
    }
  }

  changeRoler(e) {
    if (!e || e?.length == 0) {
      this.participant = [];
      return;
    }

    let listUser = e || [];
    let listRole = [];
    listUser.forEach((element) => {
      listRole.push({
        objectID: element.objectID,
        objectName: element.objectName,
        objectType: element.objectType,
        roleType: element.roleType,
        taskID: this.stepsTasks['recID'],
      });
    });
    this.participant = listRole;
    this.removeRoleDuplicate();
  }

  changeRolerOwner(event) {
    let role = event[0];
    if (role) {
      if (role?.roleType == 'Users' || role?.roleType == 'Owner') {
        role['taskID'] = this.stepsTasks?.recID;
        this.owner = [role];
        this.stepsTasks.owner = role?.objectID;
        this.removeRoleDuplicate();
      } else {
        let data = [];
        switch (role?.roleType) {
          case 'Departments':
          case 'OrgHierarchy':
            data = [role?.objectID, this.step?.instanceID, this.ownerParent];
            break;
          case 'Roles':
          case 'Positions':
            data = [
              role?.objectID,
              this.step?.instanceID,
              this.ownerParent,
              role?.objectType,
            ];
            break;
        }
        if (data?.length > 0) {
          this.api
            .exec<any>(
              'DP',
              'InstancesBusiness',
              'GetUserByOrgUnitIDAsync',
              data
            )
            .subscribe((res) => {
              if (res) {
                let role = new DP_Instances_Steps_Tasks_Roles();
                role['objectID'] = res?.userID;
                role['objectName'] = res?.userName;
                role['objectType'] = 'U';
                role['roleType'] = 'Users';
                role['taskID'] = this.stepsTasks?.recID;
                this.owner = [role];
                this.stepsTasks.owner = role?.objectID;
              }
            });
        }
      }
    } else {
      this.owner = [];
    }
  }

  removeRoleDuplicate() {
    let roleTypeO = this.owner[0];
    if (roleTypeO) {
      let index = this.participant?.findIndex(
        (p) => p.objectID == roleTypeO?.objectID
      );
      if (index >= 0) {
        this.participant?.splice(index, 1);
      }
    }
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

  valueChangeRadio(event) {
    this.stepsTasks.status = event?.field;
    this.stepsTasks.progress = event?.field == '3' ? 100 : 0;
    if (event?.field == '3') {
      this.stepsTasks.actualEnd = new Date();
      [this.startDayOld, this.endDayOld] = [
        this.stepsTasks?.startDate,
        this.stepsTasks?.endDate,
      ];
      [this.stepsTasks.startDate, this.stepsTasks.endDate] = [null, null];
    }
    if (event?.field == '1') {
      this.stepsTasks.startDate = this.startDayOld
        ? this.startDayOld
        : this.stepsTasks?.startDate;
      this.stepsTasks.endDate = this.endDayOld
        ? this.endDayOld
        : this.stepsTasks?.endDate;
      this.stepsTasks.actualEnd = null;
    }
    this.checkStatusShowForm();
  }
  //#region save
  async beforeSave(isCreateMeeting = false) {
    this.stepsTasks['roles'] = [...this.participant, ...this.owner];
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    let message = [];
    if (!this.isSaveTimeTask) {
      this.notiService.notifyCode('DP019');
      return;
    }
    if (!this.isSaveTimeGroup) {
      this.notiService.notifyCode('DP020');
      return;
    }

    if (!this.stepsTasks['taskName']?.trim()) {
      message.push(this.view['taskName']);
    }
    if (this.stepsTasks?.roles?.length <= 0) {
      message.push(this.view['roles']);
    }

    if (this.isStart) {
      if (this.stepsTasks?.status != '3') {
        if (!this.stepsTasks?.startDate) {
          message.push(this.view['startDate']);
        }
        if (!this.stepsTasks?.endDate) {
          message.push(this.view['endDate']);
        }
      }
    } else {
      if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
        message.push(this.view['durationDay']);
      }
    }

    // if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
    //   message.push(this.view['durationDay']);
    // }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
      return;
    }

    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        this.save(this.stepsTasks, isCreateMeeting);
      });
    } else {
      this.save(this.stepsTasks, isCreateMeeting);
    }
  }

  save(task, isCreateMeeting = false) {
    if (this.action == 'add' || this.action == 'copy') {
      if (isCreateMeeting) {
        task.actionStatus = '2';
        task.status = '2';
      }
      this.addTask(task, isCreateMeeting);
    }
    if (this.action == 'edit') {
      this.editTask(task);
    }
  }

  addTask(task, isCreateMeeting = false) {
    if (this.isSave) {
      this.api
        .exec<any>('DP', 'InstanceStepsBusiness', 'AddTaskStepAsync', task)
        .subscribe((res) => {
          if (res) {
            this.dialog.close({
              task: res[0],
              progressGroup: res[1],
              progressStep: res[2],
              isCreateMeeting,
            });
          }
        });
    } else {
      this.dialog.close(task);
    }
  }
  editTask(task) {
    if (this.isSave) {
      this.api
        .exec<any>('DP', 'InstanceStepsBusiness', 'UpdateTaskStepAsync', [
          task,
          this.listField,
        ])
        .subscribe((res) => {
          if (res) {
            this.step.fields = this.listFieldCopy;
            this.dialog.close({
              task: res,
              progressGroup: null,
              progressStep: null,
            });
          }
        });
    } else {
      this.dialog.close(task);
    }
  }
  //#endregion
  addFileCompleted(e) {
    // this.isAddComplete = e;
  }
  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }

      var index = this.listField.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.listField[index].dataValue = result;
      }
      let a = this.step?.fields;
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          //this.notiService.notifyCode('SYS037');
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          // this.notiService.notifyCode('RS030');
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }

  checkStatusShowForm() {
    if (this.action == 'add' || this.action == 'copy') {
      if (this.isStart) {
        if (this.stepsTasks.status == '3') {
          this.isShowDate = false;
          this.isShowTime = false;
          this.isAddTM = false;
        } else {
          this.isShowDate = true;
          this.isShowTime = true;
          this.isAddTM = true;
        }
      } else {
        this.isShowDate = false;
        this.isShowTime = true;
        this.isAddTM = true;
      }
    } else {
      //edit
      if (this.isStart) {
        if(this.stepsTasks?.status == '3'){
            this.isShowDate = false;
            this.isShowTime = false;
            this.isAddTM = false;
        }else{
          if (!this.stepsTasks?.endDate || !this.stepsTasks?.startDate) {
            this.isShowDate = false;
            this.isShowTime = false;
            this.isAddTM = false;
          } else {
            this.isShowDate = true;
            this.isShowTime = true;
            this.isAddTM = true;
          }
        }
      } else {
        this.isShowDate = false;
        this.isShowTime = true;
        this.isAddTM = true;
      }
    }
  }
}
