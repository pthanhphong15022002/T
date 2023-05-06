import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEAssurTaxBankComponent } from './popup-eassur-tax-bank.component';

describe('PopupEAssurTaxBankComponent', () => {
  let component: PopupEAssurTaxBankComponent;
  let fixture: ComponentFixture<PopupEAssurTaxBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEAssurTaxBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEAssurTaxBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
