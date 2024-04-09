import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWaitingLeavingApproveComponent } from './dialog-waiting-leaving-approve.component';

describe('DialogWaitingLeavingApproveComponent', () => {
  let component: DialogWaitingLeavingApproveComponent;
  let fixture: ComponentFixture<DialogWaitingLeavingApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogWaitingLeavingApproveComponent]
    });
    fixture = TestBed.createComponent(DialogWaitingLeavingApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
