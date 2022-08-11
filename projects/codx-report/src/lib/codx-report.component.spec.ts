import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxReportComponent } from './codx-report.component';

describe('CodxReportComponent', () => {
  let component: CodxReportComponent;
  let fixture: ComponentFixture<CodxReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
