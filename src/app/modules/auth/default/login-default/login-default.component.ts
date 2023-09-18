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
import { Login2FAComponent } from '@modules/auth/login/login2-fa/login2-fa.component';

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
  @Input() hubConnectionID: string;

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
  isFirstQR = true;
  connection: any;
  qrTimeout: number = 0;
  qrTimeoutMinutes: number = 0;
  qrBase64: string = '/assets/codx/bg/qrCodx.png';
  isScaned = false;
  modal;
  // testQRContent = '';
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
    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    } else {
      let captChaControl = this.loginForm.controls['captCha'];
      captChaControl?.valueChanges.subscribe((e) => {
        this.captChaValid = captChaControl.valid;
      });
    }

    this.realHub.start('ad').then((x: RealHub) => {
      if (x) {
        x.$subjectReal.asObservable().subscribe((z) => {
          if (z.event == 'AcceptLoginQR') {
            if (z.data?.hubConnection == this.hubConnectionID) {
              if (z.data.isLg2FA == '') {
                this.authService.setLogin(z.data?.user);
                this.realHub.stop();
                window.location.href = z.data?.host + z.data?.tenant;
              } else {
                let user = JSON.parse(z.data.user);
                let objData = {
                  data: {
                    data: {
                      email: user.Email,
                      ...user,
                    },
                  },
                  login2FA: z.data.isLg2FA,
                  hubConnectionID: this.hubConnectionID,
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
                  this.authService.setLogin(z.data?.user);
                  this.realHub.stop();
                  window.location.href = z.data?.host + z.data?.tenant;
                });
              }
            }
            
          }
        });
      }
    });
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

  changeTabs(evt) {}

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
    console.log('hub', this.hubConnectionID);

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
              '1',
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
    //     [this.testQRContent, '', '']
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
