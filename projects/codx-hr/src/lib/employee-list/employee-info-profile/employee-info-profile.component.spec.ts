import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInfoProfileComponent } from './employee-info-profile.component';

describe('EmployeeInfoProfileComponent', () => {
  let component: EmployeeInfoProfileComponent;
  let fixture: ComponentFixture<EmployeeInfoProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeInfoProfileComponent]
    });
    fixture = TestBed.createComponent(EmployeeInfoProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
