import { TestBed } from '@angular/core/testing';

import { CodxPrService } from './codx-pr.service';

describe('CodxPrService', () => {
  let service: CodxPrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxPrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
