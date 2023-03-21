import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmPartnersDetailComponent } from './crm-partners-detail.component';

describe('CrmPartnersDetailComponent', () => {
  let component: CrmPartnersDetailComponent;
  let fixture: ComponentFixture<CrmPartnersDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmPartnersDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmPartnersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
