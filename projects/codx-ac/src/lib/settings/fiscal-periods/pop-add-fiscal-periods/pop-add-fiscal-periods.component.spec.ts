import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddFiscalPeriodsComponent } from './pop-add-fiscal-periods.component';

describe('PopAddFiscalPeriodsComponent', () => {
  let component: PopAddFiscalPeriodsComponent;
  let fixture: ComponentFixture<PopAddFiscalPeriodsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAddFiscalPeriodsComponent]
    });
    fixture = TestBed.createComponent(PopAddFiscalPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
