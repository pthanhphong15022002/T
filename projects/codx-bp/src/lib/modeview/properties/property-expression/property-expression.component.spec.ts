import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyExpressionComponent } from './property-expression.component';

describe('PropertyExpressionComponent', () => {
  let component: PropertyExpressionComponent;
  let fixture: ComponentFixture<PropertyExpressionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyExpressionComponent]
    });
    fixture = TestBed.createComponent(PropertyExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
