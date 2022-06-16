import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticalProjectComponent } from './statistical-project.component';

describe('StatisticalProjectComponent', () => {
  let component: StatisticalProjectComponent;
  let fixture: ComponentFixture<StatisticalProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticalProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticalProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
