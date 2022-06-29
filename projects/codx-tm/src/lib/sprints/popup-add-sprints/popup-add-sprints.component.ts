import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { CodxTMService } from '../../codx-tm.service';
import { TM_Sprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'lib-popup-add-sprints',
  templateUrl: './popup-add-sprints.component.html',
  styleUrls: ['./popup-add-sprints.component.css'],
})
export class PopupAddSprintsComponent implements OnInit {
  taskBoard = new TM_Sprints();
  title = 'Thêm Task Board';
  readOnly = false;
  listUserDetail = [];
  action: string = '';
  dialog: any;
  user: any;
  funcID: string = '';
  // @Input('viewBase') viewBase: ViewsComponent;
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
    this.taskBoard = {
      ...this.taskBoard,
      ...dt?.data[0],
    };
    this.action = dt?.data[1];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.funcID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    if (!this.taskBoard.iterationID) {
      // this.openTask();
    } else {
      if (this.action == 'copy')
        return this.getSprintsCoppied(this.taskBoard.iterationID);
      else this.openInfo(this.taskBoard.iterationID, this.action);
    }
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'AddEditSprintAsync';
    if (this.taskBoard.iterationID != null) {
      data = [this.taskBoard, false];
    } else {
      data = [this.taskBoard, true];
    }
    op.data = data;
    return true;
  }

  saveData(id) {
    if (
      this.taskBoard.iterationName == null ||
      this.taskBoard.iterationName.trim() == ''
    )
      return this.notiService.notify('Tên Task Board không được để trống !');
    if (this.taskBoard.projectID == '') this.taskBoard.projectID = null;
    if (!this.taskBoard.isShared) this.taskBoard.resources = null;
     var isAdd
  }

  addTaskBoard(taskBoard, isAdd: boolean) {
    this.tmSv.addTaskBoard([taskBoard, isAdd]).subscribe((res) => {
      if (res) {
        // if (taskBoard.iterationID) {
        //   this.updateData.next(res);
        // } else
        //   this.dataAddNew.next(res);
        // this.closeTaskBoard();
      }
    });
  }

  closeTaskBoard() {
    this.listUserDetail = [];
    this.taskBoard = new TM_Sprints();
    //data user để test
    this.taskBoard.resources = 'PMNHI;NVHAO;NTLOI'; //test
    this.getListUser(this.taskBoard.resources);
    //this.viewBase.currentView.closeSidebarRight();
  }
  changeMemo(event: any) {
    var field = event.field;
    var dt = event.data;
    this.taskBoard.memo = dt?.value ? dt.value : dt;
  }
  changeVLL(e: any) {
    this.taskBoard[e.field] = e.data;
  }
  cbxChange(e: any) {
    this.taskBoard.projectID = e[0];
  }
  changText(e: any) {
    this.taskBoard.iterationName = e.data;
  }
  changeShare(e: any) {
    if (!this.taskBoard.isShared) {
      this.taskBoard.resources = null;
      this.listUserDetail = [];
    }
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
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
  onDeleteUser(userID) {
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
    }
    this.listUserDetail = listUserDetail;
    var resources = '';
    if (listUserDetail.length > 0) {
      listUserDetail.forEach((user) => {
        resources += user.userID + ';';
      });
      resources = resources.slice(0, -1);
      this.taskBoard.resources = resources;
    } else this.taskBoard.resources = '';
  }

  openInfo(interationID, action) {
    const t = this;
    t.taskBoard = new TM_Sprints();

    t.readOnly = action === 'edit' ? false : true;
    t.title =
      action === 'edit' ? 'Chỉnh sửa task board' : 'Xem chi tiết task board';
    t.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        t.taskBoard = res;
        if (t.taskBoard.resources) t.getListUser(t.taskBoard.resources);
        else this.listUserDetail = [];
        t.changeDetectorRef.detectChanges();
      }
    });
  }

  getSprintsCoppied(interationID) {
    const t = this;
    t.title = 'Copy task boads';
    t.readOnly = false;
    t.listUserDetail = [];
    t.taskBoard = new TM_Sprints();
    t.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        t.taskBoard.projectID = res.projectID;
        t.taskBoard.iterationName = res.iterationName;
        t.taskBoard.memo = res.memo;
        t.changeDetectorRef.detectChanges();    
      }
    });
  }
 
  valueChangeShared(e){
    console.log(e)
  }

   //caí này chạy tạm đã
   eventApply(e: any) {
    var resources = '';
    var i = 0;
    e.forEach(obj => {
      if (obj?.data && obj?.data != '') {
        switch (obj.objectType) {
          case 'U':
            resources += obj?.data;
            this.valueSelectUser(resources)
            break;
          // case 'D':
          //   //chưa chạy xong câu lệnh này đã view ra...
          //   const t = this;
          //   var depID = obj?.data.substring(0, obj?.data.length - 1);
          //   t.tmSv.getUserByDepartment(depID).subscribe(res => {
          //     if (res) {
          //       assignTo += res + ";";
          //       this.valueSelectUser(assignTo)
          //     }
          //   })
          //   break;
        }
      }
    })
  }
  valueSelectUser(resources) {
    this.getListUser(resources)
     this.changeDetectorRef.detectChanges();
   }

}
