import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SercurityTOTPComponent } from './sercurity-totp.component';

describe('SercurityTOTPComponent', () => {
  let component: SercurityTOTPComponent;
  let fixture: ComponentFixture<SercurityTOTPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SercurityTOTPComponent]
    });
    fixture = TestBed.createComponent(SercurityTOTPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
