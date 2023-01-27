import { TestBed } from '@angular/core/testing';

import { CodxAcService } from './codx-ac.service';

describe('CodxAcService', () => {
  let service: CodxAcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxAcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
