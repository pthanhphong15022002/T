import { ActivatedRoute, Route, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CallFuncService,
  ResponseModel,
  UserModel,
} from 'codx-core';
import { Login2FAComponent } from '../login/login2-fa/login2-fa.component';
import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';
// import { AngularDeviceInformationService } from 'angular-device-information';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit {
  constructor(
    private router: Router,
    private activedRouter: ActivatedRoute,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private authService: AuthService,
    private callfc: CallFuncService,
    private loginService: LoginService,
    // private deviceInfo: AngularDeviceInformationService
  ) {
    this.user = this.authStore.get();
    // let dInfo = this.deviceInfo.getDeviceInfo();
    // this.loginDevice = {
    //   name: dInfo.browser,
    //   os: dInfo.os + ' ' + dInfo.osVersion,
    //   id: null,
    //   imei: null,
    //   trust: false,
    //   tenantID: '',
    // };
    this.activedRouter.queryParams.subscribe((res: any) => {
      //this.loginDevice.loginType = res?.lt;
      this.loginService.loginDevice.loginType = res?.lt;
      this.trust = res?.trust;
    });
  }

  lstTenant = [];
  private user;
  //login2FA;
  //loginDevice: Device;
  trust = false;
  ngOnInit(): void {
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
        '', //userID
        '', //pw
        JSON.stringify(this.loginService.loginDevice),
      ])
      .subscribe((res: any) => {
        if (res) {
          this.loginService.loginDevice.tenantID = tn;
          let trust2FA = res?.extends?.Trust2FA;
          let hideTrustDevice = res?.extends?.HideTrustDevice;          
          if (!trust2FA) {
            let objData = {
              data: res.email,
              login2FA: res?.extends?.TwoFA,
              hubConnectionID: '',
              //loginDevice: this.loginService.loginDevice,
              hideTrustDevice,
            };

            let lg2FADialog = this.callfc.openForm(
              Login2FAComponent,
              '',
              400,
              600,
              '',
              objData
            );
            lg2FADialog.closed.subscribe((lg2FAEvt) => {
              if (!lg2FAEvt.event || lg2FAEvt.event?.data?.error) return;
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
  }
}
