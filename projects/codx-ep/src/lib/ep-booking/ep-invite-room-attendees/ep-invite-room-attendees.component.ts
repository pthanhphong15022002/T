import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxEpService } from '../../codx-ep.service';
import { BookingAttendees } from '../../models/bookingAttendees.model';


@Component({
  selector: 'ep-invite-room-attendees',
  templateUrl: './ep-invite-room-attendees.component.html',
  styleUrls: ['./ep-invite-room-attendees.component.css'],
})
export class EpInviteRoomAttendeesComponent implements OnInit {
  @ViewChild('form') form: TemplateRef<any>;

  dialogRef: any;
  title = '';
  listRoles = [];

  popover: any;
  idUserSelected: any;

  data: any;
  funcID: any;
  formModel: any;
  headerText: any;
  oldAttendees = [];
  newAttendees = [];
  isPopupUserCbb: boolean;
  lstUser: any[];
  attendeesList = [];
  resources = [];
  listUserID = [];
  user: any;
  curUser: any;
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    private apiHttpService: ApiHttpService,
    private authStore: AuthStore,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef = dialog;
    this.data = dialogData.data[0];
    this.formModel = dialogData.data[1];
    this.dialogRef.formModel = this.formModel;
    this.user = this.authStore.get();
    this.headerText = dialogData.data[2];
    this.cache.valueList('EP009').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = res.datas;
        tmpArr.forEach((item) => {
          if (item.value != '4') {
            this.listRoles.push(item);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.codxEpService
      .getListAttendees(this.data.recID)
      .subscribe((res: any) => {
        if (res) {
          res.forEach((people) => {
            let tempAttender = new BookingAttendees();
            tempAttender.userID = people.userID;
            tempAttender.userName = people.userName;
            tempAttender.status = people.status;
            tempAttender.roleType = people.roleType;
            tempAttender.optional = people.optional;
            this.listRoles.forEach((element) => {
              if (element.value == tempAttender.roleType) {
                tempAttender.icon = element.icon;
                tempAttender.roleName = element.text;
              }
            });
            this.oldAttendees.push(tempAttender);
            this.resources.push(tempAttender);
          });
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  onSave() {
    this.codxEpService
      .inviteAttendees(this.data.recID, this.newAttendees)
      .subscribe((res) => {
        if (res) {
          let listUserID = this.data.bookingAttendees;
          this.newAttendees.forEach((item) => {
            listUserID = listUserID + ';' + item.userID;
          });
          this.data.bookingAttendees = listUserID;
          this.notificationsService.notifyCode('SYS034');
          this.dialogRef && this.dialogRef.close(this.data);
        } else {
          this.dialogRef.close();
        }
      });
  }

  closePopUpCbb() {
    this.isPopupUserCbb = false;
  }

  openUserPopup() {
    this.isPopupUserCbb = true;
  }
  valueCbxUserChange(event) {
    if (event == null) {
      this.isPopupUserCbb = false;
      return;
    }
    if (event?.dataSelected) {
      this.lstUser = [];
      event.dataSelected.forEach((people) => {
        let tempAttender = new BookingAttendees();
        tempAttender.userID = people.UserID;
        tempAttender.userName = people.UserName;
        tempAttender.status = '1';
        tempAttender.roleType = '3';
        tempAttender.optional = false;
        this.listRoles.forEach((element) => {
          if (element.value == tempAttender.roleType) {
            tempAttender.icon = element.icon;
            tempAttender.roleName = element.text;
          }
        });
        this.lstUser.push(tempAttender);
      });
      this.lstUser.forEach((item) => {
        let check = true;
        this.oldAttendees.forEach((old) => {
          if (item.userID == old.userID) {
            check = false;
          }
        });
        if (check) {
          this.newAttendees.push(item);
        }
      });
      
      this.isPopupUserCbb = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  shareInputChange(e) {
    let assignTo = '';
    let listUserIDByOrg = '';
    let listDepartmentID = '';
    let listUserID = '';
    let listPositionID = '';
    let listEmployeeID = '';
    let listGroupMembersID = '';
    let type = 'U';
    if (e == null) return;
    e?.data?.forEach((obj) => {
      if (obj.objectType && obj.id) {
        type = obj.objectType;
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
          case 'RP':
          case 'P':
            listPositionID += obj.id + ';';
            break;
          case 'RE':
            listEmployeeID += obj.id + ';';
            break;
          case 'UG':
            listGroupMembersID += obj.id + ';';
            break;
        }
      }
    });
    if (listGroupMembersID != '') {
      listGroupMembersID = listGroupMembersID.substring(
        0,
        listGroupMembersID.length - 1
      );
      this.codxEpService
        .getListUserIDByListGroupID(listGroupMembersID)
        .subscribe((res) => {
          if (res && res?.length > 0) {
            this.valueUser(res);
          }
        });
    }
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
      this.codxEpService
        .getListUserIDByListOrgIDAsync([listDepartmentID, type])
        .subscribe((res) => {
          if (res) {
            listUserIDByOrg += res;
            if (listUserID != '') listUserIDByOrg += ';' + listUserID;
            this.valueUser(listUserIDByOrg);
          }
        });
    }
    if (listEmployeeID != '') {
      listEmployeeID = listEmployeeID.substring(0, listEmployeeID.length - 1);
      this.codxEpService
        .getListUserIDByListEmployeeID(listEmployeeID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.valueUser(res);
          }
        });
    }
    if (listPositionID != '') {
      listPositionID = listPositionID.substring(0, listPositionID.length - 1);
      this.codxEpService
        .getListUserIDByListPositionsID(listPositionID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            if (!res[1]) this.notificationsService.notifyCode('TM066');
            this.valueUser(res[0]);
          } else this.notificationsService.notifyCode('TM066');
        });
    }
  }
  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.resources != null) {
        var user = this.resources;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.userID + ';';
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
    var arrUser = resource.split(';');
    this.listUserID = this.listUserID.concat(arrUser);
    this.apiHttpService
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness_Old',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource = new BookingAttendees();
            tmpResource.userID = emp?.userID;
            tmpResource.userName = emp?.userName;
            tmpResource.positionName = emp?.positionName;
            tmpResource.roleType = '3';
            tmpResource.optional = false;
            this.listRoles.forEach((element) => {
              if (element.value == tmpResource.roleType) {
                tmpResource.icon = element.icon;
                tmpResource.roleName = element.text;
              }
            });
            this.resources.push(tmpResource);
            //}
          }
          this.resources.forEach((item) => {
            let isDuplicate = false;
            this.oldAttendees.forEach((oItem) => {
              if (item.userID == oItem.userID) {
                isDuplicate = true;
              }
            });
            if (!isDuplicate) {
              this.newAttendees.push(item);
            }
          });
          this.newAttendees = this.filterArray(this.newAttendees);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  
  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['userID'], item])).values()];
  }
  attendeesCheckChange(event: any, userID: any) {
    this.newAttendees.forEach((attender) => {
      if (attender.userID == userID) {
        attender.optional = event.data;
      }
    });
  }

  showPopover(p, userID) {
    // if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }
  selectRoseType(idUserSelected, value) {
    if (value == '1') {
      //   if(this.curUser.roleType=="1"){
      //     this.curUser.roleType="3";
      //     this.listRoles.forEach((role) => {
      //       if (this.curUser.roleType == role.value) {
      //         this.curUser.icon = role.icon;
      //       }
      //     });
      //     this.changeDetectorRef.detectChanges();
      //   }
      //   else{
      //     this.attendeesList.forEach(att=>{
      //       if(att.roleType == "1"){
      //         att.roleType="3";
      //         this.listRoles.forEach((role) => {
      //           if (att.roleType == role.value) {
      //             att.icon = role.icon;
      //           }
      //         });
      //         this.changeDetectorRef.detectChanges();
      //       }
      //     });
      //   }
    }

    // if(idUserSelected==this.curUser.userID){
    //   this.curUser.roleType=value;
    //   this.listRoles.forEach((role) => {
    //     if (this.curUser.roleType == role.value) {
    //       this.curUser.icon = role.icon;
    //     }
    //   });
    //   this.changechangeDetectorRef.detectChanges();
    // }
    else {
      this.attendeesList.forEach((res) => {
        if (res.userID == idUserSelected) {
          res.roleType = value;
          this.listRoles.forEach((role) => {
            if (role?.value == res?.roleType) {
              res.icon = role.icon;
            }
          });
        }
      });
      this.changeDetectorRef.detectChanges();
    }
    this.changeDetectorRef.detectChanges();
    this.popover.close();
  }
  deleteAttender(attID: string) {
    var tempDelete;
    this.newAttendees.forEach((item) => {
      if (item.userID == attID) {
        tempDelete = item;
      }
    });
    this.newAttendees.splice(this.attendeesList.indexOf(tempDelete), 1);
    this.changeDetectorRef.detectChanges();
  }
}
