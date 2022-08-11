import { TestBed } from '@angular/core/testing';

import { CodxReportService } from './codx-report.service';

describe('CodxReportService', () => {
  let service: CodxReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
