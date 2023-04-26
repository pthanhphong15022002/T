import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeBusinessTravelComponent } from './employee-business-travel.component';

describe('EmployeeBusinessTravelComponent', () => {
  let component: EmployeeBusinessTravelComponent;
  let fixture: ComponentFixture<EmployeeBusinessTravelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeBusinessTravelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeBusinessTravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
