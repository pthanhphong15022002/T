import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentOrderAddComponent } from './payment-order-add.component';

describe('PaymentOrderAddComponent', () => {
  let component: PaymentOrderAddComponent;
  let fixture: ComponentFixture<PaymentOrderAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentOrderAddComponent]
    });
    fixture = TestBed.createComponent(PaymentOrderAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
