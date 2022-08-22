import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  tmpTaskResource,
  TM_Tasks,
} from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { TaskGoal } from 'projects/codx-tm/src/lib/models/task.model';
import { StatusTaskGoal } from 'projects/codx-tm/src/lib/models/enum/enum';
import { AttachmentComponent } from '../attachment/attachment.component';
import * as moment from 'moment';
import { TM_TaskGroups } from 'projects/codx-tm/src/lib/models/TM_TaskGroups.model';
@Component({
  selector: 'app-assign-info',
  templateUrl: './assign-info.component.html',
  styleUrls: ['./assign-info.component.scss'],
})
export class AssignInfoComponent implements OnInit, AfterViewInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  STATUS_TASK_GOAL = StatusTaskGoal;
  user: any;
  readOnly = false;
  listUser: any[];
  idUserSelected: string;
  listUserDetail: any[] = [];
  listTodo: TaskGoal[] = [];
  listTaskResources: tmpTaskResource[] = [];
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  taskGroup: TM_TaskGroups;
  task: TM_Tasks = new TM_Tasks();
  functionID: string;
  popover: any;
  title = 'Giao việc';
  showPlan = true;
  dialog: any;
  vllShare = 'TM003';
  vllRole = 'TM001';
  listRoles = [];
  isHaveFile = false;
  taskParent: any;
  refID = '';
  refType = '';
  dueDate: Date;
  taskType = '1';
  vllPriority = 'TM005';
  changTimeCount = 2;
  loadingAll = false;
  constructor(
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.getParam();
    this.task = {
      ...this.task,
      ...dt?.data[0],
    };
    this.refID = this.task?.refID;
    this.refType = this.task?.refType;
    this.dueDate = this.task?.dueDate;
    if (this.task?.taskID) this.taskParent = this.task;

    this.vllShare = dt?.data[1] ? dt?.data[1] : this.vllShare;
    this.vllRole = dt?.data[2] ? dt?.data[2] : this.vllRole;
    this.title = dt?.data[3] ? dt?.data[3] : this.title;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.setDefault();
  }

  setDefault() {
    this.task.taskID = "";
    this.api
      .execSv<number>('TM', 'CM', 'DataBusiness', 'GetDefaultAsync', [
        this.functionID,
        'TM_Tasks',
        'taskID',
      ])
      .subscribe((response: any) => {
        if (response) {
          response['_uuid'] = response['taskID'] ?? Util.uid();
          response['idField'] = 'taskID';
          response['isNew'] = function () {
            return response[response.taskID] != response['_uuid'];
          };
          this.task = response;
          this.loadingAll = true
          this.openInfo();
        }
      });
  }

  closePanel() {
    this.dialog.close();
  }

  openInfo() {
    if (this.dueDate && !this.taskParent) {
      this.task.dueDate = moment(new Date(this.dueDate)).toDate();
    } else
      this.task.dueDate = moment(new Date())
        .set({ hour: 23, minute: 59, second: 59 })
        .toDate();
    this.listUser = [];
    this.listTaskResources = [];
    this.task.category = '3';
    this.task.status = '10';
    this.task.refID = this.refID;
    this.task.refType = this.refType;
    if (this.taskParent) {
      this.task.dueDate = this.taskParent.dueDate;
      this.task.endDate = this.taskParent.endDate;
      this.task.startDate = this.taskParent.startDate;
      this.task.estimated = this.taskParent.estimated;
      this.task.taskName = this.taskParent.taskName;
      this.task.memo = this.taskParent.memo;
      this.task.memo2 = this.taskParent.memo2;
      this.task.taskGroupID = this.taskParent.taskGroupID;
      this.task.projectID = this.taskParent.projectID;
      this.task.location = this.taskParent.location;
      this.task.tags = this.taskParent.tags;
      this.task.refID = this.taskParent.refID;
      this.task.refNo = this.taskParent.refNo;
      this.task.taskType = this.taskParent.taskType;
      this.copyListTodo(this.taskParent.taskID)
      if (this.task.startDate && this.task.endDate) this.changTimeCount = 0;
      else if (this.task.startDate || this.task.endDate) this.changTimeCount = 1;
      if (this.taskParent?.taskGroupID)
        this.logicTaskGroup(this.taskParent?.taskGroupID);
    }

    this.changeDetectorRef.detectChanges();
  }

  copyListTodo(id) {
    this.api.execSv<any>("TM", "TM", "TaskBusiness", "CopyListTodoByTaskIdAsync", id).subscribe(res => {
      if (res) {
        this.listTodo = res;
      }
    })
  }

  changText(e) {
    this.task.taskName = e.data;
  }

  // changeTime(data) {
  //   if (!data.field) return;
  //   this.task[data.field] = data.data.fromDate;
  // }
  changeTime(data) {

    if (!data.field || !data.data) return;
    this.task[data.field] = data.data?.fromDate;
    if (data.field == 'startDate') {
      if (!this.task?.endDate && this.task?.startDate) {
        if (this.task?.estimated) {
          var timeEndDay =
            this.task?.startDate.getTime() + this.task?.estimated * 3600000;
          this.task.endDate = moment(new Date(timeEndDay)).toDate();
        } else
          this.task.endDate = moment(new Date(this.task.startDate))
            .add(1, 'hours')
            .toDate();
      }
    }
    if ((data.field == 'startDate' || data.field == 'endDate') && this.loadingAll) {
      this.changTimeCount += 1;
      if (
        this.task?.startDate &&
        this.task?.endDate &&
        this.changTimeCount > 2
      ) {
        var time = (
          (this.task?.endDate.getTime() - this.task?.startDate.getTime()) /
          3600000
        ).toFixed(2);
        this.task.estimated = Number.parseFloat(time);
        // this.crrEstimated = this.task.estimated;
      }
    }
  }

  changeMemo(event: any) {
    var field = event.field;
    var dt = event.data;
    this.task.memo = dt?.value ? dt.value : dt;
  }

  valueChange(data) {
    if (data.field) {
      this.task[data.field] = data?.data;
    }
  }
  cbxChange(data) {
    if (data.data && data.data != '') {
      this.task[data.field] = data.data;
      if (data.field === 'taskGroupID')
        this.loadTodoByGroup(this.task.taskGroupID);
      return;
    } else {
      this.task[data.field] = null;
    }
    if (data.field == 'taskGroupID') {
      this.getParam();
    }
  }

  changeVLL(e) { }

  saveAssign(id, isContinue) {
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      this.notiService.notifyCode('TM027');
      return;
    }
    if (this.task.assignTo == null || this.task.assignTo == '') {
      this.notiService.notifyCode('TM011');
      return;
    }
    if (this.task.estimated < 0) {
      this.notiService.notifyCode('TM033');
      return;
    }
    if (
      this.param?.MaxHoursControl != '0' &&
      this.task.estimated > Number.parseFloat(this.param?.MaxHours)
    ) {
      this.notiService.notifyCode('TM058', 0, [this.param?.MaxHours]);
      return;
    }
    if (this.task.estimated < 0) {
      this.notiService.notifyCode('TM033');
      return;
    }
    if (this.param?.ProjectControl == '2' && !this.task.projectID) {
      this.notiService.notifyCode('TM028');
      return;
    }
    if (
      this.param?.LocationControl == '2' &&
      (this.task.location == null || this.task?.location.trim() == '')
    ) {
      this.notiService.notifyCode('TM029');
      return;
    }
    if (
      this.param?.PlanControl == '2' &&
      (!this.task.startDate || !this.task.endDate)
    ) {
      this.notiService.notifyCode('TM030');
      return;
    }
    if (this.param?.DueDateControl == '1' && this.task.dueDate <= new Date()) {
      this.notiService.notifyCode('TM031');
      return;
    }
    if (this.task.taskGroupID) {
      // if (
      //   this.taskGroup?.checkListControl != '0' &&
      //   this.listTodo.length == 0
      // ) {
      //   this.notiService.notifyCode('TM032');
      //   return;
      // }
    }
    if (this.isHaveFile) this.attachment.saveFiles();
    var taskIDParent = this.taskParent?.taskID ? this.taskParent?.taskID : null;
    this.tmSv
      .saveAssign([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
        taskIDParent,
      ])
      .subscribe((res) => {
        if (res[0]) {
          this.notiService.notifyCode('TM006');
          this.dialog.close(res);
          if (!isContinue) {
            this.closePanel();
          }
          this.resetForm();
        } else {
          this.notiService.notifyCode('TM038');
          return;
        }
      });
  }

  //Form Old
  // onDeleteUser(userID) {
  //   var listUser = [];
  //   var listUserDetail = [];
  //   var listTaskResources = [];
  //   for (var i = 0; i < this.listTaskResources.length; i++) {
  //     if (this.listUser[i] != userID) {
  //       listUser.push(this.listUser[i]);
  //     }
  //     // if (this.listUserDetail[i].userID != userID) {
  //     //   listUserDetail.push(this.listUserDetail[i]);
  //     // }
  //     if (this.listTaskResources[i]?.resourceID != userID) {
  //       listTaskResources.push(this.listTaskResources[i]);
  //     }
  //   }
  //   this.listUser = listUser;
  //   // this.listUserDetail = listUserDetail;
  //   this.listTaskResources = listTaskResources;

  //   var assignTo = '';
  //   if (listUser.length > 0) {
  //     listUser.forEach((idUser) => {
  //       assignTo += idUser + ';';
  //     });
  //     assignTo = assignTo.slice(0, -1);
  //     this.task.assignTo = assignTo;
  //   } else this.task.assignTo = '';
  // }
  onDeleteUser(item) {
    var userID = item.resourceID;
    var listUser = [];
    var listTaskResources = [];
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUser[i] != userID) {
        listUser.push(this.listUser[i]);
      }
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
      if (this.listTaskResources[i]?.resourceID != userID) {
        listTaskResources.push(this.listTaskResources[i]);
      }
    }
    this.listUser = listUser;
    this.listUserDetail = listUserDetail;
    this.listTaskResources = listTaskResources;

    var assignTo = '';
    if (listUser.length > 0) {
      listUser.forEach((idUser) => {
        assignTo += idUser + ';';
      });
      assignTo = assignTo.slice(0, -1);
      this.task.assignTo = assignTo;
    } else this.task.assignTo = '';
  }

  resetForm() {
    this.listUser = [];
    // this.listUserDetail = [];
    this.listTaskResources = [];
    this.setDefault();
    // this.task.status = '1';
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }
  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
      // if (obj?.data && obj?.data != '') {
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;
        case 'O':
        case 'D':
          listDepartmentID += obj.id + ';';
          break;
      }
      //  }
    });
    if (listUserID != '')
      listUserID = listUserID.substring(0, listUserID.length - 1);
    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    if (listDepartmentID != '') {
      this.tmSv.getUserByListDepartmentID(listDepartmentID).subscribe((res) => {
        if (res) {
          assignTo += res;
          if (listUserID != '') assignTo += ';' + listUserID;
          this.valueSelectUser(assignTo);
        }
      });
    } else this.valueSelectUser(listUserID);
  }

  valueSelectUser(assignTo) {
    if (assignTo != '') {
      if (this.task.assignTo && this.task.assignTo != '') {
        var arrAssign = assignTo.split(';');
        var arrNew = [];
        arrAssign.forEach((e) => {
          if (!this.task.assignTo.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          assignTo = arrNew.join(';');
          this.task.assignTo += ';' + assignTo;
          this.getListUser(assignTo);
        }
      } else {
        this.task.assignTo = assignTo;
        this.getListUser(assignTo);
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    var arrUser = listUser.split(';');
    this.listUser = this.listUser.concat(arrUser);
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListUserDetailAsync',
        listUser
      )
      .subscribe((res) => {
        this.listUserDetail = this.listUserDetail.concat(res);
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var taskResource = new tmpTaskResource();
            taskResource.resourceID = emp?.userID;
            taskResource.resourceName = emp?.userName;
            taskResource.positionName = emp?.positionName;
            taskResource.departmentName = emp?.departmentName;
            taskResource.roleType = 'R';
            this.listTaskResources.push(taskResource);
          }
        }
      });
  }
  //Form Old
  // getListUser(listUser) {
  //   while (listUser.includes(' ')) {
  //     listUser = listUser.replace(' ', '');
  //   }
  //   var arrUser = listUser.split(';');
  //   this.listUser = this.listUser.concat(arrUser);
  //   // arrUser.forEach((u) => {
  //   //   var taskResource = new tmpTaskResource();
  //   //   taskResource.resourceID = u;
  //   //   taskResource.roleType = 'R';
  //   //   this.listTaskResources.push(taskResource);
  //   // });
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskBusiness',
  //       'GetListUserDetailAsync',
  //       listUser
  //     )
  //     .subscribe((res) => {
  //       if (res && res.length > 0) {
  //         for (var i = 0; i < res.length; i++) {
  //           let emp = res[i];
  //           var taskResource = new tmpTaskResource();
  //           taskResource.resourceID = emp.userID;
  //           taskResource.resourceName = emp.userName;
  //           taskResource.positionName = emp.positionName;
  //           taskResource.roleType = 'R';
  //           this.listTaskResources.push(taskResource);
  //         };
  //       }
  //       // this.listUserDetail = this.listUserDetail.concat(res);
  //     });
  // }
  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }
  hidePopover(p) {
    p.close();
  }

  selectRoseType(idUserSelected, value) {
    this.listTaskResources.forEach((res) => {
      if (res.resourceID == idUserSelected) res.roleType = value;
    });
    this.changeDetectorRef.detectChanges();

    this.popover.close();
  }

  changeMemo2(e, id) {
    var message = e?.data;
    var index = this.listTaskResources.findIndex((obj) => obj.resourceID == id);
    if (index != -1) {
      this.listTaskResources.forEach((obj) => {
        if (obj.resourceID == id) {
          obj.memo = message;
          return;
        }
      });
    }
  }

  valueChangeEstimated(data) {
    if (!data.data) return;
    var num = data.data;
    if (num < 0) {
      this.notiService.notifyCode('TM033');
    }
    // if (this.param?.MaxHoursControl != '0' && num > this.param?.MaxHours) {
    //   this.task[data.field] = this.param?.MaxHours;
    // }else
    this.task[data.field] = num;

    this.changeDetectorRef.detectChanges();
  }

  loadTodoByGroup(idTaskGroup) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskGroupBusiness',
        'GetAsync',
        idTaskGroup
      )
      .subscribe((res) => {
        if (res) {
          this.taskGroup = res;
          if (res.checkList != null) {
            var toDo = res.checkList.split(';');
            this.listTodo = [];
            toDo.forEach((tx) => {
              var taskG = new TaskGoal();
              taskG.status = this.STATUS_TASK_GOAL.NotChecked;
              taskG.text = tx;
              taskG.recID = null;
              this.listTodo.push(taskG);
            });
          }
          this.convertParameterByTaskGroup(this.taskGroup);
        }
      });
  }
  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.param = param;
          this.taskType = param?.TaskType;
          //  this.paramModule = param;
        }
      });
  }
  logicTaskGroup(idTaskGroup) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskGroupBusiness',
        'GetAsync',
        idTaskGroup
      )
      .subscribe((res) => {
        if (res) {
          this.convertParameterByTaskGroup(res);
        }
      });
  }

  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
    this.param.ApproveControl = taskGroup.approveControl;
    this.param.AutoCompleted = taskGroup.autoCompleted;
    this.param.ConfirmControl = taskGroup.confirmControl;
    this.param.EditControl = taskGroup.editControl;
    this.param.LocationControl = taskGroup.locationControl;
    this.param.MaxHours = taskGroup.maxHours.toString();
    this.param.MaxHoursControl = taskGroup.maxHoursControl;
    this.param.PlanControl = taskGroup.planControl;
    this.param.ProjectControl = taskGroup.projectControl;
    this.param.UpdateControl = taskGroup.updateControl;
    this.param.VerifyBy = taskGroup.verifyBy;
    this.param.VerifyByType = taskGroup.verifyByType;
    this.param.VerifyControl = taskGroup.verifyControl;
    this.param.DueDateControl = taskGroup.dueDateControl;
    this.param.ExtendControl = taskGroup.extendControl;
    this.param.ExtendBy = taskGroup.extendBy;
    this.param.CompletedControl = taskGroup.completedControl;
  }
}
