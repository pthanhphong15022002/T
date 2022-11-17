import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
  dialog: any;
  items: AD_CompanySettings;
  title: string = 'Liên hệ';
  option: any = 'contact';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private notiService: NotificationsService,
    private adService: CodxAdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.items = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.getURLEmbed(this.items.timeZone);
  }

  update() {
    this.items;
    this.adService
      .updateInformationCompanySettings(this.items, this.option)
      .subscribe((response) => {
        if (response) {
          this.notiService.notifyCode('SYS007');
        } else {
          this.notiService.notifyCode('SYS021');
        }
        this.dialog.close(response);
        this.changeDetectorRef.detectChanges();
      });
  }

  valueChange(e: any) {
    if (e) {
      this.items[e.field] = e.data;
    }
  }

  valueChangeTimeZone(e: any) {
    if (e) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(e.data, 'text/html');
      if (doc) {
        var htmlE: any = doc.body.childNodes[0];
        if (htmlE?.src) {
          this.items.timeZone = htmlE.src;
          this.getURLEmbed(htmlE.src);
        }
      }
    }
  }

  urlEmbedSafe: any;
  getURLEmbed(url) {
    if (url) {
      this.urlEmbedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
