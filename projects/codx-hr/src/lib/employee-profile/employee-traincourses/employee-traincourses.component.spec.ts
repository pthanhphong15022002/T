import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTraincoursesComponent } from './employee-traincourses.component';

describe('EmployeeTraincoursesComponent', () => {
  let component: EmployeeTraincoursesComponent;
  let fixture: ComponentFixture<EmployeeTraincoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeTraincoursesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTraincoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
