import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import { TagsComponent } from '@shared/layout/tags/tags.component';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { CodxTMService } from '../../codx-tm.service';
import { StatusTaskGoal } from '../../models/enum/enum';
import { TaskGoal } from '../../models/task.model';
import { tmpTaskResource, TM_Tasks } from '../../models/TM_Tasks.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-test-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],
})
export class PopupAddComponent implements OnInit {
  STATUS_TASK_GOAL = StatusTaskGoal;
  user: any;
  readOnly = false;
  listUser: any[];
  listMemo2OfUser: Array<{ userID: string; memo2: string }> = [];
  listUserDetail: any[];
  listTodo: TaskGoal[];
  listTaskResources: tmpTaskResource[] = [];
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  functionID: string;
  view = '';
  action = '';
  title = 'Tạo mới công việc';
  contentTodoEdit = '';
  recIDTodoDelete = '';
  indexEditTodo = -1;
  required = {
    taskName: false,
  };
  isConfirm = true;
  isCheckTime = true;
  isCheckProjectControl = false;
  isCheckAttachmentControl = false;
  isCheckCheckListControl = false;
  openMemo2 = false;
  showPlan = true;
  showAssignTo = false;
  dataAddNew = new BehaviorSubject<any>(null);
  isAddNew = this.dataAddNew.asObservable();
  updateData = new BehaviorSubject<any>(null);
  isUpdate = this.updateData.asObservable();

  @ViewChild('contentAddUser') contentAddUser;
  @ViewChild('contentListTask') contentListTask;
  @ViewChild('messageError') messageError;
  @ViewChild('txtTodoEdit') txtTodoEdit: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;

  @ViewChild('tags') tagsComponent: TagsComponent;
  task: TM_Tasks = new TM_Tasks();
  dialog: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    public atSV: AttachmentService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.task = {
      ...this.task,
      ...dt?.data,
    };
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    const t = this;
    this.functionID = this.dialog.formModel.funcID;
    if (this.functionID == 'TMT03') this.showAssignTo = true;
    this.getParam(); //bật tắt set param
    this.openTask();
  }

  getParam(callback = null) {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.SYS,
        APICONSTANT.ASSEMBLY.CM,
        APICONSTANT.BUSINESS.CM.Parameters,
        'GetDictionaryByPredicatedAsync',
        'TM_Parameters'
      )
      .subscribe((res) => {
        if (res) {
          this.param = res;
          return callback && callback(true);
        }
      });
  }

  onAddUser(event) {
    this.changeDetectorRef.detectChanges();
    // this.openDialogFolder(this.contentAddUser, '');
  }

  changeMeno2User(message, id) {
    var index = this.listMemo2OfUser.findIndex((obj) => obj.userID == id);
    if (index != -1) {
      this.listMemo2OfUser.forEach((obj) => {
        if (obj.userID == id) {
          obj.memo2 = message;
          return;
        }
      });
    } else {
      var memo2OfUser = {
        userID: id,
        memo2: message,
      };
      this.listMemo2OfUser.push(memo2OfUser);
    }
  }

  changeMemo(event: any) {
    var field = event.field;
    var dt = event.data;
    this.task.memo = dt?.value ? dt.value : dt;
  }

  onOpenTodo() {
    if (!this.disableAddToDo) {
      this.onAddToDo();
    } else {
      this.disableAddToDo = !this.disableAddToDo;
      this.changeDetectorRef.detectChanges();
      //  if (!this.disableAddToDo) $('#txtTodoAdd').focus();
    }
  }

  onAddToDo() {
    if (!this.todoAddText) return;
    if (this.listTodo == null) this.listTodo = [];
    var todo = new TaskGoal();
    todo.status = this.STATUS_TASK_GOAL.NotChecked;
    todo.text = this.todoAddText;
    this.listTodo.push(Object.assign({}, todo));
    this.todoAddText = '';
    this.changeDetectorRef.detectChanges();
    //  $('#txtTodoAdd').focus();
  }

  onDeleteTodo(index) {
    if (this.listTodo[index].recID) {
      this.recIDTodoDelete += this.listTodo[index].recID + ';';
    }
    this.listTodo.splice(index, 1); //remove element from array
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

  openTask(): void {
    const t = this;
    if (this.functionID == 'TMT03') {
      // this.showAssignTo = true;
      //cai nay thêm để test
      this.task.assignTo = 'ADMIN;PMNHI;VVQUANG;NVHAO'; ///tesst
      this.getListUser(this.task.assignTo);
    }

    this.task.estimated = 0;
    this.readOnly = false;
    this.task = new TM_Tasks();
    this.listTodo = [];
    this.task.status = '1';
    this.task.priority = '1';
    this.task.memo = '';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.changeDetectorRef.detectChanges();
    if (!this.param)
      this.getParam(function (o) {
        //if (o) t.showPanel();
      });
    else {
      this.closePanel();
    }
  }

  openInfo(id, action) {
    this.getParam();
    const t = this;

    t.task = new TM_Tasks();
    t.readOnly = action === 'edit' ? false : true;
    t.title =
      action === 'edit' ? 'Chỉnh sửa công việc' : 'Xem chi tiết công việc';
    t.disableAddToDo = true;

    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        t.task = res[0];
        t.listUserDetail = res[1] || [];
        t.listTodo = res[2];
        t.listMemo2OfUser = res[3];
        if (t.task.assignTo != null) {
          t.listUser = t.task.assignTo.split(';');
          this.getListUser(this.task.assignTo);
        } else {
          this.listUser = [];
          this.listUserDetail = [];
          this.listMemo2OfUser = [];
          //thêm giá trị đê add thử copy -sau nay xóa đi
          //   if (action == 'edit') {
          //     this.task.assignTo = 'TQHOAN'; ///tesst
          //     this.getListUser(this.task.assignTo);
          //   }
        }
        t.changeDetectorRef.detectChanges();
        if (this.functionID == 'TMT03') {
          //    this.showAssignTo = true;
        }
        this.showPanel();
      }
    });
  }

  openAssignSchedule(task): void {
    const t = this;
    this.task = task;
    if (this.functionID == 'TMT03') {
      // this.showAssignTo = true;
      //cai nay thêm để test
      this.task.assignTo = 'ADMIN;PMNHI;VVQUANG;NVHAO'; ///tesst
      this.getListUser(this.task.assignTo);
    }

    // this.task.estimated = 0;
    this.readOnly = false;
    this.listTodo = [];
    this.task.status = '1';
    this.task.priority = '1';
    this.task.memo = '';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.changeDetectorRef.detectChanges();
    if (!this.param)
      this.getParam(function (o) {
        //if (o) t.showPanel();
      });
    else {
      this.closePanel();
    }
  }

  getTaskCoppied(id) {
    const t = this;
    if (this.functionID == 'TMT03') {
      // this.showAssignTo = true;
    }
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        t.copyListTodo(res[2]);
        t.beforeCopy(res[0]);
      }
    });
  }

  copyListTodo(listTodoCopy) {
    const t = this;
    t.listTodo = [];
    if (listTodoCopy != null) {
      listTodoCopy.forEach((td) => {
        var todo = new TaskGoal();
        todo.status = td.status;
        todo.text = td.text;
        t.listTodo.push(Object.assign({}, todo));
      });
    }
  }

  beforeCopy(data) {
    this.title = 'Copy công việc ';
    const t = this;
    t.task = new TM_Tasks();
    t.task = data;
    t.task.dueDate = moment(new Date(data.dataValue)).toDate();
    if (data.startDate != null)
      t.task.startDate = moment(new Date(data.startDate)).toDate();
    t.task.endDate = moment(new Date(data.endDate)).toDate();
    t.task.taskID = null;
    t.task.parentID = null;
    t.task.assignTo = null;
    t.task.completedOn = null;
    this.listUser = [];
    this.listUserDetail = [];
    this.listMemo2OfUser = [];
    //thêm giá trị đê add thử copy -sau nay xóa đi
    //this.task.assignTo = 'PMNHI;VVQUANG'; ///tesst
    // this.getListUser(this.task.assignTo);

    t.changeDetectorRef.detectChanges();
    this.showPanel();
  }

  saveData(id) {
    // this.task.assignTo = 'ADMIN;PMNHI;VVQUANG;NVHAO'; ///tesst
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      // this.notiService.notifyCode('TM002');
      this.notiService.notify('Tên công việc không được để trống !');
      //    $('#taskNameInput').focus();
    }
    if (
      this.functionID == 'TMT03' &&
      (this.task.assignTo == '' || this.task.assignTo == null)
    ) {
      this.notiService.notify('Phải nhập danh sách người được phân công !');
      // this.notiService.notifyCode('mã code');
      return;
    }

    this.checkLogicTime();
    if (!this.isCheckTime) {
      // this.notiService.notifyCode('TM002');
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
      // if (this.task.dueDate < this.task.startDate) {
      //   this.message =
      //     'Ngày bắt đầu lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';
      // } else if (this.task.dueDate < this.task.endDate)
      //   this.message =
      //     'Ngày kết thúc lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';
      this.notiService
        //.alert('Cảnh báo !!', this.message, { type: 'YesNo' })
        .alertCode('TM002', { type: 'YesNo' });
      // .subscribe((dialog: Dialog) => {
      //   var that = this;
      //   dialog.close = function (e) {
      //     return that.closeConfirm(e, that, id);
      //   };
      // });
    } else {
      this.actionSave(id);
    }
  }

  actionSave(id) {
    if (this.task.taskGroupID) this.checkLogicTaskGroup(this.task.taskGroupID);
    var checkLogic =
      this.isCheckProjectControl ||
      this.isCheckCheckListControl ||
      this.isCheckAttachmentControl;
    if (checkLogic) {
      this.notiService.notifyCode('TM002');
      return;
    }
    this.convertToListTaskResources();
    this.task.taskType = this.param['TaskType'];
    if (id) this.updateTask();
    else this.addTask();
    //this.viewBase.currentView.closeSidebarRight();
  }

  beforeSave(op: any) {
    var data = [];
    if (op.taskID != null) {
      op.method = 'UpdateTaskAsync';
      data = [
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
        null,
        this.recIDTodoDelete,
      ]
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
      .save((option: any) => this.beforeSave(option))
      .subscribe();
    // this.tmSv
    //   .addTask([
    //     this.task,
    //     this.functionID,
    //     this.listTaskResources,
    //     this.listTodo,
    //   ])
    //   .subscribe((res) => {
    //     if (res) {
    //       this.notiService.notify(res.message);
    //       if (res.data && res.data.length) {
    //         res.data.forEach((dt) => {
    //           var data = dt;
    //           this.dataAddNew.next(data);
    //         });
    //       }
    //       this.closeTask();
    //       // if (isCloseFormTask) {
    //       //   this.closeTask();
    //       // } else {
    //       //   if (res?.data?.length > 0) {
    //       //     let task = res.data[0];
    //       //     // this.openFormAttach(task?.parentID ?? task?.taskID);
    //       //   }
    //       // }
    //     } else {
    //       this.notiService.notify('TM002'); /// call sau
    //       return;
    //     }
    //   });
  }

  updateTask() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe();
    // this.tmSv
    //   .update([
    //     this.task,
    //     this.functionID,
    //     this.listTaskResources,
    //     this.listTodo,
    //     null,
    //     this.recIDTodoDelete,
    //   ])
    //   .subscribe((res) => {
    //     if (res) {
    //       this.notiService.notify(res.message);
    //       res.data.forEach((dt) => {
    //         var data = dt;
    //         this.updateData.next(data);
    //       });
    //       this.closeTask();
    //     } else {
    //       this.notiService.notify('TM002');
    //       return;
    //     }
    //   });
  }

  openInputMemo2() {
    this.openMemo2 = !this.openMemo2;
  }

  eventApply(e: any) {
    console.log(e);
  }

  valueChange(data) {
    if (data.data) {
      this.task[data.field] = data.data[0];
    }
  }

  changeVLL(data) {
    this.task.priority = data.data;
  }

  changeTime(data) {
    if (!data.field) return;
    this.task[data.field] = data.data.fromDate;
    if (data.field == 'startDate') {
      if (!this.task.endDate)
        this.task.endDate = moment(new Date(data.data.fromDate))
          .add(1, 'hours')
          .toDate();
    }
    if (data.field == 'startDate' || data.field == 'endDate') {
      if (this.task.startDate && this.task.endDate)
        this.task.estimated = moment(this.task.endDate).diff(
          moment(this.task.startDate),
          'hours'
        );
    }
  }

  cbxChange(data) {
    if (data.data) {
      this.task[data.field] = data.data[0];
      if (data.field === 'taskGroupID')
        this.loadTodoByGroup(this.task.taskGroupID);
    }
  }

  checkLogicTime() {
    if (!this.task.startDate && !this.task.endDate) {
      this.isCheckTime = true;
      return;
    }
    if (!this.task.startDate && this.task.endDate) {
      this.notiService.notify('Phải nhập ngày bắt đầu công việc !');
      this.isCheckTime = false;
      return;
    }
    if (this.task.startDate > this.task.endDate) {
      var message = 'Ngày bắt đầu không lớn hơn hơn ngày kết thúc ';
      this.isCheckTime = false;
      this.notiService.notify(message);
    } else {
      this.isCheckTime = true;
    }
  }

  checkLogicTaskGroup(idTaskGroup) {
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
          console.log(res);
          // co dk cu the se check thu
          //  this.isCheckProjectControl = !this.task.projectID && res.ProjectControl != '0';
          //  this.isCheckAttachmentControl = res.AttachmentControl != '0';
          // this.isCheckCheckListControl =
          //   res.CheckListControl != '0' && this.listTodo.length > 0;

          // if (this.isCheckProjectControl) {
          //   var message = 'Dự án không được để trống';
          //   this.notiService.notify(message);
          // }
          // if (this.isCheckAttachmentControl) {
          //   var message = 'File tài liệu không được để trống';
          //   this.notiService.notify(message);
          // }
          // if (this.isCheckCheckListControl) {
          //   //thieu dk taskk
          //   var message = 'Danh sách việc cần làm không được để trống';
          //   this.notiService.notify(message);
          // }
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
          if (res.checkList != null) {
            var toDo = res.checkList.split(';');
            toDo.forEach((tx) => {
              var taskG = new TaskGoal();
              taskG.status = this.STATUS_TASK_GOAL.NotChecked;
              taskG.text = tx;
              this.listTodo.push(taskG);
            });
          }
        }
      });
  }

  // valueChangeUser(event) {
  //   if (event?.valueSeleteds) {
  //     this.task.assignTo = event?.valueSeleteds;
  //   }
  // this.listUser =  this.task.assignTo.split(";");

  // this.api.exec<any>("SYS", "ERM.Business.AD", "UsersBusiness", "GetListByID", this.listUser).subscribe(res=>{
  //   this.listUserDetail = res ;
  // })
  // }

  getListUser(listUser) {
    this.listMemo2OfUser = [];
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    this.listUser = listUser.split(';');
    this.listUser.forEach((u) => {
      var obj = { userID: u.userID, memo2: null };
      this.listMemo2OfUser.push(obj);
    });
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListUserDetailAsync',
        listUser
      )
      .subscribe((res) => {
        this.listUserDetail = res;
      });
  }

  extendShow() { }

  closeTask(): void {
    this.required.taskName = false;
    this.disableAddToDo = true;
    this.resetTask();
    this.closePanel();
  }

  resetTask() {
    this.task = new TM_Tasks();
    this.isCheckProjectControl = false;
    this.isCheckAttachmentControl = false;
    this.isCheckCheckListControl = false;
    this.task.estimated = 0;
    this.isConfirm = true;
    this.required.taskName = false;
    this.disableAddToDo = true;
    this.readOnly = false;
    this.listTodo = [];
    this.listUser = [];
    this.listUserDetail = [];
    this.listMemo2OfUser = [];
    this.task.status = '1';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
  }

  valueChangeTags(tags: string) {
    this.task.tags = tags;
  }

  textboxChange(e) {
    console.log('task-info.comp', e);
    if (!e) {
      this.required.taskName = true;
    } else this.required.taskName = false;

    console.log('task required', this.required.taskName);
  }
  showPanel() { }
  closePanel() { }

  onDeleteUser(userID) {
    var listUser = [];
    var listMemo2OfUser = [];
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUser[i] != userID) {
        listUser.push(this.listUser[i]);
      }
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
      if (this.listMemo2OfUser[i]?.userID != userID) {
        listMemo2OfUser.push(this.listMemo2OfUser[i]);
      }
    }
    this.listUser = listUser;
    this.listUserDetail = listUserDetail;
    this.listMemo2OfUser = listMemo2OfUser;

    var assignTo = '';
    if (listUser.length > 0) {
      listUser.forEach((idUser) => {
        assignTo += idUser + ';';
      });
      assignTo = assignTo.slice(0, -1);
      this.task.assignTo = assignTo;
    } else this.task.assignTo = '';
  }

  openDialog() {
    // let obj = {
    //   formName: 'demo',
    //   control: '1',
    //   value: '5',
    //   text: 'demo nè',
    // };
    // this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', obj);
  }

  // closeConfirm(e: any, t: TaskInfoComponent, id: string) {
  //   if (e?.event?.status == 'Y') {
  //     t.actionSave(id)
  //   }
  // }
  popup(evt: any) {
    this.attachment.openPopup();
  }
  fileAdded(e) {
    console.log(e);
  }

  convertToListTaskResources() {
    var listTaskResources: tmpTaskResource[] = [];
    this.listMemo2OfUser.forEach((obj) => {
      var tmpTR = new tmpTaskResource();
      tmpTR.resourceID = obj.userID;
      tmpTR.memo = obj.memo2;
      tmpTR.roleType = 'R';
      listTaskResources.push(tmpTR);
    });
    this.listTaskResources = listTaskResources;
  }
}
