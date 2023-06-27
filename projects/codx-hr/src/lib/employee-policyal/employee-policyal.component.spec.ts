import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePolicyalComponent } from './employee-policyal.component';

describe('EmployeePolicyalComponent', () => {
  let component: EmployeePolicyalComponent;
  let fixture: ComponentFixture<EmployeePolicyalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeePolicyalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePolicyalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
