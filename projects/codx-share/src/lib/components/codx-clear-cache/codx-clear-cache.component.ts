import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import {
  ApiHttpService,
  DialogRef,
  DialogData,
  AuthService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
@Component({
  selector: 'lib-codx-clear-cache',
  templateUrl: './codx-clear-cache.component.html',
  styleUrls: ['./codx-clear-cache.component.css'],
})
export class CodxClearCacheComponent implements OnInit {
  dialog: DialogRef;
  listCache: any[] = [];
  cacheName: string = '';
  isAll = false;
  clearAllTeant = false;
  user: any = null;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifyService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private authstore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.user = this.authstore.get();
    this.api
      .execSv('SYS', 'ERM.Business.Core', 'CMBusiness', 'GetListCacheName')
      .subscribe((res: any) => {
        this.listCache = res || [];
      });
  }

  valueChange(evt: any) {
    var field = evt.field;
    var value = evt.data;
    if (field === 'All') {
      this.isAll = value;
      if (value) this.cacheName = field + '|';
      else this.cacheName.replace(field + '|', '');
    } else if (field === 'AllTeant') {
      this.clearAllTeant = value;
    } else if (field == 'Users') {
      if (value) this.cacheName += field + '|';
      else this.cacheName.replace(field + '|', '');
    } else if (!this.isAll) {
      if (value) this.cacheName += field + '|';
      else this.cacheName = this.cacheName.replace(field + '|', '');
    }
    this.changeDetectorRef.detectChanges();
  }

  Clear() {
    this.auth
      .clearCache(this.cacheName, this.clearAllTeant)
      .pipe()
      .subscribe((data) => {
        if (data) {
          if (!data.isError) this.notifyService.notifyCode('SYS017');
          else this.notifyService.notify(data.error);
        }
        this.dialog.close();
      });
  }
}
