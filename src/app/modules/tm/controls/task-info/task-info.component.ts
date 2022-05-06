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
  NotificationsService,
} from 'codx-core';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';

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
  listUser: any;
  listTodo: TaskGoal[];
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  task = new TM_Tasks();
  functionID: string;
  view = '';
  action = '';
  contentTodoEdit = '';
  recIDTodoDelete = '';
  indexEditTodo = -1;
  required = {
    taskName: false,
  };
  @Input('sidebar') sidebar: SidebarComponent;
 
  @ViewChild('contentPopup') contentPopup;
  @ViewChild('contentAddUser') contentAddUser;
  @ViewChild('contentListTask') contentListTask;
  @ViewChild('panelTask') panelTask;
  @ViewChild('txtTodoEdit') txtTodoEdit: ElementRef;
  // @ViewChild("attachment") attachmentComponent: AttachmentComponent;
  @ViewChild('tags') tagsComponent: TagsComponent;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private modalService: NgbModal,
    // private cbxsv: ComboboxpopupService,
    private authStore: AuthStore,
    private tmSv: TmService,
    private cache: CacheService,
    // private fileSv: FilesService,
    // private dMService: DMService,
    private notiService: NotificationsService // private confirmationDialogService: ConfirmationDialogService
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    const t = this;
    // this.cache.gridViewSetup("Tasks", "grvTasks").then((res) => {
    //   if (res) t.grvSetup = res;
    // });
    // this.getParam();
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

    this.tmSv.isCopy.subscribe((res) => {
      if (res) {
        t.view = res.view;
        t.functionID = res.functionID;
        t.getTaskCoppied(res.id);
      }
    });
  }

  getTaskCoppied(id) {
    const t = this;
    this.tmSv.getTask(id).subscribe((res) => {
      if (res && res.length) {
        t.task = res[0];
        t.listUser = res[1];
        t.listTodo = res[2];
        t.beforeCopy(t.task);
      }
    });
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

  onOpenTodo() {
    if (!this.disableAddToDo) {
      this.onAddToDo();
    } else {
      this.disableAddToDo = !this.disableAddToDo;
      // if (this.listTodo && this.listTodo.length)
      //   this.listTodo = [];
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
  removeUserRight(index) {
    this.listUser.splice(index, 1); //remove element from array
    this.changeDetectorRef.detectChanges();
  }

  SaveData(id) {
    // this.task.taskType = this.param['TaskType'];
    // if (id) this.updateTask();
    // else this.addTask();
    this.sidebar.hide();
  }

  addTask(isCloseFormTask: boolean = true) {
    this.tmSv
      .addTask([this.task, this.listTodo, this.functionID])
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res.message);
          if (res.data) {
            var dataPriority = res.data[0];
            if (dataPriority.priority == '1') {
              if (
                dataPriority.priorityColor == null &&
                dataPriority.priorityIcon == null
              ) {
                dataPriority.priorityColor = '#66a3ff';
                dataPriority.priorityIcon = 'fa fa-flag-o';
              }
            } else if (dataPriority.priority == '2') {
              if (
                dataPriority.priorityColor == null &&
                dataPriority.priorityIcon == null
              ) {
                dataPriority.priorityColor = '#ffd11a';
                dataPriority.priorityIcon = 'fa fa-flag-o';
              }
            } else if (dataPriority.priority == '3') {
              if (
                dataPriority.priorityColor == null &&
                dataPriority.priorityIcon == null
              ) {
                dataPriority.priorityColor = '#ff6600';
                dataPriority.priorityIcon = 'fa fa-flag-o';
              }
            }
            let obj = this.tmSv.changeData.value;
            let array = res.data.concat(obj.data);
            obj.data = array;
            obj.view = this.view;
            this.tmSv.setChangeData(obj);
          }
          this.listTodo = [];
          this.listUser = [];
          this.task = new TM_Tasks();
          if (isCloseFormTask) {
            this.closeTask();
          } else {
            if (res?.data?.length > 0) {
              let task = res.data[0];
              // this.openFormAttach(task?.parentID ?? task?.taskID);
            }
          }
        } else {
          this.notiService.notify('', 'TM002');
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
      ])
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res.message);
          var dataPriority = res.data[0];
          if (dataPriority.priority == '1') {
            if (
              dataPriority.priorityColor == null &&
              dataPriority.priorityIcon == null
            ) {
              dataPriority.priorityColor = '#66a3ff';
              dataPriority.priorityIcon = 'fa fa-flag-o';
            }
          } else if (dataPriority.priority == '2') {
            if (
              dataPriority.priorityColor == null &&
              dataPriority.priorityIcon == null
            ) {
              dataPriority.priorityColor = '#ffd11a';
              dataPriority.priorityIcon = 'fa fa-flag-o';
            }
          } else if (dataPriority.priority == '3') {
            if (
              dataPriority.priorityColor == null &&
              dataPriority.priorityIcon == null
            ) {
              dataPriority.priorityColor = '#ff6600';
              dataPriority.priorityIcon = 'fa fa-flag-o';
            }
          }
          let obj = this.tmSv.changeData.value;
          obj.view = this.view;
          if (res?.data.length > 0) {
            let listTask = res?.data as Array<any>;
            listTask.forEach((item) => {
              let index = obj.data.findIndex((p) => p.id == item.id);
              if (index >= 0) {
                obj.data[index] = item;
              }
            });
          }
          this.tmSv.setChangeData(obj);
          this.listTodo = [];
          this.listUser = [];
          this.task = new TM_Tasks();
          this.closeTask();
        } else {
          this.notiService.notify('', 'TM002');
          return;
        }
      });
  }

  openEditor(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'md',
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
      this.task.endDate = moment(new Date(data.data)).add(1, 'hours').toDate();
    }
    if (data.field == 'startDate' || data.field == 'endDate') {
      if (this.task.startDate && this.task.endDate)
        this.task.estimated = moment(this.task.endDate).diff(
          moment(this.task.startDate),
          'hours'
        );
    }
  }

  changeVLL(data) {
    this.task[data.field] = data.data.value;
  }

  cbxChange(data) {
    if (data.field == 'taskGroupID') {
      this.task.taskGroupID = data.data.TaskGroupID;
      this.loadTodoByGroup();
    }
    if (data.field == 'projectID') this.task.projectID = data.data.ProjectID;
  }

  loadTodoByGroup() {}

  openTask(): void {
    // this.readOnly = false;
    // this.task = new TM_Tasks();
    // this.listTodo = [];
    // this.listUser = [];
    // this.task.status = "1";
    // this.task.dueDate = moment(new Date())
    //   .set({ hour: 23, minute: 59, second: 59 })
    //   .toDate();
    // this.changeDetectorRef.detectChanges();
    // if (!this.param)
    //   this.getParam(function (o) {
    //     if (o) this.panelTask?.nativeElement.classList.add("offcanvas-on");
    //   });
    // else {
    //   this.panelTask?.nativeElement.classList.add("offcanvas-on");
    // }
  }

  valueChangeUser(event) {
    if (event?.valueSeleteds) {
      this.task.assignTo = event?.valueSeleteds;
    }
  }

  openInfo(id, action) {
    // const t = this;
    // t.task = new TM_Tasks();
    // t.readOnly = action === "edit" ? false : true;
    // t.disableAddToDo = true;
    // this.tmSv.getTask(id).subscribe((res) => {
    //   if (res && res.length) {
    //     t.task = res[0];
    //     t.listUser = res[1] || [];
    //     t.listTodo = res[2];
    //     t.changeDetectorRef.detectChanges();
    //     t.panelTask?.nativeElement.classList.add("offcanvas-on");
    //   }
    // });
  }

  beforeCopy(data) {
    const t = this;
    // if (!t.grvSetup) {
    //   t.cache.gridViewSetup("Tasks", "grvTasks").then((res) => {
    //     if (res) {
    //       t.beforeCopy(data);
    //     }
    //   });
    // } else {
    //   let obj = t.grvSetup;
    //   let newTask = new TM_Tasks();
    //   for (var fieldName in obj) {
    //     if (fieldName && obj[fieldName].allowCopy) {
    //       newTask[t.tmSv.lowerFirstLetter(fieldName)] =
    //         data[t.tmSv.lowerFirstLetter(fieldName)];
    //     }
    //   }
    //   t.task = newTask;
    //   t.task.taskID = "";
    //   t.changeDetectorRef.detectChanges();
    //   this.panelTask?.nativeElement.classList.add("offcanvas-on");
    // }
  }

  extendShow() {
     this.panelTask.nativeElement.classList.toggle("extend-show");
  }

  closeTask(): void {
    // if (this.tagsComponent.isOpen) this.tagsComponent.close();

    // this.required.taskName = false;
     this.disableAddToDo = true;
     this.panelTask.nativeElement.classList.remove("extend-show");
    // this.panelTask.nativeElement.classList.remove("offcanvas-on");
    // this.tmSv.showPanel.next(null);
    this.sidebar.hide();
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

  public onCreated(args: any) {
    this.sidebar.element.style.visibility = '';
    this.sidebar.position ="Right";
  }
  closeClick(): void {
    this.sidebar.hide();
  }

  toggleClick(): void {
    this.sidebar.show();
  }
}
