import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInfomationComponent } from './employee-infomation.component';

describe('EmployeeInfomationComponent', () => {
  let component: EmployeeInfomationComponent;
  let fixture: ComponentFixture<EmployeeInfomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeInfomationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeInfomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
