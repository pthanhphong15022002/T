import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddApprovalStepComponent } from './popup-add-approval-step.component';

describe('PopupAddApprovalStepComponent', () => {
  let component: PopupAddApprovalStepComponent;
  let fixture: ComponentFixture<PopupAddApprovalStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupAddApprovalStepComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddApprovalStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
