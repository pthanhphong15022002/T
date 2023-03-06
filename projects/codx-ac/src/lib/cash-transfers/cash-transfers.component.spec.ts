import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashTransfersComponent } from './cash-transfers.component';

describe('CashTransfersComponent', () => {
  let component: CashTransfersComponent;
  let fixture: ComponentFixture<CashTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashTransfersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
