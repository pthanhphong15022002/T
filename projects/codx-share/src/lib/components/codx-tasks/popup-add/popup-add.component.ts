import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  RequestOption,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import * as moment from 'moment';
import { StatusTaskGoal } from '../model/enum';
import {
  TaskGoal,
  tmpReferences,
  tmpTaskResource,
  TM_Parameter,
  TM_TaskGroups,
  TM_Tasks,
} from '../model/task.model';
import { CodxTasksService } from '../codx-tasks.service';
@Component({
  selector: 'app-popup-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  param: TM_Parameter = new TM_Parameter();
  taskGroup: TM_TaskGroups;
  paramModule: TM_Parameter;
  functionID: string;
  view = '';
  action = '';
  title = '';
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
  showLabelAttachment = false;
  crrIndex: number;
  popover: any;
  vllShare = 'TM003';
  planholderTaskGoal = 'Add to do list…';
  listRoles: any;
  vllRole = 'TM001';
  vllRefType = 'TM018';
  countFile = 0;
  empInfo: any = {};
  popoverList: any;
  popoverEmpInfo: any;
  listEmpInfo = [];
  listUserDetailSearch: any[] = [];
  idUserSelected: any;
  viewTask = false;
  taskType = '1';
  formModel: any;
  gridViewSetup: any;
  changTimeCount = 2;
  dataReferences = [];

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
    text: 'Nội dung công việc',
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
  titleAction = '';
  disableDueDate = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTasksService,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.task = {
      ...this.task,
      ...dt?.data[0],
    };
    if (this.task.taskGroupID != null) {
      this.logicTaskGroup(this.task.taskGroupID);
    } else this.getParam();
  
    this.action = dt?.data[1];
    this.showAssignTo = dt?.data[2];
    this.titleAction = dt?.data[3];
    this.functionID = dt?.data[4];
    this.taskCopy = dt?.data[5];
    this.dialog = dialog;
    this.user = this.authStore.get();
    
    // if(this.functionID!='TMT0203' && this.functionID!='TMT0201'&& this.functionID!='TMT0202'){
    //   if(this.showAssignTo ) this.functionID = 'TMT0203'  ;else this.functionID = 'TMT0201'  //truong hop xu ly assign\
    // }
    
    this.cache.functionList(this.functionID).subscribe(f=>{
        if(f){
          this.cache
      .gridViewSetup(
           f.formName,
           f.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
        }
    })
   // this.functionID = this.dialog.formModel.funcID;
    // this.cache
    //   .gridViewSetup(
    //     this.dialog.formModel.formName,
    //     this.dialog.formModel.gridViewName
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.gridViewSetup = res;
    //     }
    //   });
      this.cache.valueList(this.vllRole).subscribe((res) => {
        if (res && res?.datas.length > 0) {
          this.listRoles = res.datas;
        }
      });
  }

  ngOnInit(): void {
    if (this.action == 'add') {
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
      this.getTaskCoppied(this.taskCopy.taskID);
    } else {
      this.titleAction =
        this.action == 'edit' ? this.titleAction : 'Xem chi tiết';
      if (this.action == 'view') {
        this.disableDueDate = true;
        this.readOnly = true;
        this.viewTask = true;
      }
      this.openInfo(this.task.taskID, this.action);
    }
    if (this.task.startDate && this.task.endDate) this.changTimeCount = 0;
    else if (this.task.startDate || this.task.endDate) this.changTimeCount = 1;
    if (this.action != 'add') {
      this.loadDataReferences();
    }
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
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

    this.dialog.beforeClose.asObservable().subscribe((res) => {
      console.log('dialog', res);
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
            [this.task.recID]
          )
          .subscribe((res) => {
            if (res && res.length > 0) this.showLabelAttachment = true;
            else this.showLabelAttachment = false;
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
    this.listTaskResources = [];
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
      if (
        this.taskGroup?.checkListControl != '0' &&
        this.listTodo.length == 0
      ) {
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

  async actionSave(id) {
    if (this.taskType) this.task.taskType = this.taskType;
    else this.task.taskType = '1';
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.task.attachments = Array.isArray(res) ? res.length : 1;
          if (this.action == 'edit') this.updateTask();
          else this.addTask();
        }
      });
    else {
      if (this.action == 'edit') this.updateTask();
      else this.addTask();
    }
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
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddTaskAsync';
        opt.data = [
          this.task,
          this.functionID,
          this.listTaskResources,
          this.listTodo,
        ];
        return true;
      })
      .subscribe((res) => {
        this.dialog.close(res);
        this.attachment?.clearData();
        if (res && res.save) {
          var task = res.save;
          if (task?.confirmControl == "1") this.tmSv.sendAlertMail(task?.recID, "TM_0008", this.functionID).subscribe();
          if (task?.category == '1' && task.verifyControl == '1') this.tmSv.sendAlertMail(task?.recID, "TM_0018", this.functionID).subscribe();
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
              if (res) {
                this.dialog.dataService.addDatas.clear();
                if (res.update) {
                  this.dialog.close(res.update);
                  this.attachment?.clearData();
                  this.tmSv.sendAlertMail(this.task.recID, 'TM_0002', this.functionID).subscribe();   //mai test laji vi sao khong vao

                }
              }
              this.dialog.close();
              this.attachment?.clearData();
            });
        } else {
          this.dialog.close();
          this.attachment?.clearData();
        }
      });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          if (res) {
            if (res.update) {
              this.dialog.dataService.addDatas.clear();
              this.dialog.close(res.update);
              this.attachment?.clearData();
            }
          } else {
            this.dialog.close();
            this.attachment?.clearData();
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
        if (res) {
          assignTo += res;
          if (listUserID != '') assignTo += ';' + listUserID;
          this.valueSelectUser(assignTo);
        }
      });
    }
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
    var num = data.data;
    if (num < 0) {
      this.notiService.notifyCode('TM033');
      return;
    }
    this.task[data.field] = num;
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
      this.changTimeCount += 1;
      if (this.task.startDate && this.task.endDate && this.changTimeCount > 2) {
        var time = (
          (this.task.endDate.getTime() - this.task.startDate.getTime()) /
          3600000
        ).toFixed(2);
        this.task.estimated = Number.parseFloat(time);
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
    if (this.task.startDate > this.task.endDate) {
      this.isCheckTime = false;
      this.notiService.notifyCode('TM034');
    } else {
      this.isCheckTime = true;
    }
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
            // this.countTodoByGroup = toDo.length ;
            this.listTodo = [];
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
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(listUser.split(';'))
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
      this.notiService.notifyCode('TM012', 0, [item?.resourceName]);
      return;
    }
    var userID = item.resourceID;
    var listUser = [];
    var listTaskResources = [];
    var listUserDetail = [];
    var totalUser = this.listUser.length;
    for (var i = 0; i < totalUser; i++) {
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
    this.changeDetectorRef.detectChanges();
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
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
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

  //#regionreferences -- viet trong back end nhung khong co tmp chung nen viet fe
  loadDataReferences() {
    if (this.task.category == '1') {
      this.dataReferences = [];
      return;
    }
    this.dataReferences = [];
    if (this.task.category == '2') {
      this.api
        .execSv<any>(
          'TM',
          'TM',
          'TaskBusiness',
          'GetTaskParentByTaskIDAsync',
          this.task.taskID
        )
        .subscribe((res) => {
          if (res) {
            var ref = new tmpReferences();
            ref.recIDReferences = res.recID;
            ref.refType = 'TM_Tasks';
            ref.createdOn = res.createdOn;
            ref.memo = res.taskName;
            ref.createdBy = res.createdBy;
            var taskParent = res;
            this.api
              .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
                res.createdBy,
              ])
              .subscribe((user) => {
                if (user) {
                  ref.createByName = user.userName;
                  this.dataReferences.push(ref);
                  this.getReferencesByCategory3(taskParent);
                }
              });
          }
        });
    } else if (this.task.category == '3') {
      this.getReferencesByCategory3(this.task);
    }
  }

  getReferencesByCategory3(task) {
    var listUser = [];
    switch (task.refType) {
      case 'OD_Dispatches':
        this.api
          .exec<any>(
            'OD',
            'DispatchesBusiness',
            'GetListByIDAsync',
            task.refID
          )
          .subscribe((item) => {
            if (item) {
              item.forEach((x) => {
                var ref = new tmpReferences();
                ref.recIDReferences = x.recID;
                ref.refType = 'OD_Dispatches';
                ref.createdOn = x.createdOn;
                ref.memo = x.title;
                ref.createdBy = x.createdBy;
                this.dataReferences.unshift(ref);
                if (listUser.findIndex((p) => p == ref.createdBy) == -1)
                  listUser.push(ref.createdBy);
                this.getUserByListCreateBy(listUser);
              });
            }
          });
        break;
      case 'ES_SignFiles':
        this.api
          .execSv<any>(
            'ES',
            'ERM.Business.ES',
            'SignFilesBusiness',
            'GetLstSignFileByIDAsync',
            JSON.stringify(task.refID.split(';'))
          )
          .subscribe((result) => {
            if (result) {
              result.forEach((x) => {
                var ref = new tmpReferences();
                ref.recIDReferences = x.recID;
                ref.refType = 'ES_SignFiles';
                ref.createdOn = x.createdOn;
                ref.memo = x.title;
                ref.createdBy = x.createdBy;
                this.dataReferences.unshift(ref);
                if (listUser.findIndex((p) => p == ref.createdBy) == -1)
                  listUser.push(ref.createdBy);
                this.getUserByListCreateBy(listUser);
              });
            }
          });
        break;
      case 'TM_Tasks':
        this.api
          .execSv<any>(
            'TM',
            'TM',
            'TaskBusiness',
            'GetTaskByRefIDAsync',
            task.refID
          )
          .subscribe((result) => {
            if (result) {
              var ref = new tmpReferences();
              ref.recIDReferences = result.recID;
              ref.refType = 'TM_Tasks';
              ref.createdOn = result.createdOn;
              ref.memo = result.taskName;
              ref.createdBy = result.createdBy;

              this.api
                .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
                  ref.createdBy,
                ])
                .subscribe((user) => {
                  if (user) {
                    ref.createByName = user.userName;
                    this.dataReferences.unshift(ref);
                  }
                });
            }
          });
        break;
    }
  }

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
    this.param.ExtendControl = taskGroup.extendControl;
    this.param.ExtendBy = taskGroup.extendBy;
    this.param.CompletedControl = taskGroup.completedControl;
  }
}
