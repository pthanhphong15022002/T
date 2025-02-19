import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  UrlUtil,
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

import { TaskGoal } from 'projects/codx-tm/src/lib/models/task.model';
import { StatusTaskGoal } from 'projects/codx-tm/src/lib/models/enum/enum';
import moment from 'moment';
import { TM_TaskGroups } from 'projects/codx-tm/src/lib/models/TM_TaskGroups.model';
import { CodxTasksService } from '../codx-tasks/codx-tasks.service';
import { tmpReferences } from '../../models/assign-task.model';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
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
  dataReferences = [];
  vllRefType = 'TM018';
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  taskGroup: TM_TaskGroups;
  task: TM_Tasks = new TM_Tasks();
  functionID = 'TMT0203'; // giao việc nên cố định funcID này
  entytiNameDefault = 'TM_AssignTasks';
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
  refType = 'TM_Tasks';
  taskName = '';
  dueDate: Date;
  taskType = '1';
  vllPriority = 'TM005';
  changTimeCount = 2;
  loadingAll = false;
  gridViewSetup: any;
  formModel: any;
  planholderTaskChild = '';
  referedFunction: any;
  referedData: any;
  isClickSave = false;
  crrRole: any;
  accountable: boolean = false;
  paramView: any; //param view
  showLabelAttachment = false;

  constructor(
    private authStore: AuthStore,
    private tmSv: CodxTasksService,
    private callFC: CallFuncService,
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
      ...dt?.data?.task,
    };
    this.refID = this.task?.refID;
    this.refType = this.task?.refType || this.refType;
    this.dueDate = this.task?.dueDate;
    this.dueDate = this.task?.dueDate;
    this.taskName = this.task?.taskName;

    this.vllShare = dt?.data?.vllShare || this.vllShare;
    this.vllRole = dt?.data?.vllRole || this.vllRole;
    this.title = dt?.data?.title || this.title;
    this.taskParent = dt?.data?.taskParent;
    this.referedFunction = dt?.data?.referedFunction;
    this.referedData = dt?.data?.referedData;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.formModel = this.dialog.formModel;

    this.cache.functionList(this.functionID).subscribe((f) => {
      this.entytiNameDefault = f.entityName ?? this.entytiNameDefault;
    });

    this.cache.functionList(this.dialog.formModel.funcID).subscribe((f) => {
      if (f && f.module) {
        this.cache
          .viewSettingValues(f.module + 'Parameters')
          .subscribe((res) => {
            if (res?.length > 0) {
              let dataParam = res.filter(
                (x) => x.category == '1' && !x.transType
              )[0];
              if (dataParam) this.paramView = JSON.parse(dataParam.dataValue);
            }
          });
      }
    });
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });

    this.cache
      .gridViewSetup('AssignTasks', 'grvAssignTasks')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
          this.planholderTaskChild = res['Memo']?.description;
        }
      });
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.setDefault();
  }

  setDefault() {
    this.task.taskID = '';
    //gán sessionID ra biến riêng để gán lại sau khi lấy model chuẩn
    let oldSessionID = this.task.sessionID != null ? this.task.sessionID : null;

    this.api
      .execSv<any>('TM', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        this.functionID,
        'TM_Tasks',
        'taskID',
      ])
      .subscribe((response: any) => {
        if (response) {
          var data = response.data;
          data['_uuid'] = data['taskID'] ?? Util.uid();
          data['idField'] = 'taskID';
          this.task = data;
          //gán lại sessionID nếu có
          if (oldSessionID != null) {
            this.task.sessionID = oldSessionID;
          }
          this.loadingAll = true;
          this.openInfo();
        }
      });
  }

  defaultField() {
    if (
      this.referedData &&
      this.referedFunction &&
      this.referedFunction.defaultField
    ) {
      let dataField = Util.camelize(this.referedFunction.defaultField);
      let dataValue = UrlUtil.modifiedByObj(
        this.referedFunction.defaultValue,
        this.referedData
      );
      this.task[dataField] = dataValue;
      this.changeDetectorRef.detectChanges();
    }
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
    this.task.estimated = 0;
    this.task.category = '3';
    this.task.status = '10';
    this.task.refID = this.refID;
    this.task.refType = this.refType;
    this.task.taskName = this.taskName;
    this.defaultField();
    if (this.taskParent) {
      this.task.parentID =
        this.taskParent.category == '1' ? null : this.taskParent.recID;
      this.task.dueDate = this.taskParent.dueDate;
      this.task.endDate = this.taskParent.endDate;
      this.task.startDate = this.taskParent.startDate;
      this.task.estimated = this.taskParent.estimated;
      this.task.taskName = this.taskParent.taskName;
      this.task.memo = this.taskParent.memo;
      this.task.memo2 = this.taskParent.memo2;
      this.task.priority = this.taskParent.priority;
      this.task.taskGroupID = this.taskParent.taskGroupID;
      this.task.projectID = this.taskParent.projectID;
      this.task.location = this.taskParent.location;
      this.task.tags = this.taskParent.tags;
      this.task.refID = this.refID ? this.refID : this.taskParent.recID;
      this.task.refNo = this.taskParent.taskID;
      this.task.refType = this.refType
        ? this.refType
        : this.taskParent.refType
        ? this.taskParent.refType
        : 'TM_Tasks';
      this.copyListTodo(this.taskParent.taskID);
      if (this.task.startDate && this.task.endDate) this.changTimeCount = 0;
      else if (this.task.startDate || this.task.endDate)
        this.changTimeCount = 1;
      if (this.taskParent?.taskGroupID)
        this.logicTaskGroup(this.taskParent?.taskGroupID);
    }

    this.loadDataReferences();
    this.changeDetectorRef.detectChanges();
  }

  copyListTodo(id) {
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'CopyListTodoByTaskIdAsync', id)
      .subscribe((res) => {
        if (res) {
          this.listTodo = res;
        }
      });
  }

  changText(e) {
    this.task.taskName = e.data;
  }

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
    if (
      (data.field == 'startDate' || data.field == 'endDate') &&
      this.loadingAll
    ) {
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
    if (data.data && data.data.trim() != '') {
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

  changeVLL(e) {
    this.task.priority = e?.data;
  }

  async saveAssign(id, isContinue) {
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      this.notiService.notifyCode('TM027');
      return;
    }
    if (!this.task.taskGroupID && this.gridViewSetup['TaskGroupID'].isRequire) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        this.gridViewSetup['TaskGroupID'].headerText
      );
      return;
    }
    if (
      this.task.assignTo == null ||
      this.task.assignTo == '' ||
      !this.isExitTypeRAOfResource()
    ) {
      this.notiService.notifyCode('TM011');
      return;
    }

    if (this.task.estimated < 0) {
      this.notiService.notifyCode('TM033');
      return;
    }
    if (
      this.param?.MaxHoursControl != null &&
      this.param?.MaxHoursControl != '0' &&
      this.param?.MaxHours != null &&
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
    var taskIDParent = this.taskParent?.taskID ? this.taskParent?.taskID : null;
    if (this.isClickSave) return;
    this.isClickSave = true;
    //bua cho DP
    if (
      this.listTaskResources?.length == 1 &&
      this.formModel.entityName == 'DP_Instances_Steps_Tasks'
    ) {
      this.task.recID = this.task.refID;
    }

    if (this.isHaveFile && this.attachment) {
      //bua cho DP
      if (this.task.recID == this.task.refID) {
        this.attachment.objectId = this.task.recID;
        if (this.attachment.fileUploadList?.length > 0) {
          this.attachment.fileUploadList.forEach((f) => {
            f.objectID = this.task.recID;
          });
        }
      }

      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.task.attachments = Array.isArray(res) ? res.length : 1;
          this.actionSaveAssign(taskIDParent, isContinue);
        }
      });
    } else this.actionSaveAssign(taskIDParent, isContinue);
  }

  actionSaveAssign(taskIDParent, isContinue) {
    this.tmSv
      .saveAssign([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
        taskIDParent,
        this.formModel.entityName,
        this.formModel.funcID,
      ])
      .subscribe((res) => {
        if (res && res[0]) {
          this.notiService.notifyCode('TM006');
          res[2] = this.listTaskResources; // trả về cho OD xét quyền công văn
          this.dialog.close(res);
        } else {
          this.notiService.notifyCode('TM038');
          this.dialog.close();
        }
      });
  }

  onDeleteUser(item) {
    var userID = item.resourceID;
    // var listUser = [];
    // var listTaskResources = [];
    // var listUserDetail = [];
    // for (var i = 0; i < this.listUserDetail.length; i++) {
    //   if (this.listUser[i] != userID) {
    //     listUser.push(this.listUser[i]);
    //   }
    //   if (this.listUserDetail[i].userID != userID) {
    //     listUserDetail.push(this.listUserDetail[i]);
    //   }
    //   if (this.listTaskResources[i]?.resourceID != userID) {
    //     listTaskResources.push(this.listTaskResources[i]);
    //   }
    // }
    // this.listUser = listUser;
    // this.listUserDetail = listUserDetail;
    // this.listTaskResources = listTaskResources;

    var idxUser = this.listUser.findIndex((x) => x == userID);
    if (idxUser != -1) this.listUser.splice(idxUser, 1);

    var idxUserDt = this.listUserDetail.findIndex((x) => x.userID == userID);
    if (idxUserDt != -1) this.listUserDetail.splice(idxUserDt, 1);

    var idxUserRs = this.listTaskResources.findIndex(
      (x) => x.resourceID == userID
    );
    if (idxUserRs != -1) this.listTaskResources.splice(idxUserRs, 1);

    var assignTo = '';
    if (this.listUser.length > 0) {
      this.listUser.forEach((idUser) => {
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
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';
    var listPositionID = '';
    var listEmployeeID = '';
    var listGroupMembersID = '';
    if (!e && e?.length == 0) return;
    e.forEach((obj) => {
      if (obj.objectType && obj.id) {
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
          case 'RP':
          case 'P':
            listPositionID += obj.id + ';';
            break;
          case 'RE':
            listEmployeeID += obj.id + ';';
            break;
          case 'UG':
            listGroupMembersID += obj.id + ';';
            break;
        }
      }
    });
    if (listUserID != '') {
      listUserID = listUserID.substring(0, listUserID.length - 1);
      this.valueSelectUser(listUserID);
    }

    if (listDepartmentID != '') {
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
      this.tmSv.getUserByListDepartmentID(listDepartmentID).subscribe((res) => {
        if (res && res.trim() != '') {
          if (
            res.trim() == '' ||
            res.split(';')?.length != listDepartmentID.split(';')?.length
          )
            this.notiService.notifyCode('TM065');
          this.valueSelectUser(res);
        } else this.notiService.notifyCode('TM065');
      });
    }
    if (listEmployeeID != '') {
      listEmployeeID = listEmployeeID.substring(0, listEmployeeID.length - 1);
      this.tmSv
        .getListUserIDByListEmployeeID(listEmployeeID)
        .subscribe((res) => {
          if (res && res?.length > 0) {
            this.valueSelectUser(res);
          }
        });
    }
    if (listPositionID != '') {
      listPositionID = listPositionID.substring(0, listPositionID.length - 1);
      this.tmSv
        .getListUserIDByListPositionsID(listPositionID)
        .subscribe((res) => {
          if (res && res?.length > 0) {
            if (!res[1]) this.notiService.notifyCode('TM066');
            assignTo = res[0];
            this.valueSelectUser(assignTo);
          } else this.notiService.notifyCode('TM066');
        });
    }
    if (listGroupMembersID != '') {
      listGroupMembersID = listGroupMembersID.substring(
        0,
        listGroupMembersID.length - 1
      );
      this.tmSv
        .getListUserIDByListGroupID(listGroupMembersID)
        .subscribe((res) => {
          if (res && res?.length > 0) {
            this.valueSelectUser(res);
          }
        });
    }
  }

  valueSelectUser(assignTo) {
    if (assignTo != '') {
      var arrAssign = assignTo.split(';');
      if (arrAssign?.length > 1 && this.crrRole == 'A' && this.accountable) {
        this.notiService.notifyCode('TM078');
        // this.notiService.notify(
        //   'Người chiu trách nhiệm chỉ được chọn 1 người - Cần messcode từ Thuong',
        //   '2'
        // );
        return;
      }
      if (this.task.assignTo && this.task.assignTo != '') {
        var arrNew = [];
        arrAssign.forEach((e) => {
          if (!this.task.assignTo.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          assignTo = arrNew.join(';');
          this.getListUser(assignTo);
        }
        if (arrNew?.length != arrAssign?.length)
          this.notiService.notifyCode('TM077');
        // this.notiService.notify(
        //   'Người được chọn đã có trong danh sách trước đó - Cần messcode từ Thuong',
        //   '3'
        // );
      } else {
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
    if (!this.listUser) this.listUser = [];
    var crrRole = this.crrRole;
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness_Old',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(listUser.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.listUserDetail = this.listUserDetail.concat(res);
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var taskResource = new tmpTaskResource();
            taskResource.resourceID = emp?.userID;
            taskResource.resourceName = emp?.userName;
            taskResource.positionName = emp?.positionName;
            taskResource.departmentName = emp?.departmentName;
            taskResource.roleType = crrRole ?? 'R';
            this.listTaskResources.push(taskResource);
          }

          if (arrUser.length != res.length) {
            arrUser = res.map((x) => x.userID);
          }
          this.listUser = this.listUser.concat(arrUser);
          this.task.assignTo = this.listUser.join(';');
        }
      });
  }

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
    if (value == 'A' && this.accountable) {
      var checkRoleA = this.listTaskResources.some(
        (x) => x.roleType == 'A' && x.resourceID != idUserSelected
      );
      if (checkRoleA) {
        this.notiService.notifyCode('TM078');
        return;
      }
    }
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
      this.listTaskResources[index].memo = message;
    }
    this.changeDetectorRef.detectChanges();
  }

  valueChangeEstimated(data) {
    if (data.data == undefined) return;
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
          if (res.checkList != null && res.checkList.trim() != '') {
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
          if (
            this.taskGroup?.planControl == '1' &&
            this.task.startDate == null
          ) {
            this.task.startDate = new Date();
          }
          // else {
          //   this.task.startDate = null;
          //   this.task.endDate = null;
          //   this.task.estimated = 0;
          // }
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
          if (param.Accountable == '1') this.accountable = true;
          else this.accountable = false;
          //var param = JSON.parse(res.dataValue);
          this.param = param;
          this.taskType = param?.TaskType;
          if (this.param?.PlanControl == '1' && this.task.startDate == null) {
            this.task.startDate = new Date();
          }
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
    this.param.Approvers = taskGroup.approvers;
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

  //#regionreferences -- viet trong back end nhung khong co tmp chung nen viet fe
  // loadDataReferences() {
  //   if (this.task.category == '1') {
  //     this.dataReferences = [];
  //     return;
  //   }
  //   this.dataReferences = [];
  //   if (this.task.category == '2') {
  //     this.api
  //       .execSv<any>(
  //         'TM',
  //         'TM',
  //         'TaskBusiness',
  //         'GetTaskParentByTaskIDAsync',
  //         this.task.taskID
  //       )
  //       .subscribe((res) => {
  //         if (res) {
  //           var ref = new tmpReferences();
  //           ref.recIDReferences = res.recID;
  //           ref.refType = 'TM_Tasks';
  //           ref.createdOn = res.createdOn;
  //           ref.memo = res.taskName;
  //           ref.createdBy = res.createdBy;
  //           var taskParent = res;
  //           this.api
  //             .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
  //               res.createdBy,
  //             ])
  //             .subscribe((user) => {
  //               if (user) {
  //                 ref.createByName = user.userName;
  //                 this.dataReferences.push(ref);
  //                 this.getReferencesByCategory3(taskParent);
  //               }
  //             });
  //         }
  //       });
  //   } else if (this.task.category == '3') {
  //     this.getReferencesByCategory3(this.task);
  //   }
  // }
  //referen new
  loadDataReferences() {
    this.dataReferences = [];
    if (this.task.refID)
      //this.getReferencesByCategory3(this.task); //code cu
      this.tmSv.getReference(
        this.task.refType,
        this.task.refID,
        this.getRef.bind(this)
      );
  }

  getRef(dataReferences) {
    if (dataReferences && dataReferences?.length > 0)
      this.dataReferences = dataReferences;
  }
  //code cu roi cmt xoa sau
  // getReferencesByCategory3(task) {
  //   var listUser = [];
  //   switch (task.refType) {
  //     case 'OD_Dispatches':
  //       this.api
  //         .exec<any>('OD', 'DispatchesBusiness', 'GetListByIDAsync', task.refID)
  //         .subscribe((item) => {
  //           if (item) {
  //             item.forEach((x) => {
  //               var ref = new tmpReferences();
  //               ref.recIDReferences = x.recID;
  //               ref.refType = 'OD_Dispatches';
  //               ref.createdOn = x.createdOn;
  //               ref.memo = x.title;
  //               ref.createdBy = x.createdBy;
  //               this.dataReferences.unshift(ref);
  //               if (listUser.findIndex((p) => p == ref.createdBy) == -1)
  //                 listUser.push(ref.createdBy);
  //               this.getUserByListCreateBy(listUser);
  //             });
  //           }
  //         });
  //       break;
  //     case 'ES_SignFiles':
  //       this.api
  //         .execSv<any>(
  //           'ES',
  //           'ERM.Business.ES',
  //           'SignFilesBusiness',
  //           'GetLstSignFileByIDAsync',
  //           JSON.stringify(task.refID.split(';'))
  //         )
  //         .subscribe((result) => {
  //           if (result) {
  //             result.forEach((x) => {
  //               var ref = new tmpReferences();
  //               ref.recIDReferences = x.recID;
  //               ref.refType = 'ES_SignFiles';
  //               ref.createdOn = x.createdOn;
  //               ref.memo = x.title;
  //               ref.createdBy = x.createdBy;
  //               this.dataReferences.unshift(ref);
  //               if (listUser.findIndex((p) => p == ref.createdBy) == -1)
  //                 listUser.push(ref.createdBy);
  //               this.getUserByListCreateBy(listUser);
  //             });
  //           }
  //         });
  //       break;
  //     case 'TM_Tasks':
  //       this.api
  //         .execSv<any>(
  //           'TM',
  //           'TM',
  //           'TaskBusiness',
  //           'GetTaskByRefIDAsync',
  //           task.refID
  //         )
  //         .subscribe((result) => {
  //           if (result) {
  //             var ref = new tmpReferences();
  //             ref.recIDReferences = result.recID;
  //             ref.refType = 'TM_Tasks';
  //             ref.createdOn = result.createdOn;
  //             ref.memo = result.taskName;
  //             ref.createdBy = result.createdBy;

  //             this.api
  //               .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
  //                 ref.createdBy,
  //               ])
  //               .subscribe((user) => {
  //                 if (user) {
  //                   ref.createByName = user.userName;
  //                   this.dataReferences.unshift(ref);
  //                 }
  //               });
  //           }
  //         });
  //       break;
  //     case 'DP_Instances_Steps_Tasks':
  //       this.api
  //         .execSv<any>(
  //           'DP',
  //           'DP',
  //           'InstancesBusiness',
  //           'GetTempReferenceByRefIDAsync',
  //           task.refID
  //         )
  //         .subscribe((result) => {
  //           if (result && result?.length > 0) {
  //             this.dataReferences = result;
  //           }
  //         });
  //       break;
  //     case 'OM_OKRs':
  //       this.api
  //         .exec<any>('OM', 'OKRBusiness', 'GetOKRByIDAsync', task.refID)
  //         .subscribe((okr) => {
  //           if (okr) {
  //             var ref = new tmpReferences();
  //             ref.recIDReferences = okr.recID;
  //             ref.refType = 'OM_OKRs';
  //             ref.createdOn = okr?.createdOn;
  //             ref.memo = okr?.okrName;
  //             ref.createdBy = okr?.createdBy;
  //             this.dataReferences.unshift(ref);
  //             if (listUser.findIndex((p) => p == okr.createdBy) == -1)
  //               listUser.push(ref.createdBy);
  //             this.getUserByListCreateBy(listUser);
  //           }
  //         });
  //       break;
  //   }
  // }

  getUserByListCreateBy(listUser) {
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'UsersBusiness',
        'LoadUserListByIDAsync',
        JSON.stringify(listUser)
      )
      .subscribe((users) => {
        if (users) {
          this.dataReferences.forEach((ref) => {
            var index = users.findIndex((user) => user.userID == ref.createdBy);
            if (index != -1) {
              ref.createByName = users[index].userName;
            }
          });
        }
      });
  }
  //open control share
  openControlShare(controlShare: any, roleType) {
    this.crrRole = roleType;
    if (controlShare) {
      let option = new DialogModel();
      option.zIndex = 1010;
      this.callFC.openForm(controlShare, '', 450, 600, '', null, '', option);
    }
  }

  //check check list rescource phải có ít nhat 1 người thực hiên hoặc chịu trách nhiệm
  isExitTypeRAOfResource() {
    if (this.listTaskResources?.length > 0) {
      return this.listTaskResources.some(
        (x) => x.roleType == 'R' || x.roleType == 'A'
      );
    }
    return false;
  }
}
