import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAwardsInfoComponent } from './employee-awards-info.component';

describe('EmployeeAwardsInfoComponent', () => {
  let component: EmployeeAwardsInfoComponent;
  let fixture: ComponentFixture<EmployeeAwardsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAwardsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAwardsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
