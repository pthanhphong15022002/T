import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrTableEmployeeFamilyComponent } from './hr-table-employee-family.component';

describe('HrTableEmployeeFamilyComponent', () => {
  let component: HrTableEmployeeFamilyComponent;
  let fixture: ComponentFixture<HrTableEmployeeFamilyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrTableEmployeeFamilyComponent]
    });
    fixture = TestBed.createComponent(HrTableEmployeeFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
