import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApprovalSteps } from './edit-approval-step.component';

describe('EditApprovalSteps', () => {
  let component: EditApprovalSteps;
  let fixture: ComponentFixture<EditApprovalSteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditApprovalSteps],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditApprovalSteps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
