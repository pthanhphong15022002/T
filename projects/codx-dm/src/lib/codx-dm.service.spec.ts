import { TestBed } from '@angular/core/testing';

import { CodxDmService } from './codx-dm.service';

describe('CodxDmService', () => {
  let service: CodxDmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxDmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
