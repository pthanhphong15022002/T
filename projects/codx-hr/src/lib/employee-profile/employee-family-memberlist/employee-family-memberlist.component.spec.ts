import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFamilyMemberlistComponent } from './employee-family-memberlist.component';

describe('EmployeeFamilyMemberlistComponent', () => {
  let component: EmployeeFamilyMemberlistComponent;
  let fixture: ComponentFixture<EmployeeFamilyMemberlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeFamilyMemberlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFamilyMemberlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
