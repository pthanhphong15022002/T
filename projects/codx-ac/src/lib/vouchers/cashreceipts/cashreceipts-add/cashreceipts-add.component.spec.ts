import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashreceiptsAddComponent } from './cashreceipts-add.component';

describe('CashreceiptsAddComponent', () => {
  let component: CashreceiptsAddComponent;
  let fixture: ComponentFixture<CashreceiptsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashreceiptsAddComponent]
    });
    fixture = TestBed.createComponent(CashreceiptsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
