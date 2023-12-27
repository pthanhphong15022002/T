import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingLoginQrcodeComponent } from './waiting-login-qrcode.component';

describe('WaitingLoginQrcodeComponent', () => {
  let component: WaitingLoginQrcodeComponent;
  let fixture: ComponentFixture<WaitingLoginQrcodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitingLoginQrcodeComponent]
    });
    fixture = TestBed.createComponent(WaitingLoginQrcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
