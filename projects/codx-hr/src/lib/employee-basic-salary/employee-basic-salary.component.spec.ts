import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeBasicSalaryComponent } from './employee-basic-salary.component';

describe('EmployeeBasicSalaryComponent', () => {
  let component: EmployeeBasicSalaryComponent;
  let fixture: ComponentFixture<EmployeeBasicSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeBasicSalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeBasicSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
