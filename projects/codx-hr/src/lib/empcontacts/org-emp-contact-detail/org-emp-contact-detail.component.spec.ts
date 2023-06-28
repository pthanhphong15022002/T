import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgEmpContactDetailComponent } from './org-emp-contact-detail.component';

describe('OrgEmpContactDetailComponent', () => {
  let component: OrgEmpContactDetailComponent;
  let fixture: ComponentFixture<OrgEmpContactDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgEmpContactDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgEmpContactDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
