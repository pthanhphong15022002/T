import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmPartnersComponent } from './crm-partners.component';

describe('CrmPartnersComponent', () => {
  let component: CrmPartnersComponent;
  let fixture: ComponentFixture<CrmPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmPartnersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
