import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAllocatedPropertyComponent } from './employee-allocated-property.component';

describe('EmployeeAllocatedPropertyComponent', () => {
  let component: EmployeeAllocatedPropertyComponent;
  let fixture: ComponentFixture<EmployeeAllocatedPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAllocatedPropertyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAllocatedPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
