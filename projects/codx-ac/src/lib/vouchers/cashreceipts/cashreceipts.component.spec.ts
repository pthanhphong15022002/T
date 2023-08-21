import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashreceiptsComponent } from './cashreceipts.component';

describe('CashreceiptsComponent', () => {
  let component: CashreceiptsComponent;
  let fixture: ComponentFixture<CashreceiptsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashreceiptsComponent]
    });
    fixture = TestBed.createComponent(CashreceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
