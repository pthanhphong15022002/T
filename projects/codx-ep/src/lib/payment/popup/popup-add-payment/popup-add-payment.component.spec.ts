import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddPaymentComponent } from './popup-add-payment.component';

describe('PopupAddPaymentComponent', () => {
  let component: PopupAddPaymentComponent;
  let fixture: ComponentFixture<PopupAddPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddPaymentComponent]
    });
    fixture = TestBed.createComponent(PopupAddPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
