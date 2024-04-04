import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAgeChartComponent } from './dashboard-age-chart.component';

describe('DashboardAgeChartComponent', () => {
  let component: DashboardAgeChartComponent;
  let fixture: ComponentFixture<DashboardAgeChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardAgeChartComponent]
    });
    fixture = TestBed.createComponent(DashboardAgeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
