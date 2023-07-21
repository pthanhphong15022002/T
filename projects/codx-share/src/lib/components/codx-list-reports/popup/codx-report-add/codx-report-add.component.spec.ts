import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxReportAddComponent } from './codx-report-add.component';

describe('CodxReportAddComponent', () => {
  let component: CodxReportAddComponent;
  let fixture: ComponentFixture<CodxReportAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxReportAddComponent]
    });
    fixture = TestBed.createComponent(CodxReportAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
