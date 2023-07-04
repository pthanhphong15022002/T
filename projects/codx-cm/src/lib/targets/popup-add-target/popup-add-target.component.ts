import { Component, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-add-target',
  templateUrl: './popup-add-target.component.html',
  styleUrls: ['./popup-add-target.component.css']
})
export class PopupAddTargetComponent {

  dialog: any;
  data: any;
  action = '';
  headerText = '';

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.action = data?.data?.action;
  }
}
