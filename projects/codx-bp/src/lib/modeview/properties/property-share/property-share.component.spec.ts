import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyShareComponent } from './property-share.component';

describe('PropertyShareComponent', () => {
  let component: PropertyShareComponent;
  let fixture: ComponentFixture<PropertyShareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyShareComponent]
    });
    fixture = TestBed.createComponent(PropertyShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
