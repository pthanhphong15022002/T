import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogReviewLeaveApproveComponent } from './dialog-review-leave-approve.component';

describe('DialogReviewLeaveApproveComponent', () => {
  let component: DialogReviewLeaveApproveComponent;
  let fixture: ComponentFixture<DialogReviewLeaveApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogReviewLeaveApproveComponent]
    });
    fixture = TestBed.createComponent(DialogReviewLeaveApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
