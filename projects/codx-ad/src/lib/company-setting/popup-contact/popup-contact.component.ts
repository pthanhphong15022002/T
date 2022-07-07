import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CodxService,
  DialogData,
  DialogRef,
  NotificationsService,
  UrlUtil,
} from 'codx-core';
import * as moment from 'moment';

@Component({
  selector: 'lib-popup-settings-contact',
  templateUrl: './popup-contact.component.html',
  styleUrls: ['./popup-contact.component.css']
})
export class PopupContactComponent implements OnInit {

  data: any;
  dialog: any;
  test:any;
  title:string = 'Liên hệ';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.test = this.data;
  }

}
