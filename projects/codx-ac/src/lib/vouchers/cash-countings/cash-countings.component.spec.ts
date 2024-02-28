import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashCountingsComponent } from './cash-countings.component';

describe('CashCountingsComponent', () => {
  let component: CashCountingsComponent;
  let fixture: ComponentFixture<CashCountingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashCountingsComponent]
    });
    fixture = TestBed.createComponent(CashCountingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
