import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeVisaFormComponent } from './employee-visa-form.component';

describe('EmployeeVisaFormComponent', () => {
  let component: EmployeeVisaFormComponent;
  let fixture: ComponentFixture<EmployeeVisaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeVisaFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeVisaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
