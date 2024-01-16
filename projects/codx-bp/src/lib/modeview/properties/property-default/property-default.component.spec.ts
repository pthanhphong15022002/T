import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDefaultComponent } from './property-default.component';

describe('PropertyDefaultComponent', () => {
  let component: PropertyDefaultComponent;
  let fixture: ComponentFixture<PropertyDefaultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyDefaultComponent]
    });
    fixture = TestBed.createComponent(PropertyDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
