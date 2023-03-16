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
  ExtendUser,
  NotificationsService,
  TenantStore,
  UrlUtil,
  UserModel,
} from 'codx-core';
import {
  AmazonLoginProvider,
  FacebookLoginProvider,
  GoogleLoginProvider,
  MicrosoftLoginProvider,
  SocialUser,
  SocialAuthService,
} from '@abacritt/angularx-social-login';

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

  // private fields
  unsubscribe: Subscription[] = [];

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
    private readonly authService: AuthService,
    private readonly extendAuthService: SocialAuthService
  ) {
    this.layoutCZ = environment.layoutCZ;
    const tenant = this.tenantStore.getName();
    CacheRouteReuseStrategy.clear();

    // redirect to home if already logged in
    this.routeActive.queryParams.subscribe((params) => {
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
                    document.location.href =
                      this.returnUrl + '&token=' + this.auth.get().token;
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
    switch (type) {
      case 'a':
        id = AmazonLoginProvider.PROVIDER_ID;
        break;
      case 'f':
        id = FacebookLoginProvider.PROVIDER_ID;
        break;
      case 'g':
        id = GoogleLoginProvider.PROVIDER_ID;
        break;
      case 'm':
        id = MicrosoftLoginProvider.PROVIDER_ID;
        break;
    }

    if (id) this.extendAuthService.signIn(id);
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
          this.api
            .get(`auth/GetInfoToken?token=${this.auth.get().token}`)
            .pipe(
              map((data: any) => {
                if (data && data.userID) {
                  document.location.href =
                    this.returnUrl + '&token=' + this.auth.get().token;
                }
              })
            )
            .subscribe();

          return;
        } else {
          if (this.returnUrl.indexOf(data.tenant) > 0)
            this.router.navigate([`${this.returnUrl}`]);
          else if (environment.saas == 1) {
            if (!data.tenant) this.router.navigate(['/tenants']);
            else this.router.navigate([`${data.tenant}`]);
          } else this.router.navigate([`${data.tenant}`]);
        }
      } else {
        // this.alerttext = data.error;
        //$(this.error.nativeElement).html(data.error);
        this.notificationsService.notify(data.error);
        // alert(data.error);
      }
      // this.router.navigate([this.returnUrl]);
    }
  }
  //#endregion

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
