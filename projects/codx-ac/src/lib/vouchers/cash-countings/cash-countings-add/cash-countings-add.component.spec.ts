import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashCountingsAddComponent } from './cash-countings-add.component';

describe('CashCountingsAddComponent', () => {
  let component: CashCountingsAddComponent;
  let fixture: ComponentFixture<CashCountingsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashCountingsAddComponent]
    });
    fixture = TestBed.createComponent(CashCountingsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
