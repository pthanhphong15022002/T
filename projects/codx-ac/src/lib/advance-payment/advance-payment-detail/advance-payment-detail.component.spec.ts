import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentDetailComponent } from './advance-payment-detail.component';

describe('AdvancePaymentDetailComponent', () => {
  let component: AdvancePaymentDetailComponent;
  let fixture: ComponentFixture<AdvancePaymentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentDetailComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
