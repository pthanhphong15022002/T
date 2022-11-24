import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditApprovalStepComponent } from './add-edit-approval-step.component';

describe('AddEditApprovalStepComponent', () => {
  let component: AddEditApprovalStepComponent;
  let fixture: ComponentFixture<AddEditApprovalStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditApprovalStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditApprovalStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
