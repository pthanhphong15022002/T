import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticalViewlistComponent } from './statistical-viewlist.component';

describe('StatisticalViewlistComponent', () => {
  let component: StatisticalViewlistComponent;
  let fixture: ComponentFixture<StatisticalViewlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticalViewlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticalViewlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
