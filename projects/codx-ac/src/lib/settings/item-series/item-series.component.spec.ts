import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSeriesComponent } from './item-series.component';

describe('ItemSeriesComponent', () => {
  let component: ItemSeriesComponent;
  let fixture: ComponentFixture<ItemSeriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemSeriesComponent]
    });
    fixture = TestBed.createComponent(ItemSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
