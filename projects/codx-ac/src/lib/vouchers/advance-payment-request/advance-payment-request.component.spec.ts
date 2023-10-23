import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentRequestComponent } from './advance-payment-request.component';

describe('AdvancePaymentRequestComponent', () => {
  let component: AdvancePaymentRequestComponent;
  let fixture: ComponentFixture<AdvancePaymentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentRequestComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
