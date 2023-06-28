import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgEmpContactDetailCardComponent } from './org-emp-contact-detail-card.component';

describe('OrgEmpContactDetailCardComponent', () => {
  let component: OrgEmpContactDetailCardComponent;
  let fixture: ComponentFixture<OrgEmpContactDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgEmpContactDetailCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgEmpContactDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
