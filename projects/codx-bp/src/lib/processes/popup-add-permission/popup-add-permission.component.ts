import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { FileUpload, Permission } from '@shared/models/file.model';
import { DialogData, DialogRef, ApiHttpService, NotificationsService } from 'codx-core';
import {
  BP_Processes,
  BP_ProcessPermissions,
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
  per: FileUpload;
  permission: Permission[];
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  fromPermission: Permission[];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt.data[0];
    this.process = dt.data[1];
    this.id = this.process.recID;
    this.fullName = this.process.processName;
    this.isShare = dt.data[2];
  }

  ngOnInit(): void {}

  //#region footer
  onShare() {
    this.per.toPermission = this.toPermission;
    this.per.permissions = this.byPermission;
    this.per.ccPermission = this.ccPermission;
    this.per.permissions = this.fromPermission;
    for (var i = 0; i < this.per.toPermission.length; i++) {
      this.per.toPermission[i].startDate = this.startDate;
      this.per.toPermission[i].endDate = this.endDate;
      if (!this.isShare) {
        // this.per.toPermission[i].create = true;
        // this.per.toPermission[i].update = true;
        // this.per.toPermission[i].share = true;
        // this.per.toPermission[i].download = true;
        // this.per.toPermission[i].upload = true;
        this.per.toPermission[i].read = true;
      } else {
        this.per.toPermission[i].read = true;
        this.per.toPermission[i].share = this.share;
        this.per.toPermission[i].download = this.download;
      }
      if (!this.isShare) {
        this.per.form = 'request';
        this.per.titleEmail = this.requestTitle;
        this.per.contentEmail = this.shareContent;
      } else {
        this.per.form = 'share';
        this.per.titleEmail = '';
        this.per.contentEmail = this.shareContent;
      }
      this.per.sendEmail = this.sentEmail;
      this.per.postBlog = this.postblog;
      this.api.execSv<BP_ProcessPermissions>('BP','BP','ProcessesBusiness','RequestOrShareProcessAsync',this.per).subscribe(res=>{
        if (this.per.form == "share")
          this.notificationsService.notify('Chia sẻ thành công');
        else
          this.notificationsService.notify('Đã yêu cầu cấp quyền');
      })
    }
    this.dialog.close();

  }
  //#endregion

  //#region event
  onUserEvent($event, type: string) {
    console.log($event);
    var list = [];
    if ($event.data != undefined) {
      var data = $event.data;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var perm = new Permission;
        perm.startDate = this.startDate;
        perm.endDate = this.endDate;
        perm.objectName = item.text;
        perm.objectID = item.id;
        perm.objectType = item.objectType;
        perm.read = true;
        list.push(Object.assign({}, perm));
      }

      switch (type) {
        case 'to':
          this.toPermission = [];
          this.toPermission = list;
          break;
        case 'cc':
          this.ccPermission = [];
          this.ccPermission = list;
          break;
        case 'by':
          this.byPermission = [];
          this.byPermission = list;
          break;
        case 'from':
          this.fromPermission = [];
          this.fromPermission = list;
          break;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  txtValue($event, ctrl) {
    switch (ctrl) {
      case 'requestTitle':
        this.requestTitle = $event.data;
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

  checkContent() {
    if (this.shareContent === '') return false;
    else return true;
  }

  removeUserRight(index, list: Permission[] = null) {
    if (list != null && list.length > 0) {
      list.splice(index, 1); //remove element from array
      this.changeDetectorRef.detectChanges();
    }
  }
  //#endregion
}
