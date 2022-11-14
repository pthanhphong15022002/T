import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWorkingLisenceComponent } from './employee-working-lisence.component';

describe('EmployeeWorkingLisenceComponent', () => {
  let component: EmployeeWorkingLisenceComponent;
  let fixture: ComponentFixture<EmployeeWorkingLisenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeWorkingLisenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWorkingLisenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
