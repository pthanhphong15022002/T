import { TestBed } from '@angular/core/testing';

import { CodxTnService } from './codx-tn.service';

describe('CodxTnService', () => {
  let service: CodxTnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxTnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
