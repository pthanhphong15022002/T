import { TestBed } from '@angular/core/testing';

import { CodxMwpService } from './codx-mwp.service';

describe('CodxMwpService', () => {
  let service: CodxMwpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxMwpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
