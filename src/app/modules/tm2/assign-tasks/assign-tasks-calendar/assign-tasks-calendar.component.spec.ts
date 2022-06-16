import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTasksCalendarComponent } from './assign-tasks-calendar.component';

describe('AssignTasksCalendarComponent', () => {
  let component: AssignTasksCalendarComponent;
  let fixture: ComponentFixture<AssignTasksCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTasksCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTasksCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
