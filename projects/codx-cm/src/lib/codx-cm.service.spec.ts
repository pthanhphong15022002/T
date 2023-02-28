import { TestBed } from '@angular/core/testing';

import { CodxCmService } from './codx-cm.service';

describe('CodxCmService', () => {
  let service: CodxCmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxCmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
