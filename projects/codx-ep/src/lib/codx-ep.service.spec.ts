import { TestBed } from '@angular/core/testing';

import { CodxEpService } from './codx-ep.service';

describe('CodxEpService', () => {
  let service: CodxEpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxEpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
