import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePolicygenernalComponent } from './employee-policygenernal.component';

describe('EmployeePolicygenernalComponent', () => {
  let component: EmployeePolicygenernalComponent;
  let fixture: ComponentFixture<EmployeePolicygenernalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeePolicygenernalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePolicygenernalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
