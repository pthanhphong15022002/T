import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAwardsDetailComponent } from './employee-awards-detail.component';

describe('EmployeeAwardsDetailComponent', () => {
  let component: EmployeeAwardsDetailComponent;
  let fixture: ComponentFixture<EmployeeAwardsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAwardsDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAwardsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
