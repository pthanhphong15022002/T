import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEmployeeJobsalaryComponent } from './popup-employee-jobsalary.component';

describe('PopupEmployeeJobsalaryComponent', () => {
  let component: PopupEmployeeJobsalaryComponent;
  let fixture: ComponentFixture<PopupEmployeeJobsalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEmployeeJobsalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEmployeeJobsalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
