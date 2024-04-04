import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTotalemployeeChartComponent } from './dashboard-totalemployee-chart.component';

describe('DashboardTotalemployeeChartComponent', () => {
  let component: DashboardTotalemployeeChartComponent;
  let fixture: ComponentFixture<DashboardTotalemployeeChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTotalemployeeChartComponent]
    });
    fixture = TestBed.createComponent(DashboardTotalemployeeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
