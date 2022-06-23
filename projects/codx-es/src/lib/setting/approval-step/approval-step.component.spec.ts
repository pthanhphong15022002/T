import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalStepComponent } from './approval-step.component';

describe('ApprovalStepComponent', () => {
  let component: ApprovalStepComponent;
  let fixture: ComponentFixture<ApprovalStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalStepComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
