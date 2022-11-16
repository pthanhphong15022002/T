import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDisciplinesDetailComponent } from './employee-disciplines-detail.component';

describe('EmployeeDisciplinesDetailComponent', () => {
  let component: EmployeeDisciplinesDetailComponent;
  let fixture: ComponentFixture<EmployeeDisciplinesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDisciplinesDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDisciplinesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
