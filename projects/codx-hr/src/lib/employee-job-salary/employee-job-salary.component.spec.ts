import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobSalaryComponent } from './employee-job-salary.component';

describe('EmployeeJobSalaryComponent', () => {
  let component: EmployeeJobSalaryComponent;
  let fixture: ComponentFixture<EmployeeJobSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeJobSalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeJobSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
