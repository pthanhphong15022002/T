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
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { catchError, finalize, map, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheRouteReuseStrategy,
  CacheService,
  ExtendUser,
  NotificationsService,
  TenantStore,
  UIComponent,
  UrlUtil,
  UserModel,
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
import { SignalRService } from 'projects/codx-share/src/lib/layout/drawers/chat/services/signalr.service';
import { Login2FAComponent } from './login2-fa/login2-fa.component';
import { CodxAdService } from 'projects/codx-ad/src/public-api';

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
  // private fields
  unsubscribe: Subscription[] = [];
  iParams = '';
  constructor(
    private inject: Injector,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private navRouter: Router,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    private routeActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    private auth: AuthStore,
    private signalRService: SignalRService,
    private readonly authService: AuthService,
    // private readonly extendAuthService: SocialAuthService,
    private shareService: CodxShareService,
    private adService: CodxAdService
  ) {
    super(inject);
    this.layoutCZ = environment.layoutCZ;
    const tenant = this.tenantStore.getName();
    CacheRouteReuseStrategy.clear();

    this.cache.systemSetting().subscribe((res) => {
      this.sysSetting = res;
    });
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
              dt.detectChanges();
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
        dt.detectChanges();
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
            } else this.navRouter.navigate([`/${tenant}`]);
          }
        });
      }
    });
  }

  onInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    // this.adService.getLoginSetting().subscribe((setting: any) => {
    //   let t2FA = JSON.parse(setting?.dataValue)['2FA'];
    //   this.login2FA = t2FA ?? '';
    //   console.log('setting', this.login2FA);
    // });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  get c() {
    return this.changePassForm.controls;
  }

  get fl() {
    return this.firstLoginForm.controls;
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

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([Validators.required]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
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
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        password: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        confirmPassword: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
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
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        confirmPassword: [
          //this.defaultAuth.password,
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
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
        if (!data1.isError) {
          const loginSubscr = this.authService
            .login(this.c.email.value, this.c.password.value)
            .pipe()
            .subscribe((data) => {
              if (data) {
                if (!data.isError) {
                  if (this.returnUrl.indexOf(data.tenant) > 0)
                    this.navRouter.navigate([`${this.returnUrl}`]);
                  else
                    this.navRouter.navigate([
                      `${data.tenant}/${this.returnUrl}`,
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
              this.loginAfter(data);
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
    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value, type, false)
      .pipe()
      .subscribe((data) => {
        this.login2FA = data?.data?.extends['Extends'] ?? '';
        //nho xoa
        // this.login2FA = '1';
        let objData = {
          data: data,
          login2FA: this.login2FA,
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
            this.loginAfter(lg2FAEvt.event.data);
          });
        } else {
          this.authService.setLogin(data.data);
          this.loginAfter(data);
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  private extendLogin(type: string) {
    var id = '';
  }

  private loginAfter(data: any) {
    if (!data.error) {
      const user = data.data;
      if (this.signalRService.logOut) {
        this.signalRService.createConnection();
      }
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
        } else window.location.href = this.returnUrl;
      } else {
        if (this.returnUrl.indexOf(user.tenant) > 0)
          return this.navRouter.navigate([`${this.returnUrl}`]);
        else if (environment.saas == 1) {
          if (!user.tenant) return this.navRouter.navigate(['/tenants']);
          else
            return this.navRouter.navigate([
              `${this.returnUrl ? this.returnUrl : user.tenant}`,
            ]);
        }
        window.location.href = this.returnUrl ? this.returnUrl : user.tenant;
      }
    } else {
      if (data.error.errorCode === 'AD027')
        return this.navRouter.navigate(['/']);
      // this.notificationsService.notify(data.error.errorMessage);
    }
    return false;
  }
  //#endregion

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
