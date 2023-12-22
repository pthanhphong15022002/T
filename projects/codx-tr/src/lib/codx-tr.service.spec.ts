import { TestBed } from '@angular/core/testing';

import { CodxTrService } from './codx-tr.service';

describe('CodxTrService', () => {
  let service: CodxTrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxTrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
