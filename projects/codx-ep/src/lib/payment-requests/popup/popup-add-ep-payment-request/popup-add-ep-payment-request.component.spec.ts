import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEpPaymentRequestComponent } from './popup-add-ep-payment-request.component';

describe('PopupAddEpPaymentRequestComponent', () => {
  let component: PopupAddEpPaymentRequestComponent;
  let fixture: ComponentFixture<PopupAddEpPaymentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddEpPaymentRequestComponent]
    });
    fixture = TestBed.createComponent(PopupAddEpPaymentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
