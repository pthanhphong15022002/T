import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  Injector,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  RealHub,
  RealHubService,
  AuthService,
  UIComponent,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { AngularDeviceInformationService } from 'angular-device-information';
import { Modal } from 'bootstrap';

@Component({
  selector: 'codx-login',
  templateUrl: './login-default.component.html',
  styleUrls: ['./login-default.component.scss'],
})
//implements OnInit, OnDestroy, AfterViewInit
export class LoginDefaultComponent extends UIComponent {
  environment = environment;
  @ViewChild('Error') error: ElementRef;
  @Input() defaultAuth: any = {
    email: '', // 'admin@demo.com',
    password: '', // 'demo'
  };
  @Input() loginForm: FormGroup;
  @Input() changePassForm: FormGroup;
  @Input() firstLoginForm: FormGroup;
  @Input() fb: FormBuilder;
  @Input() hasError: boolean;
  @Input() returnUrl: string;
  @Input() alerttext: string;
  @Input() sessionID = null;
  @Input() email;
  @Input() mode: string;
  @Input() user: any;
  @Input() f: any;
  @Input() c: any;
  @Input() fl: any;
  @Input() isNotADMode: boolean;

  @Output() submitEvent = new EventEmitter<string>();
  @Output() submitChangePassEvent = new EventEmitter();
  @Output() submitFirstLoginEvent = new EventEmitter();
  @Output() destroyEven = new EventEmitter();
  @Output() forgotPassEven = new EventEmitter();

  externalLogin = false;
  externalLoginCol = '';
  externalLoginShowText = true;
  enableCaptcha = 0;
  token = '';
  captChaValid = false;
  enableMultiLogin = false;
  // private fields

  //#region OTP
  otpTimeout = 0;
  //#endregion

  //#region QR
  hubConnectionID: string;
  isFirstQR = true;
  connection: any;
  qrTimeout: number = 0;
  qrTimeoutMinutes: number = 0;
  qrBase64: string = '/assets/codx/bg/qrCodx.png';
  isScaned = false;
  modal;
  //#endregion

  constructor(
    private injector: Injector,
    private df: ChangeDetectorRef,
    private realHub: RealHubService,
    private authService: AuthService,
    private deviceInfo: AngularDeviceInformationService
  ) {
    super(injector);

    this.enableCaptcha = environment.captchaEnable;
    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    }
  }

  onInit(): void {
    console.log('isnot ad', this.isNotADMode);

    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    } else {
      let captChaControl = this.loginForm.controls['captCha'];
      captChaControl?.valueChanges.subscribe((e) => {
        this.captChaValid = captChaControl.valid;
      });
    }

    this.realHub.start('ad').then((x: RealHub) => {
      let t = this;
      x.hub.invoke('GetConnectionId').then(function (connectionId) {
        t.hubConnectionID = connectionId;
        console.log('hub', connectionId);
      });

      if (x) {
        x.$subjectReal.asObservable().subscribe((z) => {
          if (z.event == 'AcceptLoginQR') {
            this.authService.setLogin(z.data?.user);
            this.realHub.stop();
            window.location.href = z.data?.host + z.data?.tenant;
          }
        });
      }
    });

    //   })
    // if (
    //   environment.saas == 1 &&
    //   (environment.externalLogin.amazonId ||
    //     environment.externalLogin.facebookId ||
    //     environment.externalLogin.googleId ||
    //     environment.externalLogin.microsoftId)
    // ) {
    //   this.externalLogin = true;
    //   let iCol = 0;
    //   if (environment.externalLogin.amazonId) iCol += 1;
    //   if (environment.externalLogin.facebookId) iCol += 1;
    //   if (environment.externalLogin.googleId) iCol += 1;
    //   if (environment.externalLogin.microsoftId) iCol += 1;
    //   this.externalLoginShowText = iCol <= 2;
    //   this.externalLoginCol = 'col-md-' + (12/iCol);
    // }
  }

  ngOnDestroy() {
    this.destroyEven.emit();
  }
  ngAfterViewInit() {
    const element = document.getElementById('scanQRGuid') as HTMLElement;
    this.modal = new Modal(element);
  }
  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  valueChange(event: any) {
    if (!event) return;
    let value = event.data;
    this.f.password.patchValue(value);
    this.df.detectChanges();
  }

  submit(type?: string) {
    this.submitEvent.emit(type);
  }

  submitChangePass() {
    this.submitChangePassEvent.emit();
  }

  submitFirstLogin() {
    this.submitFirstLoginEvent.emit();
  }

  forgotPass() {
    this.forgotPassEven.emit();
  }

  activeTenantAccount() {
    this.api
      .execSv<boolean>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'ActiveTenantAccountAsync',
        [null, this.email]
      )
      .subscribe((success) => {
        if (success) {
          this.mode = 'login';
          this.df.detectChanges();
        }
      });
  }

  changeTabs(evt) {
    console.log('tab', evt);
  }

  changeOTP(evt) {
    if (!evt) return;
    let value = evt.data;
    this.loginForm.controls['otp'].setValue(value);
    this.df.detectChanges();
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
              this.df.detectChanges();
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

                  this.df.detectChanges();
                  if (this.qrTimeout === 0) {
                    clearInterval(id);
                    console.log('het gio');
                  }
                },
                1000,
                this.qrTimeout
              );
              this.df.detectChanges();
            }
          });
      },

      (error) => {
        console.log(error);
      }
    );
  }

  changeEmail() {
    this.email = this.loginForm.controls['email'].value;
  }

  testQR() {
    // this.api
    //   .execSv<string>(
    //     'SYS',
    //     'ERM.Business.AD',
    //     'UsersBusiness',
    //     'ScanQRCodeAsync',
    //     ['', '', '']
    //   )
    //   .subscribe((qrInfo: any) => {
    //     this.authService
    //       .login('mannhi1601@gmail.com', qrInfo.session as string, 'qr')
    //       .subscribe((res) => {});
    //   });
  }

  selectedTab(evt) {
    if (evt.selectedIndex === 2 && this.isFirstQR) {
      this.isFirstQR = false;
      this.generateQR();
    }
  }

  openScanQRGuid() {
    this.modal.show();
  }

  closeScanQRGuid() {
    this.modal.hide();
  }
}
