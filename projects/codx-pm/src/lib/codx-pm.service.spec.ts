import { TestBed } from '@angular/core/testing';

import { CodxPmService } from './codx-pm.service';

describe('CodxPmService', () => {
  let service: CodxPmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxPmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
