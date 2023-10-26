import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupApprovalComponent } from './popup-approval.component';

describe('PopupApprovalComponent', () => {
  let component: PopupApprovalComponent;
  let fixture: ComponentFixture<PopupApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupApprovalComponent]
    });
    fixture = TestBed.createComponent(PopupApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
