import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCertificateInfoComponent } from './employee-certificate-info.component';

describe('EmployeeCertificateInfoComponent', () => {
  let component: EmployeeCertificateInfoComponent;
  let fixture: ComponentFixture<EmployeeCertificateInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeCertificateInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeCertificateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
