import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectChartComponent } from './project-chart.component';

describe('ProjectChartComponent', () => {
  let component: ProjectChartComponent;
  let fixture: ComponentFixture<ProjectChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
