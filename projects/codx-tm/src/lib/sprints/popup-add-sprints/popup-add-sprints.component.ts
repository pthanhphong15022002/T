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
  @Input() taskBoard = new TM_Sprints();
  title = 'Task Board';
  readOnly = false;
  listUserDetail = [];
  // dataAddNew = new BehaviorSubject<any>(null);
  // isAddNew = this.dataAddNew.asObservable();
  // updateData = new BehaviorSubject<any>(null);
  // isUpdate = this.updateData.asObservable();
  dialog: any;
  user: any;
  @Input('viewBase') viewBase: ViewsComponent;
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
    // this.task = dt?.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
  }

  ngOnInit(): void {}

  saveData(id) {
    if (
      this.taskBoard.iterationName == null ||
      this.taskBoard.iterationName.trim() == ''
    )
      return this.notiService.notify('Tên Task Board không được để trống !');
    if (this.taskBoard.projectID == '') this.taskBoard.projectID = null;
    if (!this.taskBoard.isShared) this.taskBoard.resources = null;
    if (id) {
      this.addTaskBoard(this.taskBoard, false);
    } else this.addTaskBoard(this.taskBoard, true);
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
        this.listUserDetail = res;
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
        t.showPanel();
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
        t.showPanel();
      }
    });
  }
  showPanel() {}
  closePanel() {}

  openDialog() {
    // let obj = {
    //   formName: 'demo',
    //   control: '1',
    //   value: '5',
    //   text: 'demo nè',
    // };
    //   this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', 'obj');
  }
}
