import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';

import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { count } from 'console';

@Component({
  selector: 'app-popup-share-sprints',
  templateUrl: './popup-share-sprints.component.html',
  styleUrls: ['./popup-share-sprints.component.scss'],
})
export class PopupShareSprintsComponent implements OnInit {
  title = "Chia sẻ view board"
  data: any;
  dialog: any;
  searchField = '';
  listUserDetailOld = [];
  listIdUserOld = [];
  listIdUser = [];
  userID = '';
  listUserDetail = [];
  taskBoard: any;
  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.taskBoard = this.data.boardAction;
    this.listUserDetailOld = this.data.listUserDetail;
    this.listUserDetail = this.listUserDetailOld;
    for (var i = 0; i < this.listUserDetail.length; i++) {
      this.listIdUser.push(this.listUserDetail[i].userID);
    }
    this.listIdUserOld = this.listIdUser;
  }
  ngOnInit(): void { }

  onDeleteUser(userID) {
    var listUserDetail = [];
    var listIdUser = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
        listIdUser.push(this.listUserDetail[i].userID);
      }
    }
    this.listUserDetail = listUserDetail;
    this.listIdUser = listIdUser;
    this.changeDetectorRef.detectChanges();
  }
  saveData() {
    var strIdUser = '';
    if (this.listIdUser.length > 0) {
      strIdUser = this.listIdUser[0];
      for (var i = 1; i < this.listIdUser.length; i++) {
        strIdUser += ';' + this.listIdUser[i];
      }
    }
    this.api
      .execSv('TM', 'TM', 'SprintsBusiness', 'AddShareOfSprintsAsync', [
        this.taskBoard.iterationID,
        strIdUser,
      ])
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS015')
        } else {
          this.notiService.notifyCode('SYS016')
        }
        this.dialog.close();
      });
  }

  //caí này chạy tạm đã
  eventApply(e: any) {
    var resources = '';
    e?.data?.forEach((obj) => {
      // if (obj?.data && obj?.data != '') {
      switch (obj.objectType) {
        case 'U':
          resources += obj.id + ';';
          break;
        //  case 'D':
        //   resources += obj.id+";";
        //    break;
      }
      //  }
    });
  }

  valueSelectUser(resources) {
    if (resources != '') {
      resources = resources.substring(0, resources.length - 1);
      this.getListUser(resources);
      this.changeDetectorRef.detectChanges();
    }
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    this.listIdUser = this.listIdUser.concat(listUser.split(";"));
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
}
