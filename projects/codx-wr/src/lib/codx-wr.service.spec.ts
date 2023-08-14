import { TestBed } from '@angular/core/testing';

import { CodxWrService } from './codx-wr.service';

describe('CodxWrService', () => {
  let service: CodxWrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxWrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
