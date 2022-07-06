import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySettingDetailsComponent } from './company-setting-details.component';

describe('CompanySettingDetailsComponent', () => {
  let component: CompanySettingDetailsComponent;
  let fixture: ComponentFixture<CompanySettingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanySettingDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanySettingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
