import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddSalesInvoiceComponent } from './popup-add-sales-invoice.component';

describe('PopupAddSalesInvoiceComponent', () => {
  let component: PopupAddSalesInvoiceComponent;
  let fixture: ComponentFixture<PopupAddSalesInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddSalesInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddSalesInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
