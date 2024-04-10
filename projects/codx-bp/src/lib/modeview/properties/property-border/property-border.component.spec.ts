import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBorderComponent } from './property-border.component';

describe('PropertyBorderComponent', () => {
  let component: PropertyBorderComponent;
  let fixture: ComponentFixture<PropertyBorderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyBorderComponent]
    });
    fixture = TestBed.createComponent(PropertyBorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
