import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDegreeInfoComponent } from './employee-degree-info.component';

describe('EmployeeDegreeInfoComponent', () => {
  let component: EmployeeDegreeInfoComponent;
  let fixture: ComponentFixture<EmployeeDegreeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDegreeInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDegreeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
