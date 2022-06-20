import { TestBed } from '@angular/core/testing';

import { CodxEsService } from './codx-es.service';

describe('CodxEsService', () => {
  let service: CodxEsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxEsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
