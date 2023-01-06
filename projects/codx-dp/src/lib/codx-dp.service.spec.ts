import { TestBed } from '@angular/core/testing';

import { CodxDpService } from './codx-dp.service';

describe('CodxDpService', () => {
  let service: CodxDpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxDpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
