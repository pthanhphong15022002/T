import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSelfInfoComponent } from './employee-self-info.component';

describe('EmployeeSelfInfoComponent', () => {
  let component: EmployeeSelfInfoComponent;
  let fixture: ComponentFixture<EmployeeSelfInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSelfInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeSelfInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
