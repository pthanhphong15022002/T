import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSkillInfoComponent } from './employee-skill-info.component';

describe('EmployeeSkillInfoComponent', () => {
  let component: EmployeeSkillInfoComponent;
  let fixture: ComponentFixture<EmployeeSkillInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSkillInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeSkillInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
