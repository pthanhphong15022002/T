import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormStepsFieldGridComponent } from './form-steps-field-grid.component';

describe('FormStepsFieldGridComponent', () => {
  let component: FormStepsFieldGridComponent;
  let fixture: ComponentFixture<FormStepsFieldGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormStepsFieldGridComponent]
    });
    fixture = TestBed.createComponent(FormStepsFieldGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
