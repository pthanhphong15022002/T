import { TestBed } from '@angular/core/testing';

import { CodxBpService } from './codx-bp.service';

describe('CodxBpService', () => {
  let service: CodxBpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxBpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
