import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDatetimeComponent } from './property-datetime.component';

describe('PropertyDatetimeComponent', () => {
  let component: PropertyDatetimeComponent;
  let fixture: ComponentFixture<PropertyDatetimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyDatetimeComponent]
    });
    fixture = TestBed.createComponent(PropertyDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
