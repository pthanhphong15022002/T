import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDisciplinesInfoComponent } from './employee-disciplines-info.component';

describe('EmployeeDisciplinesInfoComponent', () => {
  let component: EmployeeDisciplinesInfoComponent;
  let fixture: ComponentFixture<EmployeeDisciplinesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDisciplinesInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDisciplinesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
