import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
// import { AngularDeviceInformationService } from 'angular-device-information';
import {
  AESCryptoService,
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  RealHub,
  RealHubService,
  UIComponent,
  UserModel,
} from 'codx-core';
// import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
// import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login2-fa',
  templateUrl: './login2-fa.component.html',
  styleUrls: ['./login2-fa.component.scss'],
})
export class Login2FAComponent extends UIComponent implements AfterViewInit {
  constructor(
    inject: Injector,
    // private deviceInfo: AngularDeviceInformationService,
    private realHub: RealHubService,
    private aesCrypto: AESCryptoService,
    private notiService: NotificationsService,
    private loginService: LoginService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.email = dt?.data?.data;
    this.hideTrustDevice = dt.data.hideTrustDevice;
    this.hubConnectionID = dt?.data?.hubConnectionID;
    //this.clickQueue.push(dt?.data?.login2FA);
    this.dialog = dialog;
    this.changeLogin2FAType(dt?.data?.login2FA);
    // if (dt?.data?.loginDevice) {
    //   this.loginDevice = dt?.data?.loginDevice;
    //   //this.loginDevice.times = '2';
    // } else {
    //   let dInfo = this.deviceInfo.getDeviceInfo();
    //   this.loginDevice = {
    //     name: dInfo.browser,
    //     os: dInfo.os + ' ' + dInfo.osVersion,
    //     imei: null,
    //     id: null,
    //     trust: false,
    //     //times: '2',
    //     tenantID: '',
    //   };
    // }
  }
  dialog;
  // loginDevice: Device;
  // #region QR
  // testQRContent = '';
  hideTrustDevice = false;
  askState = false;
  isFirstQR = true;
  qrTimeout: number = 0;
  hubConnectionID: string;
  qrBase64: string = '/assets/codx/bg/qrCodx.png';
  qrTimeoutMinutes: number = 0;
  isScaned = false;
  lstOptions = [];
  clickQueue = [];
  curLgType: string = '';
  email;
  unsubscribe: Subscription[] = [];
  session: string;
  interval: any;
  @ViewChildren('ipotp') ipOTP: TemplateRef<any>;
  // #endregion

  //#region OTP
  otpTimeout = 0;
  otpMinutes = 0;
  otpValues = ['', '', '', '', '', ''];
  TOTPValues = ['', '', '', '', '', ''];
  //#endregion

  //#region 2FA
  loginFG: FormGroup;
  //#endregion
  onInit() {
    //console.log(this.authStore.get());
    this.loginFG = new FormGroup({
      email: new FormControl(this.email),
      password: new FormControl(),
    });
    this.cache.valueList('SYS060').subscribe((vll) => {
      this.lstOptions = vll?.datas.filter((x) => x.value != '1');
    });
    this.generateQR();
  }

  ngAfterViewInit() {
    this.setOTPEvent();
  }

  testTOTP() {
    this.loginService.checkTOTP().subscribe((otp) => {
      console.log('test otp', otp);
    });
  }
  setOTPEvent() {
    const inputs = document.getElementById('inputs');

    if (inputs) {
      inputs.addEventListener('input', function (e) {
        const target = e.target as HTMLInputElement;
        const val = target.value as any;

        if (isNaN(val) || val == ' ') {
          target.value = '';
          return;
        }

        if (val != '') {
          const next = target.nextElementSibling as HTMLInputElement;
          if (next) {
            next.focus();
          }
        }
      });

      inputs.addEventListener('keyup', function (e) {
        const target = e.target as HTMLInputElement;
        const key = e.key.toLowerCase();

        if (key == 'backspace' || key == 'delete') {
          target.value = '';
          const prev = target.previousElementSibling as HTMLInputElement;
          if (prev) {
            prev.focus();
          }
          return;
        }
      });
    }
  }

  changeLogin2FAType(option) {
    this.curLgType = option;
    // switch (option) {
    //   case '2': {
    //     this.curLgType = 'qr';
    //     break;
    //   }
    //   case '3': {
    //     this.curLgType = 'otp';
    //     break;
    //   }
    //   case '4': {
    //     this.curLgType = 'totp';
    //     break;
    //   }
    //   default: {
    //     this.curLgType = '';
    //     break;
    //   }
    // }

    this.clickQueue.push(option);
    //this.detectorRef.detectChanges();
    if (option == '3' || option == '4') {
      this.setOTPEvent();
    }
  }
  generateQR() {
    console.log('hubConnectionID: ', this.hubConnectionID)
    if(!this.hubConnectionID) return;
    this.qrTimeout = 0;
    this.qrTimeoutMinutes = 0;
    clearInterval(this.interval);
    this.api
      .execSv<string>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenQRCodeAsync',
        [
          this.hubConnectionID,
          this.loginService.loginDevice.name,
          this.loginService.loginDevice.os,
          // position.coords.accuracy +
          //   ';' +
          //   position.coords.latitude +
          //   ';' +
          //   position.coords.longitude,
          ';;',
          '',
        ]
      )
      .subscribe((qrImg) => {
        if (qrImg) {
          //nho xoa
          // this.testQRContent = qrImg;

          this.qrTimeout = 180;
          this.qrBase64 = 'data:image/png;base64,' + qrImg;
          this.interval = setInterval(
            () => {
              this.qrTimeout -= 1;
              this.qrTimeoutMinutes = Math.floor(this.qrTimeout / 60);

              this.detectorRef.detectChanges();
              if (this.qrTimeout === 0) {
                clearInterval(this.interval);
                //console.log('het gio');
              }
            },
            1000,
            this.qrTimeout
          );
          this.detectorRef.detectChanges();
        }
      });
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {

    //   },

    //   (error) => {
    //     console.log(error);
    //   }
    // );
  }
  generateOTP() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenOTPLoginAsync',
        [this.email]
      )
      .subscribe((success) => {
        if (success) {
          this.otpTimeout = 180;
          this.session = success;
          let id = setInterval(
            () => {
              this.otpTimeout -= 1;
              this.otpMinutes = Math.floor(this.otpTimeout / 60);
              this.detectorRef.detectChanges();
              if (this.otpTimeout === 0) {
                clearInterval(id);
                //console.log('het gio');
              }
            },
            1000,
            this.otpTimeout
          );
        }
      });
  }

  close() {
    this.dialog.close();
  }
  back() {
    this.clickQueue.pop();
    this.detectorRef.detectChanges();
  }

  clear() {
    const inputs = document.getElementById('inputs');
    var ip = inputs.getElementsByTagName('input');
    for (let i = 0; i < ip.length; i++) {
      ip[i].value = '';
      this.TOTPValues[i] = '';
      this.otpValues[i] = '';
    }
  }
  changeOTP(evt, idx) {
    if (evt.target.value) {
      this.otpValues[idx] = evt.target.value;
    }
    //console.log('changeOTP', this.otpValues);

    // this.loginFG.controls['password'].setValue(evt.data);
  }

  changeTOTP(evt, idx) {
    if (evt.target.value) {
      this.TOTPValues[idx] = evt.target.value;
    }
    //console.log('change totp', this.TOTPValues);
  }

  login2FAOTP() {
    this.loginFG.controls['password'].setValue(this.otpValues.join(''));
    this.loginService.loginDevice.trust = this.askState;
    let userName = this.loginFG.controls['email'].value;
    let password = this.loginFG.controls['password'].value;
    userName = this.aesCrypto.encrypt(userName.trim());
    password = this.aesCrypto.encrypt(password);
    this.loginService.loginDevice.loginType = this.curLgType;
    this.loginService.loginDevice.session = this.session;
    const login2FASubscr = this.api
      .callSv('SYS', 'AD', 'UsersBusiness', 'CreateUserLoginAsync', [
        this.loginService.loginDevice.tenantID,
        userName,
        password,
        JSON.stringify(this.loginService.loginDevice),
      ])
      .subscribe((data) => {
        if (!data.error) {
          const user = data?.read<UserModel>();
          const r = { error: data.error, data: user };
          this.dialog.close({
            data: r,
          });
        } else {
          this.notiService.notifyCode('');
        }
      });
    this.unsubscribe.push(login2FASubscr);
  }

  testQR() {
    // this.api
    //   .execSv<string>(
    //     'SYS',
    //     'ERM.Business.AD',
    //     'UsersBusiness',
    //     'ScanQRCodeAsync',
    //     [this.testQRContent, '', '']
    //   )
    //   .subscribe((qrInfo: any) => {
    //     this.authService
    //       .login('mannhi1601@gmail.com', qrInfo.session as string, 'qr')
    //       .subscribe((res) => {});
    //   });
  }

  changeAskState(evt) {
    if (this.askState != evt.data) {
      this.askState = evt.data;
    }
  }
}
