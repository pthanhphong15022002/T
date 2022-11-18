import { TestBed } from '@angular/core/testing';

import { CodxEiService } from './codx-ei.service';

describe('CodxEiService', () => {
  let service: CodxEiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxEiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
