import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyExpressionSettingsComponent } from './property-expression-settings.component';

describe('PropertyExpressionSettingsComponent', () => {
  let component: PropertyExpressionSettingsComponent;
  let fixture: ComponentFixture<PropertyExpressionSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyExpressionSettingsComponent]
    });
    fixture = TestBed.createComponent(PropertyExpressionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
