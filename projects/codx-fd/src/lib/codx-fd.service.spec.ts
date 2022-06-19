import { TestBed } from '@angular/core/testing';

import { CodxFdService } from './codx-fd.service';

describe('CodxFdService', () => {
  let service: CodxFdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxFdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
