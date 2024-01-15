import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDefaultTitleComponent } from './property-default-title.component';

describe('PropertyDefaultTitleComponent', () => {
  let component: PropertyDefaultTitleComponent;
  let fixture: ComponentFixture<PropertyDefaultTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyDefaultTitleComponent]
    });
    fixture = TestBed.createComponent(PropertyDefaultTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
