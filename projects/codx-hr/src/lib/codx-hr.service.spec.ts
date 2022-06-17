import { TestBed } from '@angular/core/testing';

import { CodxHrService } from './codx-hr.service';

describe('CodxHrService', () => {
  let service: CodxHrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxHrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
