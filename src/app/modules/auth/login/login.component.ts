import { LoginService } from './login.service';
import { environment } from 'src/environments/environment';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Injector,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthService,
  AuthStore,
  CacheRouteReuseStrategy,
  NotificationsService,
  RealHub,
  RealHubService,
  TenantStore,
  UIComponent,
  UrlUtil,
} from 'codx-core';
// import {
//   AmazonLoginProvider,
//   FacebookLoginProvider,
//   GoogleLoginProvider,
//   MicrosoftLoginProvider,
//   SocialUser,
//   SocialAuthService,
// } from '@abacritt/angularx-social-login';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Login2FAComponent } from './login2-fa/login2-fa.component';
import { AngularDeviceInformationService } from 'angular-device-information';
import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';
import { SignalRService } from 'projects/codx-common/src/lib/_layout/drawers/chat/services/signalr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends UIComponent implements OnInit, OnDestroy {
  @ViewChild('Error') error: ElementRef;
  defaultAuth: any = {
    email: '', // 'admin@demo.com',
    password: '', // 'demo'
  };
  loginForm: FormGroup;
  changePassForm: FormGroup;
  firstLoginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  alerttext: string;
  sessionID = null;
  email = null;
  mode: string = 'login'; // 'login' | 'firstLogin' | 'activeTenant' | 'changePass';
  user: any;
  layoutCZ: any;
  sysSetting;
  login2FA = '';
  hubConnectionID = '';
  // private fields
  unsubscribe: Subscription[] = [];
  iParams = '';
  loginDevice: Device;
  tenant;
  constructor(
    private inject: Injector,
    private fb: FormBuilder,
    private navRouter: Router,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    private routeActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    private auth: AuthStore,
    private realHub: RealHubService,
    private signalRService: SignalRService,
    private readonly authService: AuthService,
    // private readonly extendAuthService: SocialAuthService,
    private shareService: CodxShareService,
    private deviceInfo: AngularDeviceInformationService,
    private loginService: LoginService
  ) {
    super(inject);
    this.layoutCZ = environment.layoutCZ;
    this.tenant = this.tenantStore.getName();
    CacheRouteReuseStrategy.clear();

    // this.cache.systemSetting().subscribe((res) => {
    //   this.sysSetting = res;
    // });

    // redirect to home if already logged in
    this.routeActive.queryParams.subscribe((params) => {
      // if (params.i){
      //   this.iParams = params.i
      // }
      if (params.sk) {
        this.api
          .execSv<string[]>(
            'SYS',
            'ERM.Business.AD',
            'UsersBusiness',
            'GetUserBySessionAsync',
            [params.sk]
          )
          .subscribe((res) => {
            //[email, mode]
            if (res) {
              this.sessionID = params.sk;
              this.email = res[0];
              this.mode = res[1];
              this.getSettingForm();
              // dt.detectChanges();
              this.detectorRef.detectChanges();
              // if (
              //   res.msgBodyData[0].lastLogin == null ||
              //   (params.id && params.id == 'forget')
              // ) {
              //   this.mode = 'firstLogin';
              //   dt.detectChanges();
              // }
            }
          });
      } else if (params.id && params.id == 'changePass') {
        this.mode = params.id;
        this.user = this.auth.get();
        this.email = this.user.email;
        this.detectorRef.detectChanges();

        // dt.detectChanges();
      } else {
        this.authService.checkUserStatus().subscribe((res) => {
          if (res) {
            this.returnUrl = UrlUtil.getUrl('returnUrl') || '';
            if (this.returnUrl) {
              this.returnUrl = decodeURIComponent(this.returnUrl);
            }
            if (
              this.returnUrl.indexOf('http://') == 0 ||
              this.returnUrl.indexOf('https://') == 0
            ) {
              this.iParams = UrlUtil.getUrl('i') || '';
              if (this.iParams.toLocaleLowerCase() == 'hcs') {
                this.shareService.redirect(this.iParams, this.returnUrl);
              } else {
                document.location.href = this.returnUrl;
              }
            } else this.navRouter.navigate([`/${this.tenant}`]);
          }
        });
      }
    });
    let dInfo = this.deviceInfo.getDeviceInfo();
    this.loginDevice = {
      name: dInfo.browser,
      os: dInfo.os + ' ' + dInfo.osVersion,
      ip: '',
      imei: null,
      id: null,
      trust: false,
      tenantID: this.tenant,
      times: '1',
    };
    console.log('login device info', this.loginDevice);
  }

  onInit(): void {
    this.initForm();

    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.router.snapshot.queryParams['returnUrl'.toString()] || '/';
    this.realHub.start('ad').then((x: RealHub) => {
      let t = this;
      x.hub.invoke('GetConnectionId').then(function (connectionId) {
        t.realHub['hubConnectionID'] = connectionId;
        t.hubConnectionID = connectionId;
      });
    });
  }

  getSettingForm(callback?: any) {
    if (this.mode == 'firstLogin' || this.mode == 'changePass') {
      this.loginService.getUserLoginSetting(this.email).subscribe((setting) => {
        this.sysSetting = setting;
        if (callback) return callback();
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm?.controls;
  }
  get c() {
    return this.changePassForm?.controls;
  }

  get fl() {
    return this.firstLoginForm?.controls;
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  forgotPass() {
    const tenant = this.tenantStore.getName();
    this.navRouter.navigate([`/${tenant}/auth/forgotpassword`]);
  }

  validatePWPattern(setting): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !setting?.pwSensitive
        ? !Boolean(control.value.match(/[!@#$%^&*?_~-£().,]/))
          ? { NotMatch: control.value }
          : null
        : null;
    };
  }

  initForm() {
    let minL = this.sysSetting?.pwLength ?? 3;
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([Validators.required]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(minL),
          Validators.maxLength(100),
        ]),
      ],
      //captCha: ['', Validators.compose([Validators.required])],
    });

    this.changePassForm = this.fb.group(
      {
        email: [
          //this.defaultAuth.email,
          '',
          Validators.compose([Validators.required]),
        ],
        passwordOld: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(minL),
            Validators.maxLength(100),
            // Validators.pattern(pattern),
            // this.validatePWPattern(),
          ]),
        ],
        password: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(minL),
            Validators.maxLength(100),
            // Validators.pattern(pattern),
            this.validatePWPattern(this.sysSetting),
          ]),
        ],
        confirmPassword: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(minL),
            Validators.maxLength(100),
            // Validators.pattern(pattern),
            this.validatePWPattern(this.sysSetting),
          ]),
        ],
        //captCha: ['', Validators.compose([Validators.required])],
      },
      { validators: this.checkPasswords }
    );

    this.firstLoginForm = this.fb.group(
      {
        email: [
          //this.defaultAuth.email,
          '',
          Validators.compose([Validators.required]),
        ],
        password: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(minL),
            Validators.maxLength(100),
            // Validators.pattern(pattern),
            this.validatePWPattern(this.sysSetting),
          ]),
        ],
        confirmPassword: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(minL),
            Validators.maxLength(100),
            this.validatePWPattern(this.sysSetting),
            // Validators.pattern(pattern),
          ]),
        ],
        //captCha: ['', Validators.compose([Validators.required])],
      },
      { validators: this.checkPasswords }
    );
  }

  valueChange(event: any) {
    if (!event) return;
    let value = event.data;
    this.f.password.patchValue(value);
    this.dt.detectChanges();
  }

  submit(type?: string) {
    if (!type) {
      type = '';
    }
    let loginType = ['', 'otp', 'qr'];
    if (loginType.includes(type)) {
      this.login(type);
    } else {
      this.extendLogin(type);
    }
  }

  submitChangePass() {
    if (
      (this.mode == 'firstLogin' || this.mode == 'changePass') &&
      this.c.email.value.toString().trim() != this.email.trim()
    ) {
      this.notificationsService.notify('Email không phù hợp!');
      return;
    }
    if (this.c.passwordOld.status == 'INVALID') {
      this.notificationsService.notify('Vui lòng nhập mật khẩu cũ!');
      return;
    }
    var passOld = '';
    if (this.mode == 'changePass') passOld = this.c.passwordOld.value;
    const changepwSubscr = this.authService
      .changepw(this.c.email.value, passOld, this.c.password.value)
      .pipe()
      .subscribe((data1) => {
        if (!data1.error) {
          const loginSubscr = this.authService
            .login(this.c.email.value, this.c.password.value, '', true)
            .pipe()
            .subscribe((data) => {
              if (data) {
                if (!data.error) {
                  if (this.returnUrl.indexOf(data.data.tenant) > 0)
                    this.navRouter.navigate([`${this.returnUrl}`]);
                  else
                    this.navRouter.navigate([
                      `${data.data.tenant}/${this.returnUrl}`,
                    ]);
                } else {
                  //$(this.error.nativeElement).html(data.error);
                  this.notificationsService.notify(data.error);
                }
              }
            });
          this.unsubscribe.push(loginSubscr);
        } else {
          //$(this.error.nativeElement).html(data1.error);
          this.notificationsService.notify(data1.error);
        }
      });
  }

  submitFirstLogin() {
    if (this.fl.email.value.toString().trim() != this.email.trim()) {
      this.notificationsService.notify('Email không phù hợp!');
      return;
    }
    //$(this.error.nativeElement).html('');
    const changepwSubscr = this.authService
      .changepw(this.fl.email.value, '', this.fl.password.value)
      .pipe()
      .subscribe((data1) => {
        if (!data1.isError) {
          const loginSubscr = this.authService
            .login(this.fl.email.value, this.fl.password.value)
            .pipe()
            .subscribe((data) => {
              this.loginService.loginAfter(data);
            });
          this.unsubscribe.push(loginSubscr);
        } else {
          //$(this.error.nativeElement).html(data1.error);
          this.notificationsService.notify(data1.error);
        }
      });
  }

  //#region Login
  private login(type: string) {
    //nho xoa
    const loginSubscr = this.authService
      .login(
        this.f.email.value,
        this.f.password.value,
        type,
        false,
        JSON.stringify(this.loginDevice)
      )
      .pipe()
      .subscribe((data) => {
        if (!data.error) {
          this.login2FA = data?.data?.extends?.Login2FA ?? '';
          let objData = {
            data: data,
            login2FA: this.login2FA,
            hubConnectionID: this.hubConnectionID,
            loginDevice: this.loginDevice,
          };

          if (this.login2FA != '') {
            let lg2FADialog = this.callfc.openForm(
              Login2FAComponent,
              '',
              400,
              600,
              '',
              objData
            );
            lg2FADialog.closed.subscribe((lg2FAEvt) => {
              console.log('close popup ', lg2FAEvt);
              if (lg2FAEvt.event.data.error) return;
              this.authService.setLogin(data.data);

              this.loginService.loginAfter(lg2FAEvt.event.data);
            });
          } else {
            this.authService.setLogin(data.data);
            this.loginService.loginAfter(data);
          }
        } else {
          this.loginService.loginAfter(data);
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  private extendLogin(type: string) {
    var id = '';
  }

  // private loginAfter(data: any) {
  //   if (!data.error) {
  //     const user = data.data;
  //     if (this.signalRService.logOut) {
  //       this.signalRService.createConnection();
  //     }
  //     this.returnUrl = UrlUtil.getUrl('returnUrl') || '';
  //     if (this.returnUrl) {
  //       this.returnUrl = decodeURIComponent(this.returnUrl);
  //     }

  //     if (
  //       this.returnUrl.indexOf('http://') == 0 ||
  //       this.returnUrl.indexOf('https://') == 0
  //     ) {
  //       this.iParams = UrlUtil.getUrl('i') || '';

  //       if (this.iParams.toLocaleLowerCase() == 'hcs') {
  //         this.shareService.redirect(this.iParams, this.returnUrl);
  //       } else window.location.href = this.returnUrl;
  //     } else {
  //       if (this.returnUrl.indexOf(user.tenant) > 0)
  //         return this.navRouter.navigate([`${this.returnUrl}`]);
  //       else if (environment.saas == 1) {
  //         if (!user.tenant) return this.navRouter.navigate(['/tenants']);
  //         else
  //           return this.navRouter.navigate([
  //             `${this.returnUrl ? this.returnUrl : user.tenant}`,
  //           ]);
  //       }
  //       window.location.href = this.returnUrl ? this.returnUrl : user.tenant;
  //     }
  //   } else {
  //     if (data.error.errorCode === 'AD027')
  //       return this.navRouter.navigate(['/']);
  //     // this.notificationsService.notify(data.error.errorMessage);
  //   }
  //   return false;
  // }
  //#endregion

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
