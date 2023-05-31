import { DomSanitizer } from '@angular/platform-browser';
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
  CallFuncService,
  DialogData,
  DialogModel,
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
  tmpTaskResource,
  TM_Parameter,
  TM_TaskGroups,
  TM_Tasks,
} from '../model/task.model';
import { CodxTasksService } from '../codx-tasks.service';
import { tmpReferences } from '../../../models/assign-task.model';
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
  recIDTodoDelete = [];
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
  planholderTaskChild = 'Ghi chú phân công...';
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
  disabledProject = false;
  isClickSave = false;
  accountable = false;

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
  titleViewTask = 'Xem';
  crrRole: any;
  isOtherModule = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFC: CallFuncService,
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
      ...dt?.data?.data,
    };
    this.getParam();
    if (this.task.taskGroupID) {
      this.logicTaskGroup(this.task.taskGroupID);
    }
    this.action = dt?.data?.action;
    this.showAssignTo = dt?.data?.showAssignTo;
    this.titleAction = dt?.data?.titleAction;
    this.functionID = dt?.data?.functionID;
    this.taskCopy = dt?.data?.taskCopy;
    this.disabledProject = dt?.data?.disabledProject;
    this.isOtherModule = dt?.data?.isOtherModule

    //da doi lai cho phu hop
    // this.action = dt?.data[1];
    // this.showAssignTo = dt?.data[2];
    // this.titleAction = dt?.data[3];
    // this.functionID = dt?.data[4];
    // this.taskCopy = dt?.data[5];
    // this.disabledProject = dt?.data[6];
    // this.isOtherModule = dt?.data[7]
    this.dialog = dialog;
    this.user = this.authStore.get();

    // if(this.functionID!='TMT0203' && this.functionID!='TMT0201'&& this.functionID!='TMT0202'){
    //   if(this.showAssignTo ) this.functionID = 'TMT0203'  ;else this.functionID = 'TMT0201'  //truong hop xu ly assign\
    // }

    this.cache.functionList(this.functionID).subscribe((f) => {
      if (f) {
        this.titleViewTask = f.language == 'VN' ? 'Xem chi tiết' : 'View';
        this.cache
          .gridViewSetup(f.formName, f.gridViewName)
          .subscribe((res) => {
            if (res) {
              this.gridViewSetup = res;
              this.planholderTaskChild = res['Memo']?.description;

              // for (let key in res) {
              //   if (res[key]['isRequire']) {
              //     let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
              //     let obj = {
              //       keyRequire: keyConvert,
              //       textHeader: res[key]['headerText'],
              //     };
              //     this.listRequire.push(obj);
              //   }
              //}
            }
          });
      }
    });
    this.cache.gridViewSetup('TaskGoals', 'grvTaskGoals').subscribe((res) => {
      if (res) {
        this.planholderTaskGoal = res['Memo']?.description;
      }
    });

    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    if (this.action == 'add') {
      if (
        this.functionID == 'TMT0203' ||
        this.functionID == 'MWP0062' ||
        this.functionID == 'OMT014'
      ) {
        this.task.category = '3';
      } else {
        this.task.category = '1';
      }
      this.openTask();
    } else if (this.action == 'copy') {
      this.task.status = '10';
      if (
        this.functionID == 'TMT0203' ||
        this.functionID == 'MWP0062' ||
        this.functionID == 'OMT014'
      ) {
        this.task.category = '3';
      } else {
        this.task.category = '1';
      }
      this.getTaskCoppied(this.taskCopy.taskID);
    } else {
      this.titleAction =
        this.action == 'edit' ? this.titleAction : this.titleViewTask;
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
          //var dataValue = JSON.parse(res.dataValue);
          var param = JSON.parse(res.dataValue);
          if (param.Accountable == '1') this.accountable = true;
          else this.accountable = false;
          if (!this.task.taskGroupID) {
            this.param = param;
            this.taskType = param?.TaskType;
            if (this.param?.PlanControl == '1' && this.task.startDate == null)
              this.task.startDate = new Date();
          }
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
      this.recIDTodoDelete.push(this.listTodo[index].recID);
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
        this.showLabelAttachment = this.task.attachments > 0 ? true : false;
        if (this.action == 'edit' && this.task.category == '2') {
          this.disableDueDate = true;
          if (this.param?.EditControl != '1') this.readOnly = true;
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
    if (!this.task.taskGroupID && this.gridViewSetup['TaskGroupID'].isRequire) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        this.gridViewSetup['TaskGroupID'].headerText
      );
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
    if (this.isClickSave) return;
    this.isClickSave = true;
    if (this.attachment && this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          let attachments = Array.isArray(res) ? res.length : 1;
          if (this.action == 'edit') {
            this.task.attachments += attachments;
            this.updateTask();
          } else {
            this.task.attachments = attachments;
            this.addTask();
          }
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
        this.recIDTodoDelete.join(';'),
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
    if (this.isOtherModule) {
      this.api
        .exec('TM', 'TaskBusiness', 'AddTaskAsync', [
          this.task,
          this.functionID,
          this.listTaskResources,
          this.listTodo,
        ])
        .subscribe((res: any) => {
          this.isClickSave = false;
          this.attachment?.clearData();
          this.dialog.close(res);
        });
    } else {
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
          this.isClickSave = false;
          this.attachment?.clearData();
          if (res && res.save) {
            this.dialog.close(res.save[0]);
            //   var task = res.save[0];
            //       //send mail FE
            //       // if (task.category == '3') {
            //       //   if (this.param?.ConfirmControl == '1')
            //       //     this.tmSv
            //       //       .sendAlertMail(task?.recID, 'TM_0008', this.functionID)
            //       //       .subscribe();
            //       //   else
            //       //     this.tmSv
            //       //       .sendAlertMail(task?.recID, 'TM_0001', this.functionID)
            //       //       .subscribe();
            //       // }

            //       // if (task?.category == '1' && task.verifyControl == '1')
            //       //   this.tmSv
            //       //     .sendAlertMail(task?.recID, 'TM_0018', this.functionID)
            //       //     .subscribe();
          }
        });
    }
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
                  var task = res.update;
                  this.dialog.close(res.update);
                  this.attachment?.clearData();
                  //send mail FE
                  // this.tmSv
                  //   .sendAlertMail(task?.recID, 'TM_0002', this.functionID)
                  //   .subscribe();
                }
              } else {
                this.dialog.close();
                this.attachment?.clearData();
              }
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

  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';
    var listPositionID = '';
    var listEmployeeID = '';
    var listGroupMembersID = '';
    if (!e || e?.length == 0) return;
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
            this.valueSelectUser(res[0]);
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
        // this.task.assignTo = assignTo;
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
          this.taskGroup = res;
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
            this.listTodo = [];
            toDo.forEach((tx) => {
              var taskG = new TaskGoal();
              taskG.status = this.STATUS_TASK_GOAL.NotChecked;
              taskG.text = tx;
              this.listTodo.push(taskG);
            });
          }
          if (
            this.taskGroup?.planControl == '1' &&
            this.task.startDate == null
          ) {
            this.task.startDate = new Date();
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
    var crrRole = this.crrRole;
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
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

  valueChangeTags(e) {
    this.task.tags = e.data;
  }

  onDeleteUser(item) {
    if (item?.status && item.status != '00' && item.status != '10') {
      this.notiService.notifyCode('TM012', 0, [item?.resourceName]);
      return;
    }
    var userID = item.resourceID;

    // var listUser = [];
    // var listTaskResources = [];
    // var listUserDetail = [];
    // var totalUser = this.listUser.length;
    // for (var i = 0; i < totalUser; i++) {
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
      this.listTaskResources[index].memo = message;
      // this.listTaskResources.forEach((obj) => {
      //   if (obj.resourceID == id) {
      //     obj.memo = message;
      //   }
      // });
    }
    this.changeDetectorRef.detectChanges();
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

  //#region popver select RolType
  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
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
  //#endregion

  //#regionreferences -- viet trong back end nhung khong co tmp chung nen viet fe
  //referen new
  loadDataReferences() {
    this.dataReferences = [];
    if (this.task.refID) this.getReferencesByCategory3(this.task);
  }

  getReferencesByCategory3(task) {
    var listUser = [];
    switch (task.refType) {
      case 'OD_Dispatches':
        this.api
          .exec<any>('OD', 'DispatchesBusiness', 'GetListByIDAsync', task.refID)
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

  //open control share
  openControlShare(controlShare: any, roleType) {
    this.crrRole = roleType;
    if (controlShare) {
      let option = new DialogModel();
      option.zIndex = 1010;
      this.callFC.openForm(controlShare, '', 450, 600, '', null, '', option);
    }
  }

  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
    this.param.Approvers = taskGroup.approveBy;
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
