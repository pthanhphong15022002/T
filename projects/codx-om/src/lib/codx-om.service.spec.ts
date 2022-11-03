import { TestBed } from '@angular/core/testing';

import { CodxOmService } from './codx-om.service';

describe('CodxOmService', () => {
  let service: CodxOmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxOmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
