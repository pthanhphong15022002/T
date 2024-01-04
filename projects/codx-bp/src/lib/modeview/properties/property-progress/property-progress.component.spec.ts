import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyProgressComponent } from './property-progress.component';

describe('PropertyProgressComponent', () => {
  let component: PropertyProgressComponent;
  let fixture: ComponentFixture<PropertyProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyProgressComponent]
    });
    fixture = TestBed.createComponent(PropertyProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
