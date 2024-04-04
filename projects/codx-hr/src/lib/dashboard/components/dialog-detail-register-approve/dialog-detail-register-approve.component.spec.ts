import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailRegisterApproveComponent } from './dialog-detail-register-approve.component';

describe('DialogDetailRegisterApproveComponent', () => {
  let component: DialogDetailRegisterApproveComponent;
  let fixture: ComponentFixture<DialogDetailRegisterApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogDetailRegisterApproveComponent]
    });
    fixture = TestBed.createComponent(DialogDetailRegisterApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
