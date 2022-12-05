import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { FileUpload, Permission } from '@shared/models/file.model';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  CacheService,
} from 'codx-core';
import {
  BP_Processes,
  BP_ProcessPermissions,
  tmpPermission,
} from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-add-permission',
  templateUrl: './popup-add-permission.component.html',
  styleUrls: ['./popup-add-permission.component.css'],
})
export class PopupAddPermissionComponent implements OnInit {
  dialog: any;
  title = '';
  requestTitle = '';
  shareContent = '';
  id: string = '';
  fullName: string = '';
  startDate: any;
  endDate: any;
  errorshow = false;
  isShare = true;
  share: any;
  download: any;
  sentEmail: any;
  postblog: any;
  process: BP_Processes;
  gridViewSetup: any;
  per = new tmpPermission();
  permission: BP_ProcessPermissions[];
  toPermission: BP_ProcessPermissions[];
  byPermission: BP_ProcessPermissions[];
  ccPermission: BP_ProcessPermissions[];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt.data[0];
    this.process = JSON.parse(JSON.stringify(dt.data[1]));
    this.per = JSON.parse(JSON.stringify(dt.data[1]));
    this.id = this.process.recID;
    this.fullName = this.process.processName;
    this.isShare = dt.data[2];
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  ngOnInit(): void {}

  //#region footer
  onShare() {
    this.per.recIDProcess = this.id;
    if (this.toPermission == null) {
      this.notificationsService.notifyCode(
        'SYS009'
      );
      return;
    }
    this.per.toPermission = this.toPermission;
    this.per.byPermission = this.byPermission;
    this.per.ccPermission = this.ccPermission;
    for (var i = 0; i < this.per.toPermission.length; i++) {
      if (this.startDate != null && this.endDate != null) {
        if (this.startDate >= this.endDate) {
          this.notificationsService.notify(
            'Vui lòng chọn ngày bắt đầu nhỏ hơn ngày kết thúc!'
          );
          return;
        }
        //Chưa có mssg code
        if (!this.isCheckFromToDate(this.startDate)) {
          this.notificationsService.notify(
            'Vui lòng chọn ngày bắt đầu lớn hơn ngày hiện tại!'
          );
          return;
        }

        this.per.toPermission[i].startDate = this.startDate;
        this.per.toPermission[i].endDate = this.endDate;
      }

      if (!this.isShare) {
        this.per.toPermission[i].share = this.share;
        this.per.toPermission[i].download = this.download;
        this.per.toPermission[i].autoCreate = false;
        this.per.toPermission[i].memberType = '3';
      } else {
        this.per.toPermission[i].share = this.share;
        this.per.toPermission[i].download = this.download;
        this.per.toPermission[i].autoCreate = false;
        this.per.toPermission[i].memberType = '2';
      }
      if (!this.isShare) {
        this.per.form = '3';
        this.per.titleEmail = this.requestTitle;
        this.per.contentEmail = this.shareContent;
      } else {
        this.per.form = '2';
        this.per.titleEmail = '';
        this.per.contentEmail = this.shareContent;
      }
      this.per.urlShare = this.getPath();
      this.per.urlPath = this.getPath();
    }
    this.api
      .execSv<any>(
        'BP',
        'BP',
        'ProcessesBusiness',
        'RequestOrShareProcessAsync',
        [this.per]
      )
      .subscribe((res) => {
        if (res) {
          if (this.per.form == '2') {
            this.notificationsService.notifyCode('OD013');
            this.dialog.close(res);
          } else {
            this.notificationsService.notifyCode('SYS034');
            this.dialog.close(res);
          }
        } else {
          if (this.per.form == '2')
            this.notificationsService.notifyCode('SYS016');
          else
            this.notificationsService.notify(
              'Yêu cầu cấp quyền không thành công'
            );
          this.dialog.close();
        }
      });
  }
  //#endregion

  //#region event
  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to >= new Date()) return true;
    else return false;
  }

  onUserEvent($event, type: string) {
    console.log($event);
    switch (type) {
      case 'to':
        if ($event.data != undefined) {
          var data = $event.data;
          var list = [];
          if (this.toPermission != null) list = this.toPermission;
          else list = [];
          for (var i = 0; i < data.length; i++) {
            var item = data[i];
            // if(item.id != null && item.objectType != "U"){
            var perm = new BP_ProcessPermissions();
            perm.objectName = item.text != null ? item.text : item.objectName;
            perm.objectID = item.id;
            perm.isActive = true;
            perm.objectType = item.objectType;
            list.push(Object.assign({}, perm));
            // }else if (item.id != null && item.objectType == "U"){
            //   var perm = new BP_ProcessPermissions();
            //   perm.startDate = this.startDate;
            //   perm.endDate = this.endDate;
            //   perm.objectName = item.text != null ? item.text : item.objectName;
            //   perm.objectID = item.id;
            //   perm.isActive = true;
            //   perm.objectType = item.objectType;
            //   perm.read = true;
            //   this.toPermission.push(Object.assign({}, perm));
            // }
          }
          this.toPermission = list;
        }
        break;
      case 'cc':
        if ($event.data != undefined) {
          var data = $event.data;
          var list = [];
          if (this.ccPermission != null) list = this.ccPermission;
          else list = [];
          for (var i = 0; i < data.length; i++) {
            var item = data[i];
            // if(item.id != null && item.objectType != "U"){
            var perm = new BP_ProcessPermissions();
            perm.startDate = this.startDate;
            perm.endDate = this.endDate;
            perm.objectName = item.text != null ? item.text : item.objectName;
            perm.objectID = item.id;
            perm.isActive = true;
            perm.objectType = item.objectType;
            list.push(Object.assign({}, perm));
            //
          }
          this.ccPermission = list;
        }
        break;
      case 'by':
        if ($event.data != undefined) {
          var data = $event.data;
          var list = [];
          if (this.byPermission != null) list = this.byPermission;
          else list = [];
          for (var i = 0; i < data.length; i++) {
            var item = data[i];
            // if(item.id != null && item.objectType != "U"){
            var perm = new BP_ProcessPermissions();
            perm.startDate = this.startDate;
            perm.endDate = this.endDate;
            perm.objectName = item.text != null ? item.text : item.objectName;
            perm.objectID = item.id;
            perm.isActive = true;
            perm.objectType = item.objectType;
            list.push(Object.assign({}, perm));
            // }else if (item.id != null && item.objectType == "U"){
            //   var perm = new BP_ProcessPermissions();
            //   perm.startDate = this.startDate;
            //   perm.endDate = this.endDate;
            //   perm.objectName = item.text != null ? item.text : item.objectName;
            //   perm.objectID = item.id;
            //   perm.isActive = true;
            //   perm.objectType = item.objectType;
            //   perm.read = true;
            //   this.byPermission.push(Object.assign({}, perm));
            // }
          }
          this.byPermission = list;
        }
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  txtValue($event, ctrl) {
    switch (ctrl) {
      case 'requestTitle':
        if ($event.data != '') {
          this.api
            .execSv<any>(
              'SYS',
              'ERM.Business.AD',
              'EmailTemplatesBusiness',
              'GetViewEmailTemplateAsync',
              [$event.data]
            )
            .subscribe((res) => {
              if (res != null) {
                this.requestTitle = res[0].subject;
              }
            });
        }
        break;
      case 'shareContent':
        this.shareContent = $event.data;
        break;
      case 'startDate':
        this.startDate = $event.data.fromDate;
        break;
      case 'endDate':
        this.endDate = $event.data.fromDate;
        break;
      case 'share':
        this.share = $event.data;
        break;
      case 'download':
        this.download = $event.data;
        break;
      case 'sentemail':
        this.sentEmail = $event.data;
        break;
      case 'postblog':
        this.postblog = $event.data;
        break;
    }
  }

  validate(item) {
    switch (item) {
      case 'requestTitle':
        if (this.errorshow && this.requestTitle == '')
          return 'w-100 border border-danger is-invalid';
        else return 'w-100';
      case 'shareContent':
        if (this.errorshow && !this.checkContent())
          return 'w-100 border border-danger is-invalid h-200';
        else return 'h-200';
    }
    return '';
  }

  getPath() {
    var index = window.location.href.indexOf('?');
    var url = window.location.href;
    if (index > -1) {
      url = window.location.href.substring(0, index);
    }
    var url = `${url}?id=${this.id}`;
    return url;
  }

  checkContent() {
    if (this.shareContent === '') return false;
    else return true;
  }

  removeUserRight(index, list: BP_ProcessPermissions[] = null) {
    if (list != null && list.length > 0) {
      list.splice(index, 1); //remove element from array
      this.changeDetectorRef.detectChanges();
    }
  }
  //#endregion
}
