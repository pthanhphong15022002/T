import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAppointionsComponent } from './employee-appointions.component';

describe('EmployeeAppointionsComponent', () => {
  let component: EmployeeAppointionsComponent;
  let fixture: ComponentFixture<EmployeeAppointionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAppointionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAppointionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
