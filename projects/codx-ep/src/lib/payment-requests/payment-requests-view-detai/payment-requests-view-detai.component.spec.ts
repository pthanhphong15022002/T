import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRequestsViewDetaiComponent } from './payment-requests-view-detai.component';

describe('PaymentRequestsViewDetaiComponent', () => {
  let component: PaymentRequestsViewDetaiComponent;
  let fixture: ComponentFixture<PaymentRequestsViewDetaiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentRequestsViewDetaiComponent]
    });
    fixture = TestBed.createComponent(PaymentRequestsViewDetaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
