import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrTemplateExcelComponent } from './hr-template-excel.component';

describe('HrTemplateExcelComponent', () => {
  let component: HrTemplateExcelComponent;
  let fixture: ComponentFixture<HrTemplateExcelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrTemplateExcelComponent]
    });
    fixture = TestBed.createComponent(HrTemplateExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
