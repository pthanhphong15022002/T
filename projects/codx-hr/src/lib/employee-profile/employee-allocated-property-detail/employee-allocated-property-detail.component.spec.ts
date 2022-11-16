import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAllocatedPropertyDetailComponent } from './employee-allocated-property-detail.component';

describe('EmployeeAllocatedPropertyDetailComponent', () => {
  let component: EmployeeAllocatedPropertyDetailComponent;
  let fixture: ComponentFixture<EmployeeAllocatedPropertyDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAllocatedPropertyDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAllocatedPropertyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
