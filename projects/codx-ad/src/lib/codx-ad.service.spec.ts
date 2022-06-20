import { TestBed } from '@angular/core/testing';

import { CodxAdService } from './codx-ad.service';

describe('CodxAdService', () => {
  let service: CodxAdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxAdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
