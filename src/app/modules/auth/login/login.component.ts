import { environment } from 'src/environments/environment';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
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
  // private fields
  unsubscribe: Subscription[] = [];
  iParams = '';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    private api: ApiHttpService,
    private routeActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    private auth: AuthStore,
    private cache: CacheService,
    private readonly authService: AuthService,
    // private readonly extendAuthService: SocialAuthService,
    private shareService: CodxShareService
  ) {
    this.layoutCZ = environment.layoutCZ;
    const tenant = this.tenantStore.getName();
    CacheRouteReuseStrategy.clear();

    this.cache.systemSetting().subscribe((res) => {
      console.log('systemSet', res);
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
            console.log('em', res);
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
        if (this.authService.checkUserStatus()) {
          this.returnUrl = UrlUtil.getUrl('returnUrl') || '';
          if (this.returnUrl) {
            this.returnUrl = decodeURIComponent(this.returnUrl);
          }
          if (
            this.returnUrl.indexOf('http://') == 0 ||
            this.returnUrl.indexOf('https://') == 0
          ) {
            this.api
              .get(`auth/GetInfoToken?token=${this.auth.get().token}`)
              .pipe(
                map((data) => {
                  if (data && data.userID) {
                    this.iParams = UrlUtil.getUrl('i') || '';
                    if (this.iParams.toLocaleLowerCase() == 'hcs') {
                      this.shareService.redirect(this.iParams, this.returnUrl);
                    } else {
                      document.location.href =
                        this.returnUrl + '&token=' + this.auth.get().token;
                    }
                  }
                })
              )
              .subscribe();

            return;
          } else this.router.navigate([`/${tenant}`]);
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';

    // this.extendAuthService.authState.subscribe(
    //   (sus: SocialUser | undefined) => {
    //     if (sus) {
    //       let extendUser = new ExtendUser()
    //       extendUser.provider = sus.provider;
    //       extendUser.id = sus.id;
    //       extendUser.email = sus.email;
    //       extendUser.name = sus.name;
    //       extendUser.photoUrl = sus.photoUrl;
    //       extendUser.firstName = sus.firstName;
    //       extendUser.lastName = sus.lastName;
    //       extendUser.idToken = sus.idToken;
    //       extendUser.authToken = sus.authToken;
    //       extendUser.authorizationCode = sus.authorizationCode;
    //       extendUser.response = sus.response;

    //       const loginSubscr = this.authService
    //         .extendLogin(extendUser)
    //         .pipe()
    //         .subscribe((data) => {
    //           this.loginAfter(data);
    //         });
    //       this.unsubscribe.push(loginSubscr);
    //     }
    //   }
    // );
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
    this.router.navigate([`/${tenant}/auth/forgotpassword`]);
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
    if (type) this.extendLogin(type);
    else this.login();
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
                    this.router.navigate([`${this.returnUrl}`]);
                  else
                    this.router.navigate([`${data.tenant}/${this.returnUrl}`]);
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
              if (data) {
                if (!data.isError) {
                  if (this.returnUrl.indexOf(data.tenant) > 0)
                    this.router.navigate([`${this.returnUrl}`]);
                  else
                    this.router.navigate([`${data.tenant}/${this.returnUrl}`]);
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

  //#region Login
  private login() {
    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe()
      .subscribe((data) => {
        this.loginAfter(data);
      });
    this.unsubscribe.push(loginSubscr);
  }

  private extendLogin(type: string) {
    var id = '';
  }

  private loginAfter(data: any) {
    if (data) {
      if (!data.isError) {
        this.returnUrl = UrlUtil.getUrl('returnUrl') || '';
        if (this.returnUrl) {
          this.returnUrl = decodeURIComponent(this.returnUrl);
        }

        if (
          this.returnUrl.indexOf('http://') == 0 ||
          this.returnUrl.indexOf('https://') == 0
        ) {
          return (
            this.api
              .get(`auth/GetInfoToken?token=${this.auth.get().token}`)
              // .pipe(
              //   map((data: any) => {
              //     if (data && data.userID) {
              //       this.router.navigate([`${this.returnUrl + '&token=' + this.auth.get().token}`]);
              //       document.location.href =
              //         this.returnUrl + '&token=' + this.auth.get().token;
              //     }
              //   })
              // )
              .subscribe((data: any) => {
                this.iParams = UrlUtil.getUrl('i') || '';

                if (this.iParams.toLocaleLowerCase() == 'hcs') {
                  this.shareService.redirect(this.iParams, this.returnUrl);
                } else if (data && data.userID)
                  this.router.navigate([
                    `${this.returnUrl + '&token=' + this.auth.get().token}`,
                  ]);
              })
          );
        } else {
          if (this.returnUrl.indexOf(data.tenant) > 0)
            return this.router.navigate([`${this.returnUrl}`]);
          // window.location.href = this.returnUrl;
          else if (environment.saas == 1) {
            if (!data.tenant) return this.router.navigate(['/tenants']);
            //window.location.href = '/tenants';
            // window.location.href = this.returnUrl
            //   ? this.returnUrl
            //   : data.tenant;
            else
              return this.router.navigate([
                `${this.returnUrl ? this.returnUrl : data.tenant}`,
              ]);
          }
          window.location.href = this.returnUrl ? this.returnUrl : data.tenant;
          // return this.router.navigate([
          //   `${this.returnUrl ? this.returnUrl : data.tenant}`,
          // ]);
        }
      } else {
        this.notificationsService.notify(data.error);
        return false;
      }
      return this.router.navigate([this.returnUrl]);
    }
    return false;
  }
  //#endregion

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
