import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  Input,
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
@Component({
  selector: 'app-assign-info',
  templateUrl: './assign-info.component.html',
  styleUrls: ['./assign-info.component.scss'],
})
export class AssignInfoComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
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
  @Input() task = new TM_Tasks();
  functionID: string;
  @Input('viewBase') viewBase: ViewsComponent;
  title = 'Giao việc';
  dialog: any;
  actionAssign = new BehaviorSubject<any>(null);
  isActionAssign = this.actionAssign.asObservable();
  dataAddNew = new BehaviorSubject<any>(null);
  isAddNew = this.dataAddNew.asObservable();
  updateData = new BehaviorSubject<any>(null);
  isUpdate = this.updateData.asObservable();
  constructor(
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.task = {
      ...this.task,
      ...dt?.data,
    };
    this.dialog = dialog;
    this.user = this.authStore.get();
    // this.functionID = this.activedRouter.snapshot.params['funcID'];
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.openInfo();
  }

  showPanel() {
    //this.viewBase.currentView.openSidebarRight();
  }
  closePanel() {
    this.dialog.close()
    //this.viewBase.currentView.closeSidebarRight();
  }

  openInfo() {
    this.listUser = [];
    this.listMemo2OfUser = [];
    this.listTodo = [];
    // this.task = taskAction;
    if (this.task.memo == null) this.task.memo = '';
    this.listTaskResources = [];
    //this.functionID = "TMT02"
    // if(this.task.assignTo !=null || this.task.assignTo !=""){
    //   this.listUser =  this.task.assignTo.split(";");
    //   this.listUser.forEach((u) => {
    //     var obj = { userID: u.userID, memo2: null };
    //     this.listMemo2OfUser.push(obj);
    //   });
    // }
    this.changeDetectorRef.detectChanges();
    // this.viewBase.currentView.openSidebarRight();
  }
  openTask() {}

  changText(e) {
    this.task.taskName = e.data;
  }

  changeTime(data) {
    if (!data.field) return;
    this.task[data.field] = data.data.fromDate;
  }

  changeMemo(event: any) {
    var field = event.field;
    var dt = event.data;
    this.task.memo = dt?.value ? dt.value : dt;
  }
  changeUser(e) {
    this.listMemo2OfUser = [];
    this.listUser = [];
    var assignTo = e.data.join(';')
    if (e.data.length == 0) {
      this.task.assignTo = '';
      return ;
    } else if (this.task.assignTo != null && this.task.assignTo != '') {
      this.task.assignTo += ';' + assignTo;
    } else this.task.assignTo = assignTo;

    this.listUser = this.task.assignTo.split(';');
    this.listUser.forEach((u) => {
      var obj = { userID: u.userID, memo2: null };
      this.listMemo2OfUser.push(obj);
    });
  }

  eventApply(e){

  }
  saveAssign(id, isContinue) {
    if (this.task.assignTo == null || this.task.assignTo == '') {
      this.notiService.notify('Phải thêm người được giao việc !');
      this.notiService.notifyCode('T0001');
      return;
    }
    this.convertToListTaskResources();
    this.tmSv
      .saveAssign([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
      ])
      .subscribe((res) => {
        if (res.data && res.data.length) {
          res.data.forEach((dt) => {
            var data = dt;
            if (data.taskID == id) {
              this.updateData.next(data);
            } else this.dataAddNew.next(data);
          });
          this.notiService.notify('Giao việc thành công !');
          if (!isContinue) {
            this.closePanel();
          }
          this.resetForm();
        } else {
          this.notiService.notifyCode('TM002'); /// call sau
          return;
        }
      });
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

  resetForm() {
    this.listUser = [];
    this.listMemo2OfUser = [];
    this.listUserDetail = [];
    this.listTaskResources = [];
    this.listTodo = [];
    this.task = new TM_Tasks();
    this.task.status = '1';
  }

  fileAdded(e){

  }
}
