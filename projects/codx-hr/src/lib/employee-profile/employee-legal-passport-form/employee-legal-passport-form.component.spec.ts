import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLegalPassportFormComponent } from './employee-legal-passport-form.component';

describe('EmployeeLegalPassportFormComponent', () => {
  let component: EmployeeLegalPassportFormComponent;
  let fixture: ComponentFixture<EmployeeLegalPassportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLegalPassportFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLegalPassportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
