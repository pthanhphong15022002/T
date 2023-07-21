import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalPeriodsComponent } from './fiscal-periods.component';

describe('FiscalPeriodsComponent', () => {
  let component: FiscalPeriodsComponent;
  let fixture: ComponentFixture<FiscalPeriodsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FiscalPeriodsComponent]
    });
    fixture = TestBed.createComponent(FiscalPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
