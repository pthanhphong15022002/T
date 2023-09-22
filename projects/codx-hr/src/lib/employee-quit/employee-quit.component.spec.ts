import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeQuitComponent } from './employee-quit.component';

describe('EmployeeQuitComponent', () => {
  let component: EmployeeQuitComponent;
  let fixture: ComponentFixture<EmployeeQuitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeQuitComponent]
    });
    fixture = TestBed.createComponent(EmployeeQuitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
