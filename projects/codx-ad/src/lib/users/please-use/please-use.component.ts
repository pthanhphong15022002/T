import { Component, OnInit, Injector, Optional } from '@angular/core';
import { DialogRef, UIComponent, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-please-use',
  templateUrl: './please-use.component.html',
  styleUrls: ['./please-use.component.scss'],
})
export class PleaseUseComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  email: any;
  constructor(
    private injector: Injector,
    @Optional() dialog: DialogRef,
    private notificationsService: NotificationsService
  ) {
    super(injector);
    this.dialog = dialog;
  }

  onInit(): void {}

  valueChange(e) {
    if (e) this.email = e.data;
  }

  onContinue() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GetByEmailAsync',
        this.email
      )
      .subscribe((res) => {
        var obj: any;
        if (res) {
          obj = {
            formType: 'edit',
            data: res,
          };
        } else {
          obj = {
            formType: 'add',
            data: null,
          };
        }
        this.dialog.close(obj);
      });
  }

  checkValidEmail(value) {
    const regex = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$');
    var checkRegex = regex.test(value);
    if (checkRegex == false) {
      this.notificationsService.notify("Trường 'Email' không hợp lệ");
      return;
    } else {
      this.onContinue();
    }
  }
}
