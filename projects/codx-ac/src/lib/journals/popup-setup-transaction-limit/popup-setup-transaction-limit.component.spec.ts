import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSetupTransactionLimitComponent } from './popup-setup-transaction-limit.component';

describe('PopupSetupInvoiceComponent', () => {
  let component: PopupSetupTransactionLimitComponent;
  let fixture: ComponentFixture<PopupSetupTransactionLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSetupTransactionLimitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupSetupTransactionLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
