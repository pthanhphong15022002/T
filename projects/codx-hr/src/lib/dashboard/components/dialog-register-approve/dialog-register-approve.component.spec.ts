import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRegisterApproveComponent } from './dialog-register-approve.component';

describe('DialogRegisterApproveComponent', () => {
  let component: DialogRegisterApproveComponent;
  let fixture: ComponentFixture<DialogRegisterApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogRegisterApproveComponent]
    });
    fixture = TestBed.createComponent(DialogRegisterApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
