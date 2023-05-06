import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddCashTransferComponent } from './popup-add-cash-transfer.component';

describe('PopupAddCashTransferComponent', () => {
  let component: PopupAddCashTransferComponent;
  let fixture: ComponentFixture<PopupAddCashTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddCashTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddCashTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
