import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupWalletHistoryComponent } from './popup-wallet-history.component';

describe('PopupWalletHistoryComponent', () => {
  let component: PopupWalletHistoryComponent;
  let fixture: ComponentFixture<PopupWalletHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupWalletHistoryComponent]
    });
    fixture = TestBed.createComponent(PopupWalletHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
