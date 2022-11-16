import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSkillDetailComponent } from './employee-skill-detail.component';

describe('EmployeeSkillDetailComponent', () => {
  let component: EmployeeSkillDetailComponent;
  let fixture: ComponentFixture<EmployeeSkillDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSkillDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeSkillDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
