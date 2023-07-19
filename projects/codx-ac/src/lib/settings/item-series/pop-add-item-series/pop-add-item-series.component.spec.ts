import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddItemSeriesComponent } from './pop-add-item-series.component';

describe('PopAddItemSeriesComponent', () => {
  let component: PopAddItemSeriesComponent;
  let fixture: ComponentFixture<PopAddItemSeriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAddItemSeriesComponent]
    });
    fixture = TestBed.createComponent(PopAddItemSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
