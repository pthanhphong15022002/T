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
      .subscribe((res: any) => {
        var obj: any;
        if (res) {
          if (!res.isExistInTenant) {
            obj = {
              formType: 'edit',
              data: res,
            };
          } else {
            this.notificationsService.notifyCode('AD007');
          }
        } else {
          obj = {
            formType: 'add',
            data: this.email,
          };
        }
        this.dialog.close(obj);
      });
  }

  checkValidEmail() {
    const regex = new RegExp(
      '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([A-Za-z]{2,6}(?:\\.[A-Za-z]{2,6})?)$'
    );
    var checkRegex = regex.test(this.email);
    if (checkRegex == false) {
      this.notificationsService.notify("Trường 'Email' không hợp lệ");
      return;
    } else {
      this.onContinue();
    }
  }
}
