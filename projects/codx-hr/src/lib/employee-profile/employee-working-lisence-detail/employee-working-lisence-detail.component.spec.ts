import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWorkingLisenceDetailComponent } from './employee-working-lisence-detail.component';

describe('EmployeeWorkingLisenceDetailComponent', () => {
  let component: EmployeeWorkingLisenceDetailComponent;
  let fixture: ComponentFixture<EmployeeWorkingLisenceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeWorkingLisenceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWorkingLisenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
