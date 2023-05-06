import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupECertificatesComponent } from './popup-ecertificates.component';

describe('PopupECertificatesComponent', () => {
  let component: PopupECertificatesComponent;
  let fixture: ComponentFixture<PopupECertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupECertificatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupECertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
