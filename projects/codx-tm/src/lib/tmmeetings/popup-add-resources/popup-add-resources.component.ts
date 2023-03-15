import { CodxTMService } from './../../codx-tm.service';
import {
  CO_Meetings,
  CO_Permissions,
  EP_BookingAttendees,
} from './../../models/CO_Meetings.model';
import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  CodxFormComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CO_Resources } from '../../models/CO_Meetings.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-popup-add-resources',
  templateUrl: './popup-add-resources.component.html',
  styleUrls: ['./popup-add-resources.component.css'],
})
export class PopupAddResourcesComponent implements OnInit {
  @ViewChild('form') form: TemplateRef<any>;
  meeting = new CO_Meetings();
  dialog: any;
  title = '';
  listRoles: any;
  permissions: CO_Permissions[] = [];
  popover: any;
  idUserSelected: any;
  lstPermissions: CO_Permissions[] = [];
  data: any;
  funcID: any;
  constructor(
    private cache: CacheService,
    private changeDetec: ChangeDetectorRef,
    private tmSv: CodxTMService,
    private api: ApiHttpService,
    private noti: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt.data;
    this.meeting = JSON.parse(JSON.stringify(this.data.data));
    this.title = this.data.title;
    this.funcID = this.data.funcID;
    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.listRoles = res.datas;
      }
    });
    this.permissions = this.meeting.permissions;
  }

  ngOnInit(): void {}

  //#region save
  onSave() {
    this.api
      .callSv('CO', 'CO', 'MeetingsBusiness', 'UpdateResourcesMeetingAsync', [
        this.meeting.meetingID,
        this.meeting.permissions,
      ])
      .subscribe((res) => {
        if (res.msgBodyData[0] != null) {
          this.dialog.close(this.meeting);
          this.AddResourcesToBookingAttendees(
            this.meeting.recID,
            this.meeting.permissions
          );
          if (this.lstPermissions != null && this.lstPermissions.length > 0) {
            this.tmSv
              .SendMailNewResources(
                this.meeting.recID,
                'TM_0023',
                this.funcID,
                this.lstPermissions
              )
              .subscribe();
          }
          this.noti.notifyCode('SYS034');
        } else {
          this.dialog.close();
          this.noti.notify('Mời người không thành công');
        }
      });
  }

  AddResourcesToBookingAttendees(recID, data) {
    var list = [];
    data.forEach((e) => {
      if (e) {
        var attendees = new EP_BookingAttendees();
        attendees.userID = e.resourceID;
        attendees.userName = e.resourceName;
        attendees.roleType = e.roleType;
        list.push(attendees);
      }
    });
    if (list && list.length > 0) {
      this.api
        .callSv('EP', 'EP', 'BookingsBusiness', 'InviteAttendeesAsync', [
          recID,
          list,
        ])
        .subscribe();
    }
  }
  //#endregion
  //#region event
  eventApply(e) {
    var listUserID = '';
    var listDepartmentID = '';
    var listUserIDByOrg = '';
    var type = 'U';
    e?.data?.forEach((obj) => {
      type = obj.objectType;
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;
        case 'O':
        case 'D':
          listDepartmentID += obj.id + ';';
          break;
      }
    });
    if (listUserID != '') {
      listUserID = listUserID.substring(0, listUserID.length - 1);
      this.valueUser(listUserID);
    }

    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    if (listDepartmentID != '') {
      this.tmSv
        .getListUserIDByListOrgIDAsync([listDepartmentID, type])
        .subscribe((res) => {
          if (res) {
            listUserIDByOrg += res;
            if (listUserID != '') listUserIDByOrg += ';' + listUserID;
            this.valueUser(listUserIDByOrg);
          }
        });
    }
  }

  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.permissions != null) {
        var user = this.permissions;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.objectID + ';';
        });
        if (id != '') {
          id = id.substring(0, id.length - 1);

          array.forEach((element) => {
            if (!id.split(';').includes(element)) arrayNew.push(element);
          });
        }
        if (arrayNew.length > 0) {
          resourceID = arrayNew.join(';');
          id += ';' + resourceID;
          this.getListUser(resourceID);
        }
      } else {
        this.getListUser(resourceID);
      }
    }
  }

  getListUser(resource) {
    while (resource.includes(' ')) {
      resource = resource.replace(' ', '');
    }
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource = new CO_Permissions();
            tmpResource.objectID = emp?.userID;
            tmpResource.objectName = emp?.userName;
            tmpResource.positionName = emp?.positionName;
            tmpResource.roleType = 'P';
            tmpResource.objectType == 'U';
            tmpResource.taskControl = true;
            this.setPermissions(tmpResource, 'P');
            this.permissions.push(tmpResource);
            this.lstPermissions.push(tmpResource);
            this.meeting.permissions = this.permissions;
          }
        }
      });
  }

  valueCbx(id, e) {
    console.log(e);
    this.meeting.permissions.forEach((res) => {
      if (res.objectID == id) res.taskControl = e.data;
    });
  }
  //#endregion

  //#region roles
  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    this.meeting.permissions.forEach((res) => {
      if (res.objectID == idUserSelected) {
        res.roleType = value;
        res.objectType = "U";
        this.setPermissions(res, value);
      }
    });
    this.changeDetec.detectChanges();

    this.popover.close();
  }

  setPermissions(tmpResource: CO_Permissions, roleType) {
    if (roleType == 'A') {
      tmpResource.full = true;
      tmpResource.read = true;
      tmpResource.allowPermit = true;
      tmpResource.publish = true;
      tmpResource.create = true;
      tmpResource.update = true;
      tmpResource.assign = true;
      tmpResource.delete = true;
      tmpResource.share = true;
      tmpResource.upload = true;
      tmpResource.download = true;
    } else if (roleType == 'S') {
      tmpResource.download = true;
      tmpResource.update = true;
      tmpResource.read = true;
    } else {
      tmpResource.read = true;
      tmpResource.download = true;
    }
  }
  //#endregion
}
