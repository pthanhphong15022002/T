import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignListTasksComponent } from './assign-list-tasks.component';

describe('AssignListTasksComponent', () => {
  let component: AssignListTasksComponent;
  let fixture: ComponentFixture<AssignListTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignListTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignListTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
