import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashPaymentsComponent } from './cashpayments.component';

describe('CashPaymentsComponent', () => {
  let component: CashPaymentsComponent;
  let fixture: ComponentFixture<CashPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
