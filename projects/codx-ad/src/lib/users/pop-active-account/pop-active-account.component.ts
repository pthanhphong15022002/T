import { Component, Injector, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  UserModel,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';

@Component({
  selector: 'lib-pop-active-account',
  templateUrl: './pop-active-account.component.html',
  styleUrls: ['./pop-active-account.component.scss'],
})
export class PopActiveAccountComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private adService: CodxAdService,
    private userStore: AuthStore,
    private notify: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.user = dt?.data;
    this.authStore = userStore.get();
    console.log('data', dt);
    console.log('data', this.user);
  }

  dialog: DialogRef;
  user;
  authStore: UserModel;
  onInit(): void {}
  resendMail() {
    let userID = this.user?.userID;
    let tenant = this.authStore?.tenant;
    this.adService
      .sendMail(userID, tenant, 'CreateNewUser')
      .subscribe((result) => {
        if (result) {
          this.notify.notifyCode('SYS034');
          this.dialog.close();
        }
      });
  }
  copyToClipboard() {
    let url =
      location.host +
      '/' +
      this.authStore.tenant +
      '/' +
      'auth/login?sk=' +
      this.user.sessionID;

    navigator.clipboard.writeText(url).then((res) => {
      this.notify.notifyCode('SYS034');
    });
  }
}
