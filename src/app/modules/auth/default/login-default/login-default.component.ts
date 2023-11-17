import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RealHub, RealHubService, AuthService, UIComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { Modal } from 'bootstrap';
import { Login2FAComponent } from '@modules/auth/login/login2-fa/login2-fa.component';
import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

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
  @Input() loginDevice: Device;
  @Input() sysSetting;

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
  enableMultiLogin = true;
  // private fields

  //#region OTP
  otpTimeout = 0;
  otpMinutes = 0;
  //#endregion

  //#region QR
  isFirstQR = true;
  connection: any;
  qrTimeout: number = 0;
  qrTimeoutMinutes: number = 0;
  qrBase64: string = '/assets/codx/bg/qrCodx.png';
  isScaned = false;
  modal;
  //#endregion

  // PW-Validate
  pwValidate = {
    length: true,
    upper: true,
    lower: true,
    num: true,
    spcialChar: true,
  };

  constructor(
    private injector: Injector,
    private df: ChangeDetectorRef,
    private realHub: RealHubService,
    private authService: AuthService
  ) {
    super(injector);

    this.enableCaptcha = environment.captchaEnable;
    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    }
  }

  onInit(): void {
    console.log('logindefault device info', this.loginDevice);
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
                setTimeout(() => {
                  window.location.href = z.data?.host + z.data?.tenant;
                }, 1000);
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
                  if (lg2FAEvt.event) {
                    this.authService.setLogin(z.data?.user);
                    this.realHub.stop();
                    setTimeout(() => {
                      window.location.href = z.data?.host + z.data?.tenant;
                    }, 1000);
                  }
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
        [this.loginForm.controls['email'].value]
      )
      .subscribe((success) => {
        if (success) {
          this.otpTimeout = 180;
          let id = setInterval(
            () => {
              this.otpTimeout -= 1;
              this.otpMinutes = Math.floor(this.otpTimeout / 60);
              this.df.detectChanges();
              if (this.otpTimeout === 0) {
                clearInterval(id);
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
    this.api
      .execSv<string>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenQRCodeAsync',
        [
          this.hubConnectionID,
          this.loginDevice.name,
          this.loginDevice.os,
          ';;',
          // position.coords.accuracy +
          //   ';' +
          //   position.coords.latitude +
          //   ';' +
          //   position.coords.longitude,
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
              }
            },
            1000,
            this.qrTimeout
          );
          this.df.detectChanges();
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

  changeEmail() {
    this.email = this.loginForm.controls['email'].value;
  }

  testQR() {
    // let objData = {
    //   data: {
    //     data: {
    //       email: 'mannhi1601@gmail.com',
    //     },
    //   },
    //   login2FA: '1',
    //   hubConnectionID: this.hubConnectionID,
    // };
    // let lg2FADialog = this.callfc.openForm(
    //   Login2FAComponent,
    //   '',
    //   400,
    //   600,
    //   '',
    //   objData
    // );
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
  select(e: SelectEventArgs) {
    if (e.isSwiped) {
      e.cancel = true;
    }
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

  pwOnHover(formGroup: FormGroup, control: string) {
    let curValue = formGroup.controls[control].value as string;
    this.pwValidate = {
      length: curValue.length >= this.sysSetting.pwLength,
      num: Boolean(curValue.match(/[0-9]/)),
      lower: Boolean(curValue.match(/[a-z]/)),
      upper: Boolean(curValue.match(/[A-Z]/)),
      spcialChar: Boolean(curValue.match(/[!@#$%^&*?_~-£().,]/)),
    };
    this.detectorRef.detectChanges();
  }

  test() {
    console.log(this.changePassForm);
  }
}
