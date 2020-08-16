import { TestBed, inject } from '@angular/core/testing';

import { AVLService } from './AVL.service';

describe('OpenAerialMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AVLService]
    });
  });

  it('should be created', inject([AVLService], (service: AVLService) => {
    expect(service).toBeTruthy();
  }));
});
