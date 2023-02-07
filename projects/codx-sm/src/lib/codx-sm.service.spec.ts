import { TestBed } from '@angular/core/testing';

import { CodxSmService } from './codx-sm.service';

describe('CodxSmService', () => {
  let service: CodxSmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxSmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
