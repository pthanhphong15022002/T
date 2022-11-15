import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeVisaInfoComponent } from './employee-visa-info.component';

describe('EmployeeVisaInfoComponent', () => {
  let component: EmployeeVisaInfoComponent;
  let fixture: ComponentFixture<EmployeeVisaInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeVisaInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeVisaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
