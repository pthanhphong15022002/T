import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSetupInvoiceComponent } from './popup-setup-invoice.component';

describe('PopupSetupInvoiceComponent', () => {
  let component: PopupSetupInvoiceComponent;
  let fixture: ComponentFixture<PopupSetupInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSetupInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupSetupInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
