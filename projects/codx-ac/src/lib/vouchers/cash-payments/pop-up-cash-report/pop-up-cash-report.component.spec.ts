import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpCashReportComponent } from './pop-up-cash-report.component';

describe('PopUpCashReportComponent', () => {
  let component: PopUpCashReportComponent;
  let fixture: ComponentFixture<PopUpCashReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopUpCashReportComponent]
    });
    fixture = TestBed.createComponent(PopUpCashReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
