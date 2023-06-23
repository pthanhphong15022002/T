import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePolicybenefitsComponent } from './employee-policybenefits.component';

describe('EmployeePolicybenefitsComponent', () => {
  let component: EmployeePolicybenefitsComponent;
  let fixture: ComponentFixture<EmployeePolicybenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeePolicybenefitsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePolicybenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
