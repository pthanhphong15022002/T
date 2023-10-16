import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettledinvoicesTableComponent } from './settledinvoices-table.component';

describe('SettledinvoicesTableComponent', () => {
  let component: SettledinvoicesTableComponent;
  let fixture: ComponentFixture<SettledinvoicesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettledinvoicesTableComponent]
    });
    fixture = TestBed.createComponent(SettledinvoicesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
