import { TestBed, inject } from '@angular/core/testing';

import { LocatesService } from '../locates/locates.service';

describe('LocatesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocatesService]
    });
  });

  it('should be created', inject([LocatesService], (service: LocatesService) => {
    expect(service).toBeTruthy();
  }));
});
