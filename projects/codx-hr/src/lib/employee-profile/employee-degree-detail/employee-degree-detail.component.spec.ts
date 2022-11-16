import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDegreeDetailComponent } from './employee-degree-detail.component';

describe('EmployeeDegreeDetailComponent', () => {
  let component: EmployeeDegreeDetailComponent;
  let fixture: ComponentFixture<EmployeeDegreeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDegreeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDegreeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
