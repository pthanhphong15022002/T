import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxShareReportComponent } from './codx-share-report.component';

describe('CodxShareReportComponent', () => {
  let component: CodxShareReportComponent;
  let fixture: ComponentFixture<CodxShareReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxShareReportComponent]
    });
    fixture = TestBed.createComponent(CodxShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
