import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
  ViewsComponent,
} from 'codx-core';
import { BehaviorSubject, map } from 'rxjs';
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
import * as moment from 'moment';
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
  idUserSelected: string;
  listUserDetail: any[] = [];
  listTodo: TaskGoal[];
  listTaskResources: tmpTaskResource[] = [];
  todoAddText: any;
  disableAddToDo = true;
  grvSetup: any;
  param: any;
  task: TM_Tasks = new TM_Tasks();
  functionID: string;
  popover: any;
  title = 'Giao việc';
  dialog: any;
  vllShare = 'TM003';
  vllRole = 'TM001';
  listRoles = [];
  isHaveFile = false;
  taskParent : any;
  refID = "";
  refType= "" ;

  constructor(
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.task = {
      ...this.task,
      ...dt?.data[0],
    };
    this.refID = this.task?.refID;
    this.refType= this.task?.refType;
    if(this.task?.taskID) this.taskParent = this.task ;
    this.vllShare = dt?.data[1] ? dt?.data[1] : this.vllShare;
    this.vllRole = dt?.data[2] ? dt?.data[2] : this.vllRole;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    // if (this.task.taskID) this.taskParent = this.task ;
    this.setDefault();
    // else this.openInfo();
  }

  setDefault() {
    this.api
      .execSv<number>('TM', 'CM', 'DataBusiness', 'GetDefaultAsync', [
        this.functionID,
        'TM_Tasks',
        'taskID',
      ])
      .subscribe((response: any) => {
        if (response) {
          response['_uuid'] = response['taskID'] ?? Util.uid();
          response['idField'] = 'taskID';
          response['isNew'] = function () {
            return response[response.taskID] != response['_uuid'];
          };
          response['taskID'] = response['_uuid'];
          this.task = response;
          this.openInfo();
        }
      });
  }

  closePanel() {
    this.dialog.close();
  }

  openInfo() {
    this.task.dueDate = moment(new Date())
      .set({ hour: 23, minute: 59, second: 59 })
      .toDate();
    this.listUser = [];
    this.listTaskResources = [];
    this.task.category = "3"
    this.task.status = "10" ;
    this.task.refID = this.refID
    this.task.refType = this.refType;
    if(this.taskParent){
      this.task.taskName = this.taskParent.taskName ;
      this.task.refID = this.taskParent.recID;
      this.task.memo = this.taskParent.memo;
      this.task.memo2 = this.taskParent.memo2;
      this.task.taskGroupID = this.taskParent.taskGroupID;
      this.task.projectID = this.taskParent.projectID;
      this.task.location = this.taskParent.location;
      this.task.tags = this.taskParent.tags;
      this.task.refID = this.taskParent.refID;
      this.task.taskType = this.taskParent.taskType;
    }

    // if (this.task.memo == null) this.task.memo = '';
    // if (this.task.assignTo != null && this.task.assignTo != '') {
    //   this.listUser = this.task.assignTo.split(';');
    //   this.api
    //     .execSv<any>(
    //       'TM',
    //       'ERM.Business.TM',
    //       'TaskResourcesBusiness',
    //       'GetListTaskResourcesByTaskIDAsync',
    //       this.task.taskID
    //     )
    //     .subscribe((res) => {
    //       if (res) {
    //         this.listTaskResources = res;
    //       }
    //     });

    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetListUserDetailAsync',
    //     this.task.assignTo
    //   )
    //   .subscribe((res) => {
    //     this.listUserDetail = this.listUserDetail.concat(res);
    //   });
    // }

    this.changeDetectorRef.detectChanges();
  }


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


  saveAssign(id, isContinue) {
    if (this.task.taskName == null || this.task.taskName.trim() == '') {
      this.notiService.notifyCode('TM027');
      return;
    }
    if (this.task.assignTo == null || this.task.assignTo == '') {
      this.notiService.notifyCode('TM011');
      return;
    }
    if (this.isHaveFile)
      this.attachment.saveFiles();
    var taskIDParent = this.taskParent?.taskID ? this.taskParent?.taskID:null ;
    this.tmSv
      .saveAssign([this.task, this.functionID, this.listTaskResources, null,taskIDParent])
      .subscribe((res) => {
        if (res[0]) {
          this.notiService.notifyCode('TM006');
          this.dialog.close(res[1]);
          if (!isContinue) {
            this.closePanel();
          }
          this.resetForm();
        } else {
          this.notiService.notifyCode('TM038'); 
          return;
        }
      });
  }

  onDeleteUser(userID) {
    var listUser = [];
    var listUserDetail = [];
    var listTaskResources = [];
    for (var i = 0; i < this.listTaskResources.length; i++) {
      if (this.listUser[i] != userID) {
        listUser.push(this.listUser[i]);
      }
      // if (this.listUserDetail[i].userID != userID) {
      //   listUserDetail.push(this.listUserDetail[i]);
      // }
      if (this.listTaskResources[i]?.resourceID != userID) {
        listTaskResources.push(this.listTaskResources[i]);
      }
    }
    this.listUser = listUser;
    // this.listUserDetail = listUserDetail;
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
    if (e.data.length > 0) this.isHaveFile = true; else this.isHaveFile = false;
  }
  eventApply(e: any) {
    var assignTo = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
      // if (obj?.data && obj?.data != '') {
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;
        case 'O':
        case 'D':
          listDepartmentID += obj.id + ';';
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
          this.getListUser(assignTo);
        }
      } else {
        this.task.assignTo = assignTo;
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
    this.listUser = this.listUser.concat(arrUser);
    // arrUser.forEach((u) => {
    //   var taskResource = new tmpTaskResource();
    //   taskResource.resourceID = u;
    //   taskResource.roleType = 'R';
    //   this.listTaskResources.push(taskResource);
    // });
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListUserDetailAsync',
        listUser
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var taskResource = new tmpTaskResource();
            taskResource.resourceID = emp.userID;
            taskResource.resourceName = emp.userName;
            taskResource.positionName = emp.positionName;
            taskResource.roleType = 'R';
            this.listTaskResources.push(taskResource);
          };
        }
        // this.listUserDetail = this.listUserDetail.concat(res);
      });
  }
  showPopover(p, userID) {
    if (this.popover)
      this.popover.close();
    if (userID)
      this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }
  hidePopover(p) {
    p.close();
  }

  selectRoseType(idUserSelected, value) {

    this.listTaskResources.forEach(res => {
      if (res.resourceID == idUserSelected) res.roleType = value;
    })
    this.changeDetectorRef.detectChanges()

    this.popover.close();
  }

}
