import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
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
import { tmpTaskResource, TM_Tasks } from '../../models/TM_Tasks.model';
import * as moment from 'moment';
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
  listMemo2OfUser: Array<{ userID: string; memo2: string }> = [];
  listUserDetail: any[] = [];
  listTodo: TaskGoal[] = [];
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
  // required = {
  //   taskName: false,
  // };
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
  crrIndex :number
  popover: any;

  @ViewChild('contentAddUser') contentAddUser;
  @ViewChild('contentListTask') contentListTask;
  @ViewChild('messageError') messageError;
  @ViewChild('txtTodoEdit') txtTodoEdit: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;

  task: TM_Tasks = new TM_Tasks();
  dialog: any;
  taskCopy: any;
  newID: string;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.getParam();
    this.task = {
      ...this.task,
      ...dt?.data[0],
    };
    this.action = dt?.data[1];
    this.showAssignTo = dt?.data[2];
    this.taskCopy = dt?.data[3];  
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    if (this.functionID == 'TMT0203') this.showAssignTo = true; ////cái này để show phân công- chưa có biến nào để xác định là Công việc của tôi hay Giao việc -Trao đổi lại
  }

  ngOnInit(): void {
    if (this.action == 'add') {
      this.openTask();
    } else if (this.action == 'copy') {
      // this.title="Copy công việc"  // cái này sau Quang làm
      this.getTaskCoppied(this.taskCopy.taskID)   //nếu alowCopy = false thì bật cái này lên 
    } else this.openInfo(this.task.taskID, this.action);
  }

  ngAfterViewInit(): void { }

  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'TM_Parameters'
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          return callback && callback(true);
        }
      });
  }

  changeMemo2OfUser(message, id) {
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
    if(event?.data){
      this.task[field] = event?.data 
    }
   
  }

  onAddToDo(evt: any) {
    if (!this.todoAddText || this.todoAddText.trim()=='' ) {
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
      if(this.task.taskGroupID)this.isCheckCheckListTrue= this.isCheckCheckListControl;
    };
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
    if(content != "" || content.trim() == ''){
      this.indexEditTodo = -1;
      return
    }  ;
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
    this.title = 'Tạo mới công việc';
    this.task.estimated = 0;
    this.readOnly = false;
    this.listTodo = [];
    this.task.status = '1';
    this.task.memo = '';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.changeDetectorRef.detectChanges();
  }

  openInfo(id, action) {
    this.readOnly = action === 'edit' ? false : true;
    this.title = 'Chỉnh sửa công việc'
    this.disableAddToDo = true;

    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        this.task = res[0] as TM_Tasks;
        this.listUserDetail = res[1] || [];
        this.listTodo = res[2];
        this.listMemo2OfUser = res[3];
        this.listUser = this.task.assignTo?.split(';') || [];
        this.api.execSv<any[]>("DM", "DM", "FileBussiness", "GetFilesByObjectIDAsync", [this.task.taskID]).subscribe(res => {
          if (res && res.length > 0) this.isHaveFile = true; else this.isHaveFile = false;
        })
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  getTaskCoppied(id) {
    const t = this;
    this.title = 'Copy công việc ';
    this.listUser = [];
    this.listUserDetail = [];
    this.listMemo2OfUser = [];
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
      //  this.beforeCopy(res[0]);
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
        todo.status = td.status;
        todo.text = td.text;
        t.listTodo.push(Object.assign({}, todo));
      });
    }
  }

  beforeCopy(data) {
    const t = this;
    // t.task = data as TM_Tasks;
   // t.task.taskID = this.newID;
    t.task.dueDate = moment(new Date(data.dueDate)).toDate();
    if (data.startDate != null)
      t.task.startDate = moment(new Date(data.startDate)).toDate();
    if (data.endDate != null)
      t.task.endDate = moment(new Date(data.startDate)).toDate();
    t.task.parentID = null;
    t.task.assignTo = null;
    t.task.completedOn = null;
    this.listUser = [];
    this.listUserDetail = [];
    this.listMemo2OfUser = [];
    t.changeDetectorRef.detectChanges();
  }

  saveData(id) {
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      // this.notiService.notifyCode('???code');
      this.notiService.notify('Tên công việc không được để trống !');
      return ;
    }
    if (
      this.showAssignTo &&
      (this.task.assignTo == '' || this.task.assignTo == null)
    ) {
      this.notiService.notify('Phải nhập danh sách người được phân công !');
      // this.notiService.notifyCode('mã code');
      return;
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
    if (this.task.taskGroupID) {
      this.checkLogicWithTaskGroup();
      var checkLogic =
        this.isCheckProjectTrue &&
        this.isCheckCheckListTrue &&
        this.isCheckAttachmentTrue;

      if (!checkLogic) {
        if (!this.isCheckAttachmentTrue)
          //  this.notiService.notifyCode('code nao vao day ??');
          this.notiService.notify('File tài liệu không được để trống');
        if (!this.isCheckProjectTrue)
          //  this.notiService.notifyCode('code nao vao day ??');
          this.notiService.notify('Dự án không được để trống');
        if (!this.isCheckCheckListTrue)
          //  this.notiService.notifyCode('code nao vao day ??');
          this.notiService.notify('Danh sách việc cần làm không được để trống');
        return;
      }
    }
    if (this.showAssignTo) {
      if (this.task.assignTo == null || this.task.assignTo == '') {
        //  this.notiService.notifyCode('code nao vao day ??');
        this.notiService.notify('Thêm người được giao việc !');
        return;
      }
    }

    this.convertToListTaskResources();
    this.task.taskType = this.param['TaskType'];
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
    // this.dialog.dataService
    //   .save((option: any) => this.beforeSave(option))
    //   .subscribe((res) => {
    //     if (res.save) {
    //       this.dialog.close();
    //       this.notiService.notifyCode('TM005');
    //     }
    //   });
    this.tmSv
      .addTask([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
      ])
      .subscribe((res) => {
        if (res && res.length>0) {
          // this.dialog.dataService.data = res.concat(
          //   this.dialog.dataService.data
          // );
          // this.dialog.dataService.setDataSelected(res[0]);
          // this.dialog.dataService.afterSave.next(res);
          // this.notiService.notifyCode('TM005');
          this.dialog.close(res);
        }
      });
  }

  updateTask() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update);
        }
      });
  }

  openInputMemo2() {
    this.openMemo2 = !this.openMemo2;
  }

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
    if (data.data) {
      this.task[data.field] = data.data;
    }
  }
  valueChangeEstimated(data) {
    if (!data.data) return;
    var num = Number.parseFloat(data.data);
    if (!num) {
      //  this.notiService.notifyCode("can cai code o day đang gan tam")
      this.notiService.notify('Giá trị nhập vào không phải là 1 số !');
      this.task.estimated = this.crrEstimated ? this.crrEstimated : 0;
      this.changeDetectorRef.detectChanges();
      return;
    }
    // if (num < 0) {
    //   //  this.notiService.notifyCode("can cai code o day đang gan tam")
    //   this.notiService.notify('Giá trị nhập vào phải lớn hơn hoặc bằng 0 !');
    //   this.task.estimated = this.crrEstimated ? this.crrEstimated : 0;
    //   this.changeDetectorRef.detectChanges();
    //   return;
    // }
    if (data.data && num) {
      this.task[data.field] = data.data;
      var estimated = num * 3600000;
      if (!this.task.startDate) {
        var crrDay = new Date();
        this.task.startDate = moment(crrDay).toDate();
        var time = crrDay.getTime();
        var timeEndDate = time + estimated;
        this.task.endDate = moment(new Date(timeEndDate)).toDate();
        this.crrEstimated = this.crrEstimated
          ? this.crrEstimated
          : this.task.estimated;
      } else if (!this.crrEstimated) {
        var timeEndDate = this.task.startDate.getTime() + estimated;
        this.task.endDate = moment(new Date(timeEndDate)).toDate();
      }
    }
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
        ).toFixed(1);
        this.task.estimated = Number.parseFloat(time);
        this.crrEstimated = this.task.estimated;
      }
      // this.task.estimated = moment(this.task.endDate).diff(
      //   moment(this.task.startDate),
      //   'hours'
      // );
    }
  }

  cbxChange(data) {
    if (data.data && data.data[0]) {
      this.task[data.field] = data.data[0];
      if (data.field === 'taskGroupID' && this.action == 'add')
        this.loadTodoByGroup(this.task.taskGroupID);
      if (data.field === 'taskGroupID') this.logicTaskGroup(data.data[0]);
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
  checkLogicWithTaskGroup() {
    if (this.isCheckCheckListControl) {
      this.isCheckCheckListTrue =
        this.isCheckCheckListControl && this.listTodo.length > 0;
    } else this.isCheckCheckListTrue = true;

    if (this.param.ProjectControl != '0') {
      if (this.isCheckProjectControl) {
        this.isCheckProjectTrue =
          this.task.projectID && this.isCheckProjectControl;
      } else this.isCheckProjectTrue = true;
    }
    if (this.isCheckAttachmentControl) {
      this.isCheckAttachmentTrue =
        this.isCheckAttachmentControl && this.isHaveFile;
    } else this.isCheckAttachmentTrue = true;
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
          if (this.param.ProjectControl != '0')
            this.isCheckProjectControl = res.projectControl != '0';
          this.isCheckAttachmentControl = res.attachmentControl != '0';
          this.isCheckCheckListControl = res.checkListControl != '0';
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

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    var arrUser = listUser.split(';');
    this.listUser = this.listUser.concat(arrUser);
    arrUser.forEach((u) => {
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
        this.listUserDetail = this.listUserDetail.concat(res);
      });
  }

  valueChangeTags(e) {
    this.task.tags = e.data;
  }
  closePanel() {
    this.dialog.close();
  }

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

  changeMemo2(e, id) {
    var message = e?.data;
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
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true; else this.isHaveFile = false;
  }
  showPoppoverDelete(p, i){
    if(this.popover)
    this.popover.close() ;
    this.crrIndex = i;
    p.open();
    this.popover = p ;
  }
}
