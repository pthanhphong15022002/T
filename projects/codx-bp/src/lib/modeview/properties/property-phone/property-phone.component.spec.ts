import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyPhoneComponent } from './property-phone.component';

describe('PropertyPhoneComponent', () => {
  let component: PropertyPhoneComponent;
  let fixture: ComponentFixture<PropertyPhoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyPhoneComponent]
    });
    fixture = TestBed.createComponent(PropertyPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
