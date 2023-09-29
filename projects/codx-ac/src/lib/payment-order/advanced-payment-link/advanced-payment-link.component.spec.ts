import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedPaymentLinkComponent } from './advanced-payment-link.component';

describe('AdvancedPaymentLinkComponent', () => {
  let component: AdvancedPaymentLinkComponent;
  let fixture: ComponentFixture<AdvancedPaymentLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedPaymentLinkComponent]
    });
    fixture = TestBed.createComponent(AdvancedPaymentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
