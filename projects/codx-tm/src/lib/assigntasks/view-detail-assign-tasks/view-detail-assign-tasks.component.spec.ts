import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailAssignTasksComponent } from './view-detail-assign-tasks.component';

describe('ViewDetailAssignTasksComponent', () => {
  let component: ViewDetailAssignTasksComponent;
  let fixture: ComponentFixture<ViewDetailAssignTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailAssignTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDetailAssignTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
