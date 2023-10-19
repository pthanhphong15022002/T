import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentRequestAddComponent } from './advance-payment-request-add.component';

describe('AdvancePaymentRequestAddComponent', () => {
  let component: AdvancePaymentRequestAddComponent;
  let fixture: ComponentFixture<AdvancePaymentRequestAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentRequestAddComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentRequestAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
