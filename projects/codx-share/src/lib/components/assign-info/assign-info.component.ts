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
  @ViewChild('attachment') attachment:AttachmentComponent 
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
  @Input() vllShare = "L1906"

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
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.openInfo();
  }

  showPanel() {
  
  }
  closePanel() {
    this.dialog.close()
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

  saveAssign(id, isContinue) {
    if (this.task.assignTo == null || this.task.assignTo == '') {
      this.notiService.notify('Phải thêm người được giao việc !');
      this.notiService.notifyCode('T0001');
      return;
    }
    this.convertToListTaskResources();
    this.attachment.saveFiles() ;
    this.tmSv
      .saveAssign([
        this.task,
        this.functionID,
        this.listTaskResources,
        this.listTodo,
      ])
      .subscribe((res) => {
        if (res && res.length) {
          this.dialog.dataService.data = res.concat(this.dialog.dataService.data);
          this.dialog.dataService.setDataSelected(res[0]);
          this.dialog.dataService.afterSave.next(res);
          this.changeDetectorRef.detectChanges();
          this.dialog.close();
          this.notiService.notifyCode('TM006');    
          if (!isContinue) {
            this.closePanel();
          }
          this.resetForm();
        } else {
          this.notiService.notify('Giao việc không thành công ! Hãy thử lại'); /// call sau
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

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e){

  }
  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
     // if (obj?.data && obj?.data != '') {
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id+';';
            break;
          case 'D':
            listDepartmentID += obj.id+";";
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
          // this.getListUser(assignTo);
        }
      } else {
        this.task.assignTo = assignTo;
        // this.getListUser(assignTo);
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  // getListUser(listUser) {
  //   // this.listMemo2OfUser = [];
  //   while (listUser.includes(' ')) {
  //     listUser = listUser.replace(' ', '');
  //   }
  //   var arrUser = listUser.split(';');
  //   this.listUser = this.listUser.concat(arrUser);
  //   arrUser.forEach((u) => {
  //     var obj = { userID: u.userID, memo2: null };
  //     this.listMemo2OfUser.push(obj);
  //   });
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskBusiness',
  //       'GetListUserDetailAsync',
  //       listUser
  //     )
  //     .subscribe((res) => {
  //       this.listUserDetail = this.listUserDetail.concat(res);
  //     });
  // }
}
