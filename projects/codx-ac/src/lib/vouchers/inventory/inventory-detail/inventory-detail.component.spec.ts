import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDetailComponent } from './inventory-detail.component';

describe('ReceiptTransactionsDetailComponent', () => {
  let component: InventoryDetailComponent;
  let fixture: ComponentFixture<InventoryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryDetailComponent]
    });
    fixture = TestBed.createComponent(InventoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
