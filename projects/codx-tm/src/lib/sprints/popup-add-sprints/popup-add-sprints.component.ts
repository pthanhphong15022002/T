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
  resources = '';
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
       this.taskBoard.viewMode='1';
    } else {
      if (this.action == 'copy')
         this.getSprintsCoppied(this.taskBoard.iterationID);
      else this.openInfo(this.taskBoard.iterationID, this.action);
    }
  }

  beforeSave(op: any, isAdd) {
    var data = [];
    op.method = 'AddEditSprintAsync';
    data = [this.taskBoard, isAdd];
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
    if (this.resources == '') this.taskBoard.resources = null;
    else this.taskBoard.resources = this.resources;
    var isAdd = id ? false : true;
    this.addTaskBoard(isAdd);
  }

  addTaskBoard(isAdd: boolean) {
    // this.tmSv.addTaskBoard([taskBoard, isAdd]).subscribe((res) => {
    //   if (res) {
    //     // if (taskBoard.iterationID) {
    //     //   this.updateData.next(res);
    //     // } else
    //     //   this.dataAddNew.next(res);
    //     // this.closeTaskBoard();
    //   }
    // });
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option, isAdd))
      .subscribe((res) => {
        if (res.save) {
          this.notiService.notifyCode('TM005');
        }
        if (res.update) {
        this.notiService.notifyCode('E0528');
        }
        this.dialog.close();
      });
  }

  closeTaskBoard() {
    this.listUserDetail = [];
    this.taskBoard = new TM_Sprints();
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
    if (e?.data.length>0) {
      this.taskBoard[e.field] = e.data[0];
    }
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
    if (this.resources == '') this.resources = listUser;
    else this.resources += ';' + listUser;
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
      this.resources = resources;
    } else this.resources = '';
  }

  openInfo(interationID, action) {
    // this.taskBoard = new TM_Sprints();

    this.readOnly = false 
    this.title ='Chỉnh sửa task board' ;
      this.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        this.taskBoard = res;
        if (this.taskBoard.resources) this.getListUser(this.taskBoard.resources);
        else this.listUserDetail = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getSprintsCoppied(interationID) {
    this.title = 'Copy task boads';
    this.readOnly = false;
    this.listUserDetail = [];
    this.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        this.taskBoard.projectID = res.projectID;
        this.taskBoard.iterationName = res.iterationName;
        this.taskBoard.viewMode = res.viewMode;
        this.taskBoard.memo = res.memo;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  valueChangeShared(e) {
    this.taskBoard.isShared = e.data
    if (!this.taskBoard.isShared) {
      this.taskBoard.resources = null;
      this.listUserDetail = [];
    }
  }

  eventApply(e: any) {
    var resources = '';
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
          resources += res;
          if (listUserID != '') resources += ';' + listUserID;
          this.valueSelectUser(resources);
        }
      });
    } else this.valueSelectUser(listUserID);
  }

  valueSelectUser(resources) {
    if (resources != '') {
      if (this.taskBoard.resources && this.taskBoard.resources != '') {
        var arrAssign = resources.split(';');
        var arrNew = [];
        arrAssign.forEach((e) => {
          if (!this.taskBoard.resources.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          resources = arrNew.join(';');
          this.taskBoard.resources += ';' + resources;
          this.getListUser(resources);
        }
      } else {
        this.taskBoard.resources = resources;
        this.getListUser(resources);
      }
    }
    this.changeDetectorRef.detectChanges();
  }
}
