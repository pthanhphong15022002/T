import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyNumberComponent } from './property-number.component';

describe('PropertyNumberComponent', () => {
  let component: PropertyNumberComponent;
  let fixture: ComponentFixture<PropertyNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyNumberComponent]
    });
    fixture = TestBed.createComponent(PropertyNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
