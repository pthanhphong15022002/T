import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptTransactionsTableComponent } from './receipt-transactions-table.component';

describe('ReceiptTransactionsTableComponent', () => {
  let component: ReceiptTransactionsTableComponent;
  let fixture: ComponentFixture<ReceiptTransactionsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiptTransactionsTableComponent]
    });
    fixture = TestBed.createComponent(ReceiptTransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
