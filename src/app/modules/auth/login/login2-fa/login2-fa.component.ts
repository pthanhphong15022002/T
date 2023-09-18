import { Component, Injector, Optional } from '@angular/core';
import { AngularDeviceInformationService } from 'angular-device-information';
import {
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
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
export class Login2FAComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private deviceInfo: AngularDeviceInformationService,
    private realHub: RealHubService,
    private authService: AuthService,
    private adService: CodxAdService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = dt?.data?.data;
    this.email = this.user.data.email;
    this.clickQueue.push(dt?.data?.login2FA);
    this.dialog = dialog;
  }
  user;
  dialog;
  isFirstQR = true;
  qrTimeout: number = 0;
  hubConnectionID: string;
  qrBase64: string = '/assets/codx/bg/qrCodx.png';
  qrTimeoutMinutes: number = 0;
  isScaned = false;
  modal;
  lstOptions = [];
  clickQueue = [];
  curLgType: string = '';
  email;
  unsubscribe: Subscription[] = [];

  //#region OTP
  otpTimeout = 0;
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
      console.log('lst options ', this.lstOptions);
    });

    // this.realHub.start('ad').then((x: RealHub) => {
    //   let t = this;
    //   x.hub.invoke('GetConnectionId').then(function (connectionId) {
    //     t.hubConnectionID = connectionId;
    //     console.log('hub', connectionId);
    //   });

    //   if (x) {
    //     x.$subjectReal.asObservable().subscribe((z) => {
    //       if (z.event == 'AcceptLoginQR') {
    //         this.authService.setLogin(z.data?.user);
    //         this.realHub.stop();
    //         window.location.href = z.data?.host + z.data?.tenant;
    //       }
    //     });
    //   }
    // });
  }
  ngAfterViewInit() {
    // const element = document.getElementById('scanQRGuid2') as HTMLElement;
    // this.modal = new Modal(element);
  }

  changeLogin2FAType(option) {
    this.curLgType =
      option.value == '2' ? 'qr' : option.value == '3' ? 'otp' : '';
    this.clickQueue.push(option.value);
    this.detectorRef.detectChanges();
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
  openScanQRGuid() {
    this.modal.show();
  }
  closeScanQRGuid() {
    this.modal.hide();
  }
  close() {
    this.dialog.close();
  }
  back() {
    this.clickQueue.pop();
    this.detectorRef.detectChanges();
  }

  changeOTP(evt) {
    this.loginFG.controls['password'].setValue(evt.data);
  }

  login2FAOTP() {
    const login2FASubscr = this.authService
      .login(
        this.loginFG.controls['email'].value,
        this.loginFG.controls['password'].value,
        this.curLgType
      )
      .pipe()
      .subscribe((data) => {
        if (!data.error)
          this.dialog.close({
            data,
          });
      });
    this.unsubscribe.push(login2FASubscr);
  }
}
