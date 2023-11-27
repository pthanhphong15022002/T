import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeKowdsComponent } from './employee-kowds.component';

describe('EmployeeKowdsComponent', () => {
  let component: EmployeeKowdsComponent;
  let fixture: ComponentFixture<EmployeeKowdsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeKowdsComponent]
    });
    fixture = TestBed.createComponent(EmployeeKowdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
