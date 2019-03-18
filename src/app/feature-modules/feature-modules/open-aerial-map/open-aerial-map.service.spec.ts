import { TestBed, inject } from '@angular/core/testing';

import { OpenAerialMapService } from './open-aerial-map.service';

describe('OpenAerialMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenAerialMapService]
    });
  });

  it('should be created', inject([OpenAerialMapService], (service: OpenAerialMapService) => {
    expect(service).toBeTruthy();
  }));
});
