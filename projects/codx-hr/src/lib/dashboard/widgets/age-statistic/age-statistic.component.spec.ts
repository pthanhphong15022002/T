import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeStatisticComponent } from './age-statistic.component';

describe('AgeStatisticComponent', () => {
  let component: AgeStatisticComponent;
  let fixture: ComponentFixture<AgeStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgeStatisticComponent]
    });
    fixture = TestBed.createComponent(AgeStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
