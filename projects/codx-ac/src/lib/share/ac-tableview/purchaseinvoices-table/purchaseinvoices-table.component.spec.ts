import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseinvoicesTableComponent } from './purchaseinvoices-table.component';

describe('PurchaseinvoicesTableComponent', () => {
  let component: PurchaseinvoicesTableComponent;
  let fixture: ComponentFixture<PurchaseinvoicesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseinvoicesTableComponent]
    });
    fixture = TestBed.createComponent(PurchaseinvoicesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
