import { TestBed } from '@angular/core/testing';

import { CodxWsService } from './codx-ws.service';

describe('CodxWsService', () => {
  let service: CodxWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
