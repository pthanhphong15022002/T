import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';

import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { count } from 'console';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'app-popup-share-sprints',
  templateUrl: './popup-share-sprints.component.html',
  styleUrls: ['./popup-share-sprints.component.scss'],
})
export class PopupShareSprintsComponent implements OnInit {
  title = 'Chia sẻ view board';
  data: any;
  dialog: any;
  searchField = '';
  listUserDetailOld = [];
  listIdUserOld = [];
  listIdUser = [];
  userID = '';
  listUserDetail = [];
  taskBoard: any;
  vllShare: any;
  constructor(
    private api: ApiHttpService,
    private tmSv: CodxTMService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.taskBoard = this.data.boardAction;
    this.title = this.data?.title;
    this.vllShare = this.data?.vllShare;
    this.listUserDetailOld = this.data.listUserDetail;
    this.listUserDetail = this.listUserDetailOld;
    for (var i = 0; i < this.listUserDetail.length; i++) {
      this.listIdUser.push(this.listUserDetail[i].userID);
    }
    this.listIdUserOld = this.listIdUser;
  }
  ngOnInit(): void {}

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
          this.notiService.notifyCode('SYS015');
        } else {
          this.notiService.notifyCode('SYS016');
        }
        this.dialog.close();
      });
  }

  //caí này chạy tạm đã
  eventApply(e: any) {
    var resources = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
      if (obj.objectType && obj.id) {
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
        }
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
          resources += res;
          if (listUserID != '') resources += ';' + listUserID;
          this.valueSelectUser(resources);
        }
      });
    } else this.valueSelectUser(listUserID);
  }

  valueSelectUser(resources) {
    if (resources != '') {
      if (this.listIdUser.length > 0) {
        var arrResource = resources.split(';');
        var arrNew = [];
        var oldListUser = this.listIdUser.join(';');
        arrResource.forEach((e) => {
          if (!oldListUser.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          resources = arrNew.join(';');
          this.getListUser(resources);
        }
      } else {
        this.getListUser(resources);
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    this.listIdUser = this.listIdUser.concat(listUser.split(';'));
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(listUser.split(';'))
      )
      .subscribe((res) => {
        this.listUserDetail = this.listUserDetail.concat(res);
      });
  }
}
