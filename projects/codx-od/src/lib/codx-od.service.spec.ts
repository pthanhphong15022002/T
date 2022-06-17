import { TestBed } from '@angular/core/testing';

import { CodxOdService } from './codx-od.service';

describe('CodxOdService', () => {
  let service: CodxOdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodxOdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
