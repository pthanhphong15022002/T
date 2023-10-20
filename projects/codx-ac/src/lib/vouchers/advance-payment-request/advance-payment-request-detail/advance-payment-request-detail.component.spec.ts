import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentRequestDetailComponent } from './advance-payment-request-detail.component';

describe('AdvancePaymentRequestDetailComponent', () => {
  let component: AdvancePaymentRequestDetailComponent;
  let fixture: ComponentFixture<AdvancePaymentRequestDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentRequestDetailComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
