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
import { CodxAdService } from '../../codx-ad.service';
import { AD_CompanySettings } from '../../models/AD_CompanySettings.models';

@Component({
  selector: 'lib-popup-settings-contact',
  templateUrl: './popup-contact.component.html',
  styleUrls: ['./popup-contact.component.css'],
})
export class PopupContactComponent implements OnInit {
  data: any;
  dialog: any;
  items: AD_CompanySettings;
  title: string = 'Liên hệ';
  option: any = 'contact';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private adService: CodxAdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.items = this.data;
  }

  update() {
    this.adService
      .updateInformationCompanySettings(this.items, this.option)
      .subscribe((response) => {
        if (response) {
          this.notiService.notifyCode('SYS007');
        } else {
          this.notiService.notifyCode('SYS021');
        }
      });
    this.dialog.close();
    this.changeDetectorRef.detectChanges();
  }

  txtValuePhone(e: any) {
    this.items.phone = e.data;
    console.log(this.items.phone);
  }

  txtValueFaxNo(e: any) {
    this.items.faxNo = e.data;
    console.log(this.items.phone);
  }

  txtValueEmail(e: any) {
    this.items.email = e.data;
    console.log(this.items.phone);
  }

  txtValueWebPage(e: any) {
    this.items.webPage = e.data;
    console.log(this.items.phone);
  }

  txtValueStreet(e: any) {
    this.items.street = e.data;
    console.log(this.items.phone);
  }
}
