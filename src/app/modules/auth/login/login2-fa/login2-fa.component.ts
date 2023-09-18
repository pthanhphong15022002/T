import { variableAudio } from './../../../../../../projects/codx-share/src/lib/components/viewFileDialog/extention';
import { AfterViewInit, Component, Injector, Optional } from '@angular/core';
import { AngularDeviceInformationService } from 'angular-device-information';
import {
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  RealHub,
  RealHubService,
  UIComponent,
} from 'codx-core';
import { Modal } from 'bootstrap';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login2-fa',
  templateUrl: './login2-fa.component.html',
  styleUrls: ['./login2-fa.component.scss'],
})
export class Login2FAComponent extends UIComponent implements AfterViewInit {
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private deviceInfo: AngularDeviceInformationService,
    private realHub: RealHubService,
    private authService: AuthService,
    private adService: CodxAdService,
    private notiService: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = dt?.data?.data;
    this.hubConnectionID = dt?.data?.hubConnectionID;
    this.email = this.user.data.email;
    this.clickQueue.push(dt?.data?.login2FA);
    this.dialog = dialog;
  }
  user;
  dialog;

  // #region QR
  // testQRContent = '';

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
  // #endregion

  //#region OTP
  otpTimeout = 0;
  otpValues = ['', '', '', '', '', ''];
  //#endregion

  //#region 2FA
  loginFG: FormGroup;
  //#endregion
  onInit() {
    this.loginFG = new FormGroup({
      email: new FormControl(this.user.data.email),
      password: new FormControl(),
    });
    this.cache.valueList('SYS060').subscribe((vll) => {
      this.lstOptions = vll?.datas.filter((x) => x.value != '1');
    });

    if (this.hubConnectionID == '') {
      this.realHub.start('ad').then((x: RealHub) => {
        this.hubConnectionID = this.realHub['hubConnectionID'];
      });
    }
    this.generateQR();
  }

  ngAfterViewInit() {
    this.setOTPEvent();
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
    this.curLgType =
      option.value == '2' ? 'qr' : option.value == '3' ? 'otp' : '';

    this.clickQueue.push(option.value);
    this.detectorRef.detectChanges();
    if (option.value == '3') {
      this.setOTPEvent();
    }
  }
  generateQR() {
    let deviceInfo = this.deviceInfo.getDeviceInfo();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.api
          .execSv<string>(
            'SYS',
            'ERM.Business.AD',
            'UsersBusiness',
            'GenQRCodeAsync',
            [
              this.hubConnectionID,
              deviceInfo.browser,
              deviceInfo.os + ' ' + deviceInfo.osVersion,
              position.coords.accuracy +
                ';' +
                position.coords.latitude +
                ';' +
                position.coords.longitude,
              '',
            ]
          )
          .subscribe((qrImg) => {
            if (qrImg) {
              //nho xoa
              // this.testQRContent = qrImg;

              this.qrTimeout = 180;
              this.qrBase64 = 'data:image/png;base64,' + qrImg;
              let id = setInterval(
                () => {
                  this.qrTimeout -= 1;
                  this.qrTimeoutMinutes = Math.floor(this.qrTimeout / 60);

                  this.detectorRef.detectChanges();
                  if (this.qrTimeout === 0) {
                    clearInterval(id);
                    console.log('het gio');
                  }
                },
                1000,
                this.qrTimeout
              );
              this.detectorRef.detectChanges();
            }
          });
      },

      (error) => {
        console.log(error);
      }
    );
  }
  generateOTP() {
    this.api
      .execSv<boolean>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenOTPLoginAsync',
        [this.email]
      )
      .subscribe((success) => {
        if (success) {
          this.otpTimeout = 30000;

          let id = setInterval(
            () => {
              this.otpTimeout -= 1000;
              this.detectorRef.detectChanges();
              if (this.otpTimeout === 0) {
                clearInterval(id);
                console.log('het gio');
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

  changeOTP(evt, idx) {
    if (evt.target.value) {
      this.otpValues[idx] = evt.target.value;
    }
    console.log('changeOTP', this.otpValues);

    // this.loginFG.controls['password'].setValue(evt.data);
  }

  login2FAOTP() {
    this.loginFG.controls['password'].setValue(this.otpValues.join(''));
    const login2FASubscr = this.authService
      .login(
        this.loginFG.controls['email'].value,
        this.loginFG.controls['password'].value,
        this.curLgType,
        true
      )
      .pipe()
      .subscribe((data) => {
        if (!data.error)
          this.dialog.close({
            data,
          });
        else {
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
}
