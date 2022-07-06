import { TestBed } from '@angular/core/testing';

import { CodxDMService } from './codx-dm.service';

describe('CodxDmService', () => {
  let service: CodxDMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxDMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
