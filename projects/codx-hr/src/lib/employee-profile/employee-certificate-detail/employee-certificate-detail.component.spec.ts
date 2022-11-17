import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCertificateDetailComponent } from './employee-certificate-detail.component';

describe('EmployeeCertificateDetailComponent', () => {
  let component: EmployeeCertificateDetailComponent;
  let fixture: ComponentFixture<EmployeeCertificateDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeCertificateDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeCertificateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
