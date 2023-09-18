import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptTransactionsDetailComponent } from './receipt-transactions-detail.component';

describe('ReceiptTransactionsDetailComponent', () => {
  let component: ReceiptTransactionsDetailComponent;
  let fixture: ComponentFixture<ReceiptTransactionsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiptTransactionsDetailComponent]
    });
    fixture = TestBed.createComponent(ReceiptTransactionsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
