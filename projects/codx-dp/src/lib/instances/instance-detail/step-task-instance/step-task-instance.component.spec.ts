import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepTaskInstanceComponent } from './step-task-instance.component';

describe('StepTaskInstanceComponent', () => {
  let component: StepTaskInstanceComponent;
  let fixture: ComponentFixture<StepTaskInstanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepTaskInstanceComponent]
    });
    fixture = TestBed.createComponent(StepTaskInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
