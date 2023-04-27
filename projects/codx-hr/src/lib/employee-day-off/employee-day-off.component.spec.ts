import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDayOffComponent } from './employee-day-off.component';

describe('EmployeeDayOffComponent', () => {
  let component: EmployeeDayOffComponent;
  let fixture: ComponentFixture<EmployeeDayOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDayOffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDayOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
