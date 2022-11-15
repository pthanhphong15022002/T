import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLegalPassportInfoComponent } from './employee-legal-passport-info.component';

describe('EmployeeLegalPassportInfoComponent', () => {
  let component: EmployeeLegalPassportInfoComponent;
  let fixture: ComponentFixture<EmployeeLegalPassportInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLegalPassportInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLegalPassportInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
