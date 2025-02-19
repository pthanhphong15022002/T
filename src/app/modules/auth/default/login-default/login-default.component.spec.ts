// tslint:disable:no-string-literal
// https://codecraft.tv/courses/angular/unit-testing/model-driven-forms/
import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  getTestBed,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { LogoutComponent } from '../logout/logout.component';
import { UserModel, AuthService } from '@core/services';
import { LoginDefaultComponent } from './login-default.component';

const fakeAuth = {
  email: 'admin@demo.com',
  password: 'demo',
};

const mockActivatedRoute = {
  snapshot: {
    params: {},
    queryParams: {},
  },
};

const fakeRoutes: Routes = [
  { path: 'auth/login', component: LoginDefaultComponent },
  { path: 'auth/logout', component: LogoutComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
];

class FakeAuthService {
  login(email: string, password: string): Observable<UserModel> {
    const isChecked =
      email === fakeAuth.email && password === fakeAuth.password;
    if (!isChecked) {
      return of(undefined);
    }

    const user = new UserModel();
    user.username = 'admin';
    user.password = 'demo';
    user.email = 'admin@demo.com';
    return of(user);
  }
}

describe('LoginDefaultComponent', () => {
  let component: LoginDefaultComponent;
  let fixture: ComponentFixture<LoginDefaultComponent>;
  let injector;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterModule.forRoot(fakeRoutes),
      ],
      declarations: [LoginDefaultComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: AuthService,
          useClass: FakeAuthService,
        },
      ],
    }).compileComponents();

    injector = getTestBed();
    authService = injector.get(AuthService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form valid with default data', () => {
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('email field validity', () => {
    let errors = {};
    const email = component.loginForm.controls.email;
    expect(email.valid).toBeTruthy();

    // Email field is required
    // Set empty email first
    email.setValue('');
    errors = email.errors || {};
    // tslint:disable-next-line:no-string-literal
    expect(errors['required']).toBeTruthy();

    // Set email to something
    email.setValue('te');
    errors = email.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['email']).toBeTruthy();
    expect(errors['minlength']).toBeTruthy();

    // Set email to something correct
    email.setValue('test@example.com');
    errors = email.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['email']).toBeFalsy();
    expect(errors['minlength']).toBeFalsy();
    expect(errors['maxlength']).toBeFalsy();
  });

  it('password field validity', () => {
    let errors;
    const password = component.loginForm.controls['password'];
    expect(password.valid).toBeTruthy();
    password.setValue('12');
    expect(password.value).toBe('12');
    errors = password.errors || {};
    expect(errors['minlength']).toBeTruthy();

    password.setValue('');
    expect(password.value).toBe('');
    expect(password.valid).toBeFalsy();
    errors = password.errors || {};
    expect(errors['required']).toBeTruthy();

    // Set password to something correct
    password.setValue('123456789');
    errors = password.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeFalsy();
    expect(errors['maxlength']).toBeFalsy();
  });
});
