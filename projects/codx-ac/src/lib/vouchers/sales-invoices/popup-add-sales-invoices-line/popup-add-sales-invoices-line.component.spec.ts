import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddSalesInvoicesLineComponent } from './popup-add-sales-invoices-line.component';

describe('PopupAddSalesInvoicesLineComponent', () => {
  let component: PopupAddSalesInvoicesLineComponent;
  let fixture: ComponentFixture<PopupAddSalesInvoicesLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddSalesInvoicesLineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddSalesInvoicesLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
