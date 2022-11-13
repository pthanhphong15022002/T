import { CodxTMService } from './../../codx-tm.service';
import { CO_Meetings } from './../../models/CO_Meetings.model';
import { CacheService, DialogData, DialogRef, ApiHttpService, NotificationsService } from 'codx-core';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { CO_Resources } from '../../models/CO_Meetings.model';

@Component({
  selector: 'lib-popup-add-resources',
  templateUrl: './popup-add-resources.component.html',
  styleUrls: ['./popup-add-resources.component.css'],
})
export class PopupAddResourcesComponent implements OnInit {
  meeting = new CO_Meetings();
  dialog: any;
  title = '';
  listRoles: any;
  resources: CO_Resources[] = [];
  popover: any;
  idUserSelected: any;
  lstResources = [];
  data: any;
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
    this.meeting = this.data.data;
    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.listRoles = res.datas;
      }
    });

  }

  ngOnInit(): void {
    this.resources = this.meeting.resources;

  }

  //#region save
  onSave(){
    this.api.callSv('CO','CO','MeetingsBusiness','UpdateResourcesMeetingAsync',[this.meeting.meetingID, this.meeting.resources]).subscribe((res)=>{
      if(res != null){
        this.dialog.close(this.meeting);
        this.noti.notify('Mời người tham gia thành công');
      }else{
        this.dialog.close(this.meeting);
        this.noti.notify('Mời người không thành công');
      }
    })
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

  valueUser(resourceID){
    if (resourceID != ''){
      if (this.resources != null) {
        var user = this.resources;;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.resourceID + ';';
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
      }else {
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
            var tmpResource = new CO_Resources();

              tmpResource.resourceID = emp?.userID;
              tmpResource.resourceName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = 'P';
              tmpResource.taskControl = true;
              this.resources.push(tmpResource);

            this.meeting.resources = this.resources;
          }
        }
      });
  }

  valueCbx(id, e) {
    console.log(e);
    this.meeting.resources.forEach((res) => {
      if (res.resourceID == id) res.taskControl = e.data;
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
    this.meeting.resources.forEach((res) => {
      if (res.resourceID == idUserSelected) res.roleType = value;
    });
    this.changeDetec.detectChanges();

    this.popover.close();
  }

  //#endregion
}
