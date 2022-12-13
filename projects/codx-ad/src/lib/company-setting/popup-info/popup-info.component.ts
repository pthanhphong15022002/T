import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';

@Component({
  selector: 'lib-popup-info',
  templateUrl: './popup-info.component.html',
  styleUrls: ['./popup-info.component.scss'],
})
export class PopupInfoComponent implements OnInit {
  title: string = 'Thông tin';
  data: any;
  dialog: DialogRef;
  option: any = 'contact';
  constructor(
    private adService: CodxAdService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dt?.data));
    this.dialog = dialog;
  }

  ngOnInit(): void {}

  valueChange(e) {
    if (e.data) {
      this.data[e.field] = e.data;
    }
  }

  update() {
    this.adService
      .updateInformationCompanySettings(this.data, this.option)
      .subscribe((response) => {
        if (!response[0] && response[0].length == 0) {
          this.notiService.notifyCode('SYS021');
        } else {
          this.notiService.notifyCode('SYS007');
          this.dialog.close(response[0]);
        }
      });
    this.changeDetectorRef.detectChanges();
  }
}
