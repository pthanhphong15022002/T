import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentAddComponent } from './advance-payment-add.component';

describe('AdvancePaymentAddComponent', () => {
  let component: AdvancePaymentAddComponent;
  let fixture: ComponentFixture<AdvancePaymentAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePaymentAddComponent]
    });
    fixture = TestBed.createComponent(AdvancePaymentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
