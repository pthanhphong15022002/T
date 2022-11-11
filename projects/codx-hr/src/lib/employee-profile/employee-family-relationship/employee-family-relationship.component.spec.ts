import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFamilyRelationshipComponent } from './employee-family-relationship.component';

describe('EmployeeFamilyRelationshipComponent', () => {
  let component: EmployeeFamilyRelationshipComponent;
  let fixture: ComponentFixture<EmployeeFamilyRelationshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeFamilyRelationshipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFamilyRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
