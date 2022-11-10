import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFamilyRelationshipDetailComponent } from './employee-family-relationship-detail.component';

describe('EmployeeFamilyRelationshipDetailComponent', () => {
  let component: EmployeeFamilyRelationshipDetailComponent;
  let fixture: ComponentFixture<EmployeeFamilyRelationshipDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeFamilyRelationshipDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFamilyRelationshipDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
