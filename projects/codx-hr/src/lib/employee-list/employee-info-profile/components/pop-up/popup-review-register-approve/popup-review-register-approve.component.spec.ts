import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRegisterApproveComponent } from './popup-review-register-approve.component';

describe('PopupRegisterApproveComponent', () => {
  let component: PopupRegisterApproveComponent;
  let fixture: ComponentFixture<PopupRegisterApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupRegisterApproveComponent]
    });
    fixture = TestBed.createComponent(PopupRegisterApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
