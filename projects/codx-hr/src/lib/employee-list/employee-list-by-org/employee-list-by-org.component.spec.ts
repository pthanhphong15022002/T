import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeListByOrgComponent } from './employee-list-by-org.component';

describe('EmployeeListByOrgComponent', () => {
  let component: EmployeeListByOrgComponent;
  let fixture: ComponentFixture<EmployeeListByOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeListByOrgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeListByOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
