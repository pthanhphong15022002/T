import { TM_Tasks } from './../../models/TM_Tasks.model';
import { TmService } from './../../tm.service';
import { APICONSTANT } from '@shared/constant/api-const';

import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import 'lodash';
// import { FilesService } from "@shared/services/file.service";
import { StatusTaskGoal } from '../../models/enum/enum';
import { FileUpload, TaskGoal } from '@modules/tm/models/task.model';
import { TagsComponent } from '@shared/layout/tags/tags.component';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CbxpopupComponent } from '../cbxpopup/cbxpopup.component';
import { BehaviorSubject, Observable } from 'rxjs';

declare var _, $: any;
@Component({
  selector: 'app-task-info',
  templateUrl: './task-info.component.html',
  styleUrls: ['./task-info.component.scss'],
})
export class TaskInfoComponent implements OnInit {
  STATUS_TASK_GOAL = StatusTaskGoal;
  user: any;
  readOnly = false;
  listUser: any[];
  // listMemo2OfUser: Array<{ userID: string; memo2: string }> = [];
  listMemo2OfUser: Array<{ userID: string; memo2: string }> = [];
  listUserDetail: any[];
  listTodo: TaskGoal[];
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  @Input() task = new TM_Tasks();
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
  message: string = '';
  isConfirm = true;
  isCheckTime = true;
  isCheckProjectControl = false;
  isCheckAttachmentControl = false;
  isCheckCheckListControl = false;
  openMemo2 = false;
  dataAddNew = new BehaviorSubject<any>(null);
  isAddNew = this.dataAddNew.asObservable();
  updateData = new BehaviorSubject<any>(null);
  isUpdate = this.updateData.asObservable();
  @Input('viewBase') viewBase: ViewsComponent;

  @ViewChild('contentAddUser') contentAddUser;
  @ViewChild('contentListTask') contentListTask;
  @ViewChild('messageError') messageError;
  @ViewChild('txtTodoEdit') txtTodoEdit: ElementRef;
  // @ViewChild("attachment") attachmentComponent: AttachmentComponent;
  @ViewChild('tags') tagsComponent: TagsComponent;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private modalService: NgbModal,
    private authStore: AuthStore,
    private tmSv: TmService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    const t = this;
    this.functionID = 'TM001'; //this.viewBase.funcID ;
    this.getParam(); //bật tắt set param
    this.openTask();

    // this.api.execSv<any>("HR", "ERM.Business.HR", "EmployeesBusiness","GetListEmployeesByUserIDAsync","PMNHI").subscribe(res=>{
    //   console.log(res)})
    // this.cache.gridViewSetup("Tasks", "grvTasks").then((res) => {
    //   if (res) t.grvSetup = res;
    // });
    //this.getParam();
    // this.dMService.islistFiles.subscribe((result) => {
    //   if (result) {
    //     this.attachmentComponent.loadAttachment();
    //   }
    // });
    // this.tmSv.isShowPanel.subscribe((res) => {
    //   if (res?.taskID) {
    //     this.functionID = res.funtionID;
    //     this.view = res.view;
    //     this.action = res.action;
    //     this.openInfo(res.taskID, res.action);
    //     return;
    //   }
    //   if (res?.funtionID) {
    //     this.functionID = res.funtionID;
    //     this.view = res.view;
    //     this.openTask();
    //     return;
    //   }
    // });

    // this.tmSv.isCopy.subscribe((res) => {
    //   if (res) {
    //     t.view = res.view;
    //     t.functionID = res.functionID;
    //     t.getTaskCoppied(res.id);
    //   }
    // });
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
    this.openDialogFolder(this.contentAddUser, '');
  }

  onSaveAddUser(event) {
    // var modal = event.modal;
    // this.listUser = this.cbxsv.dataSelcected;
    // this.changeDetectorRef.detectChanges();
    // modal.dismiss();
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

  onOpenTodo() {
    if (!this.disableAddToDo) {
      this.onAddToDo();
    } else {
      this.disableAddToDo = !this.disableAddToDo;
      this.changeDetectorRef.detectChanges();
      if (!this.disableAddToDo) $('#txtTodoAdd').focus();
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
    $('#txtTodoAdd').focus();
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

  saveData(id) {
    this.checkLogicTime();
    if (!this.isCheckTime) {
      this.notiService.notifyCode('TM002');
      return;
    }
    // if (
    //   this.task.dueDate.getDate() < this.task.startDate.getDate() ||
    //   (this.task.dueDate.getDate() < this.task.endDate.getDate() &&
    //     !this.isConfirm)
    // ) {
    //   if (this.task.dueDate.getDate() < this.task.startDate.getDate()) {
    //     this.message =
    //       'Ngày bắt đầu lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';
    //   } else
    //     this.message =
    //       'Ngày kết thúc lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';
    //   this.notiService
    //     .alert('Cảnh báo !!', this.message, { type: 'YesNo' })
    //     .subscribe((dialog: Dialog) => {
    //       var that = this;
    //       dialog.close = function (e) {
    //         return that.close(e, that, id);
    //       };
    //     });
    // } else {
    this.confirmDueTime();
    if (this.task.taskGroupID) this.checkLogicTaskGroup(this.task.taskGroupID);
    var checkLogic =
      !this.isConfirm ||
      this.isCheckProjectControl ||
      this.isCheckCheckListControl ||
      this.isCheckAttachmentControl;
    if (checkLogic) {
      this.notiService.notifyCode('TM002');
      // this.notiService.notify('Mã lỗi TM002');
      return;
    }
    this.task.taskType = this.param['TaskType'];
    if (id) this.updateTask();
    else this.addTask();
    this.viewBase.currentView.closeSidebarRight();
  }

  addTask(isCloseFormTask: boolean = true) {
    this.tmSv
      .addTask([
        this.task,
        this.listTodo,
        this.functionID,
        this.listMemo2OfUser,
      ])
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res.message);
          if (res.data) {
            res.data.forEach((dt) => {
              var data = dt;
              if (data.priorityColor == null && data.priorityIcon == null) {
                switch (data.priority) {
                  case '1':
                    data.priorityColor = '#66a3ff';
                    data.priorityIcon = 'fa fa-flag-o';
                    break;
                  case '2':
                    data.priorityColor = '#ffd11a';
                    data.priorityIcon = 'fa fa-flag-o';
                    break;
                  case '3': {
                    data.priorityColor = '#ff6600';
                    data.priorityIcon = 'fa fa-flag-o';
                    break;
                  }
                }
              }
              this.dataAddNew.next(data);
            });
          }
          this.closeTask() ;
          // if (isCloseFormTask) {
          //   this.closeTask();
          // } else {
          //   if (res?.data?.length > 0) {
          //     let task = res.data[0];
          //     // this.openFormAttach(task?.parentID ?? task?.taskID);
          //   }
          // }
        } else {
          this.notiService.notify('TM002'); /// call sau
          return;
        }
      });
  }

  updateTask() {
    this.tmSv
      .update([
        this.task,
        this.listTodo,
        null,
        this.functionID,
        this.recIDTodoDelete,
        this.listMemo2OfUser,
      ])
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res.message);
          res.data.forEach((dt) => {
            var data = dt;
            this.updateData.next(data);
          }) ;
          this.closeTask();
        } else {
          this.notiService.notify('TM002');
          return;
        }
      });
  }

  openInputMemo2() {
    this.openMemo2 = !this.openMemo2;
  }

  openDialogFolder(content, size: string = '') {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: size,
        windowClass: 'custom-class',
      })
      .result.then(
        (result) => {
          console.log(`Closed with: ${result}`);
        },
        (reason) => {
          // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  arrayBufferToBase64(buffer) {
    //this.taskboard.features..editTask(taskRecord);
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  changeTime(data) {
    if (!data.field) return;
    this.task[data.field] = data.data;
    if (data.field == 'startDate') {
      if (!this.task.endDate)
        this.task.endDate = moment(new Date(data.data))
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

  checkLogicTime() {
    if (!this.task.startDate) {
      this.notiService.notify('Phải nhập thời gian bắt đầu !');
      this.isCheckTime = false ;
      return;
    }
    if (this.task.startDate.getDate() > this.task.endDate.getDate()) {
      var message = 'Ngày bắt đầu không lớn hơn hơn ngày kết thúc ';
      this.isCheckTime = false;
      this.notiService.notify(message);
    } else {
      this.isCheckTime = true;
    }
  }
  confirmDueTime() {
    if (this.task.startDate  && this.task.endDate) {
      if (
        this.task.dueDate.getDate() < this.task.startDate.getDate() ||
        (this.task.dueDate.getDate() < this.task.endDate.getDate() &&
          !this.isConfirm)
      ) {
        if (this.task.dueDate.getDate() < this.task.startDate.getDate()) {
          this.message =
            'Ngày bắt đầu lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';
        } else
          this.message =
            'Ngày kết thúc lớn hơn ngày hết hạn ! Bạn có muốn tiếp tục ?';

        if (confirm(this.message)) {
          this.isConfirm = true;
        } else {
          this.isConfirm = false;
          if (this.task.dueDate.getDate() < this.task.startDate.getDate())
            $('#startDate').focus();
          else $('#endDate').focus();
        }
      }
    }else   this.isConfirm = false;
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

  changeVLL(data) {
    this.task.priority = data.data;
  }

  cbxChangeTaskGroup(data) {
    if (data != '') {
      this.task.taskGroupID = data[0];
      this.loadTodoByGroup(this.task.taskGroupID);
    }
  }

  cbxChange(data) {}

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
          var toDo = res.checkList.split(';');
          toDo.forEach((tx) => {
            var taskG = new TaskGoal();
            taskG.status = this.STATUS_TASK_GOAL.NotChecked;
            taskG.text = tx;
            this.listTodo.push(taskG);
          });
        }
      });
  }

  openTask(): void {
    const t = this;
    this.task.estimated = 0;
    this.readOnly = false;
    this.task = new TM_Tasks();
    this.listTodo = [];
    this.task.assignTo = 'ADMIN;PMNHI;VVQUANG;NVHAO'; ///tesst
    this.getListUser(this.task.assignTo);
    this.task.status = '1';
    this.task.priority = '1';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.changeDetectorRef.detectChanges();
    if (!this.param)
      this.getParam(function (o) {
        //if (o) t.showPanel();
      });
    else {
      t.closePanel();
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
        if (t.task.assignTo != null) t.listUser = t.task.assignTo.split(';');
        t.changeDetectorRef.detectChanges();
        this.showPanel();
      }
    });
  }

  getTaskCoppied(id) {
    const t = this;
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        t.copyListTodo(res[2]) ;
        t.beforeCopy(res[0]);
      }
    });
  }

  copyListTodo(listTodoCopy){
    const t = this;
    t.listTodo = [] ;
    if (listTodoCopy != null){
      listTodoCopy.forEach(td =>{
        var todo = new TaskGoal();
        todo.status = td.status;
        todo.text = td.text;
        t.listTodo.push(Object.assign({}, todo));
      })
    }
  }

  beforeCopy(data) {
    const t = this;
    t.task = new TM_Tasks();
    t.task = data;
    t.task.taskID = null;
    t.task.dueDate = moment(new Date(data.dueDate)).toDate();
    t.task.startDate = moment(new Date(data.startDate)).toDate();
    t.task.endDate = moment(new Date(data.endDate)).toDate();
    t.task.assignTo = null;
    t.task.parentID = null;
    this.listMemo2OfUser = [];
    this.listUser = [];
    this.listUserDetail = [];
    t.changeDetectorRef.detectChanges();
    this.showPanel();
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

  // getListUser(listUser) {
  //   while (listUser.includes(' ')) {
  //     listUser = listUser.replace(' ', '');
  //   }
  //   this.listUser = listUser.split(';');
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskBusiness',
  //       'GetListUserDetailAsync',
  //       listUser
  //     )
  //     .subscribe((res) => {
  //       this.listUserDetail = res;
  //       this.listUserDetail.forEach((u) => {
  //         var obj = { userID: u.userID, memo2: null };
  //         this.listMemo2OfUser.push(obj);
  //       });
  //     });
  // }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    this.listUser = listUser.split(';');
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
        this.listUserDetail.forEach((u) => {
          var obj = { userID: u.userID, memo2: null };
          this.listMemo2OfUser.push(obj);
        });
      });
  }
  extendShow() {
    // this.panelTask.nativeElement.classList.toggle('extend-show');
  }

  closeTask(): void {
    // if (this.tagsComponent.isOpen) this.tagsComponent.close();

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
    this.listMemo2OfUser =[] ;
    this.task.status = '1';
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
  }

  valueChangeTags(tags: string) {
    console.log('tags', tags);
    this.task.tags = tags;
  }
  clickOpenFormAttach(taskID) {
    // if (!taskID) {
    //   this.confirmationDialogService
    //     .confirm("Thông báo", "Công việc sẽ được lưu, bạn có muốn tiếp tục?")
    //     .then((confirmed) => {
    //       if (confirmed) {
    //         this.addTask(false);
    //       } else {
    //       }
    //     });
    // } else {
    //   this.openFormAttach(taskID);
    // }
  }
  // openFormAttach(taskID) {
  //   this.tmSv.openAttach("TM_Tasks", taskID, "TM001");
  // }

  textboxChange(e) {
    console.log('task-info.comp', e);
    if (!e) {
      this.required.taskName = true;
    } else this.required.taskName = false;

    console.log('task required', this.required.taskName);
  }
  showPanel() {
    this.viewBase.currentView.openSidebarRight();
  }
  closePanel() {
    this.viewBase.currentView.closeSidebarRight();
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

  openDialog() {
    let obj = {
      formName: 'demo',
      control: '1',
      value: '5',
      text: 'demo nè',
    };
    this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', obj);
  }

  close(e: any, t: TaskInfoComponent, id: string) {
    if (e?.event?.status == 'Y') {
      t.isConfirm = true;
    } else {
      t.isConfirm = false;
      if (t.task.dueDate.getDate() < t.task.startDate.getDate())
        $('#startDate').focus();
      else $('#endDate').focus();
    }
    if (t.task.taskGroupID) t.checkLogicTaskGroup(t.task.taskGroupID);
    var checkLogic =
      !t.isConfirm ||
      t.isCheckProjectControl ||
      t.isCheckCheckListControl ||
      t.isCheckAttachmentControl;
    if (checkLogic) {
      t.notiService.notifyCode('TM002');
      t.notiService.notify('Mã lỗi TM002');
      return;
    }

    t.task.taskType = t.param['TaskType'];
    if (id) t.updateTask();
    else t.addTask();
    t.viewBase.currentView.closeSidebarRight();
  }
}
