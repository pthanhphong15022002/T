import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyRankComponent } from './property-rank.component';

describe('PropertyRankComponent', () => {
  let component: PropertyRankComponent;
  let fixture: ComponentFixture<PropertyRankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyRankComponent]
    });
    fixture = TestBed.createComponent(PropertyRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
