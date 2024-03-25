import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCbbDependenceComponent } from './property-cbb-dependence.component';

describe('PropertyCbbDependenceComponent', () => {
  let component: PropertyCbbDependenceComponent;
  let fixture: ComponentFixture<PropertyCbbDependenceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyCbbDependenceComponent]
    });
    fixture = TestBed.createComponent(PropertyCbbDependenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
