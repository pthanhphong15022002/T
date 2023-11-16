import { Route, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CallFuncService,
} from 'codx-core';
import { Login2FAComponent } from '../login/login2-fa/login2-fa.component';
import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';
import { AngularDeviceInformationService } from 'angular-device-information';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private authService: AuthService,
    private callfc: CallFuncService,
    private loginService: LoginService,
    private deviceInfo: AngularDeviceInformationService
  ) {
    this.user = this.authStore.get();
    let dInfo = this.deviceInfo.getDeviceInfo();
    this.loginDevice = {
      name: dInfo.browser,
      os: dInfo.os + ' ' + dInfo.osVersion,
      ip: '',
      id: null,
      imei: null,
      trust: false,
      tenantID: '',
      times: '1',
    };
  }

  lstTenant = [];
  private user;
  //login2FA;
  loginDevice: Device;

  ngOnInit(): void {
    // this.router.navigate(['/tester']);
    this.loginService
      .getTenants(this.user.email)
      .subscribe((tenants: Array<any>) => {
        this.lstTenant = tenants;
      });
  }

  navigate(tn) {
    this.api
      .exec('AD', 'UsersBusiness', 'CreateUserLoginAsync', [
        tn,
        JSON.stringify(this.loginDevice),
      ])
      .subscribe((res: any) => {
        if (res) {
          this.loginDevice.tenantID = tn;
          let trust2FA = res?.extends?.Trust2FA;
          let objData = {
            data: { data: res },
            login2FA: res?.extends?.TwoFA,
            hubConnectionID: '',
            loginDevice: this.loginDevice,
          };
          if (!trust2FA) {
            let lg2FADialog = this.callfc.openForm(
              Login2FAComponent,
              '',
              400,
              600,
              '',
              objData
            );
            lg2FADialog.closed.subscribe((lg2FAEvt) => {
              if (lg2FAEvt.event.data.error) return;
              this.authService.setLogin(lg2FAEvt.event.data.data);
              this.loginService.loginAfter(lg2FAEvt.event.data);
            });
          } else {
            this.authService.setLogin(res);
            this.loginService.loginAfter({ data: res });
          }
        }
        return res;
      });
    // this.authService.createUserToken(tn).subscribe((res) => {
    //   console.log('login success', res);

    //   // if (res) this.router.navigate(['/' + tn]);
    // });
  }
}
