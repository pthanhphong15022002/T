import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashpaymentDetailComponent } from './cashpayment-detail.component';

describe('CashpaymentDetailComponent', () => {
  let component: CashpaymentDetailComponent;
  let fixture: ComponentFixture<CashpaymentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashpaymentDetailComponent]
    });
    fixture = TestBed.createComponent(CashpaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
