import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyComboboxComponent } from './property-combobox.component';

describe('PropertyComboboxComponent', () => {
  let component: PropertyComboboxComponent;
  let fixture: ComponentFixture<PropertyComboboxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyComboboxComponent]
    });
    fixture = TestBed.createComponent(PropertyComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
