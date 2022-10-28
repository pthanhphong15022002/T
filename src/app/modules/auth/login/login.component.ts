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
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheRouteReuseStrategy,
  NotificationsService,
  TenantStore,
  UrlUtil,
} from 'codx-core';

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
  mode: string = 'login';
  user: any;

  // private fields
  private unsubscribe: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    private api: ApiHttpService,
    private routeActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    private auth: AuthStore
  ) {
    const tenant = this.tenantStore.getName();
    CacheRouteReuseStrategy.clear();
    
    // redirect to home if already logged in
    this.routeActive.queryParams.subscribe((params) => {
      if (params.sk) {
        this.api
          .call('ERM.Business.AD', 'UsersBusiness', 'GetUserBySessionAsync', [
            params.sk,
          ])
          .subscribe((res) => {
            if (res && res.msgBodyData[0]) {
              this.sessionID = params.sk;
              this.email = res.msgBodyData[0].email;
              if (
                res.msgBodyData[0].lastLogin == null ||
                (params.id && params.id == 'forget')
              ) {
                this.mode = 'firstLogin';
                dt.detectChanges();
              }
            }
          });
      }
      if (params.id && params.id == 'changePass') {
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
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });

    this.changePassForm = this.fb.group(
      {
        email: [
          //this.defaultAuth.email,
          '',
          Validators.compose([Validators.required, Validators.email]),
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
      },
      { validators: this.checkPasswords }
    );

    this.firstLoginForm = this.fb.group(
      {
        email: [
          //this.defaultAuth.email,
          '',
          Validators.compose([Validators.required, Validators.email]),
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

  submit() {
    //$(this.error.nativeElement).html('');
    this.hasError = false;
    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe()
      .subscribe((data) => {
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
                  map((data) => {
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
              else this.router.navigate([`${data.tenant}/${this.returnUrl}`]);
            }
          } else {
            // this.alerttext = data.error;
            //$(this.error.nativeElement).html(data.error);
            this.notificationsService.notify(data.error);
            // alert(data.error);
          }
          // this.router.navigate([this.returnUrl]);
        }
        //  else {
        //   this.hasError = true;
        //   //this.alerttext = this.authService.message;
        // }
      });
    this.unsubscribe.push(loginSubscr);
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
