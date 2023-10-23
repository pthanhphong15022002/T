import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentRequestTableComponent } from './advance-payment-request-table.component';

describe('AdvancePaymentRequestTableComponent', () => {
  let component: AdvancePaymentRequestTableComponent;
  let fixture: ComponentFixture<AdvancePaymentRequestTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentRequestTableComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentRequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
