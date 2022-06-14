import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintsTasksComponent } from './sprints-tasks.component';

describe('SprintsTasksComponent', () => {
  let component: SprintsTasksComponent;
  let fixture: ComponentFixture<SprintsTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintsTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintsTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
