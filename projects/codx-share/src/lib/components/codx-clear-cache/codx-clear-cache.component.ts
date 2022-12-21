import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import {
  ApiHttpService,
  DialogRef,
  DialogData,
  AuthService,
  NotificationsService,
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
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifyService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.api
      .execSv('SYS', 'ERM.Business.CM', 'CMBusiness', 'GetListCacheName')
      .subscribe((res: any) => {
        this.listCache = res || [];
      });
  }

  valueChange(evt: any) {
    var field = evt.field;
    var value = evt.data;
    if (field === 'All') {
      this.isAll = value;
      if (value) this.cacheName = field;
    } else if (!this.isAll) {
      if (this.cacheName.includes('All'))
        this.cacheName = this.cacheName.replace('All', '');
      if (value && !this.cacheName.includes(field))
        this.cacheName += field + '|';
      else this.cacheName = this.cacheName.replace(field + '|', '');
    }
    this.changeDetectorRef.detectChanges();
  }

  Clear() {
    this.auth
      .clearCache(this.cacheName)
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
