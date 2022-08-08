import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  TemplateRef,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { CodxTMService } from '../../codx-tm.service';
import { StatusTaskGoal } from '../../models/enum/enum';
import { TaskGoal } from '../../models/task.model';
import {
  tmpTaskResource,
  TM_Parameter,
  TM_Tasks,
} from '../../models/TM_Tasks.model';
import * as moment from 'moment';
import { AnyARecord } from 'dns';
import { TM_TaskGroups } from '../../models/TM_TaskGroups.model';
@Component({
  selector: 'app-popup-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],
})
export class PopupAddComponent implements OnInit, AfterViewInit {
  STATUS_TASK_GOAL = StatusTaskGoal;
  user: any;
  readOnly = false;
  listUser: any[] = [];
  listUserDetail: any[] = [];
  listTodo: TaskGoal[] = [];
  listTaskResources: tmpTaskResource[] = [];
  todoAddText: any;
  grvSetup: any;
  param: TM_Parameter;
  taskGroup: TM_TaskGroups;
  paramModule: TM_Parameter;
  functionID: string;
  view = '';
  action = '';
  title = 'Tạo mới công việc';
  contentTodoEdit = '';
  recIDTodoDelete = '';
  indexEditTodo = -1;
  countTodoByGroup = 0;
  isConfirm = true;
  isCheckTime = true;
  isCheckProjectControl = false;
  isCheckAttachmentControl = false;
  isCheckCheckListControl = false;
  isCheckProjectTrue = true;
  isCheckAttachmentTrue = true;
  isCheckCheckListTrue = true;
  openMemo2 = false;
  showPlan = true;
  showAssignTo = false;
  isAdd = false;
  crrEstimated: any;
  isHaveFile = false;
  crrIndex: number;
  popover: any;
  vllShare = 'TM003';
  planholderTaskGoal = 'Add to do list…';
  listRoles: any;
  vllRole = 'TM001';
  countFile = 0;
  empInfo: any = {};
  popoverList: any;
  popoverEmpInfo: any;
  listEmpInfo = [];
  listUserDetailSearch: any[] = [];
  idUserSelected: any;
  viewTask = false;
  taskType ='1' ;

  @ViewChild('contentAddUser') contentAddUser;
  @ViewChild('contentListTask') contentListTask;
  @ViewChild('messageError') messageError;
  @ViewChild('txtTodoEdit') txtTodoEdit: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('tabDescription') tabDescription: TemplateRef<any>;
  @ViewChild('tabJob') tabJob: TemplateRef<any>;
  @ViewChild('tabAssignTo') tabAssignTo: TemplateRef<any>;
  @ViewChild('tabListToDo') tabListToDo: TemplateRef<any>;
  @ViewChild('tabReference') tabReference: TemplateRef<any>;

  task: TM_Tasks = new TM_Tasks();
  dialog: DialogRef;
  taskCopy: any;
  newID: string;
  paramControlReference = true;
  menuDes = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'Description',
    subName: 'Description Info',
    subText: 'Description Info',
  };

  menuJobDes = {
    icon: 'icon-article',
    text: 'Mô tả công việc',
    name: 'JobDescription',
    subName: 'Job Description',
    subText: 'Job Description',
  };
  menuAssign = {
    icon: 'icon-person_outline',
    text: 'Phân công cho',
    name: 'AssignTo',
    subName: 'Assign To',
    subText: 'Assign To',
  };
  menuListTaskGoal = {
    icon: 'icon-check_box',
    text: 'Công việc cần làm',
    name: 'ListTaskGoal',
    subName: 'List Task Goal',
    subText: 'List Task Goal',
  };
  menuRef = {
    icon: 'icon-insert_link',
    text: 'Tham chiếu',
    name: 'Reference',
    subName: 'Reference',
    subText: 'Reference',
  };

  tabInfo: any[] = [];
  tabContent: any[] = [];
  titleAction = 'Thêm';
  disableDueDate = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.getParam();
    this.task = {
      ...this.task,
      ...dt?.data[0],
    };
    if (this.task.taskGroupID != null) {
      this.logicTaskGroup(this.task.taskGroupID);
    }

    this.action = dt?.data[1];
    this.showAssignTo = dt?.data[2];
    this.taskCopy = dt?.data[3];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    if (this.functionID == 'TMT0203') this.showAssignTo = true; ////cái này để show phân công- chưa có biến nào để xác định là Công việc của tôi hay Giao việc -Trao đổi lại
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    if (this.action == 'add') {
      this.titleAction = 'Thêm';
      if (this.functionID == 'TMT0203') {
        this.task.category = '3';
      } else {
        this.task.category = '1';
      }
      this.openTask();
    } else if (this.action == 'copy') {
      this.task.status = '10';
      if (this.functionID == 'TMT0203') {
        this.task.category = '3';
      } else {
        this.task.category = '1';
      }
      this.titleAction = 'Sao chép';
      this.getTaskCoppied(this.taskCopy.taskID);
    } else {
      this.titleAction = this.action == 'edit' ? 'Chỉnh sửa' : 'Xem chi tiết';
      if (this.action == 'view') {
        this.disableDueDate = true;
        this.readOnly = true;
        this.viewTask = true;
      }
      this.openInfo(this.task.taskID, this.action);
    }
  }

  setTitle(e: any) {
    this.title = this.titleAction + ' ' +  e.charAt(0).toLocaleLowerCase() + e.slice(1);;
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.showAssignTo) {
      this.tabInfo = [
        this.menuDes,
        this.menuJobDes,
        this.menuAssign,
        this.menuListTaskGoal,
        this.menuRef,
      ];
      this.tabContent = [
        this.tabDescription,
        this.tabJob,
        this.tabAssignTo,
        this.tabListToDo,
        this.tabReference,
      ];
    } else {
      this.tabInfo = [
        this.menuDes,
        this.menuJobDes,
        this.menuListTaskGoal,
        this.menuRef,
      ];
      this.tabContent = [
        this.tabDescription,
        this.tabJob,
        this.tabListToDo,
        this.tabReference,
      ];
    }
  }

  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TM_Parameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.param = param;
          this.taskType = param?.TaskType ;
          //  this.paramModule = param;
        }
      });
  }

  //#region To Do List
  onAddToDo(evt: any) {
    if (!this.todoAddText || this.todoAddText.trim() == '') {
      this.todoAddText = '';
      return;
    }

    if (this.listTodo == null) this.listTodo = [];
    var todo = new TaskGoal();
    todo.status = this.STATUS_TASK_GOAL.NotChecked;
    todo.text = this.todoAddText;
    this.listTodo.push(Object.assign({}, todo));
    this.todoAddText = '';
    this.changeDetectorRef.detectChanges();
    evt.focus();
    this.isCheckCheckListControl = true;
  }

  onDeleteTodo(index) {
    if (this.listTodo[index]?.recID) {
      this.recIDTodoDelete += this.listTodo[index].recID + ';';
    }
    this.listTodo.splice(index, 1); //remove element from array
    if (this.listTodo.length == 0) {
      if (this.task.taskGroupID)
        this.isCheckCheckListTrue = this.isCheckCheckListControl;
    }
    this.changeDetectorRef.detectChanges();
  }

  editTodo(indexEdit, content) {
    this.indexEditTodo = indexEdit;
    this.contentTodoEdit = content;
    setTimeout(() => {
      // this will make the execution after the above boolean has changed
      this.txtTodoEdit.nativeElement.focus();
    }, 0);
  }

  updateTodoList(content: string) {
    if (content != '' || content.trim() == '') {
      this.indexEditTodo = -1;
      return;
    }
    if (this.indexEditTodo >= 0) {
      this.listTodo[this.indexEditTodo].text = content;
    }
    this.indexEditTodo = -1;
  }
  updateStatusTodoList(index) {
    if (index >= 0) {
      this.listTodo[index].status =
        this.listTodo[index].status == this.STATUS_TASK_GOAL.Checked
          ? this.STATUS_TASK_GOAL.NotChecked
          : this.STATUS_TASK_GOAL.Checked;
    }
  }
  //#endregion

  openTask(): void {
    this.task.estimated = 0;
    this.readOnly = false;
    this.listTodo = [];
    this.task.status = '10';
    this.task.memo = '';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.changeDetectorRef.detectChanges();
  }

  openInfo(id, action) {
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        this.task = res[0] as TM_Tasks;
        this.listUserDetail = res[1] || [];
        this.listTodo = res[2];
        this.listTaskResources = res[3];
        this.listUser = this.task.assignTo?.split(';') || [];
        this.api
          .execSv<any[]>(
            'DM',
            'DM',
            'FileBussiness',
            'GetFilesByObjectIDAsync',
            [this.task.taskID]
          )
          .subscribe((res) => {
            if (res && res.length > 0) this.isHaveFile = true;
            else this.isHaveFile = false;
          });

        if (this.action == 'edit' && this.task.category == '2') {
          this.disableDueDate = true;
          if (this.param?.EditControl == '0') this.readOnly = true;
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }
  getTaskCoppied(id) {
    const t = this;
    this.listUser = [];
    this.listUserDetail = [];
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        this.copyListTodo(res[2]);
      }
    });
  }

  copyListTodo(listTodoCopy) {
    const t = this;
    t.listTodo = [];
    if (listTodoCopy != null) {
      listTodoCopy.forEach((td) => {
        var todo = new TaskGoal();
        todo.status = StatusTaskGoal.NotChecked;
        todo.text = td.text;
        t.listTodo.push(Object.assign({}, todo));
      });
    }
  }

  beforeCopy(data) {
    const t = this;
    t.task.dueDate = moment(new Date(data.dueDate)).toDate();
    if (data.startDate != null)
      t.task.startDate = moment(new Date(data.startDate)).toDate();
    if (data.endDate != null)
      t.task.endDate = moment(new Date(data.startDate)).toDate();
    t.task.parentID = null;
    t.task.assignTo = null;
    t.task.completedOn = null;
    this.listUser = [];
    this.listTaskResources = [];
    this.listUserDetail = [];
    t.changeDetectorRef.detectChanges();
  }

  saveData(id) {
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      this.notiService.notifyCode('TM027');
      return;
    }
    if (
      this.showAssignTo &&
      (this.task.assignTo == '' || this.task.assignTo == null)
    ) {
      this.notiService.notifyCode('TM011');
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
    if (this.param?.PlanControl == "2" && (!this.task.startDate || !this.task.endDate)) {
      this.notiService.notifyCode('TM030');
      return;
    }
    if (this.param?.DueDateControl == '1' && this.task.dueDate <= new Date()) {
      this.notiService.notifyCode('TM031');
      return;
    }
    if (this.task.taskGroupID) {
      if (this.taskGroup?.checkListControl != '0' && this.listTodo.length == 0) {
        this.notiService.notifyCode('TM032');
        return;
      }
    }

    this.checkLogicTime();
    if (!this.isCheckTime) {
      return;
    }
    if (this.task.startDate == null && this.task.endDate == null) {
      this.actionSave(id);
      return;
    }
    if (
      this.task.dueDate < this.task.startDate ||
      this.task.dueDate < this.task.endDate
    ) {
      this.notiService.alertCode('TM002').subscribe((res) => {
        if (res?.event && res?.event?.status == 'Y') {
          this.actionSave(id);
        }
      });
    } else {
      this.actionSave(id);
    }
  }

  actionSave(id) {
    this.task.taskType = this.taskType;
    if (this.isHaveFile) this.attachment.saveFiles();
    if (this.action == 'edit') this.updateTask();
    else this.addTask();
  }

  beforeSave(op: any) {
    var data = [];
    if (this.action == 'edit') {
      op.method = 'UpdateTaskAsync';
      data = [
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
        null,
        this.recIDTodoDelete,
      ];
    } else {
      op.method = 'AddTaskAsync';
      data = [
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
      ];
    }
    op.data = data;
    return true;
  }

  addTask(isCloseFormTask: boolean = true) {
    this.tmSv
      .addTask([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
      ])
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.dialog.dataService.addDatas.clear();
          this.dialog.close(res);
        }
      });
  }

  updateTask() {
    if (this.task.category == '3') {
      this.notiService.alertCode('TM015').subscribe((res) => {
        if (res?.event && res?.event?.status == 'Y') {
          this.dialog.dataService
            .save((option: any) => this.beforeSave(option))
            .subscribe((res) => {
              this.dialog.dataService.addDatas.clear();
              if (res.update) {
                this.dialog.close(res.update);
              }
            });
        } else {
          this.dialog.close();
        }
      });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          if (res.update) {
            this.dialog.dataService.addDatas.clear();
            this.dialog.close(res.update);
          }
        });
    }
  }

  // openInputMemo2() {
  //   this.openMemo2 = !this.openMemo2;
  // }

  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;
        case 'O':
        case 'D':
          listDepartmentID += obj.id + ';';
          break;
      }
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

  valueChange(data) {
    if (data.field) {
      this.task[data.field] = data?.data;
    }
  }
  valueChangeEstimated(data) {
    if (!data.data) return;
    var num = data.data;
    // if (!num) {
    //   //  this.notiService.notifyCode("can cai code o day đang gan tam")
    //   this.notiService.notify('Giá trị nhập vào không phải là 1 số !');
    //   this.task.estimated = this.crrEstimated ? this.crrEstimated : 0;
    //   this.changeDetectorRef.detectChanges();
    //   return;
    // }
    if (num < 0) {
      //  this.notiService.notifyCode("can cai code o day đang gan tam")
      this.notiService.notifyCode('TM033');
      this.task.estimated = this.crrEstimated ? this.crrEstimated : 0;
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (this.param?.MaxHoursControl != '0' && num > this.param?.MaxHours) {
      num = this.param?.MaxHours;
    }
    this.task[data.field] = num;
    //xử lý nhập estimated thay đổi thời gian
    // if (data.data && num) {
    //   this.task[data.field] = data.data;
    //   var estimated = num * 3600000;
    //   if (!this.task.startDate) {
    //     var crrDay = new Date();
    //     this.task.startDate = moment(crrDay).toDate();
    //     var time = crrDay.getTime();
    //     var timeEndDate = time + estimated;
    //     this.task.endDate = moment(new Date(timeEndDate)).toDate();
    //     this.crrEstimated = this.crrEstimated
    //       ? this.crrEstimated
    //       : this.task.estimated;
    //   } else if (!this.crrEstimated) {
    //     var timeEndDate = this.task.startDate.getTime() + estimated;
    //     this.task.endDate = moment(new Date(timeEndDate)).toDate();
    //   }
    // }
    this.changeDetectorRef.detectChanges();
  }

  changeVLL(data) {
    this.task.priority = data.data;
  }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.task[data.field] = data.data?.fromDate;
    if (data.field == 'startDate') {
      if (!this.task.endDate && this.task.startDate) {
        if (this.task.estimated) {
          var timeEndDay =
            this.task.startDate.getTime() + this.task.estimated * 3600000;
          this.task.endDate = moment(new Date(timeEndDay)).toDate();
        } else
          this.task.endDate = moment(new Date(this.task.startDate))
            .add(1, 'hours')
            .toDate();
      }
    }
    if (data.field == 'startDate' || data.field == 'endDate') {
      if (this.task.startDate && this.task.endDate) {
        var time = (
          (this.task.endDate.getTime() - this.task.startDate.getTime()) /
          3600000
        ).toFixed(2);
        this.task.estimated = Number.parseFloat(time);
        this.crrEstimated = this.task.estimated;
      }
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

  checkLogicTime() {
    if (!this.task.startDate || !this.task.endDate) {
      this.isCheckTime = true;
      return;
    }
    // if (!this.task.startDate && this.task.endDate) {
    //   this.notiService.notify('Phải nhập ngày bắt đầu công việc !');
    //   this.isCheckTime = false;
    //   return;
    // }
    if (this.task.startDate > this.task.endDate) {
      this.isCheckTime = false;
      this.notiService.notifyCode('TM034');
    } else {
      this.isCheckTime = true;
    }
  }

  // checkLogicWithTaskGroup() {
  //   if (this.isCheckCheckListControl) {
  //     this.isCheckCheckListTrue =
  //       this.isCheckCheckListControl && this.listTodo.length > 0;
  //   } else this.isCheckCheckListTrue = true;

  //   if (this.param?.ProjectControl != '0') {
  //     if (this.isCheckProjectControl) {
  //       this.isCheckProjectTrue =
  //         this.task.projectID && this.isCheckProjectControl;
  //     } else this.isCheckProjectTrue = true;
  //   }
  //   if (this.isCheckAttachmentControl) {
  //     this.isCheckAttachmentTrue =
  //       this.isCheckAttachmentControl && this.isHaveFile;
  //   } else this.isCheckAttachmentTrue = true;
  // }

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

  loadTodoByGroup(idTaskGroup) {
    // if( this.countTodoByGroup>0)
    // this.listTodo.slice(this.listTodo.length- this.countTodoByGroup, this.countTodoByGroup)
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
            // this.countTodoByGroup = toDo.length ;
            toDo.forEach((tx) => {
              var taskG = new TaskGoal();
              taskG.status = this.STATUS_TASK_GOAL.NotChecked;
              taskG.text = tx;
              this.listTodo.push(taskG);
            });
          }
          this.convertParameterByTaskGroup(this.taskGroup);
        }
      });
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

  valueChangeTags(e) {
    this.task.tags = e.data;
  }

  onDeleteUser(item) {
    if (item?.status && item.status != '00' && item.status != '10') {
      this.notiService.notifyCode('TM012');
      return;
    }
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

  changeMemo(event: any) {
    if (event.field) {
      this.task[event.field] = event?.data ? event?.data : '';
    }
    this.changeDetectorRef.detectChanges;
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
    // else {
    //   var tmpRes = new tmpTaskResource();
    //   tmpRes.memo = message;
    //   tmpRes.resourceID = id;
    //   tmpRes.roleType = 'R'
    //   this.listTaskResources.push(tmpRes);
    // }
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
  showPoppoverDelete(p, i) {
    if (i == null) return;
    if (this.popover) this.popover.close();
    this.crrIndex = i;
    p.open();
    this.popover = p;
  }

  buttonClick(e: any) {
    console.log(e);
  }

  // popoverEmp(p: any, emp) {
  //   if (this.popoverList) {
  //     if (this.popoverList.isOpen()) this.popoverList.close();
  //   }
  //   if (emp) {
  //     this.empInfo = this.listUserDetail.find((e) => e.userID === emp);
  //     p.open();
  //   } else {
  //     p.close();
  //     this.empInfo = {};
  //   }
  // }

  // popoverEmpList(p: any, listUserDetail) {
  //   this.listUserDetailSearch = listUserDetail;
  //   this.popoverList = p;

  //   p.open();
  // }

  searchName(e) {
    var listUserDetailSearch = [];
    var searchField = e;
    if (searchField.trim() == '') {
      this.listUserDetailSearch = this.listUserDetail;
      return;
    }
    this.listUserDetail.forEach((res) => {
      var name = res.userName;
      if (name.toLowerCase().includes(searchField.toLowerCase())) {
        listUserDetailSearch.push(res);
      }
    });
    this.listUserDetailSearch = listUserDetailSearch;
  }

  //#region popver select RolType
  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    this.listTaskResources.forEach((res) => {
      if (res.resourceID == idUserSelected) res.roleType = value;
    });
    this.changeDetectorRef.detectChanges();

    this.popover.close();
  }
  //#endregion

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
    this.param.ExtendControl = taskGroup.extendControl ;
    this.param.ExtendBy = taskGroup.extendBy ;
    this.param.CompletedControl = taskGroup.completedControl;
  }
}
