import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSercurityComponent } from './login-sercurity.component';

describe('LoginSercurityComponent', () => {
  let component: LoginSercurityComponent;
  let fixture: ComponentFixture<LoginSercurityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginSercurityComponent]
    });
    fixture = TestBed.createComponent(LoginSercurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
