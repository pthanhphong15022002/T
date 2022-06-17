import { TestBed } from '@angular/core/testing';

import { CodxWpService } from './codx-wp.service';

describe('CodxWpService', () => {
  let service: CodxWpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxWpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
