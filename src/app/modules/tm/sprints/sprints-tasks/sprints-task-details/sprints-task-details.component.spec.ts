import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintsTaskDetailsComponent } from './sprints-task-details.component';

describe('SprintsTaskDetailsComponent', () => {
  let component: SprintsTaskDetailsComponent;
  let fixture: ComponentFixture<SprintsTaskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintsTaskDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintsTaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
