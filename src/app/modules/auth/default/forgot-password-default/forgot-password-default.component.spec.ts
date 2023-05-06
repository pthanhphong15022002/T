import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  getTestBed,
} from '@angular/core/testing';

import { Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from 'codx-core';
import { ForgotPasswordDefaultComponent } from './forgot-password-default.component';

const fakeAuth = {
  email: 'admin@demo.com',
  password: 'demo',
};

class FakeAuthService {
  forgotPassword(email: string): Observable<boolean> {
    const isChecked = email.toLowerCase() === fakeAuth.email.toLowerCase();
    return of(isChecked);
  }
}

describe('ForgotPasswordDefaultComponent', () => {
  let component: ForgotPasswordDefaultComponent;
  let fixture: ComponentFixture<ForgotPasswordDefaultComponent>;
  let injector;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      declarations: [ForgotPasswordDefaultComponent],
      providers: [
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
    fixture = TestBed.createComponent(ForgotPasswordDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
